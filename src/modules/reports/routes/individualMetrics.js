// src\modules\reports\routes\individualMetrics.js
import express from "express";
import * as individualMetricsController from "../controllers/individualMetricsController.js";
import { authenticateJWT, hasPermission } from "../../authentication/middleware/authMiddleware.js";

const router = express.Router();


router.get(
  "/:conversationId/satisfaction",
  authenticateJWT,
  hasPermission(['viewReports']),
  individualMetricsController.getSatisfactionMetric
);

router.get(
  "/get",
  authenticateJWT,
  hasPermission(['viewReports']),
  individualMetricsController.getAllConversationIds
);

router.get(
  "/:conversationId/conversation-duration",
  authenticateJWT,
  hasPermission(['viewReports']),
  individualMetricsController.getConversationDuration
);

router.get(
  "/:conversationId/avg-agent-response-time",
  authenticateJWT,
  hasPermission(['viewReports']),
  individualMetricsController.getAvgAgentResponseTime
);

router.get(
  "/:conversationId/avg-customer-response-time",
  authenticateJWT,
  hasPermission(['viewReports']),
  individualMetricsController.getAvgCustomerResponseTime
);

router.get(
  "/:conversationId/profile",  
  authenticateJWT,
  hasPermission(['viewReports']),
  individualMetricsController.getCustomerProfile
);

router.get(
  "/:conversationId/entities",  
  authenticateJWT,
  hasPermission(['viewReports']),
  individualMetricsController.getEntities
);
router.get(
  "/:conversationId/participantSid",  
  authenticateJWT,
  hasPermission(['viewReports']),
  individualMetricsController.getParticipantId
);

router.get(
  "/:conversationId/frequency-of-interactions",
  authenticateJWT,
  hasPermission(['viewReports']),
  individualMetricsController.getFrequencyOfInteractions
);

router.get(
  "/:conversationId/sentiment-report",
  authenticateJWT,
  hasPermission(['viewReports']),
  individualMetricsController.getSentimentReport
);

router.get(
  "/:conversationId/message-sentiment-report",
  authenticateJWT,
  hasPermission(['viewReports']),
  individualMetricsController.getMessageSentimentReport
);

export default router;

// router.get('/:conversationId/feedback', (req, res) => {
//   const conversationId = req.params.conversationId;
//   // Implement logic to fetch and return feedback report for the specific customer
//   res.json({ customer: conversationId, metric: 'Feedback Report' });
// });

// router.get('/:conversationId/resolution-status', (req, res) => {
//   const conversationId = req.params.conversationId;
//   // Implement logic to fetch and return resolution status for the specific customer
//   res.json({ customer: conversationId, metric: 'Resolution Status' });
// });
