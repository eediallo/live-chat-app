import { User } from "../models/user.js";
import StatusCodes from "http-status-codes";

const login = async (req, res) => {};

const register = async (req, res) => {
  const user = await User.create(req.body);
  res.status(StatusCodes.CREATED).json({ user });
};

export { login, register };
