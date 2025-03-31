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
  console.log("Message received from the server: ", evt.data);
};

socket.onerror = () => {
  console.log("SOMETHING WENT WRONG..");
};

socket.onclose = (evt) => {
  console.log("WEBSOCKET CLOSE...");
  console.log(evt.data);
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

    const { newMessage } = await res.json();
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

function main() {
  if (!isAuthenticated()) {
    window.location.href = "/login.html";
  } else {
    console.log("nothing yet");
  }
}

window.onload = main;
