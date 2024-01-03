// src\modules\analytics\controllers\individualMetricsController.js
import { PrismaClient } from '@prisma/client';
import logger from '../../../../logger.js';

const prisma = new PrismaClient();

export async function getSatisfactionMetric(req, res, next) {
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
}

export async function getConversationDuration(req, res, next) {
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
}

export async function getAvgAgentResponseTime(req, res, next) {
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
}

export async function getAvgCustomerResponseTime(req, res, next) {
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
}

export async function getCustomerProfile(req, res, next) {
  try {
    const customerId = req.params.customerId;

    logger.info(customerId);

    // Use Prisma to fetch and return profile-specific analysis for the specific customer
    const conversation = await prisma.conversation.findFirst({
      where: { participantSid: customerId },
    });

    logger.info(conversation);

    const customerProfile = conversation.profile;

    res.json({ customer: customerId, metric: 'Profile-Specific Analysis', customerProfile });
  } catch (error) {
    next(error);
  }
}

export async function getFrequencyOfInteractions(req, res, next) {
  try {
    const customerId = req.params.customerId;

    // Use Prisma to fetch and return frequency of interactions for the specific customer
    const conversation = await prisma.conversation.findFirst({
      where: { participantSid: customerId },
      include: { messages: true },
    });

    const messageCount = conversation ? conversation.length : 0;

    res.json({ customer: customerId, metric: 'Frequency of Interactions', messageCount });
  } catch (error) {
    next(error);
  }
}

export async function getSentimentAnalysis(req, res, next) {
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
}
