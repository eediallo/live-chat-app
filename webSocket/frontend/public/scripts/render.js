import {
  messageContainer,
  prevPageBtn,
  nextPageBtn,
  pageInfo,
} from "./domQueries.js";
import { state } from "./state.js";
import { fetchAllMessagesForAllUsers, userInfo } from "./data.js";
import { likeMessagePayload, dislikeMessagePayload } from "./dashboard.js";

function createAndAppendElToContainer(tag, className, content, container) {
  const element = createDOMElement(tag, content);
  element.classList.add(className);
  container.append(element);
}

export function createDOMElement(tag, content) {
  const element = document.createElement(tag, content);
  element.textContent = content;
  return element;
}

function createMessageCard(message) {
  const li = document.createElement("li");
  li.classList.add("message");
  li.setAttribute("data-message-id", message._id);
  li.setAttribute("data-user-id", message.sender.id);

  const timestamp = new Date(message.createdAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const time = createDOMElement("i", ` ${timestamp}`);
  const sender = createDOMElement("b", message.sender.name);
  const text = createDOMElement("p", message.message);

  // Like Button
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

  // Dislike Button
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

  li.append(sender, time, text, likeButton, dislikeButton);
  return li;
}

export function render() {
  messageContainer.innerHTML = "";

  let currentDate = null;
  state.messages.forEach((message) => {
    //console.log(message, "message in render");
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

export function updatePaginationControls() {
  pageInfo.textContent = `Page ${state.pagination.currentPage} of ${state.pagination.totalPages}`;
  prevPageBtn.disabled = state.pagination.currentPage === 1;
  nextPageBtn.disabled =
    state.pagination.currentPage === state.pagination.totalPages;
}

prevPageBtn.addEventListener("click", () => {
  if (state.isSocket && state.pagination.currentPage > 1) {
    fetchAllMessagesForAllUsers(state.pagination.currentPage - 1);
  }
});

nextPageBtn.addEventListener("click", () => {
  if (
    state.isSocket &&
    state.pagination.currentPage < state.pagination.totalPages
  ) {
    fetchAllMessagesForAllUsers(state.pagination.currentPage + 1);
  }
});
