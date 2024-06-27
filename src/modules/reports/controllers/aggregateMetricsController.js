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
      take: 11,
    });

    res.json({
      metric: "High-Frequency Customer Identification",
      data: conversations,
    });
  } catch (error) {
    next(error);
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
  }
}

export async function TicketVolume(req, res, next) {}

export async function IssueCategory(req, res, next) {}
