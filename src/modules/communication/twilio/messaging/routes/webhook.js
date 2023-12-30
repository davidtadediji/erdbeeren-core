// src\modules\communication\twilio\messaging\webhook.js
import express from 'express';
import webhookController from '../controllers/webhookController.js';

const router = express.Router();

// Define your routes here
router.post('/', webhookController);

export default router;
