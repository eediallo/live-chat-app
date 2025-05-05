import { socket } from "./state.js";

export async function likeMessagePayload(messageId) {
  const payload = {
    type: "like",
    messageId: messageId,
  };
  socket.send(JSON.stringify(payload));
}

export async function dislikeMessagePayload(messageId) {
  const payload = {
    type: "dislike",
    messageId: messageId,
  };
  socket.send(JSON.stringify(payload));
}

export async function deleteMessagePayload(messageId) {
  const payload = {
    type: "delete",
    messageId: messageId,
  };
  socket.send(JSON.stringify(payload));
}

export async function editMessagePayload(messageId, newText) {
  try {
    if (socket.readyState === WebSocket.OPEN) {
      const timestamp = new Date().toISOString();
      const payload = {
        type: "edit",
        newText,
        messageId,
        sender: {
          name: userInfo.name,
        },
        updatedAt: timestamp,
      };
      socket.send(JSON.stringify(payload));
      // Hide the error message if it is visible
      errorMsgEl.style.display = "none";
    } else {
      console.error("WebSocket is not open. Cannot send message.");
    }
  } catch (e) {
    if (e.code === 11000) {
      console.log("11000 error");
    }
  }
}
