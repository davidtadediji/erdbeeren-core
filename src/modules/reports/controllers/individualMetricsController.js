// src\modules\reports\controllers\individualMetricsController.js
import { PrismaClient } from "@prisma/client";
import logger from "../../../../logger.js";
import { extractProfile } from "../../llm_context/services/customerProfiler.js";

const prisma = new PrismaClient();

export async function getSatisfactionMetric(req, res, next) {
  try {
    const conversationId = req.params.conversationId;

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        metrics: true,
      },
    });

    if (!conversation || !conversation.metrics) {
      throw new Error("Conversation or metrics not found");
    }

    const satisfactionMetric = conversation.metrics.rating;

    res.json({
      customer: conversationId,
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
    const conversationId = req.params.conversationId;

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        metrics: true,
      },
    });

    if (!conversation || !conversation.metrics) {
      throw new Error("Conversation or metrics not found");
    }

    const conversationDuration = conversation.metrics.duration;

    res.json({
      customer: conversationId,
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
    const conversationId = req.params.conversationId;

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        metrics: true,
      },
    });

    if (!conversation || !conversation.metrics) {
      throw new Error("Conversation or metrics not found");
    }

    const avgAgentResponseTime = conversation.metrics.avgAgentResponse
      ? conversation.metrics.avgAgentResponse.toFixed(2)
      : conversation.metrics.avgAgentResponse;

    res.json({
      customer: conversationId,
      metric: "Agent Response Time Metrics",
      avgAgentResponseTime,
    });
  } catch (error) {
    next(error);
  } finally {
    await prisma.$disconnect();
  }
}

export async function getAllConversationIds(req, res, next) {
  logger.info("Get all conversation ids triggered");
  try {
    const participants = await prisma.conversation.findMany({
      select: {
        id: true,
      },
    });

    logger.info(JSON.stringify(participants));

    const participantIds = participants.map((participant) => participant.id);

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
    const conversationId = req.params.conversationId;
    logger.info("Triggered!");

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        metrics: true,
      },
    });

    if (!conversation || !conversation.metrics) {
      throw new Error("Conversation or metrics not found");
    }

    const avgCustomerResponseTime = conversation.metrics.avgCustomerResponse
      ? conversation.metrics.avgCustomerResponse.toFixed(2)
      : conversation.metrics.avgCustomerResponse;

    res.json({
      customer: conversationId,
      metric: "Customer Response Time Metrics",
      avgCustomerResponseTime,
    });
  } catch (error) {
    next(error);
  } finally {
    await prisma.$disconnect();
  }
}

export async function generateCustomerProfile(req, res, next) {
  try {
    const conversationId = req.params.conversationId;

    const messages = await prisma.message.findMany({
      where: {
        conversationId,
        sender: "customer",
      },
      orderBy: {
        sentAt: "desc",
      },
      take: 10,
    });

    // console.log(messages)
    const messagesContent = messages
      .reverse()
      .map((message) => message.content)
      .join(" ");

    console.log(messagesContent);

    const customerProfile = await extractProfile(messagesContent);

    console.log(customerProfile);

    await prisma.conversationMetrics.update({
      where: { conversationId },
      data: { customerProfile },
    });

    res.json({
      customer: conversationId,
      metric: "Generated Customer Profile",
      customerProfile,
    });
  } catch (error) {
    next(error);
  } finally {
    await prisma.$disconnect();
  }
}

export async function getCustomerProfile(req, res, next) {
  try {
    const conversationId = req.params.conversationId;

    const conversationMetrics = await prisma.conversationMetrics.findUnique({
      where: { conversationId: conversationId },
    });

    const customerProfile = conversationMetrics.customerProfile;

    res.json({
      customer: conversationId,
      metric: "Customer Profile",
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
    const conversationId = req.params.conversationId;

    const conversationMetrics = await prisma.conversationMetrics.findUnique({
      where: { conversationId: conversationId },
    });

    const messageCount = conversationMetrics.length;

    res.json({
      customer: conversationId,
      metric: "Frequency of Interactions",
      messageCount,
    });
  } catch (error) {
    next(error);
  } finally {
    await prisma.$disconnect();
  }
}

export async function getSentimentReport(req, res, next) {
  try {
    const conversationId = req.params.conversationId;

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        metrics: true,
      },
    });

    logger.info("Here");
    logger.info("Conversation: " + conversation.metrics.overallSentimentScore);

    res.json({
      customer: conversationId,
      metric: "Sentiment Report",
      overallSentimentScore: conversation.metrics.overallSentimentScore,
      overallSentiment: conversation.metrics.overallSentiment,
    });
  } catch (error) {
    next(error);
  } finally {
    await prisma.$disconnect();
  }
}

export async function getMessageSentimentReport(req, res, next) {
  try {
    const conversationId = req.params.conversationId;

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    const messages = await prisma.message.findMany({
      where: { conversationId: conversation.id },
    });

    const messageSentiments = messages.map((message) => ({
      sentimentScore: message.sentimentScore,
      sentiment: message.sentiment,
    }));

    res.json({
      customer: conversationId,
      metric: "Message Sentiment Report",
      messageSentiments,
    });
  } catch (error) {
    next(error);
  } finally {
    await prisma.$disconnect();
  }
}

export async function getParticipantId(req, res, next) {
  try {
    const conversationId = req.params.conversationId;

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    const participantSid = conversation.participantSid;

    res.json({
      customer: conversationId,
      metric: "Participant Sid",
      participantSid,
    });
  } catch (error) {
    next(error);
  } finally {
    await prisma.$disconnect();
  }
}

export async function getEntities(req, res, next) {
  try {
    const conversationId = req.params.conversationId;

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        metrics: true,
      },
    });

    const entities = conversation.metrics.entities;

    res.json({
      customer: conversationId,
      metric: "Conversation Entities",
      entities,
    });
  } catch (error) {
    next(error);
  } finally {
    await prisma.$disconnect();
  }
}
