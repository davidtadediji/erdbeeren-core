import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import logger from "../../../../logger.js";

export async function handleAgentResponseTime(conversationId) {
  logger.info("Handle agent response time triggered.");
  try {
    // Fetch the conversation from the database
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: { messages: true },
    });

    if (
      !conversation ||
      !conversation.messages ||
      conversation.messages.length === 0
    ) {
      logger.error("Invalid conversation or no messages found.");
      return;
    }
    logger.info("Conversation found.");

    // Filter agent messages
    const agentMessages = conversation.messages.filter(
      (message) => message.sender === "agent"
    );

    // Calculate average agent response time in seconds
    const totalAgentResponseTime = agentMessages.reduce(
      (acc, message, index, array) => {
        if (index === array.length - 1) return acc; // Skip last message
        const nextMessage = array[index + 1];
        return acc + (new Date(nextMessage.sentAt) - new Date(message.sentAt));
      },
      0
    );

    const avgAgentResponseTime =
      agentMessages.length > 1
        ? totalAgentResponseTime / (agentMessages.length - 1) / 1000
        : 0;

    // Update the avgAgentRes field in the conversation
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { avgAgentRes: avgAgentResponseTime },
    });

    logger.info(
      `Average Agent Response Time for conversation ${conversationId}: ${avgAgentResponseTime} seconds`
    );
  } catch (error) {
    logger.error("Error handling agent response time:", error.message);
  }
}

export async function handleCustomerResponseTime(data) {
  logger.info("Handle customer response time triggered.");  
  const conversationId = data[0]
  try {
    // Fetch the conversation from the database
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: { messages: true },
    });

    if (
      !conversation ||
      !conversation.messages ||
      conversation.messages.length === 0
    ) {
      logger.error("Invalid conversation or no messages found.");
      return;
    }
    logger.info("Conversation found.");

    // Filter customer messages
    const customerMessages = conversation.messages.filter(
      (message) => message.sender === "customer"
    );

    // Calculate average customer response time in seconds
    const totalCustomerResponseTime = customerMessages.reduce(
      (acc, message, index, array) => {
        if (index === array.length - 1) return acc; // Skip last message
        const nextMessage = array[index + 1];
        return acc + (new Date(nextMessage.sentAt) - new Date(message.sentAt));
      },
      0
    );

    const avgCustomerResponseTime =
      customerMessages.length > 1
        ? totalCustomerResponseTime / (customerMessages.length - 1) / 1000
        : 0;

    // Update the avgCustomerRes field in the conversation
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { avgCustomerRes: avgCustomerResponseTime },
    });

    logger.info(
      `Average Customer Response Time for conversation ${conversationId}: ${avgCustomerResponseTime} seconds`
    );
  } catch (error) {
    logger.error("Error handling customer response time:", error.message);
  }
}
