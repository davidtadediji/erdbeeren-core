import logger from "../../../../logger.js";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getPendingTicketIds = async (agentId) => {
  try {
  } catch (error) {
    throw new Error(error);
  } finally {
    await prisma.$disconnect();
  }
};

export const getSolvedTicketIds = async (agentId) => {
  try {
  } catch (error) {
    throw new Error(error);
  } finally {
    await prisma.$disconnect();
  }
};

export const createTicket = async (agentId, conversationId) => {
  try {
    await prisma.ticket.create({
      data: {
        subject: "Incident Complaint",
        description: message,
        status: "Open",
        priority: "High",
        assignedTo: {
          connect: { id: agentId },
        },
        conversation: {
          create: {
            channelType: "Chat",
          },
        },
      },
    });
  } catch (error) {
    throw new Error(error);
  } finally {
    await prisma.$disconnect();
  }
};
