// src\modules\reports\controllers\individualMetricsController.js
import { PrismaClient } from "@prisma/client";
import logger from "../../../../logger.js";

const prisma = new PrismaClient();

export async function getSatisfactionMetric(req, res, next) {
  try {
    const customerId = req.params.customerId;

    const conversation = await prisma.conversation.findUnique({
      where: { participantSid: customerId },
      include: {
        metrics: true,
      },
    });

    if (!conversation || !conversation.metrics) {
      throw new Error("Conversation or metrics not found");
    }

    // Extract satisfaction metric from conversation metrics
    const satisfactionMetric = conversation.metrics.rating;

    res.json({
      customer: customerId,
      metric: "Satisfaction Metrics",
      satisfactionMetric,
    });
  } catch (error) {
    next(error);
  } finally {
    await prisma.$disconnect();
  }
}

export async function getConversationDuration(req, res, next) {
  try {
    const customerId = req.params.customerId;

    const conversation = await prisma.conversation.findUnique({
      where: { participantSid: customerId },
      include: {
        metrics: true,
      },
    });

    if (!conversation || !conversation.metrics) {
      throw new Error("Conversation or metrics not found");
    }

    // Extract conversation duration from conversation metrics
    const conversationDuration = conversation.metrics.duration;

    res.json({
      customer: customerId,
      metric: "Conversation Duration",
      conversationDuration,
    });
  } catch (error) {
    next(error);
  } finally {
    await prisma.$disconnect();
  }
}

export async function getAvgAgentResponseTime(req, res, next) {
  try {
    const customerId = req.params.customerId;

    const conversation = await prisma.conversation.findUnique({
      where: { participantSid: customerId },
      include: {
        metrics: true,
      },
    });

    if (!conversation || !conversation.metrics) {
      throw new Error("Conversation or metrics not found");
    }

    // Extract average agent response time from conversation metrics
    const avgAgentResponseTime = conversation.metrics.avgAgentResponse;

    res.json({
      customer: customerId,
      metric: "Agent Response Time Metrics",
      avgAgentResponseTime,
    });
  } catch (error) {
    next(error);
  } finally {
    await prisma.$disconnect();
  }
}

export async function getAllParticipantIds(req, res, next) {
  logger.info("Get all particpants triggered");
  try {
    const participants = await prisma.conversation.findMany({
      select: {
        participantSid: true,
      },
    });

    logger.info(JSON.stringify(participants));

    const participantIds = participants.map(
      (participant) => participant.participantSid
    );
    logger.info(JSON.stringify(participantIds));

    res.json({
      participantIds,
    });
  } catch (error) {
    next(error);
  } finally {
    await prisma.$disconnect();
  }
}

export async function getAvgCustomerResponseTime(req, res, next) {
  try {
    const customerId = req.params.customerId;
    logger.info("Triggered!");

    const conversation = await prisma.conversation.findUnique({
      where: { participantSid: customerId },
      include: {
        metrics: true,
      },
    });

    if (!conversation || !conversation.metrics) {
      throw new Error("Conversation or metrics not found");
    }

    // Extract average customer response time from conversation metrics
    const avgCustomerResponseTime = conversation.metrics.avgCustomerResponse;

    res.json({
      customer: customerId,
      metric: "Customer Response Time Metrics",
      avgCustomerResponseTime,
    });
  } catch (error) {
    next(error);
  } finally {
    await prisma.$disconnect();
  }
}

export async function getCustomerProfile(req, res, next) {
  try {
    const customerId = req.params.customerId;

    const conversation = await prisma.conversation.findUnique({
      where: { participantSid: customerId },
      include: {
        metrics: true,
      },
    });

    if (!conversation || !conversation.metrics) {
      throw new Error("Conversation or metrics not found");
    }

    // Extract customer profile from conversation metrics
    const customerProfile = conversation.metrics.customerProfile;

    res.json({
      customer: customerId,
      metric: "Profile-Specific Report",
      customerProfile,
    });
  } catch (error) {
    next(error);
  } finally {
    await prisma.$disconnect();
  }
}

export async function getFrequencyOfInteractions(req, res, next) {
  try {
    const customerId = req.params.customerId;

    const conversation = await prisma.conversation.findUnique({
      where: { participantSid: customerId },
      include: { messages: true },
    });

    const messageCount = conversation ? conversation.length : 0;

    res.json({
      customer: customerId,
      metric: "Frequency of Interactions",
      messageCount,
    });
  } catch (error) {
    next(error);
  }
}

export async function getSentimentReport(req, res, next) {
  try {
    const customerId = req.params.customerId;

    const conversation = await prisma.conversation.findUnique({
      where: { participantSid: customerId },
      include: {
        metrics: true,
      },
    });

    logger.info("Here");
    logger.info("Conversation: " + conversation.metrics.overallSentimentScore);

    res.json({
      customer: customerId,
      metric: "Sentiment Report",
      overallSentimentScore: conversation.metrics.overallSentimentScore,
      overallSentiment: conversation.metrics.overallSentiment,
    });
  } catch (error) {
    next(error);
  }
}

export async function getMessageSentimentReport(req, res, next) {
  try {
    const customerId = req.params.customerId;

    const conversation = await prisma.conversation.findUnique({
      where: { participantSid: customerId },
    });

    const messages = await prisma.message.findMany({
      where: { conversationId: conversation.id },
    });

    // Extract sentimentScore and sentiment from each message
    const messageSentiments = messages.map((message) => ({
      sentimentScore: message.sentimentScore,
      sentiment: message.sentiment,
    }));

    res.json({
      customer: customerId,
      metric: "Message Sentiment Report",
      messageSentiments,
    });
  } catch (error) {
    next(error);
  }
}

export async function getEntities(req, res, next) {
  try {
    const customerId = req.params.customerId;

    const conversation = await prisma.conversation.findUnique({
      where: { participantSid: customerId },
      include: {
        metrics: true,
      },
    });

    const entities = conversation.metrics.entities;

    res.json({
      customer: customerId,
      metric: "Conversation Entities",
      entities,
    });
  } catch (error) {
    next(error);
  }
}
