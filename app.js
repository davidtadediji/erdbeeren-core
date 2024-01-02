// app.js

import { PrismaClient } from '@prisma/client';
import dotenv from "dotenv";
import express from "express";
import http from "http";
import logger from "./logger.js";
import analyticsModule from "./src/modules/analytics/index.js";
import authenticationModule from "./src/modules/authentication/index.js";
import twilioMessagingModule from "./src/modules/communication/twilio/messaging/index.js";
import {
  app as twilioVoiceApp,
  server as twilioVoiceServer,
} from "./src/modules/communication/twilio/voice/index.js";
import enterpriseConfigModule from "./src/modules/enterprise_config/index.js";
import llmContextModule from "./src/modules/llm_context/index.js";
dotenv.config()

const app = express();
const port = process.env.PORT || 3000;

const prisma = new PrismaClient();

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Perform cleanup tasks or handle the error gracefully
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error.message);
  // Perform cleanup tasks or handle the error gracefully
  gracefulShutdown();
});

// Graceful shutdown function
const gracefulShutdown = async () => {
  // Close the Prisma client connection (replace this with your actual Prisma cleanup logic)
  await prisma.$disconnect();

  // Log a message indicating the cleanup is complete
  logger.info('Graceful shutdown complete');

  // Allow the process to exit naturally
  process.exit(1);
};

app.use("/api/analytics", analyticsModule)
// Use middleware/routes from the enterprise_config module with /api/enterprise prefix
app.use("/api/enterprise", enterpriseConfigModule);

// Use middleware/routes from the llm_context module with /api/llm prefix
app.use("/api/llm", llmContextModule);

// Use middleware/routes from the authentication module with /api/auth prefix
app.use("/api/authentication", authenticationModule);

// Use middleware/routes from the twilio messaging module with /api/communication/twilio/messaging prefix
app.use("/api/twilio/messaging", twilioMessagingModule);

// Use middleware/routes from the twilio voice module with /api/communication/twilio/voice prefix
app.use("/api/twilio/voice", twilioVoiceApp);

// Start the centralized API server
app.listen(port, () => {
  logger.info(`Centralized API server listening at http://localhost:${port}`);
});

// Start the Twilio Voice HTTP server
twilioVoiceServer.listen(8080, () => {
  logger.info("Twilio Voice server listening at http://localhost:8080");
});
