import { Like } from "../models/like.js";
import { Dislike } from "../models/dislike.js";
import { User } from "../models/user.js";
import { Message } from "../models/message.js";

const saveMessageToDb = async (data) => {
  const { sender, text, createdAt } = data;
  const username = sender.name;

  if (!username || !text) {
    console.error("Username and text message must be provided");
    return;
  }
  try {
    let existingUser = await User.findOne({ name: username });
    if (!existingUser) {
      existingUser = await User.create({ username: username });
    }

    const newMessage = await Message.create({
      sender: {
        id: existingUser._id,
        name: username,
      },
      message: text,
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

const saveReactionToDb = async (
  reactionData,
  userId,
  ReactionModel,
  OppositeReactionModel,
  reactionType
) => {
  const { messageId } = reactionData;
  try {
    // Check if the user already reacted (either liked or disliked)
    const existingReaction = await ReactionModel.findOne({ messageId, userId });
    const existingOppositeReaction = await OppositeReactionModel.findOne({
      messageId,
      userId,
    });

    if (existingReaction) {
      // If the user has already reacted, undo the reaction
      await ReactionModel.deleteOne({ messageId, userId });
      return { message: `${reactionType} undone successfully.` };
    }

    if (existingOppositeReaction) {
      // If the user has already reacted oppositely, remove the opposite reaction first
      await OppositeReactionModel.deleteOne({ messageId, userId });
    }

    const reaction = await ReactionModel.create({ messageId, userId });

    // Populate the user details (id and username)
    const populatedReaction = await ReactionModel.findById(
      reaction._id
    ).populate("userId", "_id name");
    return populatedReaction;
  } catch (e) {
    console.error(`Error ${reactionType}ing message`, e);
    return { error: `An error occurred while ${reactionType}ing the message.` };
  }
};

// Wrapper functions for like and dislike
const saveLikeToDb = (likeData, userId) =>
  saveReactionToDb(likeData, userId, Like, Dislike, "like");

const saveDislikeToDb = (dislikeData, userId) =>
  saveReactionToDb(dislikeData, userId, Dislike, Like, "dislike");

const getMessageReactionCounts = async (messageId) => {
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

const deleteMessage = async (messageId, userId) => {
  try {
    // Find the message to ensure it exists and was sent by the user
    const message = await Message.findById(messageId);

    if (!message) {
      return { error: "Message not found." };
    }

    if (message.sender.id.toString() !== userId) {
      return { error: "You can only delete messages you have sent." };
    }

    // Delete the message
    await Message.deleteOne({ _id: messageId });

    return { deletedMessage: message };
  } catch (error) {
    console.error("Error deleting message", error);
    return { error: "An error occurred while deleting the message." };
  }
};

const editMessage = async (messageId, userId, newText) => {
  try {
    // Find the message to ensure it exists and was sent by the user
    const message = await Message.findById(messageId);

    if (!message) {
      return { error: "Message not found." };
    }

    if (message.sender.id.toString() !== userId) {
      return { error: "You can only edit messages you have sent." };
    }

    // Update the message text
    message.message = newText;
    await message.save();

    return { updatedMessage: message };
  } catch (error) {
    console.error("Error editing message", error);
    return { error: "An error occurred while editing the message." };
  }
};

export const handleClientMessage = async (message, ws, userConnection) => {
  const dataString = message.toString();

  try {
    const data = JSON.parse(dataString);
    const { messageId, newText, type } = data;
    const userInfo = userConnection.get(ws); // Retrieve user info from WebSocket
    const userId = userInfo?.userId;

    let result;

    switch (type) {
      case "like":
        result = await saveLikeToDb(data, userId);
        if (result.error) {
          sendErrorResponse(ws, result);
          return;
        }
        const likeCounts = await getMessageReactionCounts(messageId);
        return { ...result._doc, type: "like", ...likeCounts };

      case "dislike":
        result = await saveDislikeToDb(data, userId);
        if (result.error) {
          sendErrorResponse(ws, result);
          return;
        }
        const dislikeCounts = await getMessageReactionCounts(messageId);
        return { ...result._doc, type: "dislike", ...dislikeCounts };

      case "delete":
        result = await deleteMessage(messageId, userId);
        if (result.error) {
          sendErrorResponse(ws, result);
          return;
        }
        return { ...result.deletedMessage._doc, type: "delete" };
        break;

      case "edit":
        result = await editMessage(messageId, userId, newText);
        if (result.error) {
          sendErrorResponse(ws, result);
          return;
        }
        return { ...result.updatedMessage._doc, type: "edit" };

      default:
        const savedMessage = await saveMessageToDb(data);
        return {
          ...savedMessage._doc,
          type: "message",
          likedBy: [],
          dislikedBy: [],
        };
    }
  } catch (error) {
    console.error("Error handling client message", error);
    ws.send(
      JSON.stringify({
        type: "error",
        message: "An unexpected error occurred.",
      })
    );
  }
};

function sendErrorResponse(ws, result) {
  ws.send(JSON.stringify({ type: "error", message: result.error }));
}
