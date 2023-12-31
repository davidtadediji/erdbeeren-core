// src\modules\llm_context\index.js

import express from 'express';
import fileRoutes from './routes/fileRoutes.js';
import contextRoutes from "./routes/contextRoutes.js";
import cors from 'cors';
import errorMiddleware from './middlewares/errorMiddleware.js';
import dotenv from "dotenv";
import logger from "../../../logger.js";

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

logger.info("Port: " + process.env.PORT)

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Handle the error, log, or perform cleanup tasks
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error.message);
  // Handle the error, log, or perform cleanup tasks
  process.exit(1); // Terminate the application
});

// Routes
app.use('/repository', fileRoutes);
app.use('/context', contextRoutes);
app.use(errorMiddleware); // Use the error handling middleware

export default app;
