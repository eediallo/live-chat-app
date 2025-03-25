import { removeToken } from "./data.js";
const logoutBtn = document.querySelector("#logout-btn");

function logout() {
  removeToken();
  window.location.href = "/login.html";
}

logoutBtn.addEventListener("click", logout);

export { logout };
