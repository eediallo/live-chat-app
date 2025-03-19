const userInput = document.querySelector("#user-name");
const textMessageInput = document.querySelector("#text-message");
const sendMsgBtn = document.querySelector("#send-msg-btn");

const baseUrl = "http://localhost:3000";

const state = {
  messages: [],
};

async function fetchMessages() {
  try {
    const res = await fetch(`${baseUrl}/api/v1/messages`);
    if (!res.ok) {
      throw new Error(`Failed to fetch message: ${res.status}`);
    }

    const { messages } = await res.json();
    state.messages = messages; // update messages in state
  } catch (err) {
    console.error(err);
  }
}

const keepFetchingMessages = async () => {
  const lastMessageTime =
    state.messages.length > 0
      ? state.messages[state.messages.length - 1].timestamp
      : null;
  const queryString = lastMessageTime ? `?since=${lastMessageTime}` : "";
  const url = `${server}/messages${queryString}`;
  const rawResponse = await fetch(url);
  const response = await rawResponse.json();
  state.messages.push(...response);
  render();
  setTimeout(keepFetchingMessages, 100);
};

async function sendMessage(textMessage, userName) {
  try {
    const resp = await fetch(baseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: textMessage, user: userName }),
    });
    if (!resp.ok) {
      throw new Error(`Failed to send message: ${resp.status}`);
    }
  } catch (err) {
    console.error(err.msg);
  }
}

function createMessageCard(message) {
  const messageSection = document.createElement("section");
  const textMessage = document.createElement("p");
  textMessage.innerHTML = `<b id="user">${message.user}</b>: ${message.text}`;
  messageSection.append(textMessage);
  return messageSection;
}

function render(messages) {
  const listOfMessages = messages.map(createMessageCard);
  document.querySelector("body").append(...listOfMessages);
}

//send message event
sendMsgBtn.addEventListener("click", async (e) => {
  e.preventDefault();
  const textMessage = textMessageInput.value.trim();
  const user = userInput.value.trim();
  await sendMessage(textMessage, user);
  (textMessageInput.value = ""), (userInput.value = "");
});

async function main() {
  await fetchMessages();
  render(state.messages);
}

window.onload = main;
