import { token } from "./data.js";

export const state = {
  messages: [],
  name: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
  },
  likes: [],
  dislikes: [],
  isSocket: false,
  baseUrl: "https://eediallo-chat-server-auth.hosting.codeyourfuture.io/api/v1",
};

export let socket = new WebSocket(
  `wss://eediallo-chat-server-auth.hosting.codeyourfuture.io/?token=${token}`
);
