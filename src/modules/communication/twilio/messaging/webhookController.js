// src\modules\communication\twilio\messaging\webhookController.js
import twilio from "twilio";
import { respondToMessage } from "../../../llm_context/services/contextService.js"; // Replace with the actual path
import dotenv from "dotenv";
import {
  updateConversationTimestamp,
  createNewConversation,
  getConversationThread,
} from "./service/conversationService.js";
import { saveMessageToConversation } from "./service/messageService.js";
import logger from "../../../../../logger.js";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

dotenv.config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

const client = twilio(accountSid, authToken);

const webhookController = async (req, res) => {
  logger.info("Message webhook triggered: " + JSON.stringify(req.body, null, 2));

  try {
    const { From: phoneNumber, Body: messageContent } = req.body;

    // Check if there's an existing conversation with this phone number
    let conversation = await prisma.conversation.findFirst({
      where: { participantSid: phoneNumber },
    });

    logger.info("Conversation found")

    if (!conversation) {
      // Create a new conversation if not found
      conversation = await createNewConversation(phoneNumber);
    } else {
      // Update the last updated timestamp for an existing conversation
      await updateConversationTimestamp(conversation.id);
    }

    logger.info("Conversation created or updated")

    // Save the incoming message to the conversation
    await saveMessageToConversation(
      conversation.id,
      "customer", // Assuming the customer is always the sender
      messageContent
    );
    logger.info("New message created")

    const previousMessages = await getConversationThread(conversation.id);

    logger.info("Previous messages: ", previousMessages)
    // Respond to the message using the context service
    const response = await respondToMessage(
      messageContent,
      previousMessages,
      true
    );

    // Your logic to send the response back to the user using Twilio
    await client.messages.create({
      body: response.res, // Assuming the response is a string, adjust accordingly
      from: twilioPhoneNumber,
      to: phoneNumber,
    });

    // Create a new message in the conversation as the agent
    await saveMessageToConversation(
      conversation.id,
      "agent", // Assuming the agent is the sender
      response.res // Assuming the response is the content of the agent's message
    );

    res.status(200).send("Message received and responded successfully");
  } catch (error) {
    logger.error(error);
    res
      .status(500)
      .json({ error: "Internal server error", message: error.message });
  }
};

export default webhookController;
