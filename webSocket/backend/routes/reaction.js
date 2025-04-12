import { getMessageReactionCounts } from "../controllers/reaction.js";
import express from "express";

const reactionRouter = express.Router();

reactionRouter.get("/:id", getMessageReactionCounts);

export { reactionRouter };
