import { StatusCodes } from "http-status-codes";
import { Message } from "../models/message.js";

// Get all messages for all users
export const getAllMessagesForAllUsers = async (req, res) => {
  const { since, page, limit = 5 } = req.query;

  const query = since ? { createdAt: { $gte: new Date(since) } } : {};

  try {
    const totalMessages = await Message.countDocuments(query);
    const numOfPages = Math.ceil(totalMessages / Number(limit));

    // If no page is provided, default to the last page
    const currentPage = page ? Number(page) : numOfPages;
    const skip = (currentPage - 1) * Number(limit);

    const messages = await Message.find(query)
      .sort("createdAt")
      .skip(skip)
      .limit(Number(limit));

    if (messages.length === 0) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ msg: "No messages found" });
    }

    res.status(StatusCodes.OK).json({ messages, totalMessages, numOfPages });
  } catch (error) {
    console.error(error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ msg: "Failed to fetch messages" });
  }
};
