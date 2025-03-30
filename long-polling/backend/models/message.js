import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    message: {
      type: String,
      trim: true,
      require: [true, "Text message must be provided"],
    },
    sender: {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "Sender must be provided"],
      },
      name: {
        type: String,
        ref: "User",
        required: [true, "Sender must be provided"],
      },
    },
  },
  { timestamps: true }
);

export const Message = mongoose.model("Message", messageSchema);
