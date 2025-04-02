import { StatusCodes } from "http-status-codes";
import { Like } from "../models/like.js";

export const likeMessage = async (req, res) => {
  const { messageId } = req.params;
  console.log(messageId);
  const { userId } = req.body;
  console.log(userId);
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

export const DislikeMessage = async (req, res) => {
  const { messageId } = req.params;
  const { userId } = req.body;
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
