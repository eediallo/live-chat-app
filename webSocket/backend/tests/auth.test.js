import { vi, it, describe, expect, beforeEach, afterEach } from "vitest";
import app from "../app";
import request from "supertest";
import { User } from "../models/user";
import { StatusCodes } from "http-status-codes";

vi.mock("../middleware/auth", () => ({
  authenticateUser: vi.fn((req, _, next) => {
    req.user = { id: "938383", name: "Mick" }; // Mock authenticated user
    req.params = { id: "999" }; // mock message
    next();
  }),
}));

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

  it(`should return ${StatusCodes.INTERNAL_SERVER_ERROR} status if server error occurs during user creation`, async () => {
    createMock.mockResolvedValue(new Error("Database error"));
    const user = {
      name: "Daniel",
      email: "daniel@gmail.com",
      password: "Secret98$",
    };

    const response = await request(app)
      .post("/api/v1/auth/register")
      .send(user);

    expect(response.status).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
  });
});

describe("loginUser", () => {
  let mockFindOne;

  beforeEach(() => {
    mockFindOne = vi.spyOn(User, "findOne");
  });

  afterEach(() => {
    mockFindOne.mockRestore();
  });

  it(`should return ${StatusCodes.BAD_REQUEST} if at least one required filed is missing`, async () => {
    const user = {
      email: "daniel@gmail.com",
      password: "",
    };

    const response = await request(app).post("/api/v1/auth/login").send(user);

    expect(response.status).toBe(StatusCodes.BAD_REQUEST);
    expect(response.body).toHaveProperty(
      "msg",
      "Email and password are required"
    );
  });

  it(`should return ${StatusCodes.INTERNAL_SERVER_ERROR} status if error occurs in the server while login user`, async () => {
    mockFindOne.mockRejectedValue(new Error("Database error"));

    const user = {
      email: "daniel@gmail.com",
      password: "secret98$",
    };

    const response = await request(app).post("/api/v1/auth/login").send(user);

    expect(response.status).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
    expect(response.body).toHaveProperty(
      "msg",
      "Something went wrong, please try again later."
    );
  });

  it(`should login user and return ${StatusCodes.OK} status`, async()=>{
    const user = {
      email: "daniel@gmail.com",
      password: "Secret98$"
    }

    const token = "mock-jwt-token"
    mockFindOne.mockResolvedValue({
      ...user,
      matchPassword: vi.fn().mockResolvedValue(true),
      createJWT: vi.fn().mockResolvedValue(token)
    })

    const response = await request(app).post('/api/v1/auth/login').send(user)

    expect(response.status).toBe(StatusCodes.OK);
    expect(response.body).toHaveProperty("token")
  })
});
