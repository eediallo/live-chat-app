import { StatusCodes } from "http-status-codes";
import { Like } from "../models/like.js";
import { Dislike } from "../models/dislike.js";

export const getMessageReactionCounts = async (req, res) => {
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

export const getMessageLikes = async (req, res) => {
  try {
    const likes = await Like.find({});
    if (likes) {
      res
        .status(StatusCodes.NOT_FOUND)
        .json({ msg: "No likes found for this message" });
    }
    res.status(StatusCodes.OK).json({ likes });
  } catch (e) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ msg: "Something went wrong. Please try again later" });
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
