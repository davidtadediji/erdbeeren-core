import { PrismaClient } from "@prisma/client";
import "cheerio";
import dotenv from "dotenv";
import OpenAI from "openai";

const prisma = new PrismaClient();

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const determineFollowUp = async (previousMessages) => {
  try {
    // Prepare agent and user messages from previousMessages
    const agentMessages = previousMessages
      .filter((msg) => msg.sender === "agent" || !isNaN(parseInt(msg.sender)))
      .map((msg) => msg.text);
    const userMessages = previousMessages
      .filter((msg) => msg.sender === "customer")
      .map((msg) => msg.text);

    // Generate the prompt with agent and user messages
    const agentMessagesFormatted = agentMessages
      .map((msg) => `Agent: ${msg}`)
      .join("\n");
    const userMessagesFormatted = userMessages
      .map((msg) => `User: ${msg}`)
      .join("\n");

    const prompt = `Determine if the context of the user's response is related to that of the agent's message (0 for related, 1 for unrelated):\n\n${agentMessagesFormatted}\n\n${userMessagesFormatted}\n`;

    console.log(prompt);

    // Call OpenAI Chat API to determine follow-up
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "assistant", content: prompt }],
      temperature: 0,
      functions: [
        {
          name: "determineIfMessagesAreRelated",
          parameters: {
            type: "object",
            properties: {
              followUp: {
                type: "number",
                description:
                  "Indicator for relation between agent message and user response (0 for related, 1 for unrelated)",
              },
            },
          },
        },
      ],
      function_call: { name: "determineIfMessagesAreRelated" },
    });

    // Extract and parse the function call result
    const bit = response.choices[0].message.function_call;
    const args = JSON.parse(bit.arguments);
    const isFollowUp = args.followUp;

    return isFollowUp;
  } catch (error) {
    throw new Error(`Error determining follow-up: ${error.message}`);
  }
};

const determineFollowUp2 = async (previousMessages) => {
  try {
    // Prepare agent and user messages from previousMessages
    const agentMessages = previousMessages
      .filter((msg) => msg.sender === "agent" || !isNaN(parseInt(msg.sender)))
      .map((msg) => msg.content);
    const userMessages = previousMessages
      .filter((msg) => msg.sender === "customer")
      .map((msg) => msg.content);

    // Generate the prompt with agent and user messages
    const agentMessagesFormatted = agentMessages
      .map((msg) => `Agent: ${msg}`)
      .join("\n");
    const userMessagesFormatted = userMessages
      .map((msg) => `User: ${msg}`)
      .join("\n");

    const prompt = `Determine if the context of the user's message is specifically related to that of the agent's message (0 for related, 1 for unrelated):\n\n${agentMessagesFormatted}\n\n${userMessagesFormatted}\n`;

    console.log(prompt);

    // Call OpenAI Chat API to determine follow-up
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "assistant", content: prompt }],
      temperature: 0,
      functions: [
        {
          name: "determineIfMessagesAreRelated",
          parameters: {
            type: "object",
            properties: {
              followUp: {
                type: "number",
                description:
                  "Indicator for relation between agent message and user response (0 for related, 1 for unrelated)",
              },
            },
          },
        },
      ],
      function_call: { name: "determineIfMessagesAreRelated" },
    });

    // Extract and parse the function call result
    const bit = response.choices[0].message.function_call;
    const args = JSON.parse(bit.arguments);
    const isFollowUp = args.followUp;

    return isFollowUp;
  } catch (error) {
    throw new Error(`Error determining follow-up: ${error.message}`);
  }
};

const determineFollowUp3 = async (previousMessages) => {
  try {
    // Prepare agent and user messages from previousMessages
    const agentMessages = previousMessages
      .filter((msg) => msg.sender === "agent")
      .map((msg) => msg.content);
    const userMessages = previousMessages
      .filter((msg) => msg.sender === "customer")
      .map((msg) => msg.content);

    // Generate the prompt with agent and user messages
    const agentMessagesFormatted = agentMessages
      .map((msg) => `Agent: ${msg}`)
      .join("\n");
    const userMessagesFormatted = userMessages
      .map((msg) => `User: ${msg}`)
      .join("\n");

    const prompt = `Determine if the context of the user's message is a closely related follow up response to the agent's message (0 for follow-up, 1 for not follow-up):\n\n${agentMessagesFormatted}\n\n${userMessagesFormatted}\n`;

    console.log(prompt);

    // Call OpenAI Chat API to determine follow-up
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "assistant", content: prompt }],
      temperature: 0,
      functions: [
        {
          name: "determineIfMessageIsFollowUp",
          parameters: {
            type: "object",
            properties: {
              followUp: {
                type: "number",
                description:
                  "Indicator for follow up relation between agent message and user response  (0 for follow-up, 1 for not follow-up):",
              },
            },
          },
        },
      ],
      function_call: { name: "determineIfMessageIsFollowUp" },
    });

    // Extract and parse the function call result
    const bit = response.choices[0].message.function_call;
    const args = JSON.parse(bit.arguments);
    const isFollowUp = args.followUp;

    return isFollowUp;
  } catch (error) {
    throw new Error(`Error determining follow-up: ${error.message}`);
  }
};

// const previousMessages = [
//   {
//     sender: "agent",
//     content: "We have products at bagatelle",
//     timestamp: "2024-06-29T17:01:58.628Z",
//   },
//   {
//     sender: "customer",
//     content: "i don't know",
//     timestamp: "2024-06-29T17:01:58.628Z",
//   },
// ];

// (async () => {
//   try {
//     const isFollowUp = await determineFollowUp(previousMessages);
//     if (isFollowUp == 1) {
//       console.log("It is not a follow up response", isFollowUp);
//     } else {
//       console.log("Seems like a follow up response");
//     }
//   } catch (error) {
//     console.error("Error determining follow-up:", error.message);
//   }
// })();
