import { vi, it, describe, expect, beforeEach, afterEach } from "vitest";
import app from "../app";
import request from "supertest";
import { User } from "../models/user";
import { StatusCodes } from "http-status-codes";

describe("RegisterUser", () => {
  let createMock;

  beforeEach(() => {
    createMock = vi.spyOn(User, "create");
  });

  afterEach(() => {
    createMock.mockRestore();
  });

  it(`should register user and return ${StatusCodes.CREATED} status`, async () => {
    const user = {
      name: "Daniel",
      email: "daniel@gmail.com",
      password: "Secret98$",
    };

    const token = "mocked-jwt-token";
    createMock.mockResolvedValue({
      ...user,
      createJWT: vi.fn().mockResolvedValue(token),
    });

    const response = await request(app)
      .post("/api/v1/auth/register")
      .send(user);

    expect(response.status).toBe(StatusCodes.CREATED);
    expect(response.body).toHaveProperty("token");
  });

  it(`should return ${StatusCodes.BAD_REQUEST} if at least one required field is not provided`, async () => {
    const user = {
      name: "Daniel",
      email: "daniel@gmail.com",
    };

    const response = await request(app)
      .post("/api/v1/auth/register")
      .send(user);

    expect(response.status).toBe(StatusCodes.BAD_REQUEST);
  });
});
