import { vi, it, describe, expect, beforeEach } from "vitest";
import {
  likeMessagePayload,
  dislikeMessagePayload,
  deleteMessagePayload,
} from "../scripts/payloads";

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

  deleteMessagePayload: (messageId) => {
    socket.send(JSON.stringify({ type: "delete", messageId }));
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
      JSON.stringify({ type: "dislike", messageId })
    );
  });
});

describe("deleteMessagePayload()", () => {
  it("should send delete message with id 123", () => {
    const messageId = 123;
    deleteMessagePayload(messageId);
    expect(socket.send).toHaveBeenCalledWith(
      JSON.stringify({ type: "delete", messageId })
    );
  });
});
