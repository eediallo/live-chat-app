const sendMsgBtn = document.querySelector("#send-msg-btn");
const messageInput = document.querySelector("#message-input");
const messageContainer = document.querySelector("#messages-container");
const errorMsgEl = document.querySelector("#errorMsg");
const prevPageBtn = document.querySelector("#prev-page-btn");
const nextPageBtn = document.querySelector("#next-page-btn");
const pageInfo = document.querySelector("#page-info");
const usernameEl = document.querySelector("#username");
const paginationControlsEl = document.querySelector("#pagination-controls");
const onlineUsersEl = document.querySelector("#online-users");
const totalMembersEl = document.querySelector("#total-members");

export {
  sendMsgBtn,
  messageInput,
  messageContainer,
  errorMsgEl,
  prevPageBtn,
  nextPageBtn,
  pageInfo,
  usernameEl,
  paginationControlsEl,
  onlineUsersEl,
  totalMembersEl,
};
