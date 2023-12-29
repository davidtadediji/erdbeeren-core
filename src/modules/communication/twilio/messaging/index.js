// src\modules\communication\twilio\messaging\index.js
import express from 'express';
import webhook from './webhook.js';
import logger from "../../../../../logger.js"

const app = express();

app.use(express.json());

// Parse URL-encoded bodies (for form data)
app.use(express.urlencoded({ extended: true }));

// Use the routes
app.use('/message-webhook', webhook);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
