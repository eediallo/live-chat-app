import { vi, expect, it, describe } from "vitest";
import { BadRequest, NotFound } from "../errors/index";

describe("BadRequestError", () => {
  it("should contain message and statusCode provided", () => {
    const statusCode = 400;
    const message = "Message is required";
    const badRequestError = new BadRequest(message, statusCode);

    expect(badRequestError.statusCode).toBe(statusCode);
    expect(badRequestError.message).toBe(message);
  });
});


describe("NotFoundError", () => {
  it("should contain message and statusCode provided", () => {
    const statusCode = 404;
    const message = "Message not found";
    const notFoundError = new NotFound(message, statusCode);

    expect(notFoundError.statusCode).toBe(statusCode);
    expect( notFoundError.message).toBe(message);
  });
});
