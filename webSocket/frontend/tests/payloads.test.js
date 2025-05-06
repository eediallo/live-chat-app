import { vi, it, describe, expect } from "vitest";
import { likeMessagePayload } from "../scripts/payloads";

const socket = {
  send: vi.fn(),
};

vi.mock("../scripts/payloads", () => ({
  likeMessagePayload: (messageId) => {
    socket.send(JSON.stringify({ type: "like", messageId }));
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
