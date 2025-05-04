import { StatusCodes } from "http-status-codes";
import { Message } from "../models/message.js";
import { asyncWrapper } from "../middleware/async.js";
import { BadRequest } from "../errors/badRequestError.js";
import { NotFound } from "../errors/notFoundError.js";

export const getAllMessagesForAllUsers = asyncWrapper(async (req, res) => {
  const { page = 1, limit = 5 } = req.query;

  const totalMessages = await Message.countDocuments();
  const numOfPages = Math.ceil(totalMessages / Number(limit));

  // If no page is provided, default to the last page
  const currentPage = page ? Number(page) : numOfPages;
  const skip = (currentPage - 1) * Number(limit);

  const messages = await Message.find()
    .sort("createdAt")
    .skip(skip)
    .limit(Number(limit));

  if (!messages || !numOfPages || !totalMessages) {
    return res
      .status(StatusCodes.NOT_FOUND)
      .json({ msg: "No message has been sent yet. Please send a message" });
  }

  res.status(StatusCodes.OK).json({ messages, totalMessages, numOfPages });
});

export const createMessage = asyncWrapper(async (req, res) => {
  const { userID, name } = req.user;
  const { message } = req.body;

  if (!message || message.trim() === "") {
    throw new BadRequest("Message must be provided.");
  }

  req.body.sender = { id: userID, name };
  const createdMessage = await Message.create(req.body);

  res
    .status(StatusCodes.CREATED)
    .json({ msg: "Message created successfully", message: createdMessage });
});

export const getAllMessages = asyncWrapper(async (req, res) => {
  const sender = req.user?.userID;
  if (!sender) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: "User ID is missing or invalid" });
  }
  const messages = await Message.find({ sender }).sort("createdAt");
  if (messages.length === 0) {
    return res
      .status(StatusCodes.NOT_FOUND)
      .json({ msg: "No messages found for this user" });
  }
  res.status(StatusCodes.OK).json(messages);
});

export const getMessage = asyncWrapper(async (req, res) => {
  const {
    user: { userID },
    params: { id: msgID },
  } = req;

  const message = await Message.findOne({ _id: msgID, sender: userID });
  if (!message) {
    throw new NotFound(`No message with Id ${msgID} found`);
  }

  res.status(StatusCodes.OK).json({ message });
});

export const deleteMessage = asyncWrapper(async (req, res) => {
  const {
    user: { userID },
    params: { id: msgID },
  } = req;
  const message = await Message.findOneAndDelete({
    _id: msgID,
    sender: userID,
  });
  if (!message) {
    throw new NotFound(`No message with Id ${msgID} found`);
  }
  res.status(StatusCodes.OK).send();
});

export const updateMessage = asyncWrapper(async (req, res) => {
  const { message } = req.body;
  const {
    user: { userID },
    params: { id: msgID },
  } = req;
  const updatedMessage = await Message.findOneAndUpdate(
    { _id: msgID, sender: userID },
    { message },
    { new: true }
  );
  if (!updatedMessage) {
    return res
      .status(StatusCodes.NOT_FOUND)
      .json({ msg: `No message with Id ${msgID} found` });
  }
  res.status(StatusCodes.OK).json(updateMessage);
});
