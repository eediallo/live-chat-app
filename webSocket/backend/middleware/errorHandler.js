import { CustomAPIError } from "../errors/custom-error.js";
import { StatusCodes } from "http-status-codes";
export const errorHandlerMiddleware = (err, req, res, next) => {
  if (err instanceof CustomAPIError) {
    return res.status(err.statusCode).json({ msg: err.message });
  }
  return res
    .status(StatusCodes.INTERNAL_SERVER_ERROR)
    .send({msg: "Something went wrong, please try again later."});
};
