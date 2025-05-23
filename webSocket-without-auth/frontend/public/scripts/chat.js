const sendMsgBtn = document.querySelector("#send-msg-btn");
const messageInput = document.querySelector("#message-input");
const messageContainer = document.querySelector("#messages-container");
const errorMsgEl = document.querySelector("#errorMsg");
const prevPageBtn = document.querySelector("#prev-page-btn");
const nextPageBtn = document.querySelector("#next-page-btn");
const pageInfo = document.querySelector("#page-info");
const usernameEl = document.querySelector("#username");
const paginationControlsEl = document.querySelector("#pagination-controls");

const state = {
  messages: [],
  username: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
  },
  likes: [],
  dislikes: [],
};

let isSocketOpen = false;

function createAndAppendElToContainer(tag, className, content, container) {
  const element = createDOMElement(tag, content);
  element.classList.add(className);
  container.append(element);
}

function createDOMElement(tag, content) {
  const element = document.createElement(tag, content);
  element.textContent = content;
  return element;
}

// Style the prompt input for username
const user = prompt("Please enter your name");
if (!user) {
  alert("Username is required to join the chat.");
  throw new Error("Username is required");
}

let socket = new WebSocket(
  `wss://eediallo-live-chat-server.hosting.codeyourfuture.io/?username=${user}`
);
const baseUrl = "https://eediallo-live-chat-server.hosting.codeyourfuture.io";

socket.onopen = async () => {
  state.username = user;
  isSocketOpen = true;
  usernameEl.textContent = user;
  console.log("SOCKET OPENED");

  try {
    // Fetch the total number of pages first
    const url = `${baseUrl}/api/v1/messages/all?limit=5`;
    const resp = await fetch(url);
    const data = await resp.json();

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
  console.log(data, "data===>");

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
          username: state.username,
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

async function likeMessagePayload(messageId) {
  const payload = {
    type: "like",
    messageId: messageId,
  };
  socket.send(JSON.stringify(payload));
}

async function dislikeMessagePayload(messageId) {
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

function createMessageCard(message) {
  const li = document.createElement("li");
  li.classList.add("message");
  li.setAttribute("data-message-id", message._id);
  li.setAttribute("data-user-id", message.sender.id);

  const timestamp = new Date(message.createdAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const time = createDOMElement("i", ` ${timestamp}`);
  const sender = createDOMElement("b", message.sender.username);
  const text = createDOMElement("p", message.text);

  // Like Button
  const likeButton = createDOMElement("button", `👍 ${message.likes || 0}`);
  likeButton.classList.add("like-btn");
  likeButton.addEventListener("click", () => {
    likeMessagePayload(message._id);
  });

  // Dislike Button
  const dislikeButton = createDOMElement(
    "button",
    `👎 ${message.dislikes || 0}`
  );
  dislikeButton.classList.add("dislike-btn");
  dislikeButton.addEventListener("click", () => {
    dislikeMessagePayload(message._id);
  });

  li.append(sender, time, text, likeButton, dislikeButton);
  return li;
}

function render() {
  messageContainer.innerHTML = "";

  let currentDate = null;
  state.messages.forEach((message) => {
    const messageDate = new Date(message.createdAt).toLocaleDateString();

    if (messageDate !== currentDate) {
      currentDate = messageDate;
      createAndAppendElToContainer(
        "div",
        "date-header",
        currentDate,
        messageContainer
      );
    }

    const messageCard = createMessageCard(message);
    messageContainer.append(messageCard);
  });
}

async function fetchAllMessagesForAllUsers(page, limit = 5) {
  try {
    const url = `${baseUrl}/api/v1/messages/all?page=${page}&limit=${limit}`;
    const resp = await fetch(url);
    if (!resp.ok) {
      throw new Error(`Failed to fetch messages: ${resp.status}`);
    }
    const { messages, numOfPages } = await resp.json();

    if (messages.length === 0 && numOfPages.length === 0) {
      errorMsgEl.textContent = "No messages found. Please send a message.";
      errorMsgEl.style.display = "block";
      return;
    } else {
      state.pagination.totalPages = numOfPages;
      state.pagination.currentPage = page;
      // Replace the current messages with the new ones
      state.messages = messages;
      await fetchReactionsForMessages(state.messages);
      errorMsgEl.style.display = "none";
    }

    render();
    updatePaginationControls();
  } catch (e) {
    console.error(e);
    errorMsgEl.textContent = "An error occurred while fetching messages.";
    errorMsgEl.style.display = "block";
  }
}

async function fetchReactionsForMessages(messages) {
  for (let message of messages) {
    const reactionsResp = await fetch(
      `${baseUrl}/api/v1/reactions/${message._id}`
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

async function fetchAllReactions() {
  try {
    const resp = await fetch(`${baseUrl}/api/v1/reactions`);
    if (!resp.ok) {
      throw new Error(`Failed to fetch reactions: ${resp.status}`);
    }
    const { likes, dislikes } = await resp.json();
    state.likes = likes;
    state.dislikes = dislikes;
  } catch (e) {
    console.log(e.msg);
  }
}

function updatePaginationControls() {
  pageInfo.textContent = `Page ${state.pagination.currentPage} of ${state.pagination.totalPages}`;
  prevPageBtn.disabled = state.pagination.currentPage === 1;
  nextPageBtn.disabled =
    state.pagination.currentPage === state.pagination.totalPages;
}

prevPageBtn.addEventListener("click", () => {
  if (isSocketOpen && state.pagination.currentPage > 1) {
    fetchAllMessagesForAllUsers(state.pagination.currentPage - 1);
  }
});

nextPageBtn.addEventListener("click", () => {
  if (
    isSocketOpen &&
    state.pagination.currentPage < state.pagination.totalPages
  ) {
    fetchAllMessagesForAllUsers(state.pagination.currentPage + 1);
  }
});
