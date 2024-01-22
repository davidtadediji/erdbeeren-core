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

    if (!conversation) {
      conversation = await createNewConversation(
        phoneNumber,
        isWhatsApp ? "whatsapp" : "sms"
      );
    } else {
      conversation = await updateConversationTimestamp(conversation.id);
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

    const response = await respondToMessage(
      messageContent,
      conversation.participantSid,
      true
    );

    return { conversation, response, isWhatsApp, phoneNumber };
  } catch (error) {
    throw error;
  }
};

const sendMessage = async ({ conversation, response, isWhatsApp, phoneNumber }) => {
  try {
    if (isWhatsApp) {
      await client.messages.create({
        body: response.res,
        from: "whatsapp:" + twilioPhoneNumber,
        to: phoneNumber,
      });
    } else {
      await client.messages.create({
        body: response.res,
        from: twilioPhoneNumber,
        to: phoneNumber,
      });
    }

    const agentMessage = await saveMessageToConversation(
      conversation.id,
      "agent",
      response.res
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

    await generateCustomerVectorStore(conversation.participantSid, [
      message,
      response.res,
    ]);

    return "Message sent successfully";
  } catch (error) {
    throw error;
  }
};

const webhookController = async (req, res) => {
  logger.info("Message webhook triggered: " + JSON.stringify(req.body, null, 2));

  try {
    const { conversation, response, isWhatsApp, phoneNumber } = await receiveMessage(req);
    await sendMessage({ conversation, response, isWhatsApp, phoneNumber });

    res.status(200).send("Message received and responded successfully");
  } catch (error) {
    logger.error(error);
    res
      .status(500)
      .json({ error: "Internal server error", message: error.message });
  }
};

export default webhookController;
