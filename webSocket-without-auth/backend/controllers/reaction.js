import { StatusCodes } from "http-status-codes";
import { Like } from "../models/like.js";
import { Dislike } from "../models/dislike.js";

export const likeMessage = async (req, res) => {
  const { messageId, userId } = req.params;

  console.log(messageId, userId);

  if (!messageId || !userId) {
    console.log("messageId and usernameId must be provided");
    return;
  }

  try {
    const like = await Like.create({ messageId, userId });
    res
      .status(StatusCodes.CREATED)
      .json({ msg: `message ${messageId} liked`, like });
  } catch (e) {
    console.log(e);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ msg: "Failed to like message" });
  }
};

export const dislikeMessage = async (req, res) => {
  const { messageId, userId } = req.params;
  console.log(messageId, userId);
  if (!messageId || !userId) {
    console.log("messageId and usernameId must be provided");
    return;
  }

  try {
    const like = await Dislike.create({ messageId, userId });
    res
      .status(StatusCodes.CREATED)
      .json({ msg: `message ${messageId} liked`, like });
  } catch (e) {
    console.log(e);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ msg: "Failed to like message" });
  }
};

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
