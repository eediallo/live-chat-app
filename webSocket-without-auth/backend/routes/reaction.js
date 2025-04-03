import express from "express";
import {
  saveDislike,
  saveLike,
  getLikesAndDislikes,
} from "../controllers/reaction.js";

const reactionRouter = express.Router();

reactionRouter.post("/:messageId/like", saveLike);
reactionRouter.post("/:messageId/dislike", saveLike);
reactionRouter.get("/:messageId/reactions", getLikesAndDislikes);

export { reactionRouter };
