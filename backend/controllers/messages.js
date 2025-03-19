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

export const deleteMessage = async (req, res) => {
  try {
    const { id: msgID } = req.params;
    const message = await Message.findOneAndDelete({ _id: msgID });
    res.status(200).json({ success: true, message });
  } catch (err) {
    res.status(500).json({ success: false, msg: "Failed to delete message" });
  }
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
    res.status(200).json({success: true, updatedMessage})
  } catch (err) {
    res.status(500).json({ success: false, msg: "Failed to edit message" });
  }
};
