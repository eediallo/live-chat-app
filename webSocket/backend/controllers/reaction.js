import { Like } from "../models/like.js";
import { Dislike } from "../models/dislike.js";
import { StatusCodes } from "http-status-codes";

export const getMessageReactionCounts = async (req, res) => {
  const { messageId } = req.params;
  try {
    const [likes, dislikes, likesCount, dislikesCount] = await Promise.all([
      Like.find({ messageId }),
      Dislike.find({ messageId }),

      Like.countDocuments({
        messageId,
      }),
      Dislike.countDocuments({
        messageId,
      }),
    ]);

    const likedBy = likes.map((l) => l.userId);
    const dislikedBy = dislikes.map((d) => d.userId);

    res
      .status(StatusCodes.OK)
      .json({ likesCount, dislikesCount, likedBy, dislikedBy });
  } catch (e) {
    console.error(e);
  }
};

export const getAllReactions = async (req, res) => {
  try {
    const [likes, dislikes] = await Promise.all([
      Like.find({}),
      Dislike.find({}),
    ]);
    if (likes.length === 0 && dislikes.length === 0) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ msg: "No likes / dislikes found" });
    }
    res.status(StatusCodes.OK).json({ likes, dislikes });
  } catch (e) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ msg: "Something went wrong. Please try again later" });
  }
};
