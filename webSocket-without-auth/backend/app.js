import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./db/db.js";
import { messageRouter } from "./routes/messages.js";
import { WebSocketServer } from "ws";
import http from "http";
import { saveMsgFromWebsocketToDb } from "./controllers/messages.js";
dotenv.config();

const app = express();
const server = http.createServer(app);

const wss = new WebSocketServer({ server });

const handleIncomingMessage = async (message) => {
  const msgString = message.toString();

  try {
    const messageData = JSON.parse(msgString);
    const newMessage = await saveMsgFromWebsocketToDb(messageData);

    // Broadcast the message to all connected client
    if (newMessage) {
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(newMessage));
        }
      });
    }
  } catch (error) {
    console.error("Error parsing message", error);
  }
};

// wss connection event
wss.on("connection", (ws) => {
  console.log("New client connected");

  // handle messages from clients
  ws.on("message", handleIncomingMessage);

  // Handle client disconnection
  ws.on("close", () => {
    console.log("Client disconnected");
  });
});

const port = process.env.PORT || 3000;

const publicDir = new URL("../frontend/public", import.meta.url).pathname;

//middleware
app.use(cors());
app.use(express.json());
app.use(express.static(publicDir)); // serve static files

app.use("/api/v1/messages", messageRouter);

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    server.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
    );
  } catch (err) {
    console.err(err);
  }
};

start();
