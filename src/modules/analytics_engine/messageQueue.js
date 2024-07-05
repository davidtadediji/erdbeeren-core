// src\modules\analyticsEngine\messageQueue.js
import amqp from "amqplib";
import logger from "../../../logger.js";

const AMQP_URL = "amqp://localhost";

// producer function to produce and send message to queue
async function produceMessage(queue, message) {
  try {
    const connection = await amqp.connect(AMQP_URL);
    const amqp_channel = await connection.createChannel();

    // check if queue exists
    await amqp_channel.assertQueue(queue, { durable: true });
    const parsedMessage = JSON.stringify(message);

    // send message to queue and persist if service is restarted to prevent message loss
    amqp_channel.sendToQueue(queue, Buffer.from(parsedMessage), {
      persistent: true,
    });

    logger.info(`A message was sent to ${queue}:`, message);

    // close the channel and connection for resource management and error prevention
    await amqp_channel.close();
    await connection.close();
  } catch (error) {
    logger.error("Error occured while producing message:", error);
  }
}
export default { produceMessage };
