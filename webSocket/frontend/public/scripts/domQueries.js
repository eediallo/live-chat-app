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
const loginBtn = document.getElementById("login-btn");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const msgEl = document.getElementById("msg");
const logoutBtn = document.querySelector("#logout-btn");
const nameInput = document.getElementById("name");
const registerBtn = document.getElementById("register-btn");
const errMsgEl = document.getElementById("errorMsg");

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
  loginBtn,
  emailInput,
  passwordInput,
  msgEl,
  logoutBtn,
  nameInput,
  registerBtn,
  errMsgEl
};
