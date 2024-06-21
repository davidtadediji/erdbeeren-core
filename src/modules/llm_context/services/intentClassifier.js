import OpenAI from "openai";

import dotenv from "dotenv";

import { respondToMessage } from "./modelService";

dotenv.config();

const openai = new OpenAI({
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

const routeRequest = async (message, customerSid, isAgent = false) => {
  const classification = await classifyMessage(message);

  switch (classification) {
    case "service request":
      handleServiceRequest(message, customerSid);
      break;
    case "incident complaint":
      handleIncidentComplaint(message, customerSid);
      break;
    case "enquiry":
      return handleEnquiry(message, customerSid);
    default:
      handleUnknown(message, customerSid);
      break;
  }
};

// Function to handle service requests
const handleServiceRequest = (message, customerSid) => {
  console.log(`Handling service request: ${message}`);
};

// Function to handle complaints
const handleIncidentComplaint = (message, customerSid) => {
  console.log(`Handling incident complaint: ${message}`);
};

// Function to handle complaints
const handleEnquiry = async (message, customerSid) => {
 const res =  await respondToMessage(message, customerSid)
 return res;
};

// Function to handle unknown request types
const handleUnknown = async (message, customerSid) => {
  const res =  await respondToMessage(message, customerSid)
  return res;
 };

// Example usage
const message = "Hello";
routeRequest(message);
