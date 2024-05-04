// routes.js
import express from "express";
import path from "path";
import { setupWebSocketServer } from "../websocket.js";
import { createRecognizeStream } from "../services/sttService.js";
import { generateResponse } from "../services/gptService.js";

const router = express.Router();

router.use(express.static("public"));

router.get("/", (req, res) =>
  res.sendFile(path.join(__dirname, "/index.html"))
);

router.post("/", (req, res) => {
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

export default router;
