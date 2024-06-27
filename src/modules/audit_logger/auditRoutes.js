import express from "express";
import { PrismaClient } from "@prisma/client";
import {
  authenticateJWT,
  hasPermission,
} from "../authentication/middleware/authMiddleware.js";
import logger from "../../../logger.js";
import path from "path";
import fs from "fs/promises";

const prisma = new PrismaClient();
const router = express.Router();

router.use(authenticateJWT);
router.use(hasPermission(["viewAuditLogs"]));

router.get("/", async (req, res, next) => {
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
    next(error);
  }
});

const currentModuleURL = new URL(import.meta.url);
const currentModuleDir = path.dirname(currentModuleURL.pathname);

logger.info("File service dir: " + currentModuleDir);

const LOG_FILE_PATH = path.join(
  currentModuleDir.replace(/^\/([A-Z]:)/, "$1"),
  "..",
  "..",
  "..",
  "audit.log"
);

router.get("/text", async (req, res, next) => {
  logger.info("Get Logs triggered");
  try {
    const data = await fs.readFile(LOG_FILE_PATH, "utf8");
    const lines = data.trim().split("\n");
    const last500Lines = lines.slice(-500).join("\n");
    res.setHeader("Content-Type", "text/plain");
    res.send(last500Lines);
  } catch (error) {
    next(error);
  }
});

export default router;
