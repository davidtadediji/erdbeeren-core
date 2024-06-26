// src\modules\audit_logger\messageQueue.js

import amqp from "amqplib";
import logger from "../../../logger.js";

const AMQP_URL = "amqp://localhost";

async function produceAuditEvent(queue, { userId, actionType, details, date }) {
  try {
    const connection = await amqp.connect(AMQP_URL);
    const amqp_channel = await connection.createChannel();

    await amqp_channel.assertQueue(queue, { durable: true });

    const message = {
      userId,
      actionType,
      details,
      date
    };

    const parsedMessage = JSON.stringify(message);

    amqp_channel.sendToQueue(queue, Buffer.from(parsedMessage), {
      persistent: true,
    });

    logger.info(`Audit event logged to ${queue}:`, message);

    await amqp_channel.close();
    await connection.close();
  } catch (error) {
    logger.error("Error occurred while producing audit event:", error);
  }
}

export { produceAuditEvent };
