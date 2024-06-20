// src\modules\reports\routes\individualMetrics.js
import express from "express";
import * as individualMetricsController from "../controllers/individualMetricsController.js";
import { authenticateJWT, hasPermission } from "../../authentication/middleware/authMiddleware.js";

const router = express.Router();


router.get(
  "/:customerId/satisfaction",
  authenticateJWT,
  hasPermission(['viewReports']),
  individualMetricsController.getSatisfactionMetric
);

router.get(
  "/get",
  authenticateJWT,
  hasPermission(['viewReports']),

  individualMetricsController.getAllParticipantIds
);

router.get(
  "/:customerId/conversation-duration",
  authenticateJWT,
  hasPermission(['viewReports']),
  individualMetricsController.getConversationDuration
);

router.get(
  "/:customerId/avg-agent-response-time",
  authenticateJWT,
  hasPermission(['viewReports']),
  individualMetricsController.getAvgAgentResponseTime
);

router.get(
  "/:customerId/avg-customer-response-time",
  authenticateJWT,
  hasPermission(['viewReports']),
  individualMetricsController.getAvgCustomerResponseTime
);

router.get(
  "/:customerId/profile",  
  authenticateJWT,
  hasPermission(['viewReports']),
  individualMetricsController.getCustomerProfile
);

router.get(
  "/:customerId/entities",  
  authenticateJWT,
  hasPermission(['viewReports']),
  individualMetricsController.getEntities
);

router.get(
  "/:customerId/frequency-of-interactions",
  authenticateJWT,
  hasPermission(['viewReports']),
  individualMetricsController.getFrequencyOfInteractions
);

router.get(
  "/:customerId/sentiment-report",
  authenticateJWT,
  hasPermission(['viewReports']),
  individualMetricsController.getSentimentReport
);

router.get(
  "/:customerId/message-sentiment-report",
  authenticateJWT,
  hasPermission(['viewReports']),
  individualMetricsController.getMessageSentimentReport
);

export default router;

// router.get('/:customerId/feedback', (req, res) => {
//   const customerId = req.params.customerId;
//   // Implement logic to fetch and return feedback report for the specific customer
//   res.json({ customer: customerId, metric: 'Feedback Report' });
// });

// router.get('/:customerId/resolution-status', (req, res) => {
//   const customerId = req.params.customerId;
//   // Implement logic to fetch and return resolution status for the specific customer
//   res.json({ customer: customerId, metric: 'Resolution Status' });
// });
