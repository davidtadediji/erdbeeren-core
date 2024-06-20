import express from "express";
import errorMiddleware from "./middleware/errorMiddleware.js";
import cors from "cors";
import dotenv from "dotenv";
import AgentTicketingRoutes from "./routes/ticketingSystem.js";
import * as AgentPerformanceRoutes from "./routes/performanceMetrics.js";
import * as KnowledgeBaseRoutes from "./routes/knowledgeBase.js";

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Routes
app.use("/ticketing", AgentTicketingRoutes);
app.use("/performance", AgentPerformanceRoutes);
app.use("/knowledgebase", KnowledgeBaseRoutes);

// Error handling middleware
app.use(errorMiddleware);

export default app;
