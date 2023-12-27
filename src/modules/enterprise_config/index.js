// src\modules\enterprise_config\index.js

import express from 'express';
import * as enterpriseConfig from './configurations/detailsConfig.js';
import * as enterpriseApi from './routes/detailsRoutes.js';
import logger from '../../../logger.js';
import cors from 'cors';

const app = express();
const port = process.env.PORT || 3000; // Choose an appropriate port

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors());

// Set up routes from enterpriseRoutes.js
app.post('/setEnterpriseDetails', enterpriseApi.setEnterpriseDetails);
app.get('/getEnterpriseDetails', enterpriseApi.getEnterpriseDetails);

// Start the API server
app.listen(port, () => {
  console.log(`Enterprise API server listening at http://localhost:${port}`);
});
