// src\modules\analyticsEngine\messageConsumer.js
import dotenv from "dotenv";
dotenv.config();
import amqp from "amqplib";
import logger from "../../../logger.js";
// import metric functions to be triggered when message is consumed
import {
  handleConversationDuration,
  handleConversationLength,
} from "./services/basicMetrics.js";
import {
  handleAgentResponseTime,
  handleCustomerResponseTime,
  handleHumanAgentResponseTime,
} from "./services/responseTime.js";
import { handleSentimentAnalysis } from "./services/sentimentAnalysis.js";

// define the asychronous messaging queue url
const AMQP_URL = process.env.AMQP_URL;

// function to consume and process message sent to queue
async function consumeMessage(queue, callback) {
  try {
    // Establish connection to the amqp url 
    const connection = await amqp.connect(AMQP_URL);
    const amqp_channel = await connection.createChannel();

    // check if queue exists
    await amqp_channel.assertQueue(queue, { durable: true });

    // Set channel to only process one message per time
    amqp_channel.prefetch(1);

    logger.info(`Awaiting messages from ${queue}`);

    // parse message, trigger callback function to process the parsed content and acknowlege success
    amqp_channel.consume(queue, async (message) => {
      const messageContent = message.content.toString();
      const parsedContent = JSON.parse(messageContent);
      await callback(parsedContent.data);
      amqp_channel.ack(message);
    });
  } catch (error) {
    logger.error(
      `Error occured while consuming messages from ${queue}:`,
      error
    );
  }
}

// start consumers, which will be waiting to receive any message produced
consumeMessage("conversationLengthQueue", handleConversationLength);
consumeMessage("conversationDurationQueue", handleConversationDuration);
consumeMessage("customerResponseTimeQueue", handleCustomerResponseTime);
consumeMessage("agentResponseTimeQueue", handleAgentResponseTime);
consumeMessage("humanAgentResponseTimeQueue", handleHumanAgentResponseTime);
// consumeMessage("sentimentAnalysisQueue", handleSentimentAnalysis);
