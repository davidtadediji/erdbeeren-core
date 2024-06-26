import amqp from "amqplib";
import logger from "../../../logger.js";
import { handleAuditEvent } from "./auditTrailService.js";

const AMQP_URL = "amqp://localhost";

async function consumeAuditEvents(queue, callback) {
  try {
    const connection = await amqp.connect(AMQP_URL);
    const amqp_channel = await connection.createChannel();

    await amqp_channel.assertQueue(queue, { durable: true });
    amqp_channel.prefetch(1);

    logger.info(`Waiting for audit events from ${queue}`);

    amqp_channel.consume(queue, async (message) => {
      try {
        const messageContent = message.content.toString();
        const parsedMessage = JSON.parse(messageContent);

        const { userId, actionType, details, date } = parsedMessage;

        logger.info(`Received audit event: userId=${userId}, actionType=${actionType}`);

        await callback({ userId, actionType, details, date });

        amqp_channel.ack(message);
      } catch (error) {
        logger.error(`Error processing audit event from ${queue}:`, error);
      }
    });
  } catch (error) {
    logger.error(`Error while consuming audit events from ${queue}:`, error);
  }
}

consumeAuditEvents('logEvent', handleAuditEvent);
