import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./db/db.js";
import { messageRouter } from "./routes/messages.js";
import { authRouter } from "./routes/auth.js";
import WebSocket, { WebSocketServer } from "ws";
import http from "http";
dotenv.config();
import { notFound } from "./middleware/notFound.js";
import { errorHandlerMiddleware } from "./middleware/errorHandler.js";
import { reactionRouter } from "./routes/reaction.js";
import { handleClientMessage } from "./handlers/handleClientMessage.js";
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUiExpress from "swagger-ui-express";
import { StatusCodes } from "http-status-codes";
const app = express();
const server = http.createServer(app);

const wss = new WebSocketServer({ server, clientTracking: true });
const userConnection = new Map();
const clients = new Set();

function decodeToken(token) {
  const payloadBase64 = token.split(".")[1];
  const decodedPayload = atob(payloadBase64);
  return JSON.parse(decodedPayload);
}

//middleware
app.use(cors()); // use cors
app.use(express.json()); //parse json

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Live Chat Application",
      version: "1.0.0",
      description:
        "Thi app allows users to chat from any place at any time without interruption.",
    },
    servers: [
      {
        url: "https://eediallo-chat-server-auth.hosting.codeyourfuture.io/api/v1",
      },
    ],
  },
  apis: ["./collection.yml"], // Path to the API docs
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

app.use(
  "/api-docs",
  swaggerUiExpress.serve,
  swaggerUiExpress.setup(swaggerSpec)
);

// wss connection event
wss.on("connection", async (ws, req) => {
  console.log("New client connected");

  clients.add(ws);
  broadcastNumberOfClients();

  const token = req.url.split("=")[1];
  const userInfo = decodeToken(token);
  const { id, name } = userInfo;
  try {
    userConnection.set(ws, { userId: id, username: name });

    // Notify all previously connected clients about the new connection with the user's name
    const joinMessage = JSON.stringify({
      type: "join",
      message: `${name} has joined the chat!`,
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
    const newMessage = await handleClientMessage(message, ws, userConnection);
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
    clients.delete(ws);
    broadcastNumberOfClients();
  });
});

wss.on("error", (error) => {
  console.error("WebSocket error:", error);
  broadcastNumberOfClients();
});

function broadcastNumberOfClients() {
  const numberOfClients = clients.size;
  console.log("Number of connected users:", numberOfClients);

  // broadcast number of connected users to all connected users.
  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(
        JSON.stringify({ type: "user_count", count: numberOfClients })
      );
    }
  });
}

const port = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res
    .status(StatusCodes.OK)
    .send(
      '<h1>Live Chat application</h1><a href="/api-docs">Access Documentation here</a>'
    );
});

app.use("/api/v1/messages", messageRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/reactions", reactionRouter);

app.use(notFound);
app.use(errorHandlerMiddleware);

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

export default app
