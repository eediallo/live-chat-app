import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./db/db.js";
import { messageRouter } from "./routes/messages.js";
import { sendMessage } from "./controllers/sendMessage.js";
dotenv.config();

const app = express();

const port = process.env.PORT || 3000;

const publicDir = new URL("../frontend/public", import.meta.url).pathname;

app.use(express.json()); //parse json
//middleware
app.use(express.static(publicDir)); // serve static files

app.post("/", sendMessage);
app.use("/api/v1/messages", messageRouter);

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
