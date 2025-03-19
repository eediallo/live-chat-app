import express from "express";
import {
  getAllMessages,
  deleteMessage,
  sendMessage,
} from "../controllers/message.js";

const messageRouter = express.Router();

messageRouter.get("/", getAllMessages);
messageRouter.post("/send-message", sendMessage);
messageRouter.patch("/:id", deleteMessage);
export { messageRouter };
