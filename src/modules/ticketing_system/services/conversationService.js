import { PrismaClient } from "@prisma/client";
import eventEmitter from "../../audit_logger/eventEmitter.js";
import logger from "../../../../logger.js";

const prisma = new PrismaClient();

export const getTicketConversation = async (userId, ticketId) => {
  try {
    eventEmitter.emit("auditTrail", {
      userId,
      actionType: "Get Ticket Conversation",
      details: `Retrieving conversation for ticket ${ticketId}`,
      date: new Date().toISOString(),
    });

    logger.info("Emission triggered")

    const conversation = await prisma.conversation.findFirst({
      where: {
        tickets: {
          some: {
            id: ticketId,
            assignedTo: {
              id: userId,
            },
          },
        },
      },
      include: { messages: true },
    });

    // Sort conversation messages by sentAt date from first to last
    const sortedMessages = conversation.messages.sort(
      (a, b) => new Date(a.sentAt) - new Date(b.sentAt)
    );

    return sortedMessages;
  } catch (error) {
    throw error;
  } finally {
    await prisma.$disconnect();
  }
};
