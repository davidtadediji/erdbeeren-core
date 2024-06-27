import { getTicketConversation } from "../services/conversationService.js";
import {
  getOpenandPendingTickets,
  getSolvedTicketIds,
  getTicketDetails,
  sendMessage,
  updateStatus,
} from "../services/agentTicketService.js";
import logger from "../../../../logger.js";

export async function getAgentConversation(req, res, next) {
  try {
    const ticketId = parseInt(req.params.ticketId);
    const messages = await getTicketConversation(req.user.id, ticketId);
    logger.info(`Agent ${req.user.id} got agent conversation`);
    res.json({ messages });
  } catch (error) {
    next(error);
  }
}

export async function getAgentOpenPendingTickets(req, res, next) {
  try {
    const tickets = await getOpenandPendingTickets(req.user.id);
    logger.info(`Agent ${req.user.id} viewed open and pending tickets`);
    res.json(tickets);
  } catch (error) {
    next(error);
  }
}

export async function getAgentSolvedTicketIds(req, res, next) {
  try {
    const tickets = await getSolvedTicketIds(req.user.id);
    logger.info(`Agent ${req.user.id} viewed solved tickets`);
    res.json(tickets);
  } catch (error) {
    next(error);
  }
}

export async function sendAgentMessage(req, res, next) {
  try {
    const { content, ticketId } = req.body;
    await sendMessage(req.user.id, ticketId, content);
    logger.info(`Agent ${req.user.id} sent a message for ${ticketId}`);
    res.json("Message sent successfully");
  } catch (error) {
    next(error);
  }
}

export async function updateTicketStatus(req, res, next) {
  try {
    const { ticketId, status } = req.body;
    const response = await updateStatus(req.user.id, ticketId, status);
    logger.info(`Agent ${req.user.id} closed ticket ${ticketId}`);
    res.json(response);
  } catch (error) {
    next(error);
  }
}

export async function getAgentTicketDetails(req, res, next) {
  try {
    const ticketId = parseInt(req.params.ticketId);
    const response = await getTicketDetails(ticketId);
    res.json(response);
  } catch (error) {
    next(error);
  }
}
