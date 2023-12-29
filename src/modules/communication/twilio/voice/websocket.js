// websocket.js
import { WebSocketServer } from "ws";
import logger from "../../../../../logger.js";

export const setupWebSocketServer = (server, gptResponseGenerator) => {
  const wss = new WebSocketServer({ server });

  wss.on("connection", (ws) => {
    logger.info("New Connection Initiated");

    let recognizeStream = null;

    ws.on("message", (message) => {
      const msg = JSON.parse(message);

      switch (msg.event) {
        case "connected":
          console.log(`A new call has connected.`);
          break;
        case "start":
          console.log(`Starting media stream ${msg.streamSid}`);

          // Create Stream to the Google Speech to Text API
          recognizeStream = gptResponseGenerator(client, ws);
          break;
        case "media":
          recognizeStream.write(msg.media.payload);
          break;
        case "stop":
          logger.info("Call has ended");
          recognizeStream.destroy();
          break;
      }
    });
  });
};
