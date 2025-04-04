import express from "express";
import { getMessageReactionCounts } from "../controllers/reaction.js";

const reactionRouter = express.Router();

reactionRouter.get("/:messageId", getMessageReactionCounts);

export { reactionRouter };
