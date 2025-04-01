import { isAuthenticated } from "./auth.js";
import { getToken } from "./storage.js";
const sendMsgBtn = document.querySelector("#send-msg-btn");
const messageInput = document.querySelector("#message-input");
const messageContainer = document.querySelector("#messages-container");

const socket = new WebSocket("ws://localhost:3000");
const baseUrl = "http://localhost:3000";
const state = {
  messages: [],
};

socket.onopen = () => {
  console.log("SOCKET OPENED");
};

socket.onmessage = (evt) => {
  const msg = JSON.parse(evt.data);
  // Add the new message to the state and re-render the messages
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

async function sendMessage(message) {
  if (socket.readyState === WebSocket.OPEN) {
    const token = getToken();
    const sender = decodeToken(token);
    const timestamp = new Date().toISOString();
    const payload = {
      message,
      sender,
      createdAt: timestamp, // Ensure createdAt is set to a valid ISO string
    };
    socket.send(JSON.stringify(payload));

    try {
      // Save the message to the database
      const response = await fetch(`${baseUrl}/api/v1/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message }),
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
  if (!message) {
    return;
  }
  sendMessage(message);
  messageInput.value = "";
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

  const name = document.createElement("b");
  name.textContent = message.sender.name;

  const text = document.createElement("p");
  text.textContent = message.message;

  li.append(name, time, text);
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

function decodeToken(token) {
  const payloadBase64 = token.split(".")[1];
  const decodedPayload = atob(payloadBase64);
  return JSON.parse(decodedPayload);
}

async function fetchAllMessagesForAllUsers() {
  try {
    const resp = await fetch(`${baseUrl}/api/v1/messages/all`);
    if (!resp.ok) {
      throw new Error(`Failed to fetch messages:`, resp.status);
    }
    const { messages } = await resp.json();
    state.messages = messages;
  } catch (e) {
    console.error(e);
  }
}

async function main() {
  if (!isAuthenticated()) {
    window.location.href = "/login.html";
  } else {
    await fetchAllMessagesForAllUsers();
    render();
  }
}

window.onload = main;
