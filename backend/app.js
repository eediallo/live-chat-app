import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./db/db.js";
import { messageRouter } from "./routes/message.js";
dotenv.config();

const app = express();

const port = process.env.PORT || 3000;

const publicDir = new URL("../frontend/public", import.meta.url).pathname;

app.use(express.json()); //parse json
//middleware
app.use(express.static(publicDir)); // serve static files

app.use("/api/v1/messages", messageRouter);

//routes
app.get("/", (req, res) => {
  res
    .status(200)
    .send(
      '<h1>Welcome to our live chat application</h1><a href="/api/v1/messages">Go to messages</a>'
    );
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
