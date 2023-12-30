// src\modules\communication\twilio\messaging\index.js

import express from 'express';
import webhook from './routes/webhook.js';
import broadcastRoute from "./routes/broadcastRoute.js";
import logger from "../../../../../logger.js";

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/webhook', webhook);
app.use('/broadcast', broadcastRoute);

export default app;
