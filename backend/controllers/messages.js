import { StatusCodes } from "http-status-codes";
import { Message } from "../models/message.js";

export const createMessage = async (req, res) => {
  req.body.sender = req.user.userID;
  const message = await Message.create(req.body);
  res.status(StatusCodes.CREATED).json({ message });
};

export const getAllMessages = async (req, res) => {
  const { since } = req.query;

  try {
    let queryObject = {};
    if (since) {
      queryObject = { createdAt: { $lt: new Date(since) } };
    }

    const result = Message.find(queryObject);
    result.sort("createdAt");

    const messages = await result;

    if (messages.length === 0) {
      return res.status(200).json({ success: true, messages: [] }); // Return an empty array instead of a 404
    }
    res.status(200).json({ success: true, messages, nHits: messages.length });
  } catch (err) {
    res.status(500).json({ success: false, msg: err.message });
  }
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
  try {
    const { id: msgID } = req.params;
    const { text } = req.body;
    const updatedMessage = await Message.findByIdAndUpdate(
      msgID,
      { text },
      { new: true, runValidators: true }
    );
    res.status(200).json({ success: true, updatedMessage });
  } catch (err) {
    res.status(500).json({ success: false, msg: "Failed to edit message" });
  }
};
