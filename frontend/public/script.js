const userInput = document.querySelector("#user-name");
const textMessageInput = document.querySelector("#text-message");
const sendMsgBtn = document.querySelector("#send-msg-btn");

const baseUrl = "http://localhost:3000";

async function fetchMessages() {
  try {
    const res = await fetch(`${baseUrl}/api/v1/messages`);
    if (!res.ok) {
      throw new Error(`Failed to fetch message: ${res.status}`);
    }
    const { messages } = await res.json();
    return messages;
  } catch (err) {
    console.error(err);
  }
}

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
    const data = await resp.json();
    console.log(data);
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
  console.log(textMessage)
  const user = userInput.value.trim();
  console.log(user)
  console.log("sending message.....");
  await sendMessage(textMessage, user);
});

async function main() {
  const messages = await fetchMessages();
  render(messages);
}

window.onload = main;
