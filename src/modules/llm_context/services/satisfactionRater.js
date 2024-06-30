import OpenAI from "openai";

import dotenv from "dotenv";

import { respondToMessage } from "./modelService.js";
import {
  createTicket,
  selectRandomAgent,
} from "../../ticketing_system/services/agentTicketService.js";
import logger from "../../../../logger.js";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env["OPENAI_API_KEY"],
});

// Function to classify the message
const determineCustomerSatisfaction = async (message) => {
  const prompt = `Extract the numeric rating from the following message if there is a numeric rating. Message: "${message}", if there is no number rating in this message you must leave empty, never return a number not specified in the message.`;
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
          name: "extractCustomerSatisfactionNumberRating",
          parameters: {
            type: "object",
            properties: {
              rating: {
                type: "number",
                description: "Numeric rating of customer satisfaction",
              },
            },
          },
        },
      ],
      function_call: { name: "extractCustomerSatisfactionNumberRating" },
      max_tokens,
      top_p,
      frequency_penalty,
      presence_penalty,
      temperature,
    });

    console.log(response);
    const bit = response.choices[0].message.function_call;
    const args = JSON.parse(bit.arguments);

    const rating = args.rating;

    return rating;
  } catch (error) {
    console.error("Error during classification:", error.message);
    return null;
  }
};

export const saveCustomerSatisfactionScore = async (
  message,
  conversationId
) => {
  const rating = await determineCustomerSatisfaction(message);
  console.log(rating);

  if (!isNaN(rating) && rating >= 1 && rating <= 5) {
    console.log("Save rating!");
    try {
      const ticket = await prisma.ticket.findFirst({
        where: {
          conversationId: conversationId,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      if (ticket) {
        await prisma.ticket.update({
          where: {
            id: ticket.id,
          },
          data: {
            customerSatisfactionScore: rating,
          },
        });
      }

      return true;
    } catch (error) {
      logger.error(error.message);
      return false;
    }
  }
  return false;
};

// console.log(saveCustomerSatisfactionScore("I have 2 bags", 3));
