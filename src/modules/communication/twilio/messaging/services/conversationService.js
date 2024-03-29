// src\modules\communication\twilio\messaging\service\conversationService.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const updateConversationTimestamp = async (conversationId) => {
  return await prisma.conversation.update({
    where: { id: conversationId },
    data: { lastUpdatedAt: new Date() },
  });
};

const createNewConversation = async (phoneNumber, type) => {
  return await prisma.conversation.create({
    data: { participantSid: phoneNumber, type },
  });
};

const getConversationThread = async (conversationId, limit = 5) => {
  try {
    const messages = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { sentAt: 'desc' }, // Order messages by creation time in descending order
      take: limit, // Limit the number of messages to retrieve
    });

    // Organize messages into a conversation thread
    const conversationThread = messages.map((message) => {
      return {
        sender: message.sender,
        text: message.content,
        timestamp: message.sentAt,
      };
    });

    return conversationThread.reverse(); // Reverse the order to have the oldest messages first
  } catch (error) {
    throw error;
  }
};


export { updateConversationTimestamp, createNewConversation, getConversationThread };
