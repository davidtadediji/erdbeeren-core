// src/routes/broadcastRoute.js
import express from 'express';
import { broadcastMessage } from '../controllers/broadcastController.js';

const router = express.Router();

// Broadcast message to all conversations
router.post('/', async (req, res) => {
  const { content } = req.body;

  try {
    const result = await broadcastMessage(content);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
