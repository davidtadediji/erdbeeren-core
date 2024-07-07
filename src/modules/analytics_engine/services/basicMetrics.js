// src\modules\analytics_engine\services\basicMetrics.js
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import logger from "../../../../logger.js";
import auditLogger from "../../../../audit_logger.js";

// function to calculate and store conversation duration
export async function handleConversationDuration(conversationId) {
  logger.info("Handle conversation duration triggered: " + conversationId);
  try {
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: { messages: true },
    });

    // return error if conversation doesn't exists or if it doesn't contain messages or if the conversation length is less than 2
    if (
      !conversation.messages ||
      !conversation ||
      conversation.messages.length < 2
    ) {
      logger.error(
        `Insufficient messages for calculating duration or conversation ${conversationId} is not valid.`
      );
      auditLogger.error(
        `Insufficient messages for calculating duration or conversation ${conversationId} is not valid.`
      );
      return;
    }

    // sort conversation messages by date from first to last
    const sortedMessages = conversation.messages.sort(
      (a, b) => new Date(a.sentAt) - new Date(b.sentAt)
    );

    // logger.info(
    //   "Sorted Timestamps:",
    //   sortedMessages.map((msg) => msg.sentAt)
    // );

    const firstTimestamp = new Date(sortedMessages[0].sentAt);
    const lastTimestamp = new Date(
      sortedMessages[sortedMessages.length - 1].sentAt
    );

    logger.info(`First Message Timestamp: ${firstTimestamp}`);
    logger.info(`Last Message Timestamp: ${lastTimestamp}`);

    // subtract the first and last timestamps to get conversation duration
    const conversationDuration = lastTimestamp - firstTimestamp;

    logger.info(`Conversation Duration: ${conversationDuration}`);

    // if the first conversation check is passed but conversations do not have timestamps this check serves to avoid an error
    if (isNaN(conversationDuration) || conversationDuration < 0) {
      logger.error("Invalid duration calculation.");
      auditLogger.error("Invalid duration calculation.");
      return;
    }

    // convert conversation duration to minutes
    const conversationDurationMin = Math.ceil(
      conversationDuration / (1000 * 60)
    );

    // update the duration field of the conversation table
    await prisma.conversationMetrics.update({
      where: { conversationId: conversationId },
      data: { duration: conversationDurationMin },
    });

    logger.info(`Conversation Duration: ${conversationDurationMin} minutes`);
  } catch (error) {
    logger.error("Error handling conversation duration:", error.message);
    auditLogger.error("Error handling conversation duration:", error.message);
  }
}

// function to calculate and store conversation length
export async function handleConversationLength(conversationId) {
  logger.info("Handle conversation length triggered: " + conversationId);
  try {
    // get conversation with messages
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: { messages: true },
    });

    // check if conversation was found
    if (!conversation) {
      logger.error("Conversation was not found.");
      auditLogger.error("Conversation was not found.");
      return;
    }

    logger.info("Conversation exists.");

    // get number of messages in conversation
    const conversationLength = conversation.messages.length;

    logger.info("Message count: " + conversationLength);

    // update the conversation length field of the conversation table
    await prisma.conversationMetrics.update({
      where: { conversationId: conversationId },
      data: { length: conversationLength },
    });

    logger.info(
      `Length of Conversation ${conversationId}: ${conversationLength} messages.`
    );
  } catch (error) {
    logger.error("Error handling conversation length:" + error.message);
    auditLogger.error("Error handling conversation length:" + error.message);
  }
}

export async function handleTicketVolume(conversationId) {}

export async function handleIssueCategory(conversationId) {}
