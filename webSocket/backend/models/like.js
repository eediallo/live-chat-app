import mongoose from "mongoose";

const likeSchema = new mongoose.Schema(
  {
    messageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      required: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

// ensure user cannot like more than once
likeSchema.index({ messageId: 1, userId: 1 }, { unique: true });

export const Like = mongoose.model("Like", likeSchema);
