import mongoose from "mongoose";

export const connectDB = async (url) => {
  try {
    await mongoose.connect(url);
    console.log("Success");
  } catch (err) {
    console.error(err);
  }
};
