import express from 'express';
import { broadcastMessage } from '../controllers/broadcastController.js';
import { validateTwilioBroadcast } from '../middlewares/validationMiddleware.js';
import { authenticateJWT, hasPermission } from "../../../../authentication/middleware/authMiddleware.js";

const router = express.Router();


router.post(
  '/',
  authenticateJWT, 
  hasPermission(["broadcastMessage"]),
  validateTwilioBroadcast, 
  async (req, res) => {
    const { content } = req.body;

    try {
      const result = await broadcastMessage(content);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

// Export the router
export default router;
