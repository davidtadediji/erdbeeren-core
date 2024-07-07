// src\modules\communication\twilio\messaging\index.js

import express from "express";
import broadcastRoute from "./routes/broadcastRoute.js";
import broadcastsManagerRoutes from "./routes/broadcastsManagerRoutes.js";
import sendRoute from "./routes/sendRoute.js";
import webhook from "./routes/webhook.js";
import customerChatRoute from "./routes/customerChatRoute.js";
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/webhook", webhook);
app.use("/broadcast", broadcastRoute);
app.use("/broadcast-manager", broadcastsManagerRoutes);
app.use("/send", sendRoute);
app.use("/customer", customerChatRoute);

export default app;
