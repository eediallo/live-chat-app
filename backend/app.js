import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./db/db.js";
dotenv.config();

const app = express();

const port = process.env.PORT || 3000;

//middleware
app.use(express.json());

//routes
app.get("/", (req, res) => {
  res
    .status(200)
    .send(
      '<h1>Welcome to our live chat application</h1><a href="/api/v1/messages">Go to messages</a>'
    );
});

// get all messages
app.get("/api/v1/messages", (req, res) => {
  res.status(200).json({ msg: "Messages here" });
});

//send a message
app.post("/api/v1/messages/send-message", (req, res) => {
  res.status(201).json(req.body);
});

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
    );
  } catch (err) {
    console.err(err);
  }
};

start();
