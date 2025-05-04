import { vi, it, expect, beforeEach, afterEach, describe } from "vitest";
import request from "supertest";
import app from "../app";

import { Message } from "../models/message";
import { StatusCodes } from "http-status-codes";
import { createMessage } from "../controllers/messages";

vi.mock("../middleware/auth", () => ({
  authenticateUser: vi.fn((req, res, next) => {
    req.user = { id: "938383", name: "Mick" }; // Mock authenticated user
    next();
  }),
}));

describe("createMessage()", () => {
  let createMock;

  beforeEach(() => {
    createMock = vi.spyOn(Message, "create");
  });

  afterEach(() => {
    createMock.mockRestore();
  });

  it(`should create a message and return ${StatusCodes.CREATED} status`, async () => {
    const user = { userID: "938383", name: "Mick" };
    const messageData = { message: "Hello" };
    const createdMessage = {
      sender: { id: user.userID, name: user.name },
      message: messageData.message,
    };

    createMock.mockResolvedValue(createdMessage);

    const response = await request(app)
      .post("/api/v1/messages")
      .set("Authorization", "Bearer valid-token")
      .send(messageData);

    expect(response.status).toBe(StatusCodes.CREATED);
    expect(response.body).toHaveProperty("msg", "Message created successfully");
    expect(response.body).toHaveProperty("message");
    expect(response.body.message).toMatchObject(createdMessage);
  });

  it(`should return ${StatusCodes.INTERNAL_SERVER_ERROR} status`, async () => {
    const user = { userID: "938383", name: "Mick" };
    const messageData = { message: "Hello" };
    const createdMessage = {
        ...user,
        messageData
    }

    createMock.mockRejectedValue(new Error("Database error"));

    const response = await request(app)
      .post("/api/v1/messages")
      .set("Authorization", "Bearer valid-token")
      .send(createdMessage);

    expect(response.status).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
  });
});
