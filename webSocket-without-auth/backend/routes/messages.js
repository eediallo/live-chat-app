import express from "express";
import {
  createUserAndSendMessage,
  getAllMessages,
  getAllMessagesForAllUsers,
} from "../controllers/messages.js";

const messageRouter = express.Router();

messageRouter.get("/all", getAllMessagesForAllUsers);
messageRouter.get("/", getAllMessages);
messageRouter.post("/", createUserAndSendMessage);
export { messageRouter };
