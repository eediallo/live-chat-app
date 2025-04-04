import { StatusCodes } from "http-status-codes";
import { Like } from "../models/like.js";
import { Dislike } from "../models/dislike.js";

export const getLikesAndDislikes = async (req, res) => {
  try {
    const likes = await Like.countDocuments({
      messageId: req.params.messageId,
    });

    const dislikes = await Dislike.countDocuments({
      messageId: req.params.messageId,
    });

    res.status(StatusCodes.OK).json({ likes, dislikes });
  } catch (e) {
    console.error(e);
  }
};
