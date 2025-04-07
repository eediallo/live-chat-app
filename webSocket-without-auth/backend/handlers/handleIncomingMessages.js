import { Like } from "../models/like.js";
import { Dislike } from "../models/dislike.js";
import { User } from "../models/user.js";
import { Message } from "../models/message.js";

export const saveMsgToDb = async (message) => {
  const { sender, text, createdAt } = message;
  const username = sender.username;

  if (!username || !text) {
    console.error("Username and text message must be provided");
    return;
  }
  try {
    let existingUser = await User.findOne({ username: username });
    if (!existingUser) {
      existingUser = await User.create({ username: username });
    }

    const newMessage = await Message.create({
      sender: {
        id: existingUser._id,
        username: username,
      },
      text,
      createdAt,
    });

    return newMessage;
  } catch (e) {
    console.log(e);
    return null;
  }
};

export const saveLikeToDb = async (likeData, userId) => {
  const { messageId } = likeData;
  try {
    // Check if the user already reacted (either liked or disliked)
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

    // Populate the user details (id and username)
    const populatedLike = await Like.findById(like._id).populate(
      "userId",
      "_id username"
    );
    console.log(populatedLike, "populated like");

    return populatedLike;
  } catch (e) {
    console.error("Error liking message", e);
    return null;
  }
};

export const saveDislikeToDb = async (dislikeData, userId) => {
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

    // Populate the user details (id and username)
    const populatedDislike = await Like.findById(dislike._id).populate(
      "userId",
      "_id username"
    );
    return populatedDislike;
  } catch (e) {
    console.error("Error liking message", e);
    return null;
  }
};

export const getMessageReactionCounts = async (messageId) => {
  try {
    const [likes, dislikes] = await Promise.all([
      Like.countDocuments({ messageId }),
      Dislike.countDocuments({ messageId }),
    ]);
    return { likes, dislikes };
  } catch (err) {
    console.error("Failed to get reaction counts");
    return null;
  }
};

export const handleIncomingMessages = async (message, ws, userConnection) => {
  const dataString = message.toString();
  try {
    const data = JSON.parse(dataString);
    console.log("received from the client: ", data);
    const { messageId } = data;
    const userInfo = userConnection.get(ws); // get user info from ws
    const userId = userInfo?.userId;
    switch (data.type) {
      case "like":
        const { _doc: like } = await saveLikeToDb(data, userId);
        console.log(like, "====like info");
        const likesCounts = await getMessageReactionCounts(messageId);
        return { ...like, type: "like", ...likesCounts };
      case "dislike":
        const { _doc: dislike } = await saveDislikeToDb(data, userId);
        const dislikesCounts = await getMessageReactionCounts(messageId);
        return { ...dislike, type: "dislike", ...dislikesCounts };

      default:
        const { _doc: message } = await saveMsgToDb(data);
        return { ...message, type: "message" };
    }
  } catch (error) {
    console.error("Error parsing message", error);
    return null;
  }
};
