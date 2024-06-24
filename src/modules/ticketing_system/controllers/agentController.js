import { getTicketConversation } from "../services/conversationService.js";
import {
  getOpenandPendingTickets,
  getSolvedTicketIds,
  sendMessage,
  updateStatus,
} from "../services/agentTicketService.js";

export async function getAgentConversation(req, res, next) {
  try {
    const ticketId = parseInt(req.params.ticketId);
    const messages = await getTicketConversation(req.user.id, ticketId);
    res.json({ messages });
  } catch (error) {
    next(error);
  }
}

export async function getAgentOpenPendingTickets(req, res, next) {
  try {
    const tickets = await getOpenandPendingTickets(req.user.id);
    res.json(tickets);
  } catch (error) {
    next(error);
  }
}

export async function getAgentSolvedTicketIds(req, res, next) {
  try {
    const tickets = await getSolvedTicketIds(req.user.id);
    res.json(tickets);
  } catch (error) {
    next(error);
  }
}

export async function sendAgentMessage(req, res, next) {
  try {
    const { content, ticketId } = req.body;
    await sendMessage(req.user.id, ticketId, content);
    res.json("Message sent successfully");
  } catch (error) {
    next(error);
  }
}

export async function updateTicketStatus(req, res, next) {
  try {
    const { ticketId, status } = req.body;
    const response = await updateStatus(ticketId, status);
    res.json(response);
  } catch (error) {
    next(error);
  }
}
