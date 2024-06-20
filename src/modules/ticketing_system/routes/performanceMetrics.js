import express from "express";
import { ROLES } from "../../authentication/config/roles.js";
import {
  authenticateJWT,
  hasPermission,
} from "../../authentication/middleware/authMiddleware.js";
import * as agentController from "../controllers/agentController.js";

const router = express.Router();

export default router;