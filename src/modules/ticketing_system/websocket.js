import http from "http";
import { WebSocketServer } from "ws";
import { PrismaClient } from "@prisma/client";
import logger from "../../../logger.js";

const prisma = new PrismaClient();

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

wss.on("connection", (socket) => {
  logger.info("Client is connected");
  socket.on("disconnect", () => {
    logger.info("Client disconnected");
  });
});

async function startServer() {
  await prisma.$connect();

  const ticketListener = await prisma.$queryRaw(`
    LISTEN new_ticket;
  `);

  ticketListener.on("ticket-notification", async () => {
    wss.emit("newTicket");
  });

  server.listen(5000, () => {
    console.log("WebSocket server is running on port 3000");
  });
}

startServer().catch((err) => {
  console.error("Error starting server:", err);
});
