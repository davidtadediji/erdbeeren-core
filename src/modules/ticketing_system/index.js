// src\modules\ticketing_system\index.js
import express from "express";
import errorMiddleware from "./middleware/errorMiddleware.js";
import cors from "cors";
import dotenv from "dotenv";
import AgentTicketingRoutes from "./routes/ticketingSystemRoutes.js";
import KnowledgeBaseRoutes from "./routes/knowledgeBase.js";

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Routes
app.use("/ticketing", AgentTicketingRoutes);
app.use("/knowledge-base", KnowledgeBaseRoutes);

// Error handling middleware
app.use(errorMiddleware);

export default app;
