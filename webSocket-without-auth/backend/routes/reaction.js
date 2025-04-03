import express from "express";
import {
  likeMessage,
  dislikeMessage,
  getLikesAndDislikes,
} from "../controllers/reaction.js";

const reactionRouter = express.Router();

reactionRouter.post("/:messageId/like", likeMessage);
reactionRouter.post("/:messageId/dislike", dislikeMessage);
reactionRouter.get("/:messageId/reactions", getLikesAndDislikes);

export { reactionRouter };
