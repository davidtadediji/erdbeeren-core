// src\modules\analytics\routes\individualMetrics.js
import express from 'express';
import { PrismaClient } from '@prisma/client';
import logger from '../../../../logger.js';

const prisma = new PrismaClient();
const router = express.Router();

// Error handling middleware
router.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Example route for Individual Customer Satisfaction Metrics
router.get('/:customerId/satisfaction', async (req, res, next) => {
  try {
    const customerId = req.params.customerId;

    // Use Prisma to fetch and return satisfaction metrics for the specific customer
    const conversation = await prisma.conversation.findFirst({
      where: { participantSid: customerId },
    });

    // Assuming the 'rating' field is stored in the Conversation model
    const satisfactionMetric = conversation.rating;

    res.json({ customer: customerId, metric: 'Satisfaction Metrics', satisfactionMetric });
  } catch (error) {
    next(error);
  }
});

// Example route for Customer-Specific Conversation Duration
router.get('/:customerId/conversation-duration', async (req, res, next) => {
  try {
    const customerId = req.params.customerId;

    // Use Prisma to fetch and return conversation duration for the specific customer
    const conversation = await prisma.conversation.findFirst({
      where: { participantSid: customerId },
    });

    const conversationDuration = conversation.duration;

    res.json({ customer: customerId, metric: 'Conversation Duration', conversationDuration });
  } catch (error) {
    next(error);
  }
});

// Example route for Response Time Metrics for Individual Customers
router.get('/:customerId/avg-agent-response-time', async (req, res, next) => {
  try {
    const customerId = req.params.customerId;

    // Use Prisma to fetch and return average agent response time for the specific customer
    const conversation = await prisma.conversation.findFirst({
      where: { participantSid: customerId },
    });

    const avgAgentResponseTime = conversation.avgAgentRes;

    res.json({ customer: customerId, metric: 'Agent Response Time Metrics', avgAgentResponseTime });
  } catch (error) {
    next(error);
  }
});

router.get('/:customerId/avg-customer-response-time', async (req, res, next) => {
  try {
    const customerId = req.params.customerId;

    // Use Prisma to fetch and return average customer response time for the specific customer
    const conversation = await prisma.conversation.findFirst({
      where: { participantSid: customerId },
    });

    const avgCustomerResponseTime = conversation.avgCustomerRes;

    res.json({
      customer: customerId,
      metric: 'Customer Response Time Metrics',
      avgCustomerResponseTime,
    });
  } catch (error) {
    next(error);
  }
});

// Example route for Customer Profile-Specific Analysis
router.get('/:customerId/profile', async (req, res, next) => {
  try {
    const customerId = req.params.customerId;

    logger.info(customerId)

    // Use Prisma to fetch and return profile-specific analysis for the specific customer
    const conversation = await prisma.conversation.findFirst({
      where: { participantSid: customerId },
    });

    logger.info(conversation)

    const customerProfile = conversation.profile;

    res.json({ customer: customerId, metric: 'Profile-Specific Analysis', customerProfile });
  } catch (error) {
    next(error);
  }
});

// Example route for Frequency of Interactions for Individual Customers
router.get('/:customerId/frequency-of-interactions', async (req, res, next) => {
  try {
    const customerId = req.params.customerId;

    // Use Prisma to fetch and return frequency of interactions for the specific customer
    const conversation = await prisma.conversation.findFirst({
      where: { participantSid: customerId },
      include: { messages: true },
    });

    const messageCount = conversation.length;

    res.json({ customer: customerId, metric: 'Frequency of Interactions', messageCount });
  } catch (error) {
    next(error);
  }
});

// Example route for Sentiment Analysis for Individual Customers
router.get('/:customerId/sentiment-analysis', async (req, res, next) => {
  try {
    const customerId = req.params.customerId;

    // Use Prisma to fetch and return sentiment analysis for the specific customer
    const conversation = await prisma.conversation.findFirst({
      where: { participantSid: customerId },
    });

    const sentimentAnalysis = conversation.sentiment;

    res.json({ customer: customerId, metric: 'Sentiment Analysis', sentimentAnalysis });
  } catch (error) {
    next(error);
  }
});

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