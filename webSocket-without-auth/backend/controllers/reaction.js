import { StatusCodes } from "http-status-codes";
import { Like } from "../models/like.js";
import { Dislike } from "../models/dislike.js";
import { User } from "../models/user.js";
export const saveLike = async (likeData) => {
  const { messageId, sender } = likeData;
  const username = sender.username; // Use username from sender

  try {
    // Find the user by username
    const user = await User.findOne({ username: username }); // Find by username

    if (!user) {
      console.error("User not found");
      return null;
    }

    const like = await Like.create({ messageId, userId: user._id });
    return like;
  } catch (error) {
    console.error("Error saving like", error);
    return null;
  }
};

export const saveDislike = async (dislikeData) => {
  const { messageId, sender } = dislikeData;
  const username = sender.username;

  try {
    // Find the user by username
    const user = await User.findOne({ username: username });

    if (!user) {
      console.error("User not found");
      return null;
    }

    const dislike = await Dislike.create({ messageId, userId: user._id });
    return dislike;
  } catch (error) {
    console.error("Error saving dislike", error);
    return null;
  }
};
// export const likeMessage = async (req, res) => {
//   const { messageId } = req.params;
//   console.log(messageId);
//   const { userId } = req.body;
//   console.log(userId);
//   if (!messageId || !userId) {
//     console.log("messageId and usernameId must be provided");
//     return;
//   }

//   try {
//     const like = await Like.create({ messageId, userId });
//     res
//       .status(StatusCodes.CREATED)
//       .json({ msg: `message ${messageId} liked`, like });
//   } catch (e) {
//     console.log(e);
//     res
//       .status(StatusCodes.INTERNAL_SERVER_ERROR)
//       .json({ msg: "Failed to like message" });
//   }
// };

// export const dislikeMessage = async (req, res) => {
//   const { messageId } = req.params;
//   const { userId } = req.body;
//   if (!messageId || !userId) {
//     console.log("messageId and usernameId must be provided");
//     return;
//   }

//   try {
//     const like = await Dislike.create({ messageId, userId });
//     res
//       .status(StatusCodes.CREATED)
//       .json({ msg: `message ${messageId} liked`, like });
//   } catch (e) {
//     console.log(e);
//     res
//       .status(StatusCodes.INTERNAL_SERVER_ERROR)
//       .json({ msg: "Failed to like message" });
//   }
// };

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
