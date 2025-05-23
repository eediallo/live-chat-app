import { redirectIfNotAuthenticated } from "./auth.js";
import {
  sendMsgBtn,
  messageInput,
  errorMsgEl,
  usernameEl,
  paginationControlsEl,
  onlineUsersEl,
} from "./domQueries.js";
import { state } from "./state.js";
import {
  fetchAllMessagesForAllUsers,
  userInfo,
  fetchTotalNumberOfPages,
  fetchTotalMembers,
} from "./data.js";
import {
  render,
  showJoinMessageDialog,
  updateMessageReactionsUI,
  updatePaginationControls,
} from "./ui.js";
import { socket } from "./state.js";

redirectIfNotAuthenticated();

socket.onopen = async () => {
  usernameEl.textContent = `${userInfo.name}`; // display name of connected user
  state.isSocket = true;
  console.log("SOCKET OPENED");

  try {
    // Fetch the total number of pages first
    await fetchTotalMembers();
    const totalPages = await fetchTotalNumberOfPages();
    state.pagination.totalPages = totalPages;
    // Fetch the last page of messages
    await fetchAllMessagesForAllUsers(state.pagination.totalPages);
    render();
  } catch (e) {
    errorMsgEl.textContent = e.message || "An unexpected error occurred.";
    paginationControlsEl.style.display = "none";
    console.error("Error fetching total pages or messages:", e);
  }
};

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

    case "edit":
      const messageIndex = state.messages.findIndex((m) => m._id === data._id);
      if (messageIndex !== -1) {
        state.messages[messageIndex] = {
          ...state.messages[messageIndex],
          ...data,
        };
      }
      render();
      break;

    case "delete":
      const msgIndex = state.messages.findIndex((m) => m._id === data._id);
      if (msgIndex !== -1) {
        state.messages[msgIndex] = { ...state.messages.slice(msgIndex, 1) };
      }
      render();
      updatePaginationControls();
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
  state.isSocket = false;
  console.log("WEBSOCKET CLOSE...");
};

async function sendMessagePayload(text) {
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

function sendMessageHandler(e) {
  e.preventDefault();
  const text = messageInput.value;
  sendMessagePayload(text);
  messageInput.value = "";
}

sendMsgBtn.addEventListener("click", sendMessageHandler);
