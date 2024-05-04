// src\modules\communication\twilio\messaging\controllers\sendMessageService.js
import { PrismaClient } from "@prisma/client";
import {
  createNewConversation,
  updateConversationTimestamp,
} from "./conversationService.js";
import { saveMessageToConversation } from "./messageService.js";
import twilio from "twilio";
import logger from "../../../../../../logger.js";
import eventEmitter from "../../../../analytics_engine/eventEmitter.js";
const prisma = new PrismaClient();
import dotenv from "dotenv";
import { generateCustomerVectorStore } from "../../../../llm_context/services/customerContextService.js";
dotenv.config();
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

const client = twilio(accountSid, authToken);

const sendMessage = async (messageContent, phoneNumber) => {
  try {
    if (!messageContent || !phoneNumber) {
      logger.warn("No message or phoneNumber to send.");
      return;
    }
    const isWhatsApp = phoneNumber.startsWith("whatsapp:");
    // Your logic to send the response back to the user using Twilio
    // Check if there's an existing conversation with this phone number
    let conversation = await prisma.conversation.findUnique({
      where: { participantSid: phoneNumber },
    });

    logger.info("Conversation found");

    if (!conversation) {
      // Create a new conversation if not found
      conversation = await createNewConversation(
        phoneNumber,
        isWhatsApp ? "whatsapp" : "sms"
      );
    } else {
      // Update the last updated timestamp for an existing conversation
      conversation = await updateConversationTimestamp(conversation.id);
    }

    if (isWhatsApp) {
      // Send response in WhatsApp format
      await client.messages.create({
        body: messageContent,
        from: "whatsapp:" + twilioPhoneNumber,
        to: phoneNumber,
      });
    } else {
      // Send response in SMS format
      await client.messages.create({
        body: messageContent,
        from: twilioPhoneNumber,
        to: phoneNumber,
      });
    }

    // Create a new message in the conversation as the agent
    const agentMessage = await saveMessageToConversation(
      conversation.id,
      "agent", // Use different identifier for WhatsApp messages
      messageContent // Assuming the response is the content of the agent's message
    );

    // Emit the newMessageCreated event
    logger.info("About to emit newMessageCreated event");
    eventEmitter.emit("newMessageCreated", {
      conversationId: conversation.id,
      messageId: agentMessage.id,
    });

    logger.info("About to emit agentResponded event");
    eventEmitter.emit("agentResponded", {
      conversationId: conversation.id,
      messageId: agentMessage.id,
    });

    // Emit the newMessageCreated event
    logger.info("About to emit interactionTurnCompleted event");
    eventEmitter.emit("interactionTurnCompleted", conversation.id);

    await generateCustomerVectorStore(conversation.participantSid, [
      message,
      messageContent,
    ]);

    res.status(200).send("Message received and responded successfully");
  } catch (error) {
    logger.error("Error sending message: " + error.message);
  }
};
export { sendMessage };
