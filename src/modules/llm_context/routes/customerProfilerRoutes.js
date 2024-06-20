import express from "express";
import { ROLES } from "../../authentication/config/roles.js";
import {
  authenticateJWT,
  hasPermission,
} from "../../authentication/middleware/authMiddleware.js";
import * as customerProfilerController from "../controllers/customerProfilerController.js";

const router = express.Router();

router.get(
  "/generate/:customerId",
  authenticateJWT,
  hasPermission(["viewMonitorDashboard"]),
  customerProfilerController.extractCustomerProfile
);

export default router;
