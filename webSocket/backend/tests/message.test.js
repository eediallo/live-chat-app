import { vi, it, expect, beforeEach, afterEach, describe } from "vitest";
import request from "supertest";
import app from "../app";

import { Message } from "../models/message";
import { StatusCodes } from "http-status-codes";

vi.mock("../middleware/auth", () => ({
  authenticateUser: vi.fn((req, _, next) => {
    req.user = { id: "938383", name: "Mick" }; // Mock authenticated user
    req.params = { id: "999" }; // mock message
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

  it(`should return ${StatusCodes.INTERNAL_SERVER_ERROR} status if there is a server error`, async () => {
    const user = { userID: "938383", name: "Mick" };

    const messageData = { message: "Hello" };
    const createdMessage = {
      sender: { id: user.userID, name: user.name },
      message: messageData.message,
    };

    createMock.mockRejectedValue(new Error("Database error"));

    const response = await request(app)
      .post("/api/v1/messages")
      .set("Authorization", "Bearer valid-token")
      .send(createdMessage);

    expect(response.status).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
  });

  it(`should return ${StatusCodes.BAD_REQUEST} status if required field is message`, async () => {
    const user = { userID: "938383", name: "Mick" };

    const messageData = { message: "" };
    const createdMessage = {
      sender: { id: user.userID, name: user.name },
      message: messageData.message,
    };

    createMock.mockRejectedValue(createdMessage);

    const response = await request(app)
      .post("/api/v1/messages")
      .set("Authorization", "Bearer valid-token")
      .send(createdMessage);

    expect(response.status).toBe(StatusCodes.BAD_REQUEST);
    expect(response.body).toHaveProperty("msg", "Message must be provided.");
  });
});

describe("getMessage()", () => {
  let mockFindOne;

  beforeEach(() => {
    mockFindOne = vi.spyOn(Message, "findOne");
  });

  afterEach(() => {
    mockFindOne.mockRestore();
  });

  it(`should return message with id and ${StatusCodes.OK} status`, async () => {
    const user = { userID: "938383", name: "Mick" };
    const messageData = { msgID: "999" };
    const foundMessage = {
      _id: messageData.msgID,
      sender: user.userID,
      message: "Hello",
    };

    mockFindOne.mockResolvedValue(foundMessage);

    const response = await request(app)
      .get(`/api/v1/messages/${messageData.msgID}`)
      .set("Authorization", "Bearer valid-token");

    expect(response.status).toBe(StatusCodes.OK);
    expect(response.body).toHaveProperty("message");
    expect(response.body.message).toMatchObject(foundMessage);
  });
});
