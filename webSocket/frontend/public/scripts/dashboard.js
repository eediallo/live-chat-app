import { isAuthenticated } from "./auth.js";
import { getToken } from "./storage.js";
const sendMsgBtn = document.querySelector("#send-msg-btn");
const messageInput = document.querySelector("#message-input");
const messageContainer = document.querySelector("#messages-container");

const socket = new WebSocket("ws://localhost:3000");
const state = {
  messages: [],
};

socket.onopen = () => {
  console.log("SOCKET OPENED");
};

socket.onmessage = (evt) => {
  const msg = JSON.parse(evt.data);
  console.log("Message received from the server: ", msg);
  const { name } = decodeToken(msg.token);

  // Add the new message to the state and re-render the messages
  state.messages.push(msg);
  render(state.messages);
};

socket.onerror = () => {
  console.log("SOMETHING WENT WRONG..");
};

socket.onclose = (evt) => {
  console.log("WEBSOCKET CLOSE...");
  console.log(evt.data);
};

function sendMessage(message) {
  if (socket.readyState === WebSocket.OPEN) {
    const token = getToken();
    const payload = {
      message,
      token,
    };
    socket.send(JSON.stringify(payload));
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
  const messageSection = document.createElement("section");
  const textMessage = document.createElement("p");
  const timestamp = new Date(message.createdAt).toLocaleString();
  const senderName = message.sender ? message.sender.name : "Unknown";
  textMessage.innerHTML = `<b id="user">${senderName}</b>: ${message.message} <span class="timestamp">(${timestamp})</span>`;
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
