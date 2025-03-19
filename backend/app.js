import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./db/db.js";
dotenv.config();

const app = express();

const port = process.env.PORT || 3000;

//middleware
app.use(express.json());

//routes

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
