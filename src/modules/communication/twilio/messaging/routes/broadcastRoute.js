// Import necessary modules and middlewares
import express from 'express';
import { broadcastMessage } from '../controllers/broadcastController.js';
import { validateTwilioBroadcast } from '../middlewares/validationMiddleware.js';
import { authenticateJWT, hasPermission } from "../../../../authentication/middleware/authMiddleware.js";
import { ROLES } from "../../../../authentication/config/roles.js";

const router = express.Router();

// Protect the '/' route with authentication and permission check
router.post(
  '/',
  authenticateJWT, // Ensure the user is authenticated
  hasPermission([ROLES.ADMIN]), // Ensure the user has the 'admin' role
  validateTwilioBroadcast, // Validate the request payload
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
