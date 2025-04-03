import express from "express";
import {
  getLikesAndDislikes,
  likeMessage,
  dislikeMessage,
} from "../controllers/reaction.js";

const reactionRouter = express.Router();

reactionRouter.post("/:messageId/:userId/like", likeMessage);
reactionRouter.post("/:messageId/:userId/dislike", dislikeMessage);
reactionRouter.get("/:messageId", getLikesAndDislikes);

export { reactionRouter };
