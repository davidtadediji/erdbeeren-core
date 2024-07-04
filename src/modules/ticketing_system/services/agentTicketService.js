// src\modules\ticketing_system\services\agentTicketService.js
import { PrismaClient } from "@prisma/client";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import http from "http";
import twilio from "twilio";
import { WebSocketServer } from "ws";
import logger from "../../../../logger.js";
import eventEmitter from "../../analytics_engine/eventEmitter.js";
import { saveMessageToConversation } from "../../communication/twilio/messaging/services/messageService.js";
dotenv.config();

const app = express();
app.use(cors());

// Creating HTTP server for WebSocket, my attempt at using WebSocket server to update client end
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// Initializing Prisma client
const prisma = new PrismaClient();

// Get twilio credentials from environment variables
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

// create a twilio client instance
const client = twilio(accountSid, authToken);

// WebSocket server handling connections
wss.on("connection", (socket) => {
  logger.info("Client is connected");

  // Handling disconnect event
  socket.on("disconnect", () => {
    logger.info("Client disconnected");
  });
});

// Function to fetch open and pending tickets for an agent
export const getOpenandPendingTickets = async (agentId) => {
  try {
    /* get all the open and pending tickets an agent has, 
    the select keyword is used to specify what attributes to be returned,
    orderby is used to organise the tickets in the descending order from latest to earliest
    This query returns the latest message in the conversation associated with the ticket */
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

    // map tickets to required format before sending response to the frontend
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

// Function to fetch solved tickets for a specific agent
export const getSolvedTicketIds = async (agentId) => {
  try {
    // similar query with open and pending function but for solved
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
    // map tickets to required format
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

// Function to create a new ticket to address a service complaint or incident
export const createTicket = async (agentId, type, conversationId, message) => {
  try {
    logger.info("Handling ticket creation!");

    // create a new ticket in the database
    await prisma.ticket.create({
      data: {
        subject: type,
        description: message,
        status: "pending",
        assignedTo: {
          connect: { id: agentId },
        },
        conversation: {
          connect: { id: conversationId },
        },
      },
    });
  } catch (error) {
    throw error;
  } finally {
    await prisma.$disconnect();
  }
};

// Function to select a random agent from the database
export const selectRandomAgent = async () => {
  try {
    // fetch all agents from the database
    const agents = await prisma.user.findMany({
      where: {
        role: "agent",
      },
      select: {
        id: true,
      },
    });

    if (agents.length === 0) {
      throw new Error("No agents available");
    }

    // select an agent by an random index from the list of agents and return the id, handle errors that occur.
    const randomIndex = Math.floor(Math.random() * agents.length);
    return agents[randomIndex].id;
  } catch (error) {
    console.error("Error while choosing random agent:", error.message);
    throw error;
  } finally {
    await prisma.$disconnect(); // this is to disconnect from the database, it is good practice
  }
};

// Function for agent to send a message to address a ticket
export const sendMessage = async (agentId, ticketId, message) => {
  try {
    // fetch ticket details including conversation information
    const ticket = await prisma.ticket.findUnique({
      where: {
        id: ticketId,
      },
      select: {
        conversation: true,
      },
    });

    // determine if the message should be sent via WhatsApp or SMS 
    const participantSid = ticket.conversation?.participantSid ?? null;
    const isWhatsApp = participantSid.startsWith("whatsapp:");
    // and send the agent's message to the customer
    if (isWhatsApp) {
      await client.messages.create({
        body: message,
        from: "whatsapp:" + twilioPhoneNumber,
        to: participantSid,
      });
    } else {
      logger.info("sms triggered");
      await client.messages.create({
        body: message,
        from: twilioPhoneNumber,
        to: participantSid,
      });
    }

    // save the message to the conversation
    const humanAgentMessage = await saveMessageToConversation(
      ticket.conversation.id,
      agentId.toString(),
      message
    );

    // emit events for analytics purposes
    eventEmitter.emit("newMessageCreated", {
      conversationId: ticket.conversation.id,
      messageId: humanAgentMessage.id,
    });

    eventEmitter.emit("humanResponded", {
      agentId,
      messageId: humanAgentMessage.id,
    });
  } catch (error) { // handle any errors and finally, disconnect
    throw error;
  } finally {
    await prisma.$disconnect();
  }
};

/* Function to update the status of a ticket, used when the agent is closing a ticket 
or to set the ticket status as open when an agent clicks to view a conversation */
export async function updateStatus(agentId, ticketId, status) {
  try {
    /* to allow this function to be multi-purposed 
    create an object that has a closedAt field depending on if the status is to be closed*/
    const updateData = { status: status };

    if (status === "closed") {
      updateData.closedAt = new Date();
    }

    // update the ticket status in the database
    const updatedTicket = await prisma.ticket.update({
      where: { id: ticketId },
      data: updateData,
      include: { conversation: true },
    });

    /* Then, this prepares a message to the customer indicating that the message has been 
    transferred to AI agent if ticket status is closed */
    if (status === "closed") {
      const message =
        `You are now connected with an AI agent. Kindly rate the assistance you 
        received from the service agent on a scale of 1-5.`;

      // send the message via Twilio based on customers's messaging service
      const participantSid = updatedTicket.conversation?.participantSid ?? null;
      const isWhatsApp = participantSid.startsWith("whatsapp:");

      if (isWhatsApp) {
        await client.messages.create({
          body: message,
          from: "whatsapp:" + twilioPhoneNumber,
          to: participantSid,
        });
      } else {
        logger.info("sms triggered");
        await client.messages.create({
          body: message,
          from: twilioPhoneNumber,
          to: participantSid,
        });
      }

      // then, we save the closing message to the conversation
      await saveMessageToConversation(
        updatedTicket.conversation.id,
        agentId.toString(),
        message
      );
    }

    return updatedTicket;
  } catch (error) {
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Function for the agent to fetch detailed information about a ticket, either solved, pending or open.
export async function getTicketDetails(ticketId) {
  try {
    // Fetch the ticket details including assigned agent and conversation information
    const ticket = await prisma.ticket.findUnique({
      where: {
        id: ticketId,
      },
      include: {
        assignedTo: true,
        conversation: true,
      },
    });

    // throw an error if there is no ticket found
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

// To export the HTTP server instance for the WebSocket
export { server };

