import { PrismaClient } from "@prisma/client";
import cors from "cors";
import logger from "../../../../logger.js";
import express from "express";
import http from "http";
import { WebSocketServer } from "ws";

const app = express();

app.use(cors());
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const prisma = new PrismaClient();

wss.on("connection", (socket) => {
  logger.info("Client is connected");
  socket.on("disconnect", () => {
    logger.info("Client disconnected");
  });
});

export const getOpenandPendingTickets = async (agentId) => {
  try {
    const tickets = await prisma.ticket.findMany({
      where: {
        userId: agentId,
        status: {
          in: ["open", "pending"],
        },
      },
      select: {
        id: true,
        status: true,
        conversationId: true,
        conversation: {
          select: {
            messages: {
              orderBy: {
                sentAt: "desc",
              },
              take: 1,
              select: {
                content: true,
                deliveredAt: true,
              },
            },
          },
        },
      },
    });

    // logger.info("Ticket: " + JSON.stringify(tickets));

    const result = tickets?.map((ticket) => ({
      ticketId: ticket.id,
      status: ticket.status,
      conversationId: ticket.conversationId,
      lastMessageContent: ticket.conversation.messages[0]?.content || null,
      lastMessageDeliveryTime:
        ticket.conversation.messages[0]?.deliveredAt || null,
    }));

    return result;
  } catch (error) {
    throw error;
  } finally {
    await prisma.$disconnect();
  }
};

export const getSolvedTicketIds = async (agentId) => {
  try {
    const tickets = await prisma.ticket.findMany({
      where: {
        userId: agentId,
        status: {
          in: ["closed"],
        },
      },
      select: {
        id: true,
        status: true,
        conversationId: true,
        conversation: {
          select: {
            messages: {
              orderBy: {
                sentAt: "desc",
              },
              take: 1,
              select: {
                content: true,
                deliveredAt: true,
              },
            },
          },
        },
      },
    });

    // logger.info("Ticket: " + JSON.stringify(tickets));

    const result = tickets?.map((ticket) => ({
      ticketId: ticket.id,
      status: ticket.status,
      conversationId: ticket.conversationId,
      lastMessageContent: ticket.conversation.messages[0]?.content || null,
      lastMessageDeliveryTime:
        ticket.conversation.messages[0]?.deliveredAt || null,
    }));

    return result;
  } catch (error) {
    throw error;
  } finally {
    await prisma.$disconnect();
  }
};

export const createTicket = async (agentId, type, conversationId, message) => {
  try {
    logger.info("Handling ticket creation!");
    const newTicket = await prisma.ticket.create({
      data: {
        subject: type,
        description: message,
        status: "open",
        priority: "high",
        assignedTo: {
          connect: { id: agentId },
        },
        conversation: {
          connect: { id: conversationId },
        },
      },
    });

    // wss.clients.forEach((client) => {
    //   logger.info("Message sent to client");
    //   if (client.readyState === WebSocket.OPEN) {
    //     client.send(JSON.stringify({ event: "newTicket", data: newTicket }));
    //   }
    // });
  } catch (error) {
    throw error;
  } finally {
    await prisma.$disconnect();
  }
};

export const selectRandomAgent = async () => {
  try {
    const agentIds = await prisma.user.findMany({
      where: {
        role: "agent",
      },
      select: {
        id: true,
      },
    });

    if (agentIds.length === 0) {
      throw new Error("No agents available");
    }

    const randomIndex = Math.floor(Math.random() * agentIds.length);
    return agentIds[randomIndex].id;
  } catch (error) {
    console.error("Error while choosing random agent:", error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
};

export { server };
