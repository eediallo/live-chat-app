import { StatusCodes } from "http-status-codes";
import { Message } from "../models/message.js";

export const createMessage = async (req, res) => {
  req.body.sender = req.user.userID;
  const message = await Message.create(req.body);
  res.status(StatusCodes.CREATED).json({ message });
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
  res.status(StatusCodes.OK).json({ messages });
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
  res.status(StatusCodes.OK).json({ updatedMessage });
};
