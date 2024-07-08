// src\modules\communication\twilio\messaging\webhookController.js
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
import twilio from "twilio"; // main package for sms/whatsapp conversation
import logger from "../../../../../../logger.js";
import auditLogger from "../../../../../../audit_logger.js";
import eventEmitter from "../../../../analytics_engine/eventEmitter.js";
import { generateCustomerVectorStore } from "../../../../llm_context/services/customerContextService.js";
// import llm services
import {
  handlePoorSentiment,
  routeRequest,
} from "../../../../llm_context/services/intentClassifier.js";
import { saveCustomerSatisfactionScore } from "../../../../llm_context/services/satisfactionRater.js";
// import services to update the database during the conversation process
import {
  createNewConversation,
  getConversationThread,
  updateConversationTimestamp,
  isSuspended,
  hasOpenTicket,
} from "../services/conversationService.js";
import { saveMessageToConversation } from "../services/messageService.js";

import WebSocket, { WebSocketServer } from "ws";

const wss = new WebSocketServer({ port: 8081 });

const prisma = new PrismaClient();

// Get environment variables
dotenv.config();
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

const client = twilio(accountSid, authToken);

// This controller is called when a message is sent to the system through a communication channel by a customer
const webhookController = async (req, res) => {
  logger.info(
    "Message webhook triggered: " + JSON.stringify(req.body, null, 2)
  );

  try {
    // receiveMessage is triggered for actions in response to the message
    const { conversation, response, isWhatsApp, phoneNumber, messageContent } =
      await receiveMessage(req);
    logger.info("Recieved message");

    // The results of the receiveMessage function are then passed to the sendMessage function
    await sendMessage({
      conversation,
      response,
      isWhatsApp,
      phoneNumber,
      messageContent,
    });

    // respond with message status success or errors to the frontend
    res.status(200).send("Message received and responded successfully");
  } catch (error) {
    logger.error(error);
    auditLogger.error(error);
    res
      .status(500)
      .json({ error: "Internal server error", message: error.message });
  }
};

// Function to process a message received from a customer
const receiveMessage = async (req) => {
  try {
    // extract the message content and phone number for the request body
    const { From: phoneNumber, Body: messageContent } = req.body;

    // set isWhatsapp to true if the phoneNumber is from whatsapp
    const isWhatsApp = phoneNumber.startsWith("whatsapp:");

    /* check if a conversation already exists for that user, if it does, update the conversation timestamp
     if not create a new conversation and prepare self presentation message */
    let conversation = await prisma.conversation.findUnique({
      where: { participantSid: phoneNumber },
    });
    let selfPresentation = "";
    if (!conversation) {
      selfPresentation =
        "You are now interacting with an AI agent. We may collect and use only customer-related information solely for service improvement purposes. Your information is handled responsibly and in accordance with our privacy policies.\n";
      conversation = await createNewConversation(
        phoneNumber,
        isWhatsApp ? "whatsapp" : "sms"
      );
    } else {
      conversation = await updateConversationTimestamp(conversation.id);
      if (await isSuspended(conversation.id)) {
        const response = "You have been suspended from this platform";
        return {
          conversation,
          response,
          isWhatsApp,
          phoneNumber,
          messageContent,
        };
      }
    }

    // Perform the same check with conversation metrics which is related table, just in case
    const metricsExists = await prisma.conversationMetrics.findUnique({
      where: { conversationId: conversation.id },
    });

    if (!metricsExists) {
      await prisma.conversationMetrics.create({
        data: { conversationId: conversation.id },
      });
    }

    // get the last few messages (2-5)
    const previousMessages = await getConversationThread(conversation.id);

    logger.info("previousMessages: " + JSON.stringify(previousMessages));

    let isSaved = false;

    /* if the previous message contains a message asking the user to rate an agent service
    try to extract the customer satisfaction score from the current customer message and save it
    */
    if (
      previousMessages &&
      previousMessages.length &&
      previousMessages[previousMessages.length - 1].text ==
        `You are now connected with an AI agent. Kindly rate the assistance you received from the service agent on a scale of 1-5.`
    ) {
      isSaved = await saveCustomerSatisfactionScore(
        messageContent,
        conversation.id
      );
    }

    logger.info("here");

    /* if a score was not successfully saved, meaning the message did not contain a rating, 
    save the message in the database as part of the customers conversation and emit neccesary events (for analytics).
    It does not save the customer's message if a rating was successfully extracted from it and saved in the database*/
    if (!isSaved) {
      const customerMessage = await saveMessageToConversation(
        conversation.id,
        "customer",
        messageContent
      );
      eventEmitter.emit("newMessageCreated", {
        conversationId: conversation.id,
        messageId: customerMessage.id,
      });

      eventEmitter.emit("customerResponded", {
        conversationId: conversation.id,
        messageId: customerMessage.id,
      });
    }

    /* Check if the last three messages from the customer (including the current message,
     it has been saved in the database) were below a sentiment threshold  (-0.5)*/
    const shouldRouteToAgent = await checkNegativeSentiments(conversation.id);

    // and route to an agent in that case and tell the customer that you are transferring them to a human
    if (shouldRouteToAgent) {
      logger.info("Routing to human agent due to negative sentiment");
      handlePoorSentiment(messageContent, conversation.id);
      const response =
        "I'm transferring you to a human agent for further assistance.";
      return {
        conversation,
        response,
        isWhatsApp,
        phoneNumber,
        messageContent,
      };
    }

    /* Check if the conversation has an open ticket and if it does, the message is only sent to the agent.
    The user is not stuck with a particular agent performing badly because of the check negative sentiment function*/
    if (await hasOpenTicket(conversation.id)) {
      const response = null;
      // Send the message to agent over WebSocket
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(
            JSON.stringify({
              conversationId: conversation.id,
              event: "newMessage",
            })
          );
        }
      });
      return {
        conversation,
        response,
        isWhatsApp,
        phoneNumber,
        messageContent,
      };
    }

    // if the last three messages don't meet the negativity threshold, send it the message to the intent classifier.
    let response = await routeRequest(
      messageContent,
      conversation.id,
      true,
      previousMessages
    );

    /* Note: if the message contained an extracted e, the intent claratssifier would flag as type 'other' 
    and the llm would respond with an acknowledgement message, and the message will not be saved only the rating*/

    /*if routeRequest function returns null that means a ticket has been created, message routed to human, 
    this will be relayed to the customer, so no LLM response */
    if (!response) {
      logger.info("Routed to human agent successfully");
      return {
        conversation,
        response:
          "The matter has been transferred to a human agent for better resolution.",
        isWhatsApp,
        phoneNumber,
        messageContent,
      };
    }

    /* but if the function returns response, the response should be combined with the self presentation message
   which would be empty if the conversation is not new */
    response = `${selfPresentation}\n\n${response}`;

    logger.info("Agent response: " + response);

    // The receiveMessage function returns what will be used by the sendMessage function to reply to the customer.
    return { conversation, response, isWhatsApp, phoneNumber, messageContent };
  } catch (error) {
    throw error;
  }
};

// Function to reply to customers
const sendMessage = async ({
  conversation,
  response,
  isWhatsApp,
  phoneNumber,
  messageContent,
}) => {
  logger.info(
    `${conversation} ${response} ${isWhatsApp} ${phoneNumber} ${messageContent} were retrieved successfully`
  );

  try {
    if (!response) {
      return "Customer has an open ticket";
    }

    // check if the customers channel is sms or whatsapp to know how to respond
    // if (isWhatsApp) {
    //   await client.messages.create({
    //     body: response,
    //     from: "whatsapp:" + twilioPhoneNumber,
    //     to: phoneNumber,
    //   });
    // } else {
    //   await client.messages.create({
    //     body: response,
    //     from: twilioPhoneNumber,
    //     to: phoneNumber,
    //   });
    // }

    // Exit the function if the message the customer sent triggered a transfer to a human agent.

    // if it was whatsapp/sms based.
    // if (
    //   response ==
    //     "The matter has been transferred to a human agent for better resolution." ||
    //   response ==
    //     "I'm transferring this message to a human agent for further assistance."
    // ) {
    //   logger.info("Message has been routed");
    //   return "Message has been routed";
    // } else if (response == "Customer has rated") {
    //   logger.info("Customer has rated");
    //   return "Customer has rated";
    // }

    if (response == "Customer has rated") {
      logger.info("Customer has rated");
      return "Customer has rated";
    }

    // If the llm responded, save the ai agents message to the conversation and emit the right events
    const agentMessage = await saveMessageToConversation(
      conversation.id,
      "agent",
      response
    );

    eventEmitter.emit("newMessageCreated", {
      conversationId: conversation.id,
      messageId: agentMessage.id,
    });

    eventEmitter.emit("agentResponded", {
      conversationId: conversation.id,
      messageId: agentMessage.id,
    });

    eventEmitter.emit("interactionTurnCompleted", conversation.id);

    // update the customer-assigned vector store with the new conversation turn, generate if none exists
    const turn = [`Customer: ${messageContent}`, `Agent: ${response}`];
    await generateCustomerVectorStore(conversation.id, turn);

    return "Message sent successfully";
  } catch (error) {
    throw error;
  }
};

const NEGATIVE_SENTIMENT_THRESHOLD = -0.5;

const checkNegativeSentiments = async (conversationId) => {
  const lastThreeMessages = await prisma.message.findMany({
    where: { conversationId, sender: { not: "agent" } },
    orderBy: { sentAt: "desc" },
    take: 3,
  });

  return lastThreeMessages.every(
    (message) => message.sentimentScore < NEGATIVE_SENTIMENT_THRESHOLD
  );
};

export default webhookController;
