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
    if (e.code === 11000) {
      throw new Error(
        "Duplicate entry detected: You have already liked this message"
      );
    }
    console.error(e);
    throw new Error(
      "An error occurred while saving the message to the database"
    );
  }
};

export const saveLikeToDb = async (likeData, userId) => {
  const { messageId } = likeData;
  try {
    // Check if the user already reacted (either liked or disliked)
    const existingLike = await Like.findOne({ messageId, userId });
    const existingDislike = await Dislike.findOne({ messageId, userId });

    if (existingLike) {
      throw new Error("You have already liked this message.");
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
    return populatedLike;
  } catch (e) {
    if (e.message === "You have already liked this message.") {
      return { error: e.message };
    }
    console.error("Error liking message", e);
    return { error: "An error occurred while liking the message." };
  }
};

export const saveDislikeToDb = async (dislikeData, userId) => {
  const { messageId } = dislikeData;
  try {
    // Check if the user already reacted (either liked or disliked)
    const existingLike = await Like.findOne({ messageId, userId });
    const existingDislike = await Dislike.findOne({ messageId, userId });

    if (existingDislike) {
      throw new Error("You have already disliked this message.");
    }

    if (existingLike) {
      // If the user has already liked the message, remove the like first
      await Like.deleteOne({ messageId, userId });
    }

    const dislike = await Dislike.create({ messageId, userId });

    // Populate the user details (id and username)
    const populatedDislike = await Dislike.findById(dislike._id).populate(
      "userId",
      "_id username"
    );
    return populatedDislike;
  } catch (e) {
    if (e.message === "You have already disliked this message.") {
      return { error: e.message };
    }
    console.error("Error disliking message", e);
    return { error: "An error occurred while disliking the message." };
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
    let result;

    switch (data.type) {
      case "like":
        result = await saveLikeToDb(data, userId);
        if (result.error) {
          // Send the error message only to the concerned user
          ws.send(JSON.stringify({ type: "error", message: result.error }));
          return;
        }
        const likesCounts = await getMessageReactionCounts(messageId);
        return { ...result._doc, type: "like", ...likesCounts };
      case "dislike":
        result = await saveDislikeToDb(data, userId);
        if (result.error) {
          // Send the error message only to the concerned user
          ws.send(JSON.stringify({ type: "error", message: result.error }));
          return;
        }
        const dislikesCounts = await getMessageReactionCounts(messageId);
        return { ...result._doc, type: "dislike", ...dislikesCounts };

      default:
        const { _doc: message } = await saveMsgToDb(data);
        return { ...message, type: "message" };
    }
  } catch (error) {
    console.error("Error parsing message", error);
    // Send a generic error message only to the concerned user
    ws.send(
      JSON.stringify({
        type: "error",
        message: "An unexpected error occurred.",
      })
    );
  }
};
