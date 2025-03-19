import express from "express";
import {
  getAllMessages,
  deleteMessage,
  updateMessage,
} from "../controllers/messages.js";

const messageRouter = express.Router();

messageRouter.get("/", getAllMessages);
messageRouter.patch("/:id", deleteMessage);
messageRouter.put('/:id', updateMessage)
export { messageRouter };
