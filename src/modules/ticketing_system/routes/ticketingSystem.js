import express from "express";
import { ROLES } from "../../authentication/config/roles.js";
import {
  authenticateJWT,
  hasPermission,
} from "../../authentication/middleware/authMiddleware.js";
import * as agentController from "../controllers/agentController.js";

const router = express.Router();

router.get(
  "/get-conversation/:ticketId",
  authenticateJWT,
  hasPermission(["viewAgentDashboard"]),
  agentController.getAgentConversation
);

router.get(
  "/get-open-pending-tickets",
  authenticateJWT,
  hasPermission(["viewAgentDashboard"]),
  agentController.getAgentOpenPendingTickets
);

router.get(
  "/get-solved-tickets",
  authenticateJWT,
  hasPermission(["viewAgentDashboard"]),
  agentController.getAgentSolvedTicketIds
);

export default router;
