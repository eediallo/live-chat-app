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
  const { message, token } = JSON.parse(evt.data);
  const { name } = decodeToken(token);
  const payload = { message, name };
  console.log(payload);
  // Add the new message to the state and re-render the messages
  state.messages.push(payload);
  render(state.messages);
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
    const payload = {
      message,
      token,
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
  console.log(message);
  const messageSection = document.createElement("section");
  const textMessage = document.createElement("p");
  const timestamp = new Date().toLocaleString();
  textMessage.innerHTML = `<b id="user">${message.name}</b>: ${message.message} <span class="timestamp">(${timestamp})</span>`;
  messageSection.append(textMessage);
  return messageSection;
}

function render(messages) {
  console.log(messages);
  messageContainer.innerHTML = "";
  const listOfMessages = messages.map(createMessageCard);
  messageContainer.append(...listOfMessages);
}

function decodeToken(token) {
  const payloadBase64 = token.split(".")[1];
  const decodedPayload = atob(payloadBase64);
  return JSON.parse(decodedPayload);
}

function main() {
  if (!isAuthenticated()) {
    window.location.href = "/login.html";
  } else {
    console.log("nothing yet");
  }
}

window.onload = main;
