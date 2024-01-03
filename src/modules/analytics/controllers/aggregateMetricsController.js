// src\modules\analytics\controllers\metricsController.js
import express from 'express';
import fs from 'fs/promises';
import logger from '../../../../logger.js';
import path from 'path';

const currentModuleURL = new URL(import.meta.url);
const currentModuleDir = path.dirname(currentModuleURL.pathname);

logger.info("dir:" + currentModuleDir);

const metricsFilePath = path.join(currentModuleDir.replace(/^\/([A-Z]:)/, '$1'), '..', '..', '..', '..', 'json_store', 'metrics.json');

logger.info("Metrics file path: " + metricsFilePath)

export async function getCustomerSatisfactionTrend(req, res, next) {
  try {
    const metricsData = await fs.readFile(metricsFilePath, 'utf-8');
    const metrics = JSON.parse(metricsData);
    const customerSatisfactionData = metrics.customerSatisfaction;

    // Implement your logic to process the data as needed

    res.json({ metric: 'Customer Satisfaction Trend Analysis', data: customerSatisfactionData });
  } catch (error) {
    next(error);
  }
}

export async function getAverageConversationDuration(req, res, next) {
  try {
    const metricsData = await fs.readFile(metricsFilePath, 'utf-8');
    const metrics = JSON.parse(metricsData);
    const avgConversationDurationData = metrics.averageConversationDuration;

    // Implement your logic to process the data as needed

    res.json({ metric: 'Average Conversation Duration Analysis', data: avgConversationDurationData });
  } catch (error) {
    next(error);
  }
}

export async function getResponseTimeTrend(req, res, next) {
  try {
    const metricsData = await fs.readFile(metricsFilePath, 'utf-8');
    const metrics = JSON.parse(metricsData);
    const responseTimeTrendData = metrics.responseTimeTrend;

    // Implement your logic to process the data as needed

    res.json({ metric: 'Response Time Trend Analysis', data: responseTimeTrendData });
  } catch (error) {
    next(error);
  }
}

export async function getDemographicCustomerAnalysis(req, res, next) {
  try {
    const metricsData = await fs.readFile(metricsFilePath, 'utf-8');
    const metrics = JSON.parse(metricsData);
    const demographicCustomerData = metrics.demographicCustomerAnalysis;

    // Implement your logic to process the data as needed

    res.json({ metric: 'Demographic Customer Analysis', data: demographicCustomerData });
  } catch (error) {
    next(error);
  }
}

export async function getHighFrequencyCustomerIdentification(req, res, next) {
  try {
    const metricsData = await fs.readFile(metricsFilePath, 'utf-8');
    const metrics = JSON.parse(metricsData);
    const highFrequencyCustomerData = metrics.highFrequencyCustomerIdentification;

    // Implement your logic to process the data as needed

    res.json({ metric: 'High-Frequency Customer Identification', data: highFrequencyCustomerData });
  } catch (error) {
    next(error);
  }
}

export async function getOverallSentimentTrend(req, res, next) {
  try {
    const metricsData = await fs.readFile(metricsFilePath, 'utf-8');
    const metrics = JSON.parse(metricsData);
    const overallSentimentTrendData = metrics.overallSentimentTrend;

    // Implement your logic to process the data as needed

    res.json({ metric: 'Overall Sentiment Trend Analysis', data: overallSentimentTrendData });
  } catch (error) {
    next(error);
  }
}
