import express from "express";
import { getLikesAndDislikes } from "../controllers/reaction.js";

const reactionRouter = express.Router();

reactionRouter.get("/:messageId", getLikesAndDislikes);

export { reactionRouter };
