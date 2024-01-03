// src\modules\analytics\routes\individualMetrics.js
import express from "express";
import * as individualMetricsController from "../controllers/individualMetricsController.js";
import { authenticateJWT, hasPermission } from "../../authentication/middleware/authMiddleware.js";

const router = express.Router();

// Example route for Individual Customer Satisfaction Metrics
router.get(
  "/:customerId/satisfaction",
  authenticateJWT,
  hasPermission(['viewReports']),
  individualMetricsController.getSatisfactionMetric
);

// Example route for Customer-Specific Conversation Duration
router.get(
  "/:customerId/conversation-duration",
  authenticateJWT,
  hasPermission(['viewReports']),
  individualMetricsController.getConversationDuration
);

// Example route for Response Time Metrics for Individual Customers
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

// Example route for Customer Profile-Specific Analysis
router.get(
  "/:customerId/profile",
  individualMetricsController.getCustomerProfile
);

// Example route for Frequency of Interactions for Individual Customers
router.get(
  "/:customerId/frequency-of-interactions",
  authenticateJWT,
  hasPermission(['viewReports']),
  individualMetricsController.getFrequencyOfInteractions
);

// Example route for Sentiment Analysis for Individual Customers
router.get(
  "/:customerId/sentiment-analysis",
  authenticateJWT,
  hasPermission(['viewReports']),
  individualMetricsController.getSentimentAnalysis
);

export default router;

// // Example route for Customer Feedback Analysis
// router.get('/:customerId/feedback', (req, res) => {
//   const customerId = req.params.customerId;
//   // Implement logic to fetch and return feedback analysis for the specific customer
//   res.json({ customer: customerId, metric: 'Feedback Analysis' });
// });

// // Example route for Resolution Status for Individual Customers
// router.get('/:customerId/resolution-status', (req, res) => {
//   const customerId = req.params.customerId;
//   // Implement logic to fetch and return resolution status for the specific customer
//   res.json({ customer: customerId, metric: 'Resolution Status' });
// });
