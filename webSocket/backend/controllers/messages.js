import { StatusCodes } from "http-status-codes";
import { Message } from "../models/message.js";
import { asyncWrapper } from "../middleware/async.js";
import { NotFound } from "../errors/notFoundError.js";
import { BadRequest } from "../errors/badRequestError.js";

export const getAllMessagesForAllUsers = asyncWrapper(async (req, res) => {
  const { since } = req.query;
  let query = {};

  // Validate 'since' parameter
  if (since) {
    const sinceDate = new Date(since);
    if (isNaN(sinceDate)) {
      throw new BadRequest("Invalid 'since' date format");
    }
    query.createdAt = { $gte: sinceDate };
  }

  const messages = await Message.find(query).sort("createdAt");

  if (messages.length === 0) {
    throw new NotFound("No message found");
  }

  res.status(StatusCodes.OK).json({ messages });
});

export const createMessage = asyncWrapper(async (req, res) => {
  const { userID, name } = req.user;
  req.body.sender = { id: userID, name };
  const message = await Message.create(req.body);

  res
    .status(StatusCodes.CREATED)
    .json({ msg: "Message created successfully", message });
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
    return res
      .status(StatusCodes.NOT_FOUND)
      .json({ msg: `No message with Id ${msgID} found` });
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
    return res
      .status(StatusCodes.NOT_FOUND)
      .json({ msg: `No message with Id ${msgID} found` });
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
