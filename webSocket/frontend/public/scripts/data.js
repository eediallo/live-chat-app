import { state } from "./state.js";
import { errorMsgEl } from "./domQueries.js";
import { render } from "./render.js";
import { updatePaginationControls } from "./render.js";
import { getToken } from "./storage.js";

const baseUrl = "http://localhost:3000/api/v1";

function decodeToken(token) {
  const payloadBase64 = token.split(".")[1];
  const decodedPayload = atob(payloadBase64);
  return JSON.parse(decodedPayload);
}

export const token = getToken();
export const userInfo = decodeToken(token);

export async function fetchAllMessagesForAllUsers(page, limit = 5) {
  try {
    const url = `${baseUrl}/messages/all?page=${page}&limit=${limit}`;
    const resp = await fetch(url);
    if (!resp.ok) {
      throw new Error(`Failed to fetch messages: ${resp.status}`);
    }
    const { messages } = await resp.json();

    if (messages.length === 0) {
      errorMsgEl.textContent = "No messages found. Please send a message.";
      errorMsgEl.style.display = "block";
      return;
    }

    state.pagination.currentPage = page;
    state.messages = messages; // Replace the current messages with the new ones
    await fetchMessageReactions(state.messages);
    errorMsgEl.style.display = "none";
    render();
    updatePaginationControls();
  } catch (e) {
    errorMsgEl.textContent = `An error occurred while fetching messages: ${e.message}`;
    errorMsgEl.style.display = "block";
  }
}

async function fetchMessageReactions(messages) {
  for (let message of messages) {
    const reactionsResp = await fetch(`${baseUrl}/reactions/${message._id}`);

    if (reactionsResp.ok) {
      const { likesCount, dislikesCount, likedBy, dislikedBy } =
        await reactionsResp.json();
      message.likes = likesCount;
      message.dislikes = dislikesCount;
      message.likedBy = likedBy || [];
      message.dislikedBy = dislikedBy || [];
    } else {
      message.likes = 0;
      message.dislikes = 0;
      message.likedBy = [];
      message.dislikedBy = [];
    }
  }
}
