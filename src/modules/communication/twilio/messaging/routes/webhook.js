// src\modules\communication\twilio\messaging\webhook.js
import express from 'express';
import webhookController from '../controllers/webhookController.js';
import {validateTwilioWebhook}from '../middlewares/validationMiddleware.js';

const router = express.Router();

router.post('/', validateTwilioWebhook, webhookController);

export default router;
