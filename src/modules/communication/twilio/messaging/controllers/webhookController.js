// src\modules\communication\twilio\messaging\webhookController.js
import twilio from "twilio";
import { respondToMessage } from "../../../../llm_context/services/modelService.js"; // Replace with the actual path
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

const webhookController = async (req, res) => {
  logger.info(
    "Message webhook triggered: " + JSON.stringify(req.body, null, 2)
  );

  try {
    const { From: phoneNumber, Body: messageContent } = req.body;

    // Identify the message source (SMS or WhatsApp) based on the 'From' field format
    const isWhatsApp = phoneNumber.startsWith("whatsapp:");

    // Check if there's an existing conversation with this phone number
    let conversation = await prisma.conversation.findFirst({
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

    logger.info("Conversation created or updated");

    // Save the incoming message to the conversation
    await saveMessageToConversation(
      conversation.id,
      "customer", // Use different identifier for WhatsApp messages
      messageContent
    );
    logger.info("New message created");

    // Emit the newMessageCreated event
    logger.info("About to emit newMessageCreated event");
    eventEmitter.emit("newMessageCreated", conversation.id);

    
    // Find appropriate places for the responded events later
    // Emit the newMessageCreated event
    logger.info("About to emit customerResponded event");
    eventEmitter.emit("customerResponded", conversation.id);

    
    // Emit the newMessageCreated event
    logger.info("About to emit agentResponded event");
    eventEmitter.emit("agentResponded", conversation.id);


    const previousMessages = await getConversationThread(conversation.id);

    logger.info("Previous messages: ", previousMessages);

    // Respond to the message using the context service
    const response = await respondToMessage(
      messageContent,
      conversation.participantSid,
      true
    );

    // Your logic to send the response back to the user using Twilio
    if (isWhatsApp) {
      // Send response in WhatsApp format
      await client.messages.create({
        body: response.res,
        from: "whatsapp:" + twilioPhoneNumber,
        to: phoneNumber,
      });
    } else {
      // Send response in SMS format
      await client.messages.create({
        body: response.res,
        from: twilioPhoneNumber,
        to: phoneNumber,
      });
    }

    // Create a new message in the conversation as the agent
    await saveMessageToConversation(
      conversation.id,
      "agent", // Use different identifier for WhatsApp messages
      response.res // Assuming the response is the content of the agent's message
    );

    


    // Emit the newMessageCreated event
    logger.info("About to emit interactionTurnCompleted event");
    eventEmitter.emit("interactionTurnCompleted", conversation.id);

    await generateCustomerVectorStore(conversation.participantSid, [
      message,
      response.res,
    ]);

    res.status(200).send("Message received and responded successfully");
  } catch (error) {
    logger.error(error);
    res
      .status(500)
      .json({ error: "Internal server error", message: error.message });
  }
};

export default webhookController;
