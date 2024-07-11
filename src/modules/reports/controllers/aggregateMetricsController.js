// src\modules\reports\controllers\metricsController.js
import express from "express";
import fs from "fs/promises";
import logger from "../../../../logger.js";
import path from "path";
import { PrismaClient } from "@prisma/client";

const currentModuleURL = new URL(import.meta.url);
const currentModuleDir = path.dirname(currentModuleURL.pathname);

logger.info("dir:" + currentModuleDir);

const metricsFilePath = path.join(
  currentModuleDir.replace(/^\/([A-Z]:)/, "$1"),
  "..",
  "..",
  "..",
  "..",
  "json_store",
  "metrics.json"
);

logger.info("Metrics file path: " + metricsFilePath);

const prisma = new PrismaClient();

export async function getCustomerSatisfactionTrend(req, res, next) {
  try {
    const metricsData = await fs.readFile(metricsFilePath, "utf-8");
    const metrics = JSON.parse(metricsData);
    const customerSatisfactionData = metrics.customerSatisfaction;

    res.json({
      metric: "Customer Satisfaction Trend Report",
      data: customerSatisfactionData,
    });
  } catch (error) {
    next(error);
  } finally {
    await prisma.$disconnect();
  }
}

export async function getAverageConversationDuration(req, res, next) {
  try {
    const conversationDurationData = await prisma.conversationMetrics.aggregate(
      {
        _avg: {
          duration: true,
        },
      }
    );

    res.json({
      metric: "Average Conversation Duration Report",
      data: conversationDurationData,
    });
  } catch (error) {
    next(error);
  } finally {
    await prisma.$disconnect();
  }
}

export async function getAgentsWithBestCustomerSatisfaction(req, res, next) {
  try {
    const agentsWithAvgScores = await prisma.ticket.groupBy({
      by: ['userId'],
      where: {
        status: 'closed',
        customerSatisfactionScore: {
          not: null,
        },
      },
      _avg: {
        customerSatisfactionScore: true,
      },
      orderBy: {
        _avg: {
          customerSatisfactionScore: 'desc',
        },
      },
      take: 10, 
    });

    const agents = await Promise.all(agentsWithAvgScores.map(async result => {
      const agent = await prisma.user.findUnique({
        where: {
          id: result.userId,
        },
        select: {
          id: true,
          username: true,
        },
      });

      return {
        id: agent.id,
        username: agent.username,
        averageCustomerSatisfactionScore: result._avg.customerSatisfactionScore || 0,
      };
    }));

    res.json({
      metric: "Agents with Best Customer Satisfaction",
      data: agents,
    });
  } catch (error) {
    next(error);
  } finally {
    await prisma.$disconnect();
  }
}

export async function getResponseTimeTrend(req, res, next) {
  try {
    const responseTimeTrendData = await prisma.conversationMetrics.aggregate({
      _avg: {
        avgCustomerResponse: true,
        avgAgentResponse: true,
      },
    });

    logger.info(responseTimeTrendData);

    res.json({
      metric: "Response Time Trend Report",
      data: responseTimeTrendData,
    });
  } catch (error) {
    next(error);
  } finally {
    await prisma.$disconnect();
  }
}

export async function getDemographicCustomerReport(req, res, next) {
  try {
    const metricsData = await fs.readFile(metricsFilePath, "utf-8");
    const metrics = JSON.parse(metricsData);
    const demographicCustomerData = metrics.demographicCustomerReport;

    res.json({
      metric: "Demographic Customer Report",
      data: demographicCustomerData,
    });
  } catch (error) {
    next(error);
  } finally {
    await prisma.$disconnect();
  }
}

export async function getLowestHandlingTimeAgents(req, res, next) {
  try {
    // Fetch all users
    const users = await prisma.user.findMany();

    // Calculate the average handling time for each user
    const userHandlingTimes = await Promise.all(users.map(async user => {
      // Fetch closed tickets for the user
      const tickets = await prisma.ticket.findMany({
        where: {
          userId: user.id,
          status: 'closed',
        },
        select: {
          createdAt: true,
          closedAt: true,
        },
      });

      // If there are no tickets, return a high handling time to ensure they're not included in the top
      if (tickets.length === 0) {
        return {
          id: user.id,
          username: user.username,
          averageHandlingTime: Infinity,
        };
      }

      // Calculate the total handling time
      const totalHandlingTime = tickets.reduce((acc, ticket) => {
        if (ticket.createdAt && ticket.closedAt) {
          const difference = (new Date(ticket.closedAt) - new Date(ticket.createdAt)) / (1000 * 60); 
          return acc + difference;
        }
        return acc;
      }, 0);

      // Calculate the average handling time
      const averageHandlingTime = totalHandlingTime / tickets.length;

      return {
        id: user.id,
        username: user.username,
        averageHandlingTime,
      };
    }));

    // Sort users by average handling time (ascending), remove users with no closed tickets and take the top 10
    const sortedUsers = userHandlingTimes
      .filter(user => user.averageHandlingTime !== Infinity) 
      .sort((a, b) => a.averageHandlingTime - b.averageHandlingTime)
      .slice(0, 10);

    // Send the response
    res.json({
      metric: "Agents with Lowest Handling Time",
      data: sortedUsers,
    });
  } catch (error) {
    next(error);
  } finally {
    await prisma.$disconnect();
  }
}

export async function getHighFrequencyCustomerIdentification(req, res, next) {
  try {
    const conversations = await prisma.conversation.findMany({
      orderBy: {
        messages: {
          _count: "desc",
        },
      },
      take: 10,
    });

    res.json({
      metric: "High-Frequency Customer Identification",
      data: conversations,
    });
  } catch (error) {
    next(error);
  } finally {
    await prisma.$disconnect();
  }
}

export async function getLowestResponseTimeAgents(req, res, next) {
  try {
    const agents = await prisma.user.findMany({
      orderBy: {
        averageResponseTime: "asc",
      },
      where: {
        averageResponseTime: {
          not: null,
        },
      },
      take: 10,
    });

    res.json({
      metric: "Agents with Lowest Response Time",
      data: agents,
    });
  } catch (error) {
    next(error);
  } finally {
    await prisma.$disconnect();
  }
}

export async function getOverallSentimentTrend(req, res, next) {
  try {
    const aggregateSentimentScore = await prisma.conversationMetrics.aggregate({
      _avg: {
        overallSentimentScore: true,
      },
    });

    const aggregateSentiment =
      aggregateSentimentScore &&
      aggregateSentimentScore?._avg?.overallSentimentScore > 0
        ? "positive"
        : "negative";

    const overallSentimentTrendData = {
      aggregateSentiment,
      aggregateSentimentScore,
    };

    res.json({
      metric: "Overall Sentiment Trend Report",
      data: overallSentimentTrendData,
    });
  } catch (error) {
    next(error);
  } finally {
    await prisma.$disconnect();
  }
}
