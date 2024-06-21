import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getConversation = async (userId, ticketId) => {
  try {
    const conversation = await prisma.conversation.findUnique({
      where: { participantSid: "+23054863422" },
      include: { messages: true },
    });

    if (!conversation.messages || !conversation) {
      logger.error("The conversation or its messages do not exist.");
      return;
    }

    // sort conversation messages by date from first to last
    const sortedMessages = conversation.messages.sort(
      (a, b) => new Date(a.sentAt) - new Date(b.sentAt)
    );
    return sortedMessages;
  } catch (error) {
    throw new Error(error);
  } finally {
    await prisma.$disconnect();
  }
};
