import { PrismaClient } from "@prisma/client";
import logger from "../../../../logger.js";
const prisma = new PrismaClient();

// function to calculate customer response time
export async function handleCustomerResponseTime(conversationId) {
  logger.info("Handle customer response time triggered: " + conversationId);
  try {
    // Fetch the conversation from the database
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: { messages: true },
    });

    //  return error if doesn't conversation exists or if it doesn't contain messages or if the conversation length is = 0
    if (
      !conversation ||
      !conversation.messages ||
      conversation.messages.length === 0
    ) {
      logger.error("Conversation is invalid or no messages found.");
      return;
    }
    logger.info("Conversation found.");

    // Get messages sent by customer
    const customerMessages = conversation.messages.filter(
      (message) => message.sender === "customer"
    );

    const customerMessagesLength = customerMessages.length;

    let averageCustomerResponseTime = 0;

    if (customerMessagesLength > 1) {
      // Calculate total customer response time using the reduce function
      const totalCustomerResponseTime = customerMessages.reduce(
        (accumulate, message, index, messages) => {
          // Returns the accumulate if index is on the last message
          if (index === messages.length - 1) return accumulate;
          // add the difference between time differences between sent messages to the accumulator which is 0 in the beginning.
          return (
            accumulate +
            (new Date(messages[index + 1].sentAt) - new Date(message.sentAt))
          );
        },
        0
      );

      // check if customer calculate average response time and convert to seconds.
      averageCustomerResponseTime =
        totalCustomerResponseTime / (customerMessagesLength - 1) / 1000;
    }

    // update the avgCustomerRes field in the conversation
    await prisma.conversationMetrics.update({
      where: { conversationId: conversationId },
      data: { avgCustomerResponse: averageCustomerResponseTime },
    });

    logger.info(
      `Average Customer Response Time for conversation ${conversationId}: ${averageCustomerResponseTime} seconds`
    );
  } catch (error) {
    logger.error(
      "Error occured while handling customer response time: " + error.message
    );
  }
}

// function to calculate agent response time
export async function handleAgentResponseTime(conversationId) {
  logger.info("Handle agent response time triggered: " + conversationId);
  try {
    // Fetch the conversation from the database
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: { messages: true },
    });

    //  return error if doesn't conversation exists or if it doesn't contain messages or if the conversation length is = 0
    if (
      !conversation ||
      !conversation.messages ||
      conversation.messages.length === 0
    ) {
      logger.error("Conversation is invalid or no messages found.");
      return;
    }
    logger.info("Conversation found.");

    // Get messages sent by agent
    const agentMessages = conversation.messages.filter(
      (message) => message.sender === "agent"
    );

    const agentMessagesLength = agentMessages.length;

    let averageAgentResponseTime = 0;

    if (agentMessagesLength > 1) {
      // Calculate total agent response time using the reduce function
      const totalAgentResponseTime = agentMessages.reduce(
        (accumulate, message, index, messages) => {
          // Returns the accumulate if index is on the last message
          if (index === messages.length - 1) return accumulate;
          // add the difference between time differences between sent messages to the accumulator which is 0 in the beginning.
          return (
            accumulate +
            (new Date(messages[index + 1].sentAt) - new Date(message.sentAt))
          );
        },
        0
      );

      // check if agent calculate average response time and convert to seconds.
      averageAgentResponseTime =
        totalAgentResponseTime / (agentMessagesLength - 1) / 1000;
    }

    // update the avgAgentRes field in the conversation
    await prisma.conversationMetrics.update({
      where: { conversationId: conversationId },
      data: { avgAgentResponse: averageAgentResponseTime },
    });

    logger.info(
      `Average Agent Response Time for conversation ${conversationId}: ${averageAgentResponseTime} seconds`
    );
  } catch (error) {
    logger.error(
      "Error occured while handling agent response time: " + error.message
    );
  }
}
