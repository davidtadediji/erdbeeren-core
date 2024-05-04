// src/controllers/broadcastController.js
import { PrismaClient } from '@prisma/client';
import { updateConversationTimestamp } from '../services/conversationService.js';
import { saveMessageToConversation } from '../services/messageService.js';
import twilio from 'twilio';
import logger from "../../../../../../logger.js"
const prisma = new PrismaClient();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

const client = twilio(accountSid, authToken);

const broadcastMessage = async (content) => {
  try {
    // Get all conversations
    const conversations = await prisma.conversation.findMany();

    // Send message to each conversation
    await Promise.all(
      conversations.map(async (conversation) => {
        // Prefix Twilio phone number based on conversation type
        logger.info("Conversation encountered.")
        const formattedPhoneNumber =
          conversation.type === 'whatsapp'
            ? `whatsapp: ${twilioPhoneNumber}`
            : twilioPhoneNumber;

        // Your Twilio messaging logic here
        await client.messages.create({
          body: content,
          from: formattedPhoneNumber,
          to: conversation.participantSid, // Assuming participantSid is the phone number
        });

        // Save the broadcasted message to the database
        await saveMessageToConversation(conversation.id, 'agent', content);

        // Update conversation timestamp
        await updateConversationTimestamp(conversation.id);
      })
    );

    return { success: true };
  } catch (error) {
    logger.error('Error broadcasting message:', error.message);
    throw error;
  }
};

export { broadcastMessage };
