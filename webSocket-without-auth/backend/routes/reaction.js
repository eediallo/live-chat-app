import express from "express";
import { likeMessage, DislikeMessage } from "../controllers/reaction.js";

const reactionRouter = express.Router();

reactionRouter.post("/:messageId/like", likeMessage);
reactionRouter.post("/:messageId/dislike", DislikeMessage);

export { reactionRouter };
