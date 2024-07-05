import dotenv from "dotenv"; // Importing dotenv for environment variables
import OpenAI from "openai"; // Importing OpenAI API wrapper
import logger from "../../../../logger.js"; // Importing logger module
import {
  createTicket,
  selectRandomAgent,
} from "../../ticketing_system/services/agentTicketService.js"; // Importing ticketing system functions
import { respondToMessage } from "./modelService.js"; // Importing local function

dotenv.config(); // This loads environment variables from .env file

const openai = new OpenAI({ // This initializes OpenAI with API key from environment variables
  apiKey: process.env["OPENAI_API_KEY"],
});

// Function to classify the message using OpenAI's GPT-3 model
const classifyMessage = async (message) => {
  const prompt = `Classify the following message as either 'service request', 'service complaint', 'enquiry' or 'other' type: ${message}`;
  const model = "gpt-4"; // This sets the model version
  const max_tokens = 10; // This defines the maximum number of tokens for the completion
  const top_p = 1; // This sets the sampling parameter for diversity
  const frequency_penalty = 0; // This sets the frequency penalty for the model
  const presence_penalty = 0; // This sets the presence penalty for the model
  const temperature = 0; // This sets the temperature parameter for sampling

  try {
    // This makes an API call to OpenAI for message classification
    const response = await openai.chat.completions.create({
      model,
      messages: [{ role: "assistant", content: prompt }],
      // function call rre
      functions: [
        {
          name: "getIntent",
          parameters: {
            type: "object",
            properties: {
              intent: {
                type: "string",
                // These are the four main classifications
                enum: [
                  "enquiry",
                  "service request",
                  "service complaint",
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

    // This parses the response to extract the classified intent and we return the intent
    const bit = response.choices[0].message.function_call;
    const args = JSON.parse(bit.arguments);
    const intent = args.intent;

    return intent;
  } catch (error) {
    logger.error("Error during classification:", error.message); 
    return "unknown"; /* We handle errors in classification 
    by returning 'unknown'  */
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
  }
};
