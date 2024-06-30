import { getTicketConversation } from "../services/conversationService.js";
import {
  getOpenandPendingTickets,
  getSolvedTicketIds,
  getTicketDetails,
  sendMessage,
  updateStatus,
} from "../services/agentTicketService.js";
import logger from "../../../../logger.js";
import auditLogger from "../../../../audit_logger.js";

export async function getAgentConversation(req, res, next) {
  try {
    const ticketId = parseInt(req.params.ticketId);
    const messages = await getTicketConversation(req.user.id, ticketId);
    auditLogger.info(
      `Agent ${req.user.id} viewed the conversation for ${ticketId}`
    );
    res.json({ messages });
  } catch (error) {
    next(error);
  }
}

export async function getAgentOpenPendingTickets(req, res, next) {
  try {
    const tickets = await getOpenandPendingTickets(req.user.id);
    auditLogger.info(
      `Agent ${req.user.id} viewed their open and pending tickets`
    );
    res.json(tickets);
  } catch (error) {
    next(error);
  }
}

export async function getAgentSolvedTicketIds(req, res, next) {
  try {
    const tickets = await getSolvedTicketIds(req.user.id);
    auditLogger.info(`Agent ${req.user.id} viewed their solved tickets`);
    res.json(tickets);
  } catch (error) {
    next(error);
  }
}

export async function sendAgentMessage(req, res, next) {
  try {
    const { content, ticketId } = req.body;
    await sendMessage(req.user.id, ticketId, content);
    auditLogger.info(
      `Agent ${req.user.id} sent a message to resolve ${ticketId}`
    );
    res.json("Message sent successfully");
  } catch (error) {
    next(error);
  }
}

export async function updateTicketStatus(req, res, next) {
  try {
    const { ticketId, status } = req.body;
    const response = await updateStatus(req.user.id, ticketId, status);
    auditLogger.info(`Agent ${req.user.id} closed ticket ${ticketId}`);
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
