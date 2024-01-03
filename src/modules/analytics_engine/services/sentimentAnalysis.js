import { PrismaClient } from "@prisma/client";
import axios from "axios"; // Import axios library
import logger from "../../../../logger.js";

const prisma = new PrismaClient();

export async function handleSentimentAnalysis(data) {
  logger.info("Handle sentiment analysis triggered.");
  const messageId = data[1];
  const message = await prisma.message.findUnique({
    where: { id: messageId },
    include: { conversation: true },
  });

  if (!message) {
    logger.error("Message not found: " + messageId);
    return;
  }

  const text = encodeURIComponent(message.content);

  try {
    const response = await axios.post(
      "https://api.twinword.com/api/sentiment/analyze/latest/",
      `text=${text}`,
      {
        headers: {
          "accept": "application/json, text/javascript, */*; q=0.01",
          "accept-language": "en-US,en;q=0.9",
          "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
          "sec-ch-ua": "\"Not_A Brand\";v=\"8\", \"Chromium\";v=\"120\", \"Google Chrome\";v=\"120\"",
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-platform": "\"Windows\"",
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "same-site",
        },
      }
    );

    const data = response.data;
    logger.info("Sentiment Analysis result: " + messageId, data);

    if(!data.type || !data.score){
      logger.error("Exceeded quota limit.")
    }

    // Update the Message model with sentiment analysis results
    await prisma.message.update({
      where: { id: messageId },
      data: {
        sentiment: data.type,
        sentimentScore: data.score,
      },
    });

    // Update the Conversation model with overall sentiment analysis results
    const conversationId = message.conversationId;
    const messages = await prisma.message.findMany({
      where: { conversationId },
    });

    const overallSentiment = calculateOverallSentiment(messages);
    const overallSentimentScore = calculateOverallSentimentScore(messages);

    await prisma.conversation.update({
      where: { id: conversationId },
      data: {
        overallSentiment,
        overallSentimentScore,
      },
    });
  } catch (error) {
    logger.error("Error in Sentiment Analysis: " + messageId, error);
  }
}

function calculateOverallSentiment(messages) {
  const sentimentCounts = { positive: 0, neutral: 0, negative: 0 };

  for (const message of messages) {
    sentimentCounts[message.sentiment]++;
  }

  const maxSentiment = Object.keys(sentimentCounts).reduce(
    (a, b) => (sentimentCounts[a] > sentimentCounts[b] ? a : b),
    null
  );

  return maxSentiment;
}

function calculateOverallSentimentScore(messages) {
  const totalScore = messages.reduce((sum, message) => sum + message.sentimentScore, 0);
  const averageScore = totalScore / messages.length;

  return averageScore;
}
