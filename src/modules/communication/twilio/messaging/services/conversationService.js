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

const getConversationThread = async (conversationId, limit = 1) => {
  try {
    const messages = await prisma.message.findMany({
      where: { conversationId },
      select: { sender: true, content: true, sentAt: true },
      orderBy: { sentAt: "asc" },
    });

    const lastTwoMessages = messages.slice(-limit);

    // Organize messages into a conversation thread
    const conversationThread = lastTwoMessages.map((message) => {
      return {
        sender: message.sender,
        text: message.content,
        timestamp: message.sentAt,
      };
    });

    return conversationThread;
  } catch (error) {
    throw error;
  }
};

const isSuspended = async (conversationId) => {
  try {
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (conversation && conversation.strike >= 5) {
      return true;
    }

    return false;
  } catch (error) {
    console.error("Error occurred while checking strike limit:", error);
    throw error;
  }
};

export {
  createNewConversation,
  getConversationThread,
  updateConversationTimestamp,
  isSuspended,
};
