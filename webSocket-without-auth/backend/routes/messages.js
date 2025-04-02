import express from "express";
import {
  getAllMessages,
  getAllMessagesForAllUsers,
} from "../controllers/messages.js";

const messageRouter = express.Router();

messageRouter.get("/all", getAllMessagesForAllUsers);
messageRouter.get("/", getAllMessages);
export { messageRouter };
