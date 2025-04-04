const sendMsgBtn = document.querySelector("#send-msg-btn");
const messageInput = document.querySelector("#message-input");
const messageContainer = document.querySelector("#messages-container");
const errorMsgEl = document.querySelector("#errorMsg");

const state = {
  messages: [],
  username: null,
};

const user = prompt("Please enter your name");
let socket = new WebSocket(`ws://localhost:3000?username=${user}`);
const baseUrl = "http://localhost:3000";

socket.onopen = () => {
  state.username = user;
  console.log("SOCKET OPENED");
};

socket.onmessage = (evt) => {
  const msg = JSON.parse(evt.data);
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

async function sendMessage(text) {
  state.username = user;
  if (socket.readyState === WebSocket.OPEN) {
    const timestamp = new Date().toISOString();
    const payload = {
      type: "message",
      text,
      sender: {
        username: state.username,
      },
      createdAt: timestamp,
    };
    console.log(payload);
    socket.send(JSON.stringify(payload));
  } else {
    console.error("WebSocket is not open. Cannot send message.");
  }
}

function sendMessageHandler(e) {
  e.preventDefault();
  const message = messageInput.value;
  sendMessage(message);
  messageInput.value = "";
}

sendMsgBtn.addEventListener("click", sendMessageHandler);

function createMessageCard(message) {
  const li = document.createElement("li");
  li.classList.add("message");
  li.setAttribute("data-message-id", message._id);
  li.setAttribute("data-user-id", message.sender.id);

  const timestamp = new Date(message.createdAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const time = document.createElement("i");
  time.textContent = ` ${timestamp}`;

  const sender = document.createElement("b");
  sender.textContent = message.sender.username;

  const text = document.createElement("p");
  text.textContent = message.text;

  // Like Button
  const likeButton = document.createElement("button");
  likeButton.textContent = `👍 ${message.likes || 0}`;
  likeButton.classList.add("like-btn");
  likeButton.addEventListener("click", async () => {
    const newLikes = await likeMessage(message._id, message.sender.id);
    likeButton.textContent = `👍 ${newLikes}`; // Update UI
  });

  // Dislike Button
  const dislikeButton = document.createElement("button");
  dislikeButton.textContent = `👎 ${message.dislikes || 0}`;
  dislikeButton.classList.add("dislike-btn");
  dislikeButton.addEventListener("click", async () => {
    const newDislikes = await dislikeMessage(message._id, message.sender.id);
    dislikeButton.textContent = `👎 ${newDislikes}`; // Update UI
  });

  li.append(sender, time, text, likeButton, dislikeButton);
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

async function fetchAllMessagesForAllUsers() {
  try {
    const resp = await fetch(`${baseUrl}/api/v1/messages/all`);
    if (!resp.ok) {
      throw new Error(`Failed to fetch messages: ${resp.status}`);
    }
    const { messages } = await resp.json();

    // Fetch likes and dislikes for each message
    for (let message of messages) {
      const reactionsResp = await fetch(
        `${baseUrl}/api/v1/reactions/${message._id}`
      );
      if (reactionsResp.ok) {
        const { likes, dislikes } = await reactionsResp.json();
        message.likes = likes;
        message.dislikes = dislikes;
      } else {
        message.likes = 0;
        message.dislikes = 0;
      }
    }

    state.messages = messages;
    render(); // Render after updating all messages
  } catch (e) {
    console.log(e);
  }
}

async function fetchLikesAndDislikes(messageId) {
  try {
    const response = await fetch(`${baseUrl}/api/v1/reactions/${messageId}`);
    if (!response.ok) {
      throw new Error("Failed to fetch reactions");
    }
    return await response.json(); // Should return { likes: number, dislikes: number }
  } catch (e) {
    console.error("Error fetching likes and dislikes", e);
    return { likes: 0, dislikes: 0 }; // Default fallback
  }
}

function likeMessagePayload(messageId) {
  const payload = {
    type: "like",
    messageId: messageId,
  };
  socket.send(JSON.stringify(payload));
}

function dislikeMessagePayload(messageId) {
  const payload = {
    type: "dislike",
    messageId: messageId,
  };
  socket.send(JSON.stringify(payload));
}

async function likeMessage(messageId, userId) {
  try {
    const response = await fetch(
      `${baseUrl}/api/v1/reactions/${messageId}/${userId}/like`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      }
    );

    if (!response.ok) throw new Error("Failed to like message");

    const { likes } = await fetchLikesAndDislikes(messageId); // Get updated count
    return likes;
  } catch (e) {
    console.error("Error liking message", e);
    return 0; // Return default if an error occurs
  }
}

async function dislikeMessage(messageId, userId) {
  try {
    const response = await fetch(
      `${baseUrl}/api/v1/reactions/${messageId}/${userId}/dislike/`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      }
    );

    if (!response.ok) throw new Error("Failed to dislike message");

    const { dislikes } = await fetchLikesAndDislikes(messageId); // Get updated count
    return dislikes;
  } catch (e) {
    console.error("Error disliking message", e);
    return 0;
  }
}

async function updateMessageReactions(messageId) {
  try {
    const response = await fetch(`${baseUrl}/api/v1/reactions/${messageId}`);

    if (!response.ok) {
      throw new Error("Failed to fetch reaction counts");
    }

    const { likes, dislikes } = await response.json();

    // Find the message in the UI and update the like/dislike counts
    const messageEl = document.querySelector(
      `[data-message-id="${messageId}"]`
    );
    if (messageEl) {
      messageEl.querySelector(".like-btn").textContent = `👍 ${likes}`;
      messageEl.querySelector(".dislike-btn").textContent = `👎 ${dislikes}`;
    }
  } catch (error) {
    console.error("Error updating reactions:", error);
  }
}

async function main() {
  await fetchAllMessagesForAllUsers();
  render();
}

window.onload = main;
