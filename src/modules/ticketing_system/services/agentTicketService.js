import { PrismaClient } from "@prisma/client";
import cors from "cors";
import logger from "../../../../logger.js";
import express from "express";
import http from "http";
import { WebSocketServer } from "ws";
import eventEmitter from "../../analytics_engine/eventEmitter.js";
import { saveMessageToConversation } from "../../communication/twilio/messaging/services/messageService.js";
import dotenv from "dotenv";
dotenv.config();

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
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        status: true,
        description: true,
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
      lastMessageContent: ticket.description,
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
    await prisma.ticket.create({
      data: {
        subject: type,
        description: message,
        status: "pending",
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

export const sendMessage = async (agentId, ticketId, message) => {
  const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
  try {
    const ticket = await prisma.ticket.findUnique({
      where: {
        id: ticketId,
      },
      select: {
        conversation: true,
      },
    });

    const humanAgentMessage = await saveMessageToConversation(
      ticket.conversation.id,
      agentId.toString(),
      message
    );

    // const conversation = await prisma.conversation.findUnique({
    //   where: { id: conversationId },
    //   select: { participantSid: true },
    // });

    const participantSid = ticket.conversation?.participantSid ?? null;

    const isWhatsApp = participantSid.startsWith("whatsapp:");
    if (isWhatsApp) {
      // await client.messages.create({
      //   body: response.res,
      //   from: "whatsapp:" + twilioPhoneNumber,
      //   to: participantSid,
      // });
    } else {
      logger.info("sms triggered");
      // await client.messages.create({
      //   body: response.res,
      //   from: twilioPhoneNumber,
      //   to: participantSid,
      // });
    }
    eventEmitter.emit("newMessageCreated", {
      conversationId: ticket.conversation.id,
      messageId: humanAgentMessage.id,
    });

    eventEmitter.emit("humanResponded", {
      agentId,
      messageId: humanAgentMessage.id,
    });
  } catch (error) {
    throw error;
  } finally {
    await prisma.$disconnect();
  }
};

export async function updateStatus(agentId, ticketId, status) {
  try {
    // Update the ticket status
    const updatedTicket = await prisma.ticket.update({
      where: { id: ticketId },
      data: { status: status, closedAt: new Date() },
      include: { conversation: true },
    });

    const message =
      "You have been routed to the AI agent you are now conversing with an AI agent";

    await saveMessageToConversation(
      updatedTicket.conversation.id,
      agentId.toString(),
      message
    );

    // const conversation = await prisma.conversation.findUnique({
    //   where: { id: conversationId },
    //   select: { participantSid: true },
    // });

    const participantSid = updatedTicket.conversation?.participantSid ?? null;

    const isWhatsApp = participantSid.startsWith("whatsapp:");
    if (isWhatsApp) {
      // await client.messages.create({
      //   body: message,
      //   from: "whatsapp:" + twilioPhoneNumber,
      //   to: participantSid,
      // });
    } else {
      logger.info("sms triggered");
      // await client.messages.create({
      //   body: response.res,
      //   from: twilioPhoneNumber,
      //   to: participantSid,
      // });
    }
    return updatedTicket;
  } catch (error) {
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

export async function getTicketDetails(ticketId) {
  try {
    const ticket = await prisma.ticket.findUnique({
      where: {
        id: ticketId,
      },
      include: {
        assignedTo: true,
        conversation: true,
      },
    });

    if (!ticket) {
      throw new Error(`Ticket with ID ${ticketId} not found`);
    }

    return ticket;
  } catch (error) {
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

export { server };
