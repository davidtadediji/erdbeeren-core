// src\modules\enterprise_config\index.js

import express from 'express';
import * as enterpriseConfig from './configurations/detailsConfig.js';
import * as enterpriseApi from './routes/detailsRoutes.js';
import cors from 'cors';

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Routes
app.post('/setEnterpriseDetails', enterpriseApi.setEnterpriseDetails);
app.get('/getEnterpriseDetails', enterpriseApi.getEnterpriseDetails);

export default app;
