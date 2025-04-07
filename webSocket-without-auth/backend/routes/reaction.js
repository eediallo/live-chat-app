import express from "express";
import {
  getMessageReactionCounts,
  getMessageLikes,
  getAllReactions,
} from "../controllers/reaction.js";

const reactionRouter = express.Router();

reactionRouter.get("/", getAllReactions);
reactionRouter.get("/:messageId", getMessageReactionCounts);
reactionRouter.get("/:messageId", getMessageLikes);

export { reactionRouter };
