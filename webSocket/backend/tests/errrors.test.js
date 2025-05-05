import { vi, expect, it, describe } from "vitest";
import { BadRequest } from "../errors/index";

describe("BadRequestError", () => {
  it("should contain message and statusCode provided", () => {
    const statusCode = 400;
    const message = "Message is required";
    const badRequestError = new BadRequest(message, statusCode);

    expect(badRequestError.statusCode).toBe(statusCode);
    expect(badRequestError.message).toBe(message);
  });
});
