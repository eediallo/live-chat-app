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
      '<h1>Welcome to our live chat application</h1><a href="/api/messages">Go to messages</a>'
    );
});

app.get("/api/messages", (req, res) => {
  res.status(200).json({ msg: "Messages here" });
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
