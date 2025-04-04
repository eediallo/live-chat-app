const sendMsgBtn = document.querySelector("#send-msg-btn");
const messageInput = document.querySelector("#message-input");
const messageContainer = document.querySelector("#messages-container");
const errorMsgEl = document.querySelector("#errorMsg");

const state = {
  messages: [],
  username: null,
};

const user = prompt("Please enter your name");
let socket = new WebSocket(`ws://localhost:3000?username=${user}`);
const baseUrl = "http://localhost:3000";

socket.onopen = () => {
  state.username = user;
  console.log("SOCKET OPENED");
};

socket.onmessage = (evt) => {
  const data = JSON.parse(evt.data);
  console.log(data, "======>from server");

  switch (data.type) {
    case "message":
      state.messages.push(data);
      render();
      break;

    case "like":
      // Update message reaction counts for likes
      const likedMessage = state.messages.find((m) => m._id === data.messageId);
      if (likedMessage) {
        likedMessage.likes = data.likes || 0;
      }

      // Update UI for this specific message
      const likedMessageEl = document.querySelector(
        `[data-message-id="${data.messageId}"]`
      );
      if (likedMessageEl) {
        likedMessageEl.querySelector(".like-btn").textContent = `👍 ${
          data.likes || 0
        }`;
      }
      render();
      break;

    case "dislike":
      // Update message reaction counts for dislikes
      const dislikedMessage = state.messages.find(
        (m) => m._id === data.messageId
      );
      if (dislikedMessage) {
        dislikedMessage.dislikes = data.dislikes || 0;
      }

      // Update UI for this specific message
      const dislikedMessageEl = document.querySelector(
        `[data-message-id="${data.messageId}"]`
      );
      if (dislikedMessageEl) {
        dislikedMessageEl.querySelector(".dislike-btn").textContent = `👎 ${
          data.dislikes || 0
        }`;
      }
      render();
      break;

    default:
      console.warn("Unknown message type:", data.type);
  }
};

socket.onerror = () => {
  console.log("SOMETHING WENT WRONG..");
};

socket.onclose = (evt) => {
  console.log("WEBSOCKET CLOSE...");
  console.log(evt.data);
};

async function sendMessage(text) {
  state.username = user;
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
    console.log(payload);
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

  const time = document.createElement("i");
  time.textContent = ` ${timestamp}`;

  const sender = document.createElement("b");
  sender.textContent = message.sender.username;

  const text = document.createElement("p");
  text.textContent = message.text;

  // Like Button
  const likeButton = document.createElement("button");
  likeButton.textContent = `👍 ${message.likes || 0}`;
  likeButton.classList.add("like-btn");
  likeButton.addEventListener("click", () => {
    likeMessagePayload(message._id);
  });

  // Dislike Button
  const dislikeButton = document.createElement("button");
  dislikeButton.textContent = `👎 ${message.dislikes || 0}`;
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
      const dateHeader = document.createElement("div");
      dateHeader.classList.add("date-header");
      dateHeader.textContent = currentDate;
      messageContainer.append(dateHeader);
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

async function main() {
  await fetchAllMessagesForAllUsers();
  console.log(state.messages);
  render();
}

window.onload = main;
