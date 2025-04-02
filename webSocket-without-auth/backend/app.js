import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./db/db.js";
import { messageRouter } from "./routes/messages.js";
import { WebSocketServer } from "ws";
import http from "http";
import { User } from "./models/user.js";
import { Message } from "./models/message.js";
dotenv.config();

const app = express();
const server = http.createServer(app);

const wss = new WebSocketServer({ server });

const saveMsgFromWebsocketToDb = async (message) => {
  const { sender, text, createdAt } = message;
  const username = sender.username;

  if (!username || !text) {
    console.error("Username and text message must be provided");
    return;
  }
  try {
    let existingUser = await User.findOne({ username: username });
    if (!existingUser) {
      existingUser = await User.create({ username: username });
    }

    const newMessage = await Message.create({
      sender: {
        id: existingUser._id,
        username: username,
      },
      text,
      createdAt,
    });

    return newMessage;
  } catch (e) {
    console.log(e);
    return null;
  }
};

// wss connection event
wss.on("connection", (ws) => {
  console.log("New client connected");

  // handle messages from clients
  ws.on("message", async (message) => {
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
  });

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
