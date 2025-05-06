import {
  messageContainer,
  prevPageBtn,
  nextPageBtn,
  pageInfo,
} from "./domQueries.js";
import { state } from "./state.js";
import { fetchAllMessagesForAllUsers, userInfo } from "./data.js";
import {
  likeMessagePayload,
  dislikeMessagePayload,
  deleteMessagePayload,
  editMessagePayload,
} from "./payloads.js";
import { createDOMElement, createAndAppendElToContainer } from "./helperFuncs.js";

//display  join message in a dialog box
export function showJoinMessageDialog(message) {
  const dialog = createDOMElement("dialog", message);

  const closeButton = createDOMElement("button", "Close");
  closeButton.addEventListener("click", () => {
    dialog.close();
    dialog.remove();
  });

  dialog.appendChild(closeButton);
  document.body.appendChild(dialog);
  dialog.showModal();
}

// Ensure the UI is updated with the correct likes and dislikes counts
export function updateMessageReactionsUI(data) {
  const message = state.messages.find((m) => m._id === data.messageId);
  if (message) {
    if (data.type === "like") {
      message.likes = data.likes || 0;
    } else if (data.type === "dislike") {
      message.dislikes = data.dislikes || 0;
    }
  }

  // Update UI for this specific message
  const messageEl = document.querySelector(
    `[data-message-id="${data.messageId}"]`
  );
  if (messageEl) {
    const likeButton = messageEl.querySelector(".like-btn");
    const dislikeButton = messageEl.querySelector(".dislike-btn");

    if (likeButton) {
      likeButton.textContent = `👍 ${message.likes || 0}`;
    }
    if (dislikeButton) {
      dislikeButton.textContent = `👎 ${message.dislikes || 0}`;
    }
  }
}

function createMessageCard(message) {
  // Ensure likedBy and dislikedBy are initialized
  message.likedBy = message.likedBy || [];
  message.dislikedBy = message.dislikedBy || [];

  const li = document.createElement("li");
  li.classList.add("message");
  li.setAttribute("data-message-id", message._id);
  li.setAttribute("data-user-id", message.sender.id);

  const timestamp = new Date(message.createdAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const time = createDOMElement("i", ` ${timestamp}`);
  if (message.updatedAt && message.updatedAt !== message.createdAt) {
    const editedIndicator = createDOMElement("span", " (edited)");
    editedIndicator.classList.add("edited-indicator");
    time.appendChild(editedIndicator);
  }

  const sender = createDOMElement("b", message.sender.name);
  const text = createDOMElement("p", message.message);
  
  const likeButton = createLikeButton(message);
  const dislikeButton = createDislikeButton(message);
  const editButton = createEditButton(message);
  const deleteButton = createDeleteButton(message);

  li.append(
    sender,
    time,
    text,
    likeButton,
    dislikeButton,
    editButton,
    deleteButton
  );
  return li;
}

function createLikeButton(message) {
  const likeButton = createDOMElement("button", `👍 ${message.likes || 0}`);
  likeButton.classList.add("like-btn");
  likeButton.addEventListener("click", () => {
    if (message.likedBy.includes(userInfo.name)) {
      message.likes -= 1;
      message.likedBy = message.likedBy.filter(
        (user) => user !== userInfo.name
      );
      likeMessagePayload(message._id); // Reset like on server
    } else {
      if (message.dislikedBy.includes(userInfo.name)) {
        message.dislikes -= 1;
        message.dislikedBy = message.dislikedBy.filter(
          (user) => user !== userInfo.name
        );
      }
      message.likes += 1;
      message.likedBy.push(userInfo.name);
      likeMessagePayload(message._id);
    }
    render();
  });
  return likeButton;
}

function createDeleteButton(message) {
  const deleteButton = createDOMElement("button", "🗑️ Delete");
  deleteButton.classList.add("delete-btn");
  deleteButton.addEventListener("click", () => {
    if (message.sender.id === userInfo.id) {
      const confirmDelete = confirm(
        "Are you sure you want to delete this message?"
      );
      if (confirmDelete) {
        // Remove the message from the state
        state.messages = state.messages.filter((m) => m._id !== message._id);
        // Update the server to delete the message
        deleteMessagePayload(message._id);
        render();
      }
    } else {
      alert("You can only delete your own messages.");
    }
  });
  return deleteButton;
}

function createEditButton(message) {
  const editButton = createDOMElement("button", "✏️ Edit");
  editButton.classList.add("edit-btn");
  editButton.addEventListener("click", () => {
    if (message.sender.id === userInfo.id) {
      const newText = prompt("Edit your message:", message.message);
      if (newText && newText.trim() !== "") {
        message.message = newText.trim();
        // Update the server with the edited message
        editMessagePayload(message._id, newText.trim());
        render();
      }
    } else {
      alert("You can only edit your own messages.");
    }
  });
  return editButton;
}

function createDislikeButton(message) {
  const dislikeButton = createDOMElement(
    "button",
    `👎 ${message.dislikes || 0}`
  );
  dislikeButton.classList.add("dislike-btn");
  dislikeButton.addEventListener("click", () => {
    if (message.dislikedBy.includes(userInfo.name)) {
      message.dislikes -= 1;
      message.dislikedBy = message.dislikedBy.filter(
        (user) => user !== userInfo.name
      );
      dislikeMessagePayload(message._id); // Reset dislike on server
    } else {
      if (message.likedBy.includes(userInfo.name)) {
        message.likes -= 1;
        message.likedBy = message.likedBy.filter(
          (user) => user !== userInfo.name
        );
      }
      message.dislikes += 1;
      message.dislikedBy.push(userInfo.name);
      dislikeMessagePayload(message._id);
    }
    render();
  });
  return dislikeButton;
}


// render messages
export function render() {
  messageContainer.innerHTML = "";

  let currentDate = null;
  state.messages.forEach((message) => {
    const messageDate = new Date(message.createdAt).toLocaleDateString();

    if (messageDate !== currentDate) {
      currentDate = messageDate;
      createAndAppendElToContainer(
        "div",
        "date-header",
        currentDate,
        messageContainer
      );
    }

    const messageCard = createMessageCard(message);
    messageContainer.append(messageCard);
  });
}


// pagination control
export function updatePaginationControls() {
  pageInfo.textContent = `Page ${state.pagination.currentPage} of ${state.pagination.totalPages}`;
  prevPageBtn.disabled = state.pagination.currentPage === 1;
  nextPageBtn.disabled =
    state.pagination.currentPage === state.pagination.totalPages;
}


// previous button event
if (prevPageBtn) {
  prevPageBtn.addEventListener("click", () => {
    if (state.isSocket && state.pagination.currentPage > 1) {
      fetchAllMessagesForAllUsers(state.pagination.currentPage - 1);
    }
  });
}


// next button event
if (nextPageBtn) {
  nextPageBtn.addEventListener("click", () => {
    if (
      state.isSocket &&
      state.pagination.currentPage < state.pagination.totalPages
    ) {
      fetchAllMessagesForAllUsers(state.pagination.currentPage + 1);
    }
  });
}
