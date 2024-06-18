// src\modules\audit_logger\messageConsumer.js

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
      const messageContent = message.content.toString();
      const parsedMessage = JSON.parse(messageContent);

      await callback(parsedMessage);

      amqp_channel.ack(message);
    });
  } catch (error) {
    logger.error(`Error while consuming audit events from ${queue}:`, error);
  }
}

consumeAuditEvents('auditTrailQueue', handleAuditEvent)
