import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      trim: true,
      require: [true, "Text message must be provided"],
    },
    sender: {
      id: { type: mongoose.Schema.Types.ObjectId , ref: 'User'},
      username: String,
    },
  },
  { timestamps: true }
);

export const Message = mongoose.model("Message", messageSchema);
