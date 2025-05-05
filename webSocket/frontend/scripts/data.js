import { state } from "./state.js";
import { errorMsgEl, totalMembersEl } from "./domQueries.js";
import { render } from "./render.js";
import { updatePaginationControls } from "./render.js";
import { getToken } from "./storage.js";
import { paginationControlsEl } from "./domQueries.js";
import { decodeToken } from "./decodeToken.js";

export const token = getToken();
export const userInfo = decodeToken(token);

export async function fetchAllMessagesForAllUsers(page, limit = 5) {
  try {
    const url = `${state.baseUrl}/messages/all?page=${page}&limit=${limit}`;
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
    const reactionsResp = await fetch(
      `${state.baseUrl}/reactions/${message._id}`
    );

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

export async function fetchTotalNumberOfPages() {
  try {
    const url = `${state.baseUrl}/messages/all?limit=5`;
    const resp = await fetch(url);
    let data;
    try {
      data = await resp.json();
    } catch (e) {
      throw new Error("Failed to parse JSON response: " + e.message);
    }

    if (!resp.ok) {
      console.error(`Failed to fetch total pages: ${resp.status}`);
      errorMsgEl.textContent = data.msg || "An error occurred.";
      paginationControlsEl.style.display = "none";
      return;
    }

    const { numOfPages } = data;
    errorMsgEl.style.display = "none";
    return numOfPages;
  } catch (e) {
    errorMsgEl.textContent = e.message || "An unexpected error occurred.";
    paginationControlsEl.style.display = "none";
    console.error("Error fetching total pages or messages:", e);
  }
}

export async function fetchTotalMembers() {
  try {
    const { data, msg } = await axios.get(`${state.baseUrl}/auth/users_number`);
    if (msg) {
      const errorMessage = msg || "Failed to fetch number of users";
      errorMsgEl.textContent = errorMessage;
      return;
    }

    totalMembersEl.textContent = data;
  } catch (e) {
    console.error("An error has occurred: ", e);
  }
}
