import { User } from "../models/user.js";
import StatusCodes from "http-status-codes";

const login = async (req, res) => {
  const { email, password } = req.body;
  if (email === "" || password === "") {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: "Email and password are required" });
  }
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
  res.status(StatusCodes.OK).json({ name: user.name, token });
};

const register = async (req, res) => {
  const user = await User.create(req.body);
  const token = user.createJWT();
  res.status(StatusCodes.CREATED).json({ name: user.name, token });
};

export { login, register };
