import express from "express";
import {
  getAllMessages,
  deleteMessage,
  updateMessage,
  getMessage,
  createMessage,
} from "../controllers/messages.js";

const messageRouter = express.Router();

messageRouter.get("/", getAllMessages);
messageRouter.post("/", createMessage);
messageRouter.get("/:id", getMessage);
messageRouter.patch("/:id", updateMessage);
messageRouter.delete("/:id", deleteMessage);
export { messageRouter };
