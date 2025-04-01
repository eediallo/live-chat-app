import express from "express";
import {
  createMessage,
  getAllMessages,
  getAllMessagesForAllUsers,
} from "../controllers/messages.js";

const messageRouter = express.Router();

messageRouter.get("/all", getAllMessagesForAllUsers);
messageRouter.get("/", getAllMessages);
messageRouter.post("/", createMessage);
export { messageRouter };
