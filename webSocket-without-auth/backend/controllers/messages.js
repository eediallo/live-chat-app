import { StatusCodes } from "http-status-codes";
import { Message } from "../models/message.js";
import { User } from "../models/user.js";

// Get all messages for all users
export const getAllMessagesForAllUsers = async (req, res) => {
  const { since } = req.query;
  let query = {};

  if (since) {
    const sinceDate = new Date(since);
    if (!isNaN(sinceDate)) {
      query.createdAt = { $gte: sinceDate };
    }
  }

  try {
    const messages = await Message.find(query).sort("createdAt");
    if (messages.length === 0) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ msg: "No messages found" });
    }

    res.status(StatusCodes.OK).json({ messages });
  } catch (error) {
    console.error(error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ msg: "Failed to fetch messages" });
  }
};

// Create a new message
export const createUserAndSendMessage = async (req, res) => {
  const { username, text } = req.body;

  if (!username || !text) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: "Name and message are required" });
  }

  try {
    const newUser = await User.create({ username });

    const message = await Message.create({
      sender: {
        id: newUser._id,
        username: newUser.username,
      },
      text,
    });

    res.status(StatusCodes.CREATED).json(message);
  } catch (error) {
    console.error(error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ msg: "Failed to create message" });
  }
};

// Get all messages for a specific user
export const getAllMessages = async (req, res) => {
  const { name } = req.query;

  if (!name) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: "Name is required" });
  }

  try {
    const messages = await Message.find({ name }).sort("createdAt");
    if (messages.length === 0) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ msg: "No messages found for this user" });
    }

    res.status(StatusCodes.OK).json({ messages });
  } catch (error) {
    console.error(error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ msg: "Failed to fetch messages" });
  }
};
