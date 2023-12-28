// src\modules\llm_context\index.js
import express from 'express';
import fileRoutes from './routes/fileRoutes.js';
import contextRoutes from "./routes/contextRoutes.js";
import cors from 'cors';
import errorMiddleware from './middleware/errorMiddleware.js';
import dotenv from "dotenv";
import logger from "../../../logger.js";

dotenv.config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors());

logger.info("Port: " + process.env.PORT)
const PORT = process.env.PORT || 3000;

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Handle the error, log, or perform cleanup tasks
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error.message);
  // Handle the error, log, or perform cleanup tasks
  process.exit(1); // Terminate the application
});

app.use('/files', fileRoutes);
app.use('/context', contextRoutes);
app.use(errorMiddleware); // Use the error handling middleware

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


