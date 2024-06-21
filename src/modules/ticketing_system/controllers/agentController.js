import logger from "../../../../logger.js";
import { getConversation } from "../services/conversationService.js";
import {
  getPendingTicketIds,
  getSolvedTicketIds,
} from "../services/agentTicketService.js";

export async function getAgentConversation(req, res, next) {
  try {
    const messages = await getConversation(
      req.user.id,
      req.params.ticketId
    );
    res.json({ messages });
  } catch (error) {
    next(error);
  }
}

export async function getAgentPendingTicketIds(req, res, next) {
  try {
    await getPendingTicketIds(req.user.id);
    res.json({});
  } catch (error) {
    next(error);
  }
}

export async function getAgentSolvedTicketIds(req, res, next) {
  try {
    await getSolvedTicketIds(req.user.id);
    res.json({});
  } catch (error) {
    next(error);
  }
}
