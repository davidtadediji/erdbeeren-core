// src\modules\reports\index.js

import express from 'express';
import errorMiddleware from './middleware/errorMiddleware.js';
import cors from 'cors';
import dotenv from 'dotenv';
import individualMetricsRoutes from "./routes/individualMetrics.js";
import aggregateMetricsRoutes from "./routes/aggregateMetrics.js";
import agentMetricsRoutes from "./routes/agentMetrics.js"

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Routes
app.use('/individual', individualMetricsRoutes)
app.use('/aggregate', aggregateMetricsRoutes)
app.use('/agent', agentMetricsRoutes)

// Error handling middleware
app.use(errorMiddleware);

export default app;
