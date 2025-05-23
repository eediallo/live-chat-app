import { User } from "../models/user.js";
import StatusCodes from "http-status-codes";
import { asyncWrapper } from "../middleware/async.js";
import { BadRequest } from "../errors/badRequestError.js";
import { UnauthenticatedError } from "../errors/unauthorizedError.js";
import { NotFound } from "../errors/notFoundError.js";

const login = asyncWrapper(async (req, res) => {
  const { email, password } = req.body;
  if (email === "" || password === "") {
    throw new BadRequest("Email and password are required");
  }
  const user = await User.findOne({ email });
  if (!user) {
    throw new UnauthenticatedError("Invalid credentials");
  }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    throw new UnauthenticatedError("Invalid credentials");
  }

  const token = user.createJWT();
  res.status(StatusCodes.OK).json({ token });
});

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

export const getNumberOfUsers = asyncWrapper(async (_, res) => {
  const numberOfUsers = await User.countDocuments();
  if (!numberOfUsers || numberOfUsers.length === 0) {
    throw new NotFound("No users found");
  }
  res.status(StatusCodes.OK).json(numberOfUsers);
});

export { login, register };
