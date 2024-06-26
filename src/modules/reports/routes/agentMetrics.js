import express from "express";
import * as metricsController from "../controllers/agentMetricsController.js";
import {
  authenticateJWT,
  hasPermission,
} from "../../authentication/middleware/authMiddleware.js";

const router = express.Router();

router.get(
  "/:agentId/avg-response-time",
  authenticateJWT,
  hasPermission(["viewMonitorDashboard"]),
  metricsController.getAvgAgentResponseTime
);

router.get(
  "/get",
  authenticateJWT,
  hasPermission(["viewReports"]),
  metricsController.getAllAgentIds
);

router.get(
  "/:agentId/email-address",
  authenticateJWT,
  hasPermission(["viewReports"]),
  metricsController.getEmailAddress
);

router.get(
  "/:agentId/ticket-volume",
  authenticateJWT,
  hasPermission(["viewReports"]),
  metricsController.getTicketVolume
);

router.get(
  "/:agentId/average-handling-time",
  authenticateJWT,
  hasPermission(["viewReports"]),
  metricsController.getAverageHandlingTime
);

router.get(
  "/:agentId/average-satisfaction-score",
  authenticateJWT,
  hasPermission(["viewReports"]),
  metricsController.getAverageCustomerSatisfactionScore
);

export default router;
