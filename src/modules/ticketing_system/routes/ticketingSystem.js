import express from "express";
import { ROLES } from "../../authentication/config/roles.js";
import {
  authenticateJWT,
  hasPermission,
} from "../../authentication/middleware/authMiddleware.js";
import * as agentController from "../controllers/agentController.js";

const router = express.Router();

router.get(
  "/getConversation/:ticketId",
  authenticateJWT,
  hasPermission(["viewAgentDashboard"]),
  agentController.getAgentConversation
);

router.get(
  "/getPendingTicketIds",
  authenticateJWT,
  hasPermission(["viewAgentDashboard"]),
  agentController.getAgentPendingTicketIds
);

router.get(
  "/getSolvedTicketIds",
  authenticateJWT,
  hasPermission(["viewAgentDashboard"]),
  agentController.getAgentSolvedTicketIds
);

export default router;
