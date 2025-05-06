import { vi, it, describe, expect } from "vitest";
import { likeMessagePayload, dislikeMessagePayload } from "../scripts/payloads";

const socket = {
  send: vi.fn(),
};

vi.mock("../scripts/payloads", () => ({
  likeMessagePayload: (messageId) => {
    socket.send(JSON.stringify({ type: "like", messageId }));
  },
  dislikeMessagePayload: (messageId) => {
    socket.send(JSON.stringify({ type: "dislike", messageId }));
  },
}));

describe("likeMessagePayload()", () => {
  it("should send liked message with id 123", () => {
    const messageId = 123;
    likeMessagePayload(messageId);
    expect(socket.send).toHaveBeenCalledWith(
      JSON.stringify({ type: "like", messageId })
    );
  });
});

describe("dislikeMessagePayload()", () => {
  it("should send disliked message with id 123", () => {
    const messageId = 123;
    dislikeMessagePayload(messageId);
    expect(socket.send).toHaveBeenCalledWith(
      JSON.stringify({ type: "like", messageId })
    );
  });
});
