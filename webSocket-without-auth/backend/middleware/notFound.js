import { StatusCodes } from "http-status-codes";

export const notFound = (req, res) => {
  res
    .status(StatusCodes.NOT_FOUND)
    .send(
      '<h1>The Page you are looking for is not found</h1><a href="/">Back to home page</a>'
    );
};
