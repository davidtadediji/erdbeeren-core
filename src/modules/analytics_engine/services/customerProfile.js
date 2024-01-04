// src\modules\analytics_engine\services\customerProfile.js
import { customerProfiling } from "../../llm_context/services/modelService.js";
import { PrismaClient } from "@prisma/client";
import logger from "../../../../logger.js";

const prisma = new PrismaClient();

export async function handleCustomerProfile(messageId) { 
  logger.info("Handle customer profile triggered: " + messageId);
  try {

    const message = await prisma.message.findFirst({
      where: { id: messageId },
      include: { conversation: true },
    });

    const conversationId = message.conversation.id
    logger.info("Conversation id: ", conversationId)
  
    if (!message) {
      logger.error("Message not found: " + messageId);
      return;
    }
  
    const text = encodeURIComponent(message.content);

    const userInfo = await customerProfiling(text);

    // Implement logic to store profiling data using the userInfo object and conversationId
    await storeProfileInDatabase(userInfo, conversationId);

    logger.info("Customer Profile:", userInfo);
  } catch (error) {
    logger.error("Error handling customer profile: " + error.message);
  }
}

async function storeProfileInDatabase(userInfo, conversationId) {
  try {
    await prisma.conversation.update({
      where: { id: conversationId },
      data: {
        profile: {
          ...userInfo,
        },
      },
    });
    logger.info(
      "Profile data updated in the database for conversationId:",
      conversationId
    );
  } catch (error) {
    logger.error("Error updating profile data in the database: " + error.message);
  }
}
