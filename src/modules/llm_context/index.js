// src\modules\llm_context\index.js
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import logger from "../../../logger.js";
import errorMiddleware from "./middlewares/errorMiddleware.js";
import customerContextRoutes from "./routes/customerContextRoutes.js";
import enterpriseContextRoutes from "./routes/enterpriseContextRoutes.js";
import fileRoutes from "./routes/fileRoutes.js";
import modelRoutes from "./routes/modelRoutes.js"

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

logger.info("Port: " + process.env.PORT);

// Routes
app.use("/repository", fileRoutes);
app.use("/enterprise-context", enterpriseContextRoutes);
app.use("/customer-context", customerContextRoutes);
app.use("/model", modelRoutes);
app.use(errorMiddleware); // Use the error handling middleware

export default app;
