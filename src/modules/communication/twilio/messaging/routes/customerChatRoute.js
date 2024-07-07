// src\modules\communication\twilio\messaging\webhook.js

import express from "express";
import { getCustomerConversationMessages } from "../services/conversationService.js";
const router = express.Router();

// Toute to get customer conversation messages
router.get("/:participantSid", async (req, res) => {
  const { participantSid } = req.params;

  try {
    const messages = await getCustomerConversationMessages(participantSid);
    res.status(200).json({ success: true, messages });
  } catch (error) {
    console.error("Error in getting customer conversation messages:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
