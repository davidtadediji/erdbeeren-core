// src\modules\enterprise_config\routes\detailsRoutes.js
import logger from "../../../../../../logger.js";
import * as broadcastsManager from "../services/broadcastsManager.js";

import express from "express";
import {
  authenticateJWT,
  hasPermission,
} from "../../../../authentication/middleware/authMiddleware.js";

const router = express.Router();

router.get(
  "/get-broadcasts",
  authenticateJWT,
  hasPermission(["manageBroadcasts"]),
  async (req, res, next) => {
    try {
      const broadcasts = await broadcastsManager.getBroadcasts();
      res.json(broadcasts);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
