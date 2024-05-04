// src\modules\communication\twilio\messaging\webhook.js
import express from 'express';
import webhookController from '../controllers/webhookController.js';
import {validateTwilioWebhook}from '../middlewares/validationMiddleware.js'; // Update the path accordingly

const router = express.Router();

// Apply the validation middleware to the route
router.post('/', validateTwilioWebhook, webhookController);

export default router;
