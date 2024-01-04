import { PrismaClient } from "@prisma/client";
import axios from "axios";
import logger from "../../../../logger.js";
import dotenv from "dotenv";
const prisma = new PrismaClient();

dotenv.config();

export async function handleEntityRecognition(messageId) {
  logger.info("Handle entity recognition: " + messageId);
  try {
    const message = await prisma.message.findUnique({
      where: { id: messageId },
      include: { conversation: true },
    });

    if (!message) {
      logger.error("Message not found.");
      return;
    }

    const existingEntities = message.conversation?.entities || [];

    const apiKey = process.env.TEXTRAZOR_API_KEY;
    logger.info("TEXTRAZOR_API_KEY: " + apiKey);
    const apiUrl = "https://api.textrazor.com/";
    const extractors = "entities";

    const headers = {
      "Content-Type": "application/x-www-form-urlencoded",
      "x-textrazor-key": apiKey,
    };

    const minTextLengthForLanguageDetection = 5;
    const defaultLanguage = "eng"; // ISO-639-2 code for English
    logger.info("Message content: " + message.content);
    const messageContent = message.content;

    const data = new URLSearchParams();
    data.append("text", messageContent);
    // Check if the message content is short
    if (messageContent.length < minTextLengthForLanguageDetection) {
      // Set the language to English explicitly for short texts
      data.append("languageOverride", defaultLanguage);
    }
    data.append("extractors", extractors);

    const response = await axios.post(apiUrl, data, { headers });
    logger.info("Entity recognition result: ", response.data.response);
    const responseEntities = response.data.response.entities;

    // Check if entities exist in the response
    if (!responseEntities) {
      logger.warn("No entities found in the API response.");
      return;
    }

    const newEntities = responseEntities.map((entity) => ({
      entityId: entity.entityId,
      wikiLink: entity.wikiLink,
      type: entity.type,
    }));
    const updatedEntities = [...existingEntities, ...newEntities];

    await prisma.conversation.update({
      where: { id: message.conversation.id },
      data: { entities: updatedEntities },
    });

    logger.info("Entities analyzed and saved successfully.");
  } catch (error) {
    logger.error("Error analyzing and saving entities: " + error.message);
  }
}
