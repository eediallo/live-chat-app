import { StatusCodes } from "http-status-codes";
import { Message } from "../models/message.js";

const callbacksForNewMessages = [];

export const getAllMessagesForAllUsers = async (req, res) => {
  const { since } = req.query;
  let query = {};

  if (since) {
    const sinceDate = new Date(since);
    if (!isNaN(sinceDate)) {
      query.createdAt = { $gte: sinceDate };
    }
  }

  const messages = await Message.find(query).sort("createdAt");
  if (messages.length === 0) {
    // Note: We need to use an arrow function here, rather than just pushing `res.send` directly.
    // This is because of handling of "this".
    // You can read about "this" at https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/this
    callbacksForNewMessages.push((value) => res.json({ value }));
  } else {
    res.json({ messages });
  }
  // try {

  //   if (messages.length === 0) {
  //     return res
  //       .status(StatusCodes.NOT_FOUND)
  //       .json({ msg: "No messages found" });
  //   }

  //   res.status(StatusCodes.OK).json({ messages });
  // } catch (error) {
  //   console.error(error);
  //   res
  //     .status(StatusCodes.INTERNAL_SERVER_ERROR)
  //     .json({ msg: "Failed to fetch messages" });
  // }
};

export const createMessage = async (req, res) => {
  const { userID, name } = req.user;
  req.body.sender = { id: userID, name };
  const message = await Message.create(req.body);

  while (callbacksForNewMessages.length > 0) {
    const callback = callbacksForNewMessages.pop();
    callback([message]);
  }

  res
    .status(StatusCodes.CREATED)
    .json({ msg: "Message created successfully", message });
};

export const getAllMessages = async (req, res) => {
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
};

export const getMessage = async (req, res) => {
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
};

export const deleteMessage = async (req, res) => {
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
};

export const updateMessage = async (req, res) => {
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
};
