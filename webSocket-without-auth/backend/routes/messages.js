import express from "express";
import { getAllMessagesForAllUsers } from "../controllers/messages.js";

const messageRouter = express.Router();

messageRouter.get("/all", getAllMessagesForAllUsers);
export { messageRouter };
