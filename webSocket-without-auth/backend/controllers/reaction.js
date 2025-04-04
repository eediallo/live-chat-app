import { StatusCodes } from "http-status-codes";
import { Like } from "../models/like.js";
import { Dislike } from "../models/dislike.js";

export const saveLike = async (likeData, userId) => {
  const { messageId } = likeData;
  try {
    //check if the user already reacted (either liked or disliked)
    const existingLike = await Like.findOne({ messageId, userId });
    const existingDislike = await Dislike.findOne({ messageId, userId });

    if (existingLike) {
      console.error("You have already liked this message.");
      return;
    }

    if (existingDislike) {
      // If the user has already disliked the message, remove the dislike first
      await Dislike.deleteOne({ messageId, userId });
    }

    const like = await Like.create({ messageId, userId });
    return like;
  } catch (e) {
    console.error("Error liking message", e);
    return null;
  }
};

export const getLikesDislikeCounts = async (messageId) => {
  try {
    const [likes, dislikes] = await Promise.all([
      Like.countDocuments({ messageId }),
      Dislike.countDocuments({ messageId }),
    ]);
    return { likes, dislikes };
  } catch (err) {
    console.error("Failed to get likes and dislikes counts");
    return null;
  }
};

export const saveDislike = async (dislikeData, userId) => {
  const { messageId } = dislikeData;
  try {
    //check if the user already reacted (either liked or disliked)
    const existingLike = await Like.findOne({ messageId, userId });
    const existingDislike = await Dislike.findOne({ messageId, userId });

    if (existingDislike) {
      console.error("You have already disliked this message.");
      return;
    }

    if (existingLike) {
      // If the user has already disliked the message, remove the dislike first
      await Like.deleteOne({ messageId, userId });
    }

    const dislike = await Dislike.create({ messageId, userId: userId });
    return dislike;
  } catch (e) {
    console.error("Error liking message", e);
    return null;
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
