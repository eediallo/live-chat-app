import { Message } from "../models/message.js";

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
