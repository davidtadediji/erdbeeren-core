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

export default router;
