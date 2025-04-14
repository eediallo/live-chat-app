import {
  emailInput,
  loginBtn,
  passwordInput,
  msgEl,
  logoutBtn,
  registerBtn,
  nameInput,
  errMsgEl,
} from "./domQueries.js";
import { state } from "./state.js";
import { getToken, setToken, removeToken } from "./storage.js";

const register = async (e) => {
  e.preventDefault();
  const name = nameInput.value;
  const email = emailInput.value;
  const password = passwordInput.value;
  const body = { name, email, password };

  try {
    const response = await fetch(`${state.baseUrl}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      // Display the error message from the server if available
      const errorMessage = data.msg || "Registration failed. Please try again.";
      errMsgEl.textContent = errorMessage;
      errMsgEl.style.color = "red";
      return;
    }

    errMsgEl.textContent = "Your account has been successfully created.";
    errMsgEl.style.color = "green";
    setToken(data.token);
    setTimeout(() => {
      window.location.href = "/login.html";
    }, 500);
  } catch (error) {
    console.error("Error occurred:", error);
    errMsgEl.textContent = "An unexpected error occurred. Please try again.";
  }
};

if (registerBtn) {
  registerBtn.addEventListener("click", register);
}

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
    const isExpired = payload.expiresIn * 1000 < Date.now();
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

// Redirect unauthenticated users from chat.html
if (window.location.pathname === "/chat.html") {
  redirectIfNotAuthenticated();
}

function logout() {
  removeToken();
  window.location.href = "/login.html";
}

if (logoutBtn) {
  logoutBtn.addEventListener("click", logout);
}

export { logout };
