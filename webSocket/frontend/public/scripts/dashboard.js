import {
  sendMsgBtn,
  messageInput,
  errorMsgEl,
  usernameEl,
  paginationControlsEl,
  onlineUsersEl,
} from "./domQueries.js";
import { state } from "./state.js";
import { fetchAllMessagesForAllUsers, userInfo, token } from "./data.js";
import { render, createDOMElement } from "./render.js";



usernameEl.textContent = `${userInfo.name}`;


let socket = new WebSocket(`ws:localhost:3000/${token}`);
const baseUrl = "http://localhost:3000";

socket.onopen = async () => {
  state.isSocket = true;
  console.log("SOCKET OPENED");

  try {
    // Fetch the total number of pages first
    const url = `${baseUrl}/api/v1/messages/all?limit=5`;
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
    state.pagination.totalPages = numOfPages;
    errorMsgEl.style.display = "none";

    // Fetch the last page of messages
    await fetchAllMessagesForAllUsers(state.pagination.totalPages);
    render();
  } catch (e) {
    errorMsgEl.textContent = e.message || "An unexpected error occurred.";
    paginationControlsEl.style.display = "none";
    console.error("Error fetching total pages or messages:", e);
  }
};

//display  join message in a dialog box
function showJoinMessageDialog(message) {
  const dialog = createDOMElement("dialog", message);

  const closeButton = createDOMElement("button", "Close");
  closeButton.addEventListener("click", () => {
    dialog.close();
    dialog.remove();
  });

  dialog.appendChild(closeButton);
  document.body.appendChild(dialog);
  dialog.showModal();
}

socket.onmessage = (evt) => {
  const data = JSON.parse(evt.data);

  switch (data.type) {
    case "message":
      state.messages.push(data);

      // Create a new page if message count exceeds 5
      if (state.messages.length > 5) {
        state.pagination.currentPage += 1;
        state.messages = [data];
        state.pagination.totalPages = state.pagination.currentPage;
      }

      render();
      break;

    case "like":
      updateMessageReactionsUI(data);
      break;

    case "dislike":
      updateMessageReactionsUI(data);
      break;

    case "join":
      showJoinMessageDialog(data.message);
      break;

    case "user_count":
      onlineUsersEl.textContent = data.count;
      break;

    case "error":
      alert(data.message); // Display the error message to the user
      break;

    default:
      console.warn("Unknown message type:", data.type);
  }
};

socket.onerror = (evt) => {
  console.log("SOMETHING WENT WRONG..");
  console.log(evt.data);
};

socket.onclose = () => {
  isSocketOpen = false;
  console.log("WEBSOCKET CLOSE...");
};

// Ensure the UI is updated with the correct likes and dislikes counts
function updateMessageReactionsUI(data) {
  const message = state.messages.find((m) => m._id === data.messageId);
  if (message) {
    if (data.type === "like") {
      message.likes = data.likes || 0;
    } else if (data.type === "dislike") {
      message.dislikes = data.dislikes || 0;
    }
  }

  // Update UI for this specific message
  const messageEl = document.querySelector(
    `[data-message-id="${data.messageId}"]`
  );
  if (messageEl) {
    const likeButton = messageEl.querySelector(".like-btn");
    const dislikeButton = messageEl.querySelector(".dislike-btn");

    if (likeButton) {
      likeButton.textContent = `👍 ${message.likes || 0}`;
    }
    if (dislikeButton) {
      dislikeButton.textContent = `👎 ${message.dislikes || 0}`;
    }
  }
}

async function sendMessage(text) {
  try {
    if (socket.readyState === WebSocket.OPEN) {
      const timestamp = new Date().toISOString();
      const payload = {
        type: "message",
        text,
        sender: {
          name: userInfo.name,
        },
        createdAt: timestamp,
      };
      socket.send(JSON.stringify(payload));
      // Hide the error message if it is visible
      errorMsgEl.style.display = "none";
    } else {
      console.error("WebSocket is not open. Cannot send message.");
    }
  } catch (e) {
    if (e.code === 11000) {
      console.log("11000 error");
    }
  }
}

export async function likeMessagePayload(messageId) {
  const payload = {
    type: "like",
    messageId: messageId,
  };
  socket.send(JSON.stringify(payload));
}

export async function dislikeMessagePayload(messageId) {
  const payload = {
    type: "dislike",
    messageId: messageId,
  };
  socket.send(JSON.stringify(payload));
}

function sendMessageHandler(e) {
  e.preventDefault();
  const text = messageInput.value;
  sendMessage(text);
  messageInput.value = "";
}

sendMsgBtn.addEventListener("click", sendMessageHandler);


