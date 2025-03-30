import { isAuthenticated } from "./auth.js";
import { getToken } from "./storage.js";
const sendMsgBtn = document.querySelector("#send-msg-btn");
const messageInput = document.querySelector("#message-input");
const messageContainer = document.querySelector("#messages-container");

const baseUrl = "http://localhost:3000";
const state = {
  messages: [],
};

// async function fetchMessages() {
//   try {
//     const res = await fetch(`${baseUrl}/api/v1/messages/all`);
//     if (!res.ok) {
//       throw new Error(`Failed to fetch message: ${res.status}`);
//     }

//     const { messages } = await res.json();
//     // state.messages = messages; // update messages in state
//   } catch (err) {
//     console.error(err);
//   }
// }

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

async function sendMessageHandler(e) {
  e.preventDefault();
  const message = messageInput.value;
  if (!message) {
    return;
  }
  await sendMessage({ message });
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

function render() {
  messageContainer.innerHTML = "";
  const listOfMessages = state.messages.map(createMessageCard);
  messageContainer.append(...listOfMessages);
}

const keepFetchingMessages = async () => {
  try {
    const lastMessageTime =
      state.messages.length > 0
        ? state.messages[state.messages.length - 1].createdAt
        : null;
    const queryString = lastMessageTime ? `?since=${lastMessageTime}` : "";
    const url = `${baseUrl}/api/v1/messages/all${queryString}`;
    const rawResponse = await fetch(url);

    if (!rawResponse.ok) {
      throw new Error(`Failed to fetch messages: ${rawResponse.status}`);
    }
    const response = await rawResponse.json();
    state.messages.push(...response);
    console.log(state.messages);
    render(); // Only render new messages
  } catch (err) {
    console.error(err);
  } finally {
    setTimeout(keepFetchingMessages, 5000);
  }
};

function main() {
  if (!isAuthenticated()) {
    window.location.href = "/login.html";
  } else {
    keepFetchingMessages();
  }
}

window.onload = main;
