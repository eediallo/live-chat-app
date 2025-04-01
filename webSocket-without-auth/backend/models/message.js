import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      trim: true,
      require: [true, "Text message must be provided"],
    },
    sender: {
      type: String,
      required: [true, "Text message must be provided"],
    },
  },
  { timestamps: true }
);

export const Message = mongoose.model("Message", messageSchema);
