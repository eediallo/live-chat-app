import { StatusCodes } from "http-status-codes";
import { Message } from "../models/message.js";

export const getAllMessagesForAllUsers = async (req, res) => {
  const { page, limit = 5 } = req.query;

  try {
    const totalMessages = await Message.countDocuments();
    const numOfPages = Math.ceil(totalMessages / Number(limit));

    // If no page is provided, default to the last page
    const currentPage = page ? Number(page) : numOfPages;
    const skip = (currentPage - 1) * Number(limit);

    const messages = await Message.find()
      .sort("createdAt")
      .skip(skip)
      .limit(Number(limit));

    res.status(StatusCodes.OK).json({ messages, totalMessages, numOfPages });
  } catch (error) {
    console.error(error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ msg: "Failed to fetch messages" });
  }
};
