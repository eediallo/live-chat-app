import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  text: {
    type: String,
    trim: true,
    require: [true, "Text message must be provided"],
  },
  user: {
    type: String,
    trim: true,
    require: [true, "User must be provided"],
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

export const Message = mongoose.model("Message", messageSchema);
