const sendMsgBtn = document.querySelector("#send-msg-btn");
const messageInput = document.querySelector("#message-input");
const messageContainer = document.querySelector("#messages-container");
const errorMsgEl = document.querySelector("#errorMsg");

const state = {
  messages: [],
  username: null,
};

function createAndAppendElToContainer(tag, className, content, container) {
  const element = createElement(tag, content);
  element.classList.add(className);
  container.append(element);
}

function createElement(tag, content) {
  const element = document.createElement(tag, content);
  element.textContent = content;
  return element;
}

const user = prompt("Please enter your name");
let socket = new WebSocket(`ws://localhost:3000?username=${user}`);
const baseUrl = "http://localhost:3000";

socket.onopen = async () => {
  state.username = user;
  console.log("SOCKET OPENED");

  // Fetch and display all previous messages
  await fetchAllMessagesForAllUsers();
  render();
};

socket.onmessage = (evt) => {
  const data = JSON.parse(evt.data);
  switch (data.type) {
    case "message":
      state.messages.push(data);
      render();
      break;

    case "like":
      // Update message reaction counts for likes
      updateMessageReactionsUI(data);
      break;

    case "dislike":
      // Update message reaction counts for dislikes
      updateMessageReactionsUI(data);
      break;

    case "join":
      // Display join message on the UI
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

  const time = createElement("i", ` ${timestamp}`);
  const sender = createElement("b", message.sender.username);
  const text = createElement("p", message.text);

  // Like Button
  const likeButton = createElement("button", `👍 ${message.likes || 0}`);
  likeButton.classList.add("like-btn");
  likeButton.addEventListener("click", () => {
    likeMessagePayload(message._id);
  });

  // Dislike Button
  const dislikeButton = createElement("button", `👎 ${message.dislikes || 0}`);
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

async function fetchAllMessagesForAllUsers() {
  try {
    const resp = await fetch(`${baseUrl}/api/v1/messages/all`);
    if (!resp.ok) {
      throw new Error(`Failed to fetch messages: ${resp.status}`);
    }
    const { messages } = await resp.json();

    // Fetch likes and dislikes for each message
    await fetchReactionsForMessages(messages);

    state.messages = messages;
    render(); // Render after updating all messages
  } catch (e) {
    console.log(e);
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
