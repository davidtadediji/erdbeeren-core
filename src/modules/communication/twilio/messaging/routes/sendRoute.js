import express from "express";
import { sendMessage } from "../services/sendMessageService.js";
import { validateTwilioBroadcast } from "../middlewares/validationMiddleware.js";
import {
  authenticateJWT,
  hasPermission,
} from "../../../../authentication/middleware/authMiddleware.js";

const router = express.Router();

router.post(
  "/",
//   authenticateJWT, 
//   hasPermission(["sendMessage"]),
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

export default router;
