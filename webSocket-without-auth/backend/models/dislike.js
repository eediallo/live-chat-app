import mongoose from "mongoose";

const dislikeSchema = new mongoose.Schema(
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

// ensure that user cannot dislike more than once
dislikeSchema.index({ messageId: 1, userId: 1 }, { unique: true });

export const Dislike = mongoose.model("Dislike", dislikeSchema);
