import express from "express";
import {
  getAllMessages,
  deleteMessage,
  sendMessage,
  updateMessage,
} from "../controllers/message.js";

const messageRouter = express.Router();

messageRouter.get("/", getAllMessages);
messageRouter.post("/send-message", sendMessage);
messageRouter.patch("/:id", deleteMessage);
messageRouter.put('/:id', updateMessage)
export { messageRouter };
