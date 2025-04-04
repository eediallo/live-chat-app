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
