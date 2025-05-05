import { vi, it, expect, describe } from "vitest";
import jwt from "jsonwebtoken";
import { decodeToken } from "../scripts/decodeToken";

function generateToken() {
  const email = "secret@gmail.com";
  const jwt_secret = "secret98";
  const jwt_expires = "30d";

  const token = jwt.sign({ email: email }, jwt_secret, {
    expiresIn: jwt_expires,
  });
  return token;
}

describe("decodeToken()", () => {
  it("should decode token", () => {
    const token = generateToken();

    const data = decodeToken(token);

    expect(data).toHaveProperty("email", "secret@gmail.com");
    expect(data).toHaveProperty("iat");
    expect(data).toHaveProperty("exp");
  });
});
