// Import necessary modules and middlewares
import express from "express";
import { sendMessage } from "../services/sendMessageService.js";
import { validateTwilioBroadcast } from "../middlewares/validationMiddleware.js";
import {
  authenticateJWT,
  hasPermission,
} from "../../../../authentication/middleware/authMiddleware.js";

const router = express.Router();

// Protect the '/' route with authentication and permission check
router.post(
  "/",
//   authenticateJWT, // Ensure the user is authenticated
//   hasPermission(["sendMessage"]), // Ensure the user has the 'admin' role
  async (req, res) => {
    const { content, phoneNumber } = req.body;

    try {
      const result = await sendMessage(content, phoneNumber);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

// Export the router
export default router;
