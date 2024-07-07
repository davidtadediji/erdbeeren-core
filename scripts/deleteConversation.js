import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const deleteConversation = async (participantSid) => {
  try {
    const conversation = await prisma.conversation.findUnique({
      where: { participantSid },
      include: {
        metrics: true,
        tickets: true,
        messages: true,
      },
    });

    if (!conversation) {
      throw new Error("Conversation not found");
    }

    await prisma.ticket.deleteMany({
      where: { conversationId: conversation.id },
    });

    if (conversation.metrics) {
      await prisma.conversationMetrics.delete({
        where: { id: conversation.metrics.id },
      });
    }

    await prisma.message.deleteMany({
      where: { conversationId: conversation.id },
    });

    await prisma.conversation.delete({
      where: { participantSid },
    });

    console.log(`${participantSid} successfully deleted`);
    return { success: true };
  } catch (error) {
    console.error(`Error deleting conversation ${participantSid}:`, error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
};

deleteConversation("chat");
