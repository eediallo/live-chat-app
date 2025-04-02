const sendMsgBtn = document.querySelector("#send-msg-btn");
const messageInput = document.querySelector("#message-input");
const nameInput = document.querySelector("#name-input");
const messageContainer = document.querySelector("#messages-container");
const errorMsgEl = document.querySelector("#errorMsg");

const socket = new WebSocket("ws://localhost:3000");
const baseUrl = "http://localhost:3000";

const state = {
  messages: [],
  username: null, // Add a username to the state
};

socket.onopen = () => {
  console.log("SOCKET OPENED");
};

socket.onmessage = (evt) => {
  const msg = JSON.parse(evt.data);
  state.messages.push(msg);
  render();
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
      text,
      sender: {
        username: username,
      },
      createdAt: timestamp,
    };
    socket.send(JSON.stringify(payload));

    try {
      const response = await fetch(`${baseUrl}/api/v1/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          text,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save message to the database");
      }

      console.log("Message saved to the database");
    } catch (error) {
      console.error("Error saving message to the database:", error);
    }
  } else {
    console.error("WebSocket is not open. Cannot send message.");
  }
}

function sendMessageHandler(e) {
  e.preventDefault();
  const message = messageInput.value;
  let sender = nameInput.value;

  if (state.username) {
    sender = state.username; // Use stored username
  }

  if (!message || !sender) {
    return;
  }

  sendMessage(sender, message);
  messageInput.value = "";

  // Hide name input after username is set
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

  li.append(sender, time, text);
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

async function main() {
  await fetchAllMessagesForAllUsers();
  render();
}

window.onload = main;
