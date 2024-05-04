// src\modules\communication\twilio\voice\index.js

import express from 'express';
import http from 'http';
import logger from '../../../../../logger.js';
import routes from './routes/callRoutes.js';
import { setupWebSocketServer } from './websocket.js';
import { generateResponse } from './services/gptService.js';

const app = express();
const server = http.createServer(app);

// Share the generateResponse function with the WebSocket handler
const gptResponseGenerator = generateResponse;

// Setup WebSocket server with separation of concerns
setupWebSocketServer(server, gptResponseGenerator);

// Use routes from the 'routes' module
app.use('/call', routes);


// Export both the Express app and the HTTP server
export { app, server };



/*
import express from "express";
import http from "http";
import logger from "../../../../../logger.js";

const app = express();
const server = http.createServer(app);
import { WebSocketServer } from "ws";
const wss = new WebSocketServer({ server });

wss.on("connection", (ws) => {
  logger.info("New Connection Initiated");

  ws.on("message", (message) => {
    const msg = JSON.parse(message);
    switch (msg.event) {
      case "connected":
        logger.info("A new call has connected");
        break;
      case "start":
        logger.info("Starting media stream");
        break;
      case "media":
        logger.info("Receiving audio...");
        break;
      case "stop":
        logger.info("Call has ended");
        break;
    }
  });
});

app.post("/", (req, res) => {
  res.set("Content-Type", "text/xml");
  res.send(
    `<Response>
      <Start>
        <Stream url="wss://${req.headers.host}" />
      </Start>
      <Say> I will stream the next 60 seconds of audio</Say>
      <Pause length="60" />
    </Response>`
  );
});

logger.info("Listening at Port 8080");
server.listen(8080);

*/


/*
import express from "express";
import http from "http";
import logger from "../../../../../logger.js";
import { WebSocketServer } from 'ws';
import ngrok from "ngrok";
import isOnline from "is-online";

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// Function to establish ngrok tunnel and update webhook
const establishNgrokTunnel = async () => {
  const ngrokOptions = {
    proto: "http",
    addr: 8080, // Adjust the port accordingly
  };

  try {
    const url = await ngrok.connect(ngrokOptions);
    console.log("ngrok url is " + url);

    // Update the Twilio webhook with the ngrok URL
    // Note: Make sure the updateWebhook function is accessible here
    // await updateVoiceUrl("(678) 270-2106", url);
  } catch (error) {
    console.error("Error establishing ngrok tunnel:", error.message);
  }
};

const updateVoiceUrl = async (phoneNumberSID, url) => {
    console.log(phoneNumberSID)
    try {
     
client.incomingPhoneNumbers(phoneNumberSID)
  .update({voiceUrl: url})
  .then(incoming_phone_number => console.log(incoming_phone_number.friendlyName)); } catch (error) {
      console.error('Error updating webhooks:', error.message);
    }
  };
  

// Function to periodically check and re-establish ngrok tunnel if needed
const checkAndEstablishNgrok = async () => {
  const isConnectionAvailable = await isOnline();

  if (isConnectionAvailable) {
    // If connection is available, establish ngrok tunnel
    await establishNgrokTunnel();
  } else {
    // If connection is not available, wait and check again
    setTimeout(checkAndEstablishNgrok, 5000); // Check every 5 seconds (adjust as needed)
  }
};

wss.on("connection", (ws) => {
  logger.info("New Connection Initiated");

  ws.on("message", (message) => {
    const msg = JSON.parse(message);
    switch (msg.event) {
      case "connected":
        logger.info("A new call has connected");
        break;
      case "start":
        logger.info("Starting media stream");
        break;
      case "media":
        logger.info("Receiving audio...");
        break;
      case "stop":
        logger.info("Call has ended");
        break;
    }
  });
});

app.post("/", (req, res) => {
  res.set("Content-Type", "text/xml");
  res.send(
    `<Response>
      <Start>
        <Stream url="wss://${req.headers.host}" />
      </Start>
      <Say> I will stream the next 60 seconds of audio</Say>
      <Pause length="60" />
    </Response>`
  );
});

const port = process.env.PORT || 8080;
server.listen(port, async () => {
  console.log(`Server is running on port ${port}`);

  // Start the periodic check for internet connection and ngrok tunnel
  await checkAndEstablishNgrok();
});

*/
