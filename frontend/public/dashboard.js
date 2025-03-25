import { isAuthenticated } from "./auth.js";

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