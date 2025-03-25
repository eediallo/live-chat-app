import express from "express";
import {
  deleteMessage,
  updateMessage,
  getMessage,
  createMessage,
  getAllMessages,
} from "../controllers/messages.js";

const messageRouter = express.Router();

messageRouter.get("/", getAllMessages);
messageRouter.post("/", createMessage);
messageRouter.get("/:id", getMessage);
messageRouter.patch("/:id", updateMessage);
messageRouter.delete("/:id", deleteMessage);
export { messageRouter };
