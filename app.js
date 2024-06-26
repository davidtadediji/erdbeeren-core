// app.js

import { PrismaClient } from "@prisma/client";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import logger from "./logger.js";
import reportsModule from "./src/modules/reports/index.js";
import "./src/modules/analytics_engine/eventListener.js";
import authenticationModule from "./src/modules/authentication/index.js";
import twilioMessagingModule from "./src/modules/communication/twilio/messaging/index.js";
import auditLoggingModule from "./src/modules/audit_logger/index.js";
import {
  app as twilioVoiceApp,
  server as twilioVoiceServer,
} from "./src/modules/communication/twilio/voice/index.js";
import { server as webSocketServer } from "./src/modules/ticketing_system/services/agentTicketService.js";

import enterpriseConfigModule from "./src/modules/enterprise_config/index.js";
import llmContextModule from "./src/modules/llm_context/index.js";
import ticketingModule from "./src/modules/ticketing_system/index.js";

dotenv.config();

const app = express();
app.use(cors());

const port = process.env.PORT || 3000;

const prisma = new PrismaClient();

process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection at:" + promise + "reason:" + reason);
  // Perform cleanup tasks or handle the error gracefully
});

process.on("uncaughtException", (error) => {
  logger.error("Uncaught Exception:" + error.message);
  // Perform cleanup tasks or handle the error gracefully
  gracefulShutdown();
});

// Graceful shutdown function
const gracefulShutdown = async () => {
  // Close the Prisma client connection
  await prisma.$disconnect();

  logger.info("Graceful shutdown complete");

  // Allow the process to exit naturally
  process.exit(1);
};

app.use("/api/report", reportsModule);
app.use("/api/enterprise", enterpriseConfigModule);
app.use("/api/llm", llmContextModule);
app.use("/api/authentication", authenticationModule);
app.use("/api/agent", ticketingModule);
app.use("/api/twilio/messaging", twilioMessagingModule);
app.use("/api/twilio/voice", twilioVoiceApp);
app.use("/api/audit", auditLoggingModule);

// Start the centralized API server
app.listen(port, () => {
  logger.info(`Centralized API server listening at http://localhost:${port}`);
});

// webSocketServer.listen(5000, () => {
//   logger.info(`WebSocket server listening at ws://localhost:5000`);
// });

// Start the Twilio Voice HTTP server
twilioVoiceServer.listen(8080, () => {
  logger.info("Twilio Voice server listening at http://localhost:8080");
});
