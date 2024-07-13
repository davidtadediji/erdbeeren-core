import { PrismaClient } from "@prisma/client";
import axios from "axios";
import logger from "../../../../logger.js";
import auditLogger from "../../../../audit_logger.js";

const prisma = new PrismaClient();

export async function handleSentimentAnalysis(messageId) {
  logger.info("Handle sentiment analysis triggered: " + messageId);

  const message = await prisma.message.findUnique({
    where: { id: messageId },
    include: { conversation: true },
  });

  if (!message) {
    logger.error("Message not found for sentiment analysis: " + messageId);
    auditLogger.error("Message not found for sentiment analysis: " + messageId);
    return;
  }

  const text = encodeURIComponent(message.content);

  logger.info("Analysed text: " + text);

  const options = {
    method: "GET",
    url: "https://twinword-sentiment-analysis.p.rapidapi.com/analyze/",
    params: {
      text: text,
    },
    headers: {
      "x-rapidapi-key": "77efa167e9mshbd2544ac809dc95p19ff49jsn256c8b53024e",
      "x-rapidapi-host": "twinword-sentiment-analysis.p.rapidapi.com",
    },
  };

  try {
    const response = await axios.request(options);

    const data = response.data;
    logger.info("Sentiment analysis result: " + messageId, data);

    logger.info(
      "Sentiment type: " + data.type + " Sentiment score: " + data.score
    );

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

    logger.info(
      "OverallSentiment: " +
        overallSentiment +
        " OverallSentimentScore: " +
        overallSentimentScore
    );

    await prisma.conversationMetrics.update({
      where: { conversationId: conversationId },
      data: {
        overallSentiment,
        overallSentimentScore,
      },
    });
  } catch (error) {
    logger.error("Error in Sentiment Analysis: " + messageId, error);
    auditLogger.error("Error in Sentiment Analysis: " + messageId, error);
  }
}

function calculateOverallSentiment(messages) {
  const sentimentCounts = { positive: 0, neutral: 0, negative: 0 };

  for (const message of messages) {
    // Excluded messages with null sentiment
    if (message.sentiment !== null) {
      sentimentCounts[message.sentiment]++;
    }
  }

  const maxSentiment = Object.keys(sentimentCounts).reduce(
    (a, b) => (sentimentCounts[a] > sentimentCounts[b] ? a : b),
    null
  );

  return maxSentiment;
}

function calculateOverallSentimentScore(messages) {
  const totalScore = messages.reduce(
    (sum, message) => sum + message.sentimentScore,
    0
  );
  const averageScore = totalScore / messages.length;

  return averageScore;
}
