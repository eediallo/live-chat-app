import { isAuthenticated } from "./auth.js";
import { getToken } from "./data.js";
const sendMsgBtn = document.querySelector("#send-msg-btn");
const messageInput = document.querySelector("#message-input");
const logoutBtn = document.querySelector("#logout-btn");
console.log(logoutBtn);

const baseUrl = "http://localhost:3000";
const state = {
  messages: [],
};

async function fetchMessages() {
  try {
    const res = await fetch(`${baseUrl}/api/v1/messages/all`);
    if (!res.ok) {
      throw new Error(`Failed to fetch message: ${res.status}`);
    }

    const { messages } = await res.json();
    state.messages = messages; // update messages in state
  } catch (err) {
    console.error(err);
  }
}

async function sendMessage(message) {
  try {
    const token = getToken();
    const res = await fetch(`${baseUrl}/api/v1/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(message),
    });

    if (!res.ok) {
      throw new Error(`Failed to send message: ${res.status}`);
    }

    const newMessage = await res.json();
    state.messages.push(newMessage); // update messages in state
  } catch (err) {
    console.error(err);
  }
}

async function sendMessageHandler() {
  const message = messageInput.value;
  if (!message) {
    return;
  }
  await sendMessage({ message });
  console.log(state.messages);
  render(state.messages);
  messageInput.value = "";
}

sendMsgBtn.addEventListener("click", sendMessageHandler);

function createMessageCard(message) {
  const messageSection = document.createElement("section");
  const textMessage = document.createElement("p");
  textMessage.innerHTML = `<b id="user">${message.sender.name}</b>: ${message.message}`;
  messageSection.append(textMessage);
  return messageSection;
}

function render(messages) {
  const listOfMessages = messages.map(createMessageCard);
  document.querySelector("body").append(...listOfMessages);
}

async function loadMessages() {
  await fetchMessages();
  console.log(state.messages);
  render(state.messages);
}

document.addEventListener("DOMContentLoaded", () => {
  if (!isAuthenticated()) {
    window.location.href = "/login.html";
  } else {
    loadMessages();
  }
});
