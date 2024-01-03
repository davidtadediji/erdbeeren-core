// src\modules\analytics\routes\metrics.js
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
  hasPermission(['viewMonitorDashboard']),
  metricsController.getCustomerSatisfactionTrend
);
router.get(
  "/average-conversation-duration",
  authenticateJWT,
  hasPermission(['viewMonitorDashboard']),
  metricsController.getAverageConversationDuration
);
router.get(
  "/response-time-trend",

  authenticateJWT,
  hasPermission(['viewMonitorDashboard']),
  metricsController.getResponseTimeTrend
);
router.get(
  "/demographic-customer-analysis",
  metricsController.getDemographicCustomerAnalysis
);
router.get(
  "/high-frequency-customer-identification",
  authenticateJWT,
  hasPermission(['viewMonitorDashboard']),
  metricsController.getHighFrequencyCustomerIdentification
);
router.get(
  "/overall-sentiment-trend",
  authenticateJWT,
  hasPermission(['viewMonitorDashboard']),
  metricsController.getOverallSentimentTrend
);

export default router;
