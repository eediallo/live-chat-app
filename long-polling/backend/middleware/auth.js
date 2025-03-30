import { StatusCodes } from "http-status-codes";
import jsonwebtoken from "jsonwebtoken";

export const authenticateUser = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer")) {
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ msg: "Invalid token provided" });
  }
  const token = authHeader.split(" ")[1];
  if (!token) {
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ msg: "Invalid Credentials" });
  }
  try {
    const payload = jsonwebtoken.verify(token, process.env.JWT_SECRET);
    const { id: userID, name } = payload;
    req.user = { userID, name };
    next();
  } catch (err) {
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ msg: "Invalid Credentials" });
  }
};
