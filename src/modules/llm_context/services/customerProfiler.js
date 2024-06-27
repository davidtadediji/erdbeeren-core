import OpenAI from "openai";

import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env["OPENAI_API_KEY"],
});

const customer_profile_functions = [
  {
    name: "extractCustomerInfo",
    description: "Get the customer info",
    parameters: {
      type: "object",
      properties: {
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
        purchase_history: {
          type: "array",
          items: {
            type: "object",
            properties: {
              item: {
                type: "string",
                description: "Name of the purchased item",
              },
              date: {
                type: "string",
                format: "date",
                description: "Date of purchase",
              },
              amount: {
                type: "number",
                description: "Amount spent on the purchase",
              },
            },
          },
          description: "List of previous purchases",
        },
        customer_agent_satisfaction: {
          type: "string",
          description:
            "User satisfaction on conversation agent's performance, never about product or service directly offered by company",
        },
      },
    },
  },
];

// Function to classify the message using OpenAI API
export const extractProfile = async (message) => {
  const prompt = `Check this message: ${message}, to extract any customer detail, must return empty if no info exists, must never add any info non-existent in the message`;
  const model = "gpt-3.5-turbo-1106";
  const max_tokens = 100;
  const top_p = 1;
  const frequency_penalty = 0;
  const presence_penalty = 0;
  const temperature = 0;

  try {
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
    console.log(response.choices[0].message.function_call);
    const bit = response.choices[0].message.function_call;
    const args = JSON.parse(bit.arguments);
    console.log(args);
    return args;
  } catch (error) {
    console.error("Error during extraction:", error.message);
    return "unknown";
  }
};

// const message = "Hello";
// const customerProfile = await extractProfile(message);
// console.log(customerProfile);
