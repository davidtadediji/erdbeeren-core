// src\modules\analyticsEngine\messageConsumer.js
import amqp from 'amqplib';
import * as AnalyticsService from './analyticsService.js';
import logger from '../../../logger.js';

const QUEUE_URL = 'amqp://localhost'; // Replace with your RabbitMQ server URL

async function consumeMessage(queueName, callback) {
  try {
    const connection = await amqp.connect(QUEUE_URL);
    const channel = await connection.createChannel();

    await channel.assertQueue(queueName, { durable: true });
    channel.prefetch(1);

    logger.info(`Waiting for messages from ${queueName}`);

    channel.consume(queueName, async (message) => {
      const content = JSON.parse(message.content.toString());
      await callback(content.data);

      channel.ack(message);
    });
  } catch (error) {
    logger.error(`Error consuming messages from ${queueName}:`, error);
  }
}

consumeMessage('sentimentAnalysisQueue', AnalyticsService.handleSentimentAnalysis);
consumeMessage('frequencyOfInteractionsQueue', AnalyticsService.handleFrequencyOfInteractions);
consumeMessage('conversationDurationQueue', AnalyticsService.handleConversationDuration);
consumeMessage('customerProfileQueue', AnalyticsService.handleCustomerProfile);
consumeMessage('responseTimeMetricsQueue', AnalyticsService.handleResponseTimeMetrics);
consumeMessage('feedbackQueue', AnalyticsService.handleFeedback);

// Run this file to start the consumers
