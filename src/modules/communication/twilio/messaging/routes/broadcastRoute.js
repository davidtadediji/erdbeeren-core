import express from "express";
import { broadcastMessage } from "../controllers/broadcastController.js";
import { validateTwilioBroadcast } from "../middlewares/validationMiddleware.js";
import {
  authenticateJWT,
  hasPermission,
} from "../../../../authentication/middleware/authMiddleware.js";

const router = express.Router();

router.post(
  "/",
  authenticateJWT,
  hasPermission(["broadcastMessage"]),
  validateTwilioBroadcast,
  async (req, res) => {
    console.log("broadcast triggered");
    const { title, content } = req.body;

    try {
      const result = await broadcastMessage(title, content);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

export default router;
