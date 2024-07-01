// src\modules\communication\twilio\messaging\service\conversationService.js
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const updateConversationTimestamp = async (conversationId) => {
  return await prisma.conversation.update({
    where: { id: conversationId },
    data: { updatedAt: new Date() },
  });
};

const createNewConversation = async (phoneNumber, channelType) => {
  return await prisma.conversation.create({
    data: { participantSid: phoneNumber, channelType, language: "English" },
  });
};

const getConversationThread = async (conversationId, limit = 5) => {
  try {
    const messages = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { sentAt: "desc" },
      take: limit,
    });

    // Organize messages into a conversation thread
    const conversationThread = messages.map((message) => {
      return {
        sender: message.sender,
        text: message.content,
        timestamp: message.sentAt,
      };
    });

    return conversationThread.reverse();
  } catch (error) {
    throw error;
  }
};

export {
  updateConversationTimestamp,
  createNewConversation,
  getConversationThread,
};
