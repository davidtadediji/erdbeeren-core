// src\modules\enterprise_config\index.js

import express from 'express';
import detailsRoutes from "./routes/detailsRoutes.js"
import cors from 'cors';
import errorMiddleware from './middlewares/errorMiddleware.js';

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());


// Routes
app.use('/config', detailsRoutes);

app.use(errorMiddleware)

export default app;
