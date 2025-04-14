import {
  emailInput,
  loginBtn,
  passwordInput,
  msgEl,
  logoutBtn,
} from "./domQueries.js";
import { state } from "./state.js";
import { getToken, setToken, removeToken } from "./storage.js";

const login = async (e) => {
  e.preventDefault();
  try {
    const email = emailInput.value;
    const password = passwordInput.value;
    const body = { email, password };
    const response = await fetch(`${state.baseUrl}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    const { token, msg } = await response.json();

    if (msg) {
      const errorMessage = msg || "login Failed. Please try again.";
      msgEl.textContent = errorMessage;
      msgEl.style.color = "red";
      return;
    }
    setToken(token);
    window.location.href = "/chat.html";
  } catch (error) {
    console.error("An error occurred:", error);
    msgEl.innerText = "An error occurred. Please try again later.";
  }
};

if (loginBtn) {
  loginBtn.addEventListener("click", login);
}

// check user authentication
export function isAuthenticated() {
  const token = getToken();
  if (!token) return false;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const isExpired = payload.exp * 1000 < Date.now();
    return !isExpired;
  } catch (err) {
    return false;
  }
}

export function redirectIfNotAuthenticated() {
  if (!isAuthenticated()) {
    window.location.href = "/login.html";
  }
}

function logout() {
  removeToken();
  window.location.href = "/login.html";
}

if (logoutBtn) {
  logoutBtn.addEventListener("click", logout);
}

export { logout };
