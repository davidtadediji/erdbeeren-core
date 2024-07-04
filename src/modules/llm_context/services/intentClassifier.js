import dotenv from "dotenv";
import OpenAI from "openai"; // Importing OpenAI API wrapper
import logger from "../../../../logger.js"; // Importing logger module
import {
  createTicket,
  selectRandomAgent,
} from "../../ticketing_system/services/agentTicketService.js"; // Importing agent ticketing system functions
import { respondToMessage } from "./modelService.js"; // Importing function for llm response.

dotenv.config();

// Function to route request based on customer intent
export const routeRequest = async (
  message,
  conversationId,
  isAgent = false,
  previousMessages
) => {
  // get the message intent classification
  const classification = await classifyMessage(message);

  // route depending on the classification
  switch (classification) {
    case "service request":
      handleRequireHuman(message, conversationId, "service request");
      // no response because it would be routed to agent
      return null;
    case "service complaint":
      handleRequireHuman(message, conversationId, "service complaint");
      // no response because it would be routed to agent
      return null;
    case "enquiry":
      return handleRequireAI(
        message,
        conversationId,
        isAgent,
        previousMessages,
        "enquiry"
      );
    default:
      return handleRequireAI(
        message,
        conversationId,
        isAgent,
        previousMessages,
        "unknown"
      );
  }
};

const openai = new OpenAI({
  // This initializes OpenAI with API key from environment variables
  apiKey: process.env["OPENAI_API_KEY"],
});

// Function to classify the message using OpenAI's GPT model, the request router utilizes this function
const classifyMessage = async (message) => {
  const prompt = `Classify the following message as either 'service request', 
  'service complaint', 'enquiry' or 'other' type: ${message}`;
  const model = "gpt-4"; // This sets the model version
  const max_tokens = 10; // This defines the maximum number of tokens for the completion
  const top_p = 1; // This sets the sampling parameter for response diversity
  /* Setting the temperature parameter, frequency penalty and presence penalty
    for sampling to 0 makes model responses deterministic and conservative. */
  const frequency_penalty = 0;
  const presence_penalty = 0;
  const temperature = 0;

  try {
    // This makes an API call to OpenAI for message classification
    const response = await openai.chat.completions.create({
      model,
      messages: [{ role: "assistant", content: prompt }],
      /*Function calling restricts the model's output to predictable outcomes, 
      which is beneficial for programming purposes*/
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

// Function to handle service requests and incident complaints
const handleRequireHuman = async (message, conversationId, type) => {
  try {
    logger.info(`Handling service request: ${message}`);
    // select a random agent 
    const agentId = await selectRandomAgent();
    // create a ticket and assign it to the agent to address the issue
    await createTicket(agentId, type, conversationId, message);
  } catch (error) {
    logger.error(`Error occurred while handling ${type}!`, error);
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
  const res = await respondToMessage(message, conversationId, isAgent, previousMessages);
  return res;
};

// Function to handle poor sentiment, when a customers previous messages have been under a certain sentiment threshold
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
