import dotenv from "dotenv"; // Importing dotenv for environment variables
import OpenAI from "openai"; // Importing OpenAI API wrapper
import logger from "../../../../logger.js"; // Importing logger module
import { PrismaClient } from "@prisma/client";
import auditLogger from "../../../../audit_logger.js"; // Importing logger module
import {
  createTicket,
  selectRandomAgent,
} from "../../ticketing_system/services/agentTicketService.js"; // Importing ticketing system functions
import { respondToMessage } from "./modelService.js"; // Importing local function

dotenv.config(); // This loads environment variables from .env file

const prisma = new PrismaClient();
const openai = new OpenAI({
  // This initializes OpenAI with API key from environment variables
  apiKey: process.env["OPENAI_API_KEY"],
});

// Function to classify the message using OpenAI API
const classifyMessage2 = async (message) => {
  const prompt = `Classify the following message as either 'service request', 'incident complaint', 'enquiry', 'other' type or "explicit content' if it is an inappropriate message: ${message}`;
  const model = "gpt-4";
  const max_tokens = 100;
  const top_p = 1;
  const frequency_penalty = 0;
  const presence_penalty = 0;
  const temperature = 0;

  try {
    const response = await openai.chat.completions.create({
      model,
      messages: [{ role: "assistant", content: prompt }],
      functions: [
        {
          name: "getIntent",
          parameters: {
            type: "object",
            properties: {
              intent: {
                type: "string",
                enum: [
                  "enquiry",
                  "service request",
                  "incident complaint",
                  "explicit content",
                  "other",
                ],
              },
            },
          },
        },
      ],
      function_call: { name: "getIntent" },
      max_tokens,
      top_p,
      frequency_penalty,
      presence_penalty,
      temperature,
    });
    const bit = response.choices[0].message.function_call;
    const args = JSON.parse(bit.arguments);

    const intent = args.intent;

    return intent;
  } catch (error) {
    console.error("Error during classification:", error.message);
    return "unknown";
  }
};

const classifyMessage = async (message) => {
  const prompt = `Classify the following message as either 'transfer', if the user is CLEARLY asking to be transferred, "explicit content' if it is an inappropriate message: ${message}, "remain" if it anything other any of those`;
  const model = "gpt-4";
  const max_tokens = 500;
  const top_p = 1;
  const frequency_penalty = 0;
  const presence_penalty = 0;
  const temperature = 0;

  try {
    const response = await openai.chat.completions.create({
      model,
      messages: [{ role: "assistant", content: prompt }],
      functions: [
        {
          name: "getIntent",
          parameters: {
            type: "object",
            properties: {
              intent: {
                type: "string",
                enum: ["transfer", "remain", "explicit content"],
              },
            },
          },
        },
      ],
      function_call: { name: "getIntent" },
      max_tokens,
      top_p,
      frequency_penalty,
      presence_penalty,
      temperature,
    });
    const bit = response.choices[0].message.function_call;
    const args = JSON.parse(bit.arguments);

    const intent = args.intent;

    return intent;
  } catch (error) {
    console.error("Error during classification:", error.message);
    return "unknown";
  }
};

export const routeRequest = async (
  message,
  conversationId,
  isAgent = false,
  previousMessages
) => {
  const classification = await classifyMessage(message);
  logger.info("Classification: ", classification);
  switch (classification) {
    case "transfer":
      handleRequireHuman(message, conversationId, "transfer");
      // no response because it would be routed to agent
      return null;
    case "incident complaint":
      handleRequireHuman(message, conversationId, "incident complaint");
      // no response because it would be routed to agent
      return null;
    case "remain":
      return handleRequireAI(
        message,
        conversationId,
        isAgent,
        previousMessages,
        "enquiry"
      );
    case "explicit content":
      handleExplicit(conversationId);
      return null;
    default:
      return handleRequireAI(
        message,
        conversationId,
        isAgent,
        previousMessages,
        "unknown"
      );
  }
  // switch (classification) {
  //   case "service request":
  //     handleRequireHuman(message, conversationId, "service request");
  //     // no response because it would be routed to agent
  //     return null;
  //   case "incident complaint":
  //     handleRequireHuman(message, conversationId, "incident complaint");
  //     // no response because it would be routed to agent
  //     return null;
  //   case "enquiry":
  //     return handleRequireAI(
  //       message,
  //       conversationId,
  //       isAgent,
  //       previousMessages,
  //       "enquiry"
  //     );
  //   case "explicit content":
  //     handleExplicit(conversationId);
  //     return null;
  //   default:
  //     return handleRequireAI(
  //       message,
  //       conversationId,
  //       isAgent,
  //       previousMessages,
  //       "unknown"
  //     );
  // }
};

const handleExplicit = async (conversationId) => {
  try {
    logger.info(`Handling explict content in ${conversationId}`);
    auditLogger.info(`Handling explict content from ${conversationId}`);
    await prisma.conversation.update({
      where: { id: conversationId },
      data: {
        strike: {
          increment: 1,
        },
      },
    });
  } catch (error) {
    logger.error("Error occurred while handling explicit content!", error);
    auditLogger.error(
      `Error occurred while handling explicit content from ${conversationId}`,
      error
    );
  }
};

// handleServiceComplaint("Hello", "05f21bc4-6c69-4e0b-9fcf-a46a499bca53");

// Function to handle requests and incident complaints
const handleRequireHuman = async (message, conversationId, type) => {
  try {
    logger.info(`Handling ${type}: ${message}`);
    // select a random agent
    const agentId = await selectRandomAgent();
    // create a ticket and assign it to the agent to address the issue
    await createTicket(agentId, type, conversationId, message);
  } catch (error) {
    logger.error(`Error occurred while handling ${type}!`, error);
    auditLogger.error(`Error occurred while handling ${type}!`, error);
  }
};

// Function to handle enquires and messages of undefined type
const handleRequireAI = async (
  message,
  conversationId,
  isAgent,
  previousMessages,
  type
) => {
  logger.info(`Handling ${type}: ${message}`);
  // pass the message to the LLM to respond
  const res = await respondToMessage(
    message,
    conversationId,
    isAgent,
    previousMessages
  );
  return res;
};

// Function to handle complaints
export const handlePoorSentiment = async (message, conversationId) => {
  try {
    logger.info(`Handling service complaint: ${message}`);
    const type = "service complaint";
    const agentId = await selectRandomAgent();
    console.log("Random Agent: ", agentId);
    await createTicket(agentId, type, conversationId, message);
  } catch (error) {
    logger.error("Error occurred while handling service complaint!", error);
    auditLogger.error(
      `Error occurred while handling service complaint from ${conversationId}`,
      error
    );
  }
};
