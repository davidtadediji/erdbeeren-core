// src\modules\analyticsEngine\messageConsumer.js
import amqp from 'amqplib';
import logger from '../../../logger.js';
import { handleConversationDuration, handleFeedback, handleFrequencyOfInteractions } from "./services/basicMetrics.js";
import { handleCustomerProfile } from "./services/customerProfile.js";
import { handleAgentResponseTime, handleCustomerResponseTime } from "./services/responseTime.js";
import { handleSentimentAnalysis } from './services/sentimentAnalysis.js';

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

consumeMessage('sentimentAnalysisQueue', handleSentimentAnalysis);
consumeMessage('frequencyOfInteractionsQueue', handleFrequencyOfInteractions);
consumeMessage('conversationDurationQueue', handleConversationDuration);
consumeMessage('customerProfileQueue', handleCustomerProfile);
consumeMessage('agentResponseTimeQueue', handleAgentResponseTime);
consumeMessage('customerResponseTimeQueue', handleCustomerResponseTime);
consumeMessage('feedbackQueue', handleFeedback);

// Run this file to start the consumers
