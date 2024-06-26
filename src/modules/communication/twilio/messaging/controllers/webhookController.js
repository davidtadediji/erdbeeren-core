// src\modules\communication\twilio\messaging\webhookController.js
import twilio from "twilio";
import { respondToMessage } from "../../../../llm_context/services/modelService.js";
import { generateCustomerVectorStore } from "../../../../llm_context/services/customerContextService.js";
import dotenv from "dotenv";
import {
  updateConversationTimestamp,
  createNewConversation,
  getConversationThread,
} from "../services/conversationService.js";
import { saveMessageToConversation } from "../services/messageService.js";
import logger from "../../../../../../logger.js";
import { PrismaClient } from "@prisma/client";
import eventEmitter from "../../../../analytics_engine/eventEmitter.js";
import { routeRequest } from "../../../../llm_context/services/intentClassifier.js";

const prisma = new PrismaClient();

dotenv.config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

const client = twilio(accountSid, authToken);

const receiveMessage = async (req) => {
  try {
    const { From: phoneNumber, Body: messageContent } = req.body;

    const isWhatsApp = phoneNumber.startsWith("whatsapp:");

    let conversation = await prisma.conversation.findUnique({
      where: { participantSid: phoneNumber },
    });

    let selfPresentation = "";

    if (!conversation) {
      selfPresentation =
        "You are now interacting with an AI agent. We may collect and use only customer-related information solely for service improvement purposes. Your information is handled responsibly and in accordance with our privacy policies.\n";
      conversation = await createNewConversation(
        phoneNumber,
        isWhatsApp ? "whatsapp" : "sms"
      );
    } else {
      conversation = await updateConversationTimestamp(conversation.id);
    }

    const metricsExists = await prisma.conversationMetrics.findUnique({
      where: { conversationId: conversation.id },
    });

    if (!metricsExists) {
      await prisma.conversationMetrics.create({
        data: { conversationId: conversation.id },
      });
    }

    const customerMessage = await saveMessageToConversation(
      conversation.id,
      "customer",
      messageContent
    );

    eventEmitter.emit("newMessageCreated", {
      conversationId: conversation.id,
      messageId: customerMessage.id,
    });

    eventEmitter.emit("customerResponded", {
      conversationId: conversation.id,
      messageId: customerMessage.id,
    });

    const previousMessages = await getConversationThread(conversation.id);

    
    const response = await routeRequest(messageContent, conversation.id, true)

    // const response = await respondToMessage(
    //   messageContent,
    //   conversation.id,
    //   true
    // );

    // const response = { res: { text: "Okay" } };

    //  response = selfPresentation + response;

    logger.info("Agent response: " + response);

    return { conversation, response, isWhatsApp, phoneNumber, messageContent };
  } catch (error) {
    throw error;
  }
};

const sendMessage = async ({
  conversation,
  response,
  isWhatsApp,
  phoneNumber,
  messageContent,
}) => {
  logger.info(
    `${conversation} ${response} ${isWhatsApp} ${phoneNumber} ${messageContent} were retrieved successfully`
  );

  try {
    // if (isWhatsApp) {
    //   await client.messages.create({
    //     body: response,
    //     from: "whatsapp:" + twilioPhoneNumber,
    //     to: phoneNumber,
    //   });
    // } else {
    //   await client.messages.create({
    //     body: response,
    //     from: twilioPhoneNumber,
    //     to: phoneNumber,
    //   });
    // }

    const agentMessage = await saveMessageToConversation(
      conversation.id,
      "agent",
      response
    );

    eventEmitter.emit("newMessageCreated", {
      conversationId: conversation.id,
      messageId: agentMessage.id,
    });

    eventEmitter.emit("agentResponded", {
      conversationId: conversation.id,
      messageId: agentMessage.id,
    });

    eventEmitter.emit("interactionTurnCompleted", conversation.id);

    const turn = [`Customer: ${messageContent}`, `Agent: ${response}`];

    await generateCustomerVectorStore(conversation.participantSid, turn);

    return "Message sent successfully";
  } catch (error) {
    throw error;
  }
};

const webhookController = async (req, res) => {
  logger.info(
    "Message webhook triggered: " + JSON.stringify(req.body, null, 2)
  );

  try {
    const { conversation, response, isWhatsApp, phoneNumber, messageContent } =
      await receiveMessage(req);
    logger.info("Recieved message");

    await sendMessage({
      conversation,
      response,
      isWhatsApp,
      phoneNumber,
      messageContent,
    });

    res.status(200).send("Message received and responded successfully");
  } catch (error) {
    logger.error(error);
    res
      .status(500)
      .json({ error: "Internal server error", message: error.message });
  }
};

export default webhookController;
