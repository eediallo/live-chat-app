const sendMsgBtn = document.querySelector("#send-msg-btn");
const messageInput = document.querySelector("#message-input");
const nameInput = document.querySelector("#name-input");
const messageContainer = document.querySelector("#messages-container");
const errorMsgEl = document.querySelector("#errorMsg");

const state = {
  messages: [],
  username: null,
};

const socket = new WebSocket("ws://localhost:3000", [], {
  headers: { username: state.username },
});
const baseUrl = "http://localhost:3000";

socket.onopen = () => {
  console.log("SOCKET OPENED");
};

socket.onmessage = (evt) => {
  const msg = JSON.parse(evt.data);
  console.log(msg, '=======>')
  console.log(msg.type);
  if (msg.type === "like" || msg.type === "dislike" || msg.type === "message") {
    console.log(state.messages, "messages====>");
    const index = state.messages.findIndex(
      (message) => message._id === msg._id
    );
    if (index !== -1) {
      state.messages[index] = msg;
    } else {
      state.messages.push(msg);
    }
    console.log(state.messages);
    render();
  }
};

socket.onerror = () => {
  console.log("SOMETHING WENT WRONG..");
};

socket.onclose = (evt) => {
  console.log("WEBSOCKET CLOSE...");
  console.log(evt.data);
};

async function sendMessage(username, text) {
  if (socket.readyState === WebSocket.OPEN) {
    const timestamp = new Date().toISOString();
    const payload = {
      type: "message",
      text,
      sender: {
        username: username,
      },
      createdAt: timestamp,
    };
    socket.send(JSON.stringify(payload));
  } else {
    console.error("WebSocket is not open. Cannot send message.");
  }
}

function sendMessageHandler(e) {
  e.preventDefault();
  const message = messageInput.value;
  let sender = nameInput.value;

  if (state.username) {
    sender = state.username;
  }

  if (!message || !sender) {
    return;
  }

  sendMessage(sender, message);
  messageInput.value = "";

  if (!state.username) {
    state.username = sender;
    nameInput.style.display = "none";
  }
}

sendMsgBtn.addEventListener("click", sendMessageHandler);

function createMessageCard(message) {
  const li = document.createElement("li");
  li.classList.add("message");

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

  const likeButton = document.createElement("button");
  likeButton.textContent = `👍 ${message.likes || 0}`;
  likeButton.addEventListener("click", () => likeMessage(message._id));

  const dislikeButton = document.createElement("button");
  dislikeButton.textContent = `👎 ${message.dislikes || 0}`;
  dislikeButton.addEventListener("click", () => dislikeMessage(message._id));

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
    state.messages = messages;
  } catch (e) {
    console.log(e);
  }
}

function likeMessage(messageId) {
  const payload = {
    type: "like",
    messageId: messageId,
    sender: {
      username: state.username,
    },
  };
  socket.send(JSON.stringify(payload));
}

function dislikeMessage(messageId) {
  const payload = {
    type: "dislike",
    messageId: messageId,
    sender: {
      username: state.username,
    },
  };
  socket.send(JSON.stringify(payload));
}

async function main() {
  await fetchAllMessagesForAllUsers();
  render();
}

window.onload = main;
