// src\modules\analytics_engine\services\customerProfile.js
import { PrismaClient } from "@prisma/client";
import logger from "../../../../logger.js";
import { customerProfiling } from "../../llm_context/services/modelService.js";

const prisma = new PrismaClient();

// function to update the customer profile json in the database.
async function updateCustomerProfile(customerInfo, conversationId) {
  try {
    await prisma.conversationMetrics.update({
      where: { conversationId: conversationId },
      data: {
        customerProfile: {
          ...customerInfo,
        },
      },
    });

    logger.info("Customer profile updated for conversationId:", conversationId);
  } catch (error) {
    logger.error(
      "Error occured while updating the customer profile: " + error.message
    );
  }
}

export async function handleCustomerProfile(messageId) {
  // logger.info("Handle customer profile triggered: " + messageId);
  // try {
  //   // find and return the specific message
  //   const message = await prisma.message.findUnique({
  //     where: { id: messageId },
  //     include: { conversation: true },
  //   });

  //   const conversationId = message.conversation.id;
  //   logger.info("Conversation id: ", conversationId);

  //   if (!message) {
  //     logger.error("The message does not exist: " + messageId);
  //     return;
  //   }

  //   // extract customer profile from message content using llm function.
  //   // const customerInfo = await customerProfiling(
  //   //   encodeURIComponent(message.content)
  //   // );

  //   const customerInfo = ""
    
  //   // update customer profile using the extracted customerInfo object and conversationId
  //   await updateCustomerProfile(customerInfo, conversationId);

  //   logger.info("Customer Profile:", customerInfo);
  // } catch (error) {
  //   logger.error("Error handling customer profile: " + error.message);
  // }
}
