// src\modules\llm_context\services\customerProfiler.js
import OpenAI from "openai";

import dotenv from "dotenv";

dotenv.config();

// Initializing OpenAI with API key from environment variables
const openai = new OpenAI({
  apiKey: process.env["OPENAI_API_KEY"],
});

// Define an array of customer profile details to be extracted from a conversation with descriptions of parameters
const customer_profile_functions = [
  {
    name: "extractCustomerInfo",
    description: "Get the customer info",
    parameters: {
      type: "object",
      properties: {
        // extract name, email, phonenumber, preferred mode of contact and purchase history of the customer if stated in the conversation
        name: {
          type: "string",
          description: "Name of the customer",
        },
        email: {
          type: "string",
          description: "Email address of the customer",
        },
        phone_number: {
          type: "string",
          description: "Phone number of the customer",
        },
        preferred_contact_method: {
          type: "string",
          description: "Preferred method of contact (e.g., email, phone, SMS)",
        },
      },
    },
  },
];

/* Function to extract customer profile information from a given message, this is called by the monitor/admin
 to generate a customer profile based on customer-related information from a customer's entire conversation. 
 it is then displayed as part of the report, no sensitive information is collected!*/
export const extractProfile = async (message) => {
  const prompt = `Check this message: ${message}, to extract any customer detail, MUST return empty if no information that correctly identifies a customer exists, must never add any info non-existent in the message`;
  const model = "gpt-4";
  const max_tokens = 500;
  const top_p = 1;
  const frequency_penalty = 0;
  const presence_penalty = 0;
  const temperature = 0;

  try {
    // Request OpenAI to complete the prompt and extract customer information
    const response = await openai.chat.completions.create({
      model,
      messages: [{ role: "assistant", content: prompt }],
      functions: customer_profile_functions,
      function_call: { name: "extractCustomerInfo" },
      max_tokens,
      top_p,
      frequency_penalty,
      presence_penalty,
      temperature,
    });

    // Carefully extract the json object from OpenAI's response and return it
    const bit = response.choices[0].message.function_call;
    const args = JSON.parse(bit.arguments);
    return args;
  } catch (error) {
    console.error("Error during extraction:", error.message);
    return "unknown"; // Returning "unknown" as default in case of error
  }
};
