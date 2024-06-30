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
import {
  handlePoorSentiment,
  routeRequest,
} from "../../../../llm_context/services/intentClassifier.js";
import { saveCustomerSatisfactionScore } from "../../../../llm_context/services/satisfactionRater.js";

const prisma = new PrismaClient();

dotenv.config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

const client = twilio(accountSid, authToken);

const NEGATIVE_SENTIMENT_THRESHOLD = -0.5;

const checkNegativeSentiments = async (conversationId) => {
  const lastThreeMessages = await prisma.message.findMany({
    where: { conversationId },
    orderBy: { sentAt: "desc" },
    take: 3,
  });

  return lastThreeMessages.every(
    (message) => message.sentimentScore < NEGATIVE_SENTIMENT_THRESHOLD
  );
};

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

    const previousMessages = [
      {
        sender: "2",
        text: "Bring it to baga telle",
        timestamp: "2024-06-29T17:01:54.666Z",
      },
      {
        sender: "2",
        text: "You are now connected with an AI agent. Kindly rate the assistance you received from the service agent on a scale of 1-5.",
        timestamp: "2024-06-29T17:01:58.628Z",
      },
    ];
    console.log(previousMessages);

    let isSaved = false;

    if (
      previousMessages &&
      previousMessages[previousMessages.length - 1].text ==
        "You are now connected with an AI agent. Kindly rate the assistance you received from the service agent on a scale of 1-5."
    ) {
      isSaved = await saveCustomerSatisfactionScore(
        messageContent,
        conversation.id
      );
    }

    if (!isSaved) {
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
    }

    const shouldRouteToAgent = await checkNegativeSentiments(conversation.id);

    if (shouldRouteToAgent) {
      logger.info("Routing to human agent due to negative sentiment");
      handlePoorSentiment(messageContent, conversation.id);
      const response =
        "I'm transferring you to a human agent for further assistance.";
      return {
        conversation,
        response,
        isWhatsApp,
        phoneNumber,
        messageContent,
      };
    }

    let response = await routeRequest(
      messageContent,
      conversation.id,
      true,
      previousMessages
    );

    if (!response) {
      logger.info("Routed to human agent successfully");
      return {
        conversation,
        response:
          "The matter has been transferred to a human agent for better resolution.",
        isWhatsApp,
        phoneNumber,
        messageContent,
      };
    }

    response = `${selfPresentation}\n\n${response}`;

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

    if (
      response ==
        "The matter has been transferred to a human agent for better resolution." ||
      response ==
        "I'm transferring this message to a human agent for further assistance."
    ) {
      console.log("Message has been routed");
      return "Message has been routed";
    } else if (response == "Customer has rated") {
      console.log("Customer has rated");
      return "Customer has rated";
    }

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

    await generateCustomerVectorStore(conversation.id, turn);

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
