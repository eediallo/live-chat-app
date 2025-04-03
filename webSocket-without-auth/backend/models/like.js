import mongoose from "mongoose";

const likeSchema = new mongoose.Schema(
  {
    messageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      required: true,
    },
    
    sender: {
      id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      username: String,
    },
  },
  { timestamps: true }
);

export const Like = mongoose.model("Like", likeSchema);
