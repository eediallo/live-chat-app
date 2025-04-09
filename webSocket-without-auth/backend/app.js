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
import { User } from "./models/user.js";
import { notFound } from "./middleware/notFound.js";

const app = express();
const server = http.createServer(app);

const wss = new WebSocketServer({ server, clientTracking: true });
const userConnection = new Map();

// wss connection event
wss.on("connection", async (ws, req) => {
  const origin = req.headers.origin;
  if (
    origin !==
    "https://eediallo-live-chat-server-frontend.hosting.codeyourfuture.io/"
  ) {
    ws.close();
  }
  console.log("New client connected");
  const username = req.url.split("=")[1];

  try {
    let user = await User.findOne({ username });
    if (!user) {
      // save to db if user does not exist
      user = await User.create({ username });
    }

    userConnection.set(ws, { userId: user._id, username });

    // Notify all previously connected clients about the new connection with the user's name
    const joinMessage = JSON.stringify({
      type: "join",
      message: `${username} has joined the chat!`,
    });
    wss.clients.forEach((client) => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(joinMessage);
      }
    });
  } catch (e) {
    console.error("could not find user", e);
  }
  // handle messages from clients
  ws.on("message", async (message) => {
    const newMessage = await handleIncomingMessages(
      message,
      ws,
      userConnection
    );
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
    userConnection.delete(ws);
  });
});

wss.on("error", (error) => {
  console.error("WebSocket error:", error);
});

const port = process.env.PORT || 3000;

// const publicDir = new URL("../frontend/public", import.meta.url).pathname;

//middleware
app.use(cors());
app.use(express.json());

app.get("/", (req, resp) => {
  resp.send(` <h1>Live Chat App</h1>
    <a href="./api/v1/messages/all">Get All messages</a><br>
    <a href="./api/v1/reactions">Get All reactions</a><br>`);
});

app.use("/api/v1/messages", messageRouter);
app.use("/api/v1/reactions", reactionRouter);
app.use(notFound);

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    server.listen(3000, () =>
      console.log(`Server is listening on port ${port}...`)
    );
  } catch (err) {
    console.err(err);
  }
};

start();
