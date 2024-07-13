// src\modules\audit_logger\auditRoutes.js
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

// create a new router instance
const router = express.Router();

// implement middleware to authenticate user through JWT tokens
router.use(authenticateJWT);

// implement middleware to check if the user has the required permissions
router.use(hasPermission(["viewAuditLogs"]));



// Get the directory of the current module
const currentModuleURL = new URL(import.meta.url);
const currentModuleDir = path.dirname(currentModuleURL.pathname);

logger.info("File service dir: " + currentModuleDir); // Log the current module directory

// Define the path to the log file
const LOG_FILE_PATH = path.join(
  currentModuleDir.replace(/^\/([A-Z]:)/, "$1"),
  "..",
  "..",
  "..",
  "audit.log"
);

// Route to get the last 500 lines of the audit log file as plain text
router.get("/text", async (req, res, next) => {
  logger.info("Get Logs triggered"); // Log the get logs trigger
  try {
    // Read the log file content
    const data = await fs.readFile(LOG_FILE_PATH, "utf8");
    // const lines = data.trim().split("\n"); // Split the file content into lines and get the last 500 lines
    // const last500Lines = lines.slice(-500).join("\n"); 
    res.setHeader("Content-Type", "text/plain"); // Set the response content type to plain text
    res.send(data); // Send the last 500 lines as the response
  } catch (error) {
    next(error); // Pass any errors to the error handling middleware
  }
});

export default router;
