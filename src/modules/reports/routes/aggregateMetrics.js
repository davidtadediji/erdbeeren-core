// src\modules\reports\routes\metrics.js
import express from "express";
import * as metricsController from "../controllers/aggregateMetricsController.js";
import {
  authenticateJWT,
  hasPermission,
} from "../../authentication/middleware/authMiddleware.js";

const router = express.Router();

router.get(
  "/customer-satisfaction-trend",
  authenticateJWT,
  hasPermission(["viewMonitorDashboard"]),
  metricsController.getCustomerSatisfactionTrend
);

router.get(
  "/average-conversation-duration",
  authenticateJWT,
  hasPermission(["viewMonitorDashboard"]),
  metricsController.getAverageConversationDuration
);
router.get(
  "/response-time-trend",

  authenticateJWT,
  hasPermission(["viewMonitorDashboard"]),
  metricsController.getResponseTimeTrend
);

router.get(
  "/agents-with-lowest-handling-time",
  authenticateJWT,
  hasPermission(["viewMonitorDashboard"]),
  metricsController.getLowestHandlingTimeAgents
);

router.get(
  "/demographic-customer-report",
  metricsController.getDemographicCustomerReport
);
router.get(
  "/high-frequency-customer-identification",
  authenticateJWT,
  hasPermission(["viewMonitorDashboard"]),
  metricsController.getHighFrequencyCustomerIdentification
);

router.get(
  "/overall-sentiment-trend",
  authenticateJWT,
  hasPermission(["viewMonitorDashboard"]),
  metricsController.getOverallSentimentTrend
);

router.get(
  "/agents-with-lowest-response-time",
  authenticateJWT,
  hasPermission(["viewMonitorDashboard"]),
  metricsController.getLowestResponseTimeAgents
);

router.get(
  "/agents-with-best-customer-satisfaction",
  authenticateJWT,
  hasPermission(["viewMonitorDashboard"]),
  metricsController.getAgentsWithBestCustomerSatisfaction
);

export default router;
