import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "Username must be provided"],
    unique: true,
  },
});

export const User = mongoose.model("User", userSchema);
