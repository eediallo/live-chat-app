import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./db/db.js";
import { messageRouter } from "./routes/messages.js";
import { WebSocketServer } from "ws";
import http from "http";
dotenv.config();
import { handleIncomingMessages } from "./handlers/handleIncomingMessages.js";
import { reactionRouter } from "./routes/reaction.js";

const app = express();
const server = http.createServer(app);

const wss = new WebSocketServer({ server });

// wss connection event
wss.on("connection", (ws) => {
  console.log("New client connected");

  // handle messages from clients
  ws.on("message", async (message) => {
    const newMessage = await handleIncomingMessages(message);
    if (newMessage) {
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(newMessage));
        }
      });
    }
  });

  // Handle client disconnection
  ws.on("close", () => {
    console.log("Client disconnected");
  });
});

wss.on("error", (error) => {
  console.error("WebSocket error:", error);
});

const port = process.env.PORT || 3000;

const publicDir = new URL("../frontend/public", import.meta.url).pathname;

//middleware
app.use(cors());
app.use(express.json());
app.use(express.static(publicDir)); // serve static files

app.use("/api/v1/messages", messageRouter);
app.use("/api/v1/reactions", reactionRouter);

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
