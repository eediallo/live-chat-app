const sendMsgBtn = document.querySelector("#send-msg-btn");
const messageInput = document.querySelector("#message-input");
const messageContainer = document.querySelector("#messages-container");
const errorMsgEl = document.querySelector("#errorMsg");
const prevPageBtn = document.querySelector("#prev-page-btn");
const nextPageBtn = document.querySelector("#next-page-btn");
const pageInfo = document.querySelector("#page-info");

const state = {
  messages: [],
  username: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
  },
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

const user = prompt("Please enter your name");
let socket = new WebSocket(`ws://localhost:3000?username=${user}`);
const baseUrl = "http://localhost:3000";

socket.onopen = async () => {
  state.username = user;
  isSocketOpen = true;
  console.log("SOCKET OPENED");

  try {
    // Fetch the total number of pages first
    const url = `${baseUrl}/api/v1/messages/all?limit=5`;
    const resp = await fetch(url);
    if (!resp.ok) {
      throw new Error(`Failed to fetch total pages: ${resp.status}`);
    }
    const { numOfPages } = await resp.json();
    state.pagination.totalPages = numOfPages;

    // Fetch the last page of messages
    await fetchAllMessagesForAllUsers(state.pagination.totalPages);
    render();
  } catch (e) {
    console.error("Error fetching total pages or messages:", e);
  }
};

socket.onmessage = (evt) => {
  const data = JSON.parse(evt.data);

  switch (data.type) {
    case "message":
      state.messages.push(data);

      // Check if the current page has more than 5 messages
      if (state.messages.length > 5) {
        console.log("Message count exceeds 5. Moving to a new page...");
        state.pagination.currentPage += 1;
        state.messages = [data]; // Start a new page with the new message
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
      createAndAppendElToContainer(
        "div",
        "join-message",
        data.message,
        messageContainer
      );
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

function updateMessageReactionsUI(data) {
  const message = state.messages.find((m) => m._id === data.messageId);
  if (message) {
    data.type === "like"
      ? (message.likes = data.likes || 0)
      : data.type === "dislike"
      ? message.dislikes
      : data.dislikes || 0;
  }

  // Update UI for this specific message
  const messageEl = document.querySelector(
    `[data-message-id="${data.messageId}"]`
  );
  if (messageEl) {
    if (data.type === "like") {
      messageEl.querySelector(".like-btn").textContent = `👍 ${
        data.likes || 0
      }`;
    } else if (data.type === "dislike") {
      messageEl.querySelector(".dislike-btn").textContent = `👎 ${
        data.dislikes || 0
      }`;
    }
  }
  render();
}

async function sendMessage(text) {
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
  } else {
    console.error("WebSocket is not open. Cannot send message.");
  }
}

function likeMessagePayload(messageId) {
  const payload = {
    type: "like",
    messageId: messageId,
  };
  socket.send(JSON.stringify(payload));
}

function dislikeMessagePayload(messageId) {
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
    state.pagination.totalPages = numOfPages;
    state.pagination.currentPage = page;

    // Replace the current messages with the new ones
    state.messages = messages;

    render();
    updatePaginationControls();
  } catch (e) {
    console.error(e);
  }
}

async function fetchReactionsForMessages(messages) {
  for (let message of messages) {
    const reactionsResp = await fetch(
      `${baseUrl}/api/v1/reactions/${message._id}`
    );
    if (reactionsResp.ok) {
      const { likes, dislikes } = await reactionsResp.json();
      message.likes = likes;
      message.dislikes = dislikes;
    } else {
      message.likes = 0;
      message.dislikes = 0;
    }
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

// Add an event listener to detect when the user scrolls to the bottom of the message container
messageContainer.addEventListener("scroll", async () => {
  const isAtBottom =
    messageContainer.scrollTop + messageContainer.clientHeight >=
    messageContainer.scrollHeight;

  if (
    isAtBottom &&
    state.pagination.currentPage < state.pagination.totalPages
  ) {
    await fetchAllMessagesForAllUsers(state.pagination.currentPage + 1);
  }
});
