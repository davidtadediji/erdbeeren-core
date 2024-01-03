// src\modules\analytics\routes\metrics.js
import express from "express";
import * as metricsController from "../controllers/aggregateMetricsController.js";
import {
  authenticateJWT,
  hasPermission,
} from "../../authentication/middleware/authMiddleware.js";
import { ROLES } from "../../authentication/config/roles.js";

const router = express.Router();

router.get(
  "/customer-satisfaction-trend",
  authenticateJWT,
  hasPermission([ROLES.MINOTOR]),
  metricsController.getCustomerSatisfactionTrend
);
router.get(
  "/average-conversation-duration",
  authenticateJWT,
  hasPermission([ROLES.MINOTOR]),
  metricsController.getAverageConversationDuration
);
router.get(
  "/response-time-trend",

  authenticateJWT,
  hasPermission([ROLES.MINOTOR]),
  metricsController.getResponseTimeTrend
);
router.get(
  "/demographic-customer-analysis",
  metricsController.getDemographicCustomerAnalysis
);
router.get(
  "/high-frequency-customer-identification",
  authenticateJWT,
  hasPermission([ROLES.MINOTOR]),
  metricsController.getHighFrequencyCustomerIdentification
);
router.get(
  "/overall-sentiment-trend",
  authenticateJWT,
  hasPermission([ROLES.MINOTOR]),
  metricsController.getOverallSentimentTrend
);

export default router;
