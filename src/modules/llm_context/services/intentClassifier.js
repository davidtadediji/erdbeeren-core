import dotenv from "dotenv"; // Importing dotenv for environment variables
import OpenAI from "openai"; // Importing OpenAI API wrapper
import logger from "../../../../logger.js"; // Importing logger module
import auditLogger from "../../../../audit_logger.js"; // Importing logger module
import {
  createTicket,
  selectRandomAgent,
} from "../../ticketing_system/services/agentTicketService.js"; // Importing ticketing system functions
import { respondToMessage } from "./modelService.js"; // Importing local function

dotenv.config(); // This loads environment variables from .env file

const openai = new OpenAI({
  // This initializes OpenAI with API key from environment variables
  apiKey: process.env["OPENAI_API_KEY"],
});
// Function to classify the message using OpenAI API
const classifyMessage = async (message) => {
  const prompt = `Classify the following message as either 'service request', 'incident complaint', 'enquiry' or 'other' type: ${message}`;
  const model = "gpt-3.5-turbo-1106";
  const max_tokens = 10;
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

export const routeRequest = async (
  message,
  conversationId,
  isAgent = false,
  previousMessages
) => {
  const classification = await classifyMessage(message);
  // const classification = "enquiry";
  // const classification = "service request"
  console.log("Classification: ", classification);

  switch (classification) {
    case "service request":
      handleServiceRequest(message, conversationId);
      return null;
    case "service complaint":
      handleServiceComplaint(message, conversationId);
      return null;
    case "enquiry":
      return handleEnquiry(message, conversationId, isAgent, previousMessages);
    default:
      return handleUnknown(message, conversationId, isAgent, previousMessages);
  }
};

// Function to handle service requests
const handleServiceRequest = async (message, conversationId) => {
  try {
    logger.info(`Handling service request: ${message}`);
    const type = "service request";
    const agentId = await selectRandomAgent();
    console.log("Random Agent: ", agentId);
    await createTicket(agentId, type, conversationId, message);
  } catch (error) {
    logger.error("Error occurred while handling service request!", error);
    auditLogger.error(
      `Error occurred while handling service request from ${conversationId}`,
      error
    );
  }
};

// Function to handle complaints
const handleServiceComplaint = async (message, conversationId) => {
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

// handleServiceComplaint("Hello", "05f21bc4-6c69-4e0b-9fcf-a46a499bca53");

// Function to handle complaints
const handleEnquiry = async (
  message,
  conversationId,
  isAgent,
  previousMessages
) => {
  logger.info(`Handling enquiry: ${message}`);
  const res = await respondToMessage(
    message,
    conversationId,
    isAgent,
    previousMessages
  );
  // const res = "Hello"
  return res;
};

// Function to handle unknown request types
const handleUnknown = async (
  message,
  conversationId,
  isAgent,
  previousMessages
) => {
  logger.info(`Handling unknown: ${message}`);
  const res = await respondToMessage(
    message,
    conversationId,
    isAgent,
    previousMessages
  );
  // const res = "Hello";
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
