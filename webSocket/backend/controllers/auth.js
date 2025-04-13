import { User } from "../models/user.js";
import StatusCodes from "http-status-codes";

const login = async (req, res) => {
  const { email, password } = req.body;
  if (email === "" || password === "") {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: "Email and password are required" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ msg: "Invalid credentials" });
    }
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ msg: "Invalid credentials" });
    }
    const token = user.createJWT();
    res.status(StatusCodes.OK).json({ token });
  } catch (e) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ msg: "Something went wrong. Please try again later" });
  }
};

const register = async (req, res) => {
  try {
    const user = await User.create(req.body);
    const token = user.createJWT();
    res.status(StatusCodes.CREATED).json({ token });
  } catch (error) {
    if (error.name === "ValidationError") {
      const errorMessage = Object.values(error.errors)
        .map((err) => err.message)
        .join(", ");
      return res.status(StatusCodes.BAD_REQUEST).json({ msg: errorMessage });
    }
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ msg: "Something went wrong. Please try again later" });
  }
};

export const getNumberOfUsers = async (_, res) => {
  try {
    const numberOfUsers = await User.countDocuments();
    if (!numberOfUsers) {
      return res.status(StatusCodes.NOT_FOUND).json({ msg: "No users found" });
    }

    res.status(StatusCodes.OK).json(numberOfUsers);
  } catch (e) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ msg: "Something went wrong. Please try again later." });
  }
};

export { login, register };
