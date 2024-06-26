import express from "express";
import { PrismaClient } from "@prisma/client";
import {
  authenticateJWT,
  hasPermission,
} from "../authentication/middleware/authMiddleware.js";
import logger from "../../../logger.js";

const prisma = new PrismaClient();
const router = express.Router();

router.use(authenticateJWT);
// router.use(hasPermission(["viewAuditLogs"]));

router.get("/", async (req, res) => {
  logger.info("Audit trail Triggered");
  try {
    const auditLogs = await prisma.auditLog.findMany({
      select: {
        userId: true,
        details: true,
        date: true,
        event: true,
      },
      orderBy: { date: "desc" },
    });
    res.json(auditLogs);
  } catch (error) {
    throw error;
  }
});

export default router;
