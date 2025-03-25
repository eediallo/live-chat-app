import express from "express";
import {
  deleteMessage,
  updateMessage,
  getMessage,
  createMessage,
  getAllMessages,
  getAllMessagesForAllUsers,
} from "../controllers/messages.js";
import { authenticateUser } from "../middleware/auth.js";

const messageRouter = express.Router();

messageRouter.get("/all", getAllMessagesForAllUsers);
messageRouter.get("/", authenticateUser, getAllMessages);
messageRouter.post("/", authenticateUser, createMessage);
messageRouter.get("/:id", authenticateUser, getMessage);
messageRouter.patch("/:id", authenticateUser, updateMessage);
messageRouter.delete("/:id", authenticateUser, deleteMessage);
export { messageRouter };
