import { Message } from "../models/message.js";

export const getAllMessages = async (req, res) => {
  try {
    const messages = await Message.find({});
    if (messages.length === 0) {
      return res.status(404).json({ success: false, msg: "No message found" });
    }
    res.status(200).json({ success: true, messages });
  } catch (err) {
    res.status(404).json({ success: false, msg: err });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const message = await Message.create(req.body);
    res.status(201).json({ success: true, message });
  } catch (err) {
    res.status(500).json({
      success: false,
      msg: "Failed to send message. Please try again later",
    });
  }
};

export const deleteMessage = async (req, res) => {
  try {
    const { id: msgID } = req.params;
    const message = await Message.findOneAndDelete({ _id: msgID });
    res.status(200).json({ success: true, message });
  } catch (err) {
    res.status(500).json({ success: false, msg: "Failed to delete message" });
  }
};
