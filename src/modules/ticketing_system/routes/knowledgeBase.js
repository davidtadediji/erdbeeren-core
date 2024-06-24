import express from "express";
import { ROLES } from "../../authentication/config/roles.js";
import {
  authenticateJWT,
  hasPermission,
} from "../../authentication/middleware/authMiddleware.js";
import * as agentController from "../controllers/agentController.js";
import { listFiles, viewFile } from "../services/knowledgeBaseService.js";

const router = express.Router();

// Protect the '/list' route with authentication and permission check
router.get(
  "/list",
  authenticateJWT,
  hasPermission(["viewAgentDashboard"]),
  async (req, res, next) => {
    try {
      const files = await listFiles();
      res.json({ files });
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  "/view/:filename",
  authenticateJWT,
  hasPermission(["viewAgentDashboard"]),
  async (req, res, next) => {
    const { filename } = req.params;

    try {
      const { fileStream, contentType } = await viewFile(filename);

      res.setHeader("Content-Type", contentType);
      res.setHeader("Content-Disposition", `attachment; filename=${filename}`);

      fileStream.pipe(res);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
