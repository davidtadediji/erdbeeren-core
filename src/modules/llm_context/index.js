// src\modules\llm_context\index.js
import express from 'express';
import fileRoutes from './routes/fileRoutes.js';
import contextRoutes from "./routes/contextRoutes.js";
import cors from 'cors';
import errorMiddleware from './middleware/errorMiddleware.js';
import dotenv from "dotenv";
import logger from "../../../logger.js";

dotenv.config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors());

logger.info("Port: " + process.env.PORT)
const PORT = process.env.PORT || 3000;


app.use('/files', fileRoutes);
app.use('/context', contextRoutes);
app.use(errorMiddleware); // Use the error handling middleware

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


