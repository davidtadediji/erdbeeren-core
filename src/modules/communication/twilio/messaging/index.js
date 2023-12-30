// src\modules\communication\twilio\messaging\index.js

import express from 'express';
import webhook from './webhook.js';
import logger from "../../../../../logger.js";

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/webhook', webhook);

export default app;
