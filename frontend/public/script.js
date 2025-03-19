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

async function main() {
  const messages = await fetchMessages();
  console.log(messages);
  render(messages);
}

window.onload = main;
