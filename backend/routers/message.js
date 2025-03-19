import express from "express";
import { getAllMessages, sendMessage } from "../controllers/message.js";

const messageRouter = express.Router();

messageRouter.get("/", getAllMessages);
messageRouter.post("/send-message", sendMessage);

export { messageRouter };
