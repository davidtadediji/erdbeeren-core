import { PrismaClient } from "@prisma/client";
import axios from "axios";
import logger from "../../../../logger.js";
import auditLogger from "../../../../audit_logger.js";

const prisma = new PrismaClient();

// function to calculate message sentiment, to be called by message consumer
export async function handleSentimentAnalysis(messageId) {
  logger.info("Handle sentiment analysis triggered: " + messageId);

  // Find the message by Id
  const message = await prisma.message.findUnique({
    where: { id: messageId },
    include: { conversation: true },
  });

  if (!message) {
    logger.error("Message not found for sentiment analysis: " + messageId);
    auditLogger.error("Message not found for sentiment analysis: " + messageId);
    return;
  }

  // get the text of the message
  const text = encodeURIComponent(message.content);

  logger.info("Analysed text: " + text);

  // this is to prepare the request and add the text of the message to the options object being prepared
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
    // use axios to make a get request with the options object as parameter
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

    // calculate the overall sentiment and score of all messages within the conversation
    // associated with the message that triggered sentiment analysis
    const overallSentiment = calculateOverallSentiment(messages);
    const overallSentimentScore = calculateOverallSentimentScore(messages);

    logger.info(
      "OverallSentiment: " +
        overallSentiment +
        " OverallSentimentScore: " +
        overallSentimentScore
    );

    // update the conversation kpis
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

// Function to calculate overall sentiment of a conversation based on sentiment count
function calculateOverallSentiment(messages) {
  const sentimentCounts = { positive: 0, neutral: 0, negative: 0 };

  for (const message of messages) {
    // To exclude messages with null sentiment
    if (message.sentiment !== null) {
      sentimentCounts[message.sentiment]++;
    }
  }

  // return the most occurring conversation sentiment
  const maxSentiment = Object.keys(sentimentCounts).reduce(
    (a, b) => (sentimentCounts[a] > sentimentCounts[b] ? a : b),
    null
  );

  return maxSentiment;
}

// Function to calculate overall sentiment score of a conversation
function calculateOverallSentimentScore(messages) {
  // accummulate all the sentiment scores of messages within the conversation and find the average.
  const totalScore = messages.reduce(
    (sum, message) => sum + message.sentimentScore,
    0
  );
  const averageScore = totalScore / messages.length;

  return averageScore;
}
