// src\modules\audit_logger\index.js
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import auditRoutes from "./auditRoutes.js";
import errorMiddleware from "./errorMiddleware.js";

dotenv.config();

// Create an Express application
const app = express();

// middleware to parse JSON bodies
app.use(express.json());

// middleware to parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// middleware to enable Cross-Origin Resource Sharing (CORS)
app.use(cors());

// Routes
app.use("/logs", auditRoutes); // Use the audit routes for '/logs' endpoint
app.use(errorMiddleware); // Use the custom error handling middleware

export default app; // Export the app for use in app.js, (application entry point)
