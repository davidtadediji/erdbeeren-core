// enterpriseApi.js

import express from 'express';
import * as enterpriseConfig from '../configurations/enterpriseConfig';

const app = express();
const port = 3000; // Choose an appropriate port

app.use(express.json());

// Endpoint to set enterprise details
app.post('/setEnterpriseDetails', (req, res) => {
  const details = req.body.details;
  enterpriseConfig.setEnterpriseDetails(details);
  res.json({ message: 'Enterprise details updated successfully' });
});

// Endpoint to get enterprise details
app.get('/getEnterpriseDetails', (req, res) => {
  const details = enterpriseConfig.getEnterpriseDetails();
  res.json(details);
});

export const start = () => {
  app.listen(port, () => {
    console.log(`Enterprise API server listening at http://localhost:${port}`);
  });
};
