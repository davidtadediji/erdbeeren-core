// src/controllers/broadcastController.js
import { PrismaClient } from "@prisma/client";
import { updateConversationTimestamp } from "../services/conversationService.js";
import { saveMessageToConversation } from "../services/messageService.js";
import twilio from "twilio";
import logger from "../../../../../../logger.js";
import auditLogger from "../../../../../../audit_logger.js";
import { updateBroadcasts } from "../services/broadcastsManager.js";
const prisma = new PrismaClient();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

const client = twilio(accountSid, authToken);

const broadcastMessage = async (title, content) => {
  logger.info("Broadcast triggered");
  try {
    // Get all conversations
    const conversations = await prisma.conversation.findMany();

    const messageToSend = `${title}\n${content}`;
    let receiverConversationIds = [];

    // Send content to each conversation
    await Promise.all(
      conversations.map(async (conversation) => {
        logger.info("Conversation encountered.");
        //try catch to handle any errors broadcasting and skip to next
        try {
          const formattedPhoneNumber =
            conversation.type === "whatsapp"
              ? `whatsapp: ${twilioPhoneNumber}`
              : twilioPhoneNumber;

          await client.messages.create({
            body: messageToSend,
            from: formattedPhoneNumber,
            to: conversation.participantSid,
          });

          receiverConversationIds.push(conversation.id);

          await saveMessageToConversation(
            conversation.id,
            "broadcast",
            messageToSend
          );

          await updateConversationTimestamp(conversation.id);
        } catch (error) {
          logger.error("Error sending message to conversation:", {
            conversationId: conversation.id,
            error: error.message,
            code: error.code,
            moreInfo: error.moreInfo,
          });
          auditLogger.error("Error sending message to conversation:", {
            conversationId: conversation.id,
            error: error.message,
            code: error.code,
            moreInfo: error.moreInfo,
          });
        }
      })
    );

    const broadcast = {
      title,
      content: messageToSend,
      conversationIds: receiverConversationIds,
      timestamp: new Date(),
    };

    await updateBroadcasts(broadcast);

    return { success: true };
  } catch (error) {
    logger.error("Error broadcasting message:", error);
    auditLogger.error("Error broadcasting message:", error);
    throw error;
  }
};

export { broadcastMessage };
