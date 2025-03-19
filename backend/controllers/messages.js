import { Message } from "../models/message.js";

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
    res.status(200).json({ success: true, updatedMessage });
  } catch (err) {
    res.status(500).json({ success: false, msg: "Failed to edit message" });
  }
};
