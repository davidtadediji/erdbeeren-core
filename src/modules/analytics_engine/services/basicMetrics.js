import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

import logger from "../../../../logger.js";

export async function handleFrequencyOfInteractions(conversationId) {
  logger.info("Handle frequency of interactions triggered.");
  try {
    // Fetch the conversation from the database
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: { messages: true },
    });

    if (!conversation) {
      logger.error("Conversation not found.");
      return;
    }
    logger.info("Conversation found.");
    // Calculate the total number of messages
    const messageCount = conversation.messages.length;

    logger.info("Message count: " + messageCount);

    // Update the length field of the conversation
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { length: messageCount },
    });

    logger.info(
      `Frequency of Interactions for conversation ${conversationId}: ${messageCount} messages.`
    );
  } catch (error) {
    logger.error("Error handling frequency of interactions:" + error.message);
  }
}

export async function handleConversationDuration(conversationId) {
  logger.info("Handle conversation duration triggered.");
  try {
    // Fetch the conversation from the database
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: { messages: true },
    });

    // Ensure there are messages in the conversation
    if (
      !conversation ||
      !conversation.messages ||
      conversation.messages.length < 2
    ) {
      logger.error(
        "Invalid conversation or insufficient messages for duration calculation."
      );
      return;
    }

    // Sort messages by timestamp
    const sortedMessages = conversation.messages.sort(
      (a, b) => new Date(a.sentAt) - new Date(b.sentAt)
    );

    // Log the sorted timestamps for debugging
    logger.info(
      "Sorted Timestamps:",
      sortedMessages.map((msg) => msg.sentAt)
    );

    // Get the timestamps of the first incoming and last outgoing messages
    const firstIncomingTimestamp = new Date(sortedMessages[0].sentAt);
    const lastOutgoingTimestamp = new Date(
      sortedMessages[sortedMessages.length - 1].sentAt
    );

    // Log the timestamps for debugging
    logger.info("First Incoming Timestamp:", firstIncomingTimestamp);
    logger.info("Last Outgoing Timestamp:", lastOutgoingTimestamp);

    // Calculate conversation duration in milliseconds
    const durationInMilliseconds =
      lastOutgoingTimestamp - firstIncomingTimestamp;

    // Check for NaN or negative duration
    if (isNaN(durationInMilliseconds) || durationInMilliseconds < 0) {
      logger.error("Invalid duration calculation.");
      return;
    }

    // Convert duration to minutes, rounding up if less than a minute
    const durationInMinutes = Math.ceil(durationInMilliseconds / (1000 * 60));

    // Update the duration field in the conversation
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { duration: durationInMinutes },
    });

    logger.info(`Conversation Duration: ${durationInMinutes} minutes`);
  } catch (error) {
    logger.error("Error handling conversation duration:", error.message);
  }
}

export function handleFeedback(data) {
  // Implement feedback logic
  logger.info("Feedback: " + data);
}
