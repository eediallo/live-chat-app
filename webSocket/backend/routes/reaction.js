import {
  getAllReactions,
  getMessageReactionCounts,
} from "../controllers/reaction.js";
import express from "express";

const reactionRouter = express.Router();

reactionRouter.get("/", getAllReactions);
reactionRouter.get("/:messageId", getMessageReactionCounts);

export { reactionRouter };
