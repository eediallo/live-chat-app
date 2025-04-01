import { StatusCodes } from "http-status-codes";
import { Message } from "../models/message.js";

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
export const createMessage = async (req, res) => {
  const { sender, text } = req.body;

  if (!sender || !text) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: "Name and message are required" });
  }

  try {
    const message = await Message.create({
      sender,
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

// Get a specific message
export const getMessage = async (req, res) => {
  const { id: msgID } = req.params;

  try {
    const message = await Message.findById(msgID);
    if (!message) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ msg: `No message with Id ${msgID} found` });
    }

    res.status(StatusCodes.OK).json({ message });
  } catch (error) {
    console.error(error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ msg: "Failed to fetch message" });
  }
};

// Delete a message
export const deleteMessage = async (req, res) => {
  const { id: msgID } = req.params;

  try {
    const message = await Message.findByIdAndDelete(msgID);
    if (!message) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ msg: `No message with Id ${msgID} found` });
    }

    res.status(StatusCodes.OK).json({ msg: "Message deleted successfully" });
  } catch (error) {
    console.error(error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ msg: "Failed to delete message" });
  }
};

// Update a message
export const updateMessage = async (req, res) => {
  const { message } = req.body;
  const { id: msgID } = req.params;

  try {
    const updatedMessage = await Message.findByIdAndUpdate(
      msgID,
      { message },
      { new: true }
    );

    if (!updatedMessage) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ msg: `No message with Id ${msgID} found` });
    }

    res
      .status(StatusCodes.OK)
      .json({ msg: "Message updated successfully", message: updatedMessage });
  } catch (error) {
    console.error(error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ msg: "Failed to update message" });
  }
};
