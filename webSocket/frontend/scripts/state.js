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
  baseUrl: "http://localhost:3000/api/v1",
};

export function createSocket() {
  const token = localStorage.getItem("token");
  return new WebSocket(`ws://localhost:3000/api/v1/?token=${token}`);
}

export let socket = createSocket();
