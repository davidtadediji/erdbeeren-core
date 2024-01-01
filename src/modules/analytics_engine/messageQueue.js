// src\modules\analyticsEngine\messageQueue.js
import amqp from 'amqplib';
import logger from '../../../logger.js';

const QUEUE_URL = 'amqp://localhost'; // Replace with your RabbitMQ server URL

async function produceMessage(queueName, message) {
  try {
    const connection = await amqp.connect(QUEUE_URL);
    const channel = await connection.createChannel();

    await channel.assertQueue(queueName, { durable: true });
    channel.sendToQueue(queueName, Buffer.from(JSON.stringify(message)), { persistent: true });

    logger.info(`Message sent to ${queueName}:`, message);

    await channel.close();
    await connection.close();
  } catch (error) {
    logger.error('Error producing message:', error);
  }
}

export default {
  produceMessage,
};
