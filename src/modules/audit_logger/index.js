// src\modules\audit_logger\index.js
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import logger from "../../../logger.js";
import errorMiddleware from "./errorMiddleware.js";
import auditRoutes from "./auditRoutes.js";

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

logger.info("Port: " + process.env.PORT);

// Routes
app.use("/logs", auditRoutes);
app.use(errorMiddleware);

export default app;
