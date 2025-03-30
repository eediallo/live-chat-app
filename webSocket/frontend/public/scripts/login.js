const endpoint = "http://localhost:3000/api/v1/auth/login";
import { setToken } from "./storage.js";

const loginBtn = document.getElementById("login-btn");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const msgEl = document.getElementById("msg");

const login = async (e) => {
  e.preventDefault();
  try {
    const email = emailInput.value;
    const password = passwordInput.value;
    const body = { email, password };
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    const { token } = await response.json();
    if (response.ok) {
      setToken(token);
      window.location.href = "/dashboard.html";
    } else {
      document.getElementById("msg").innerText = "Invalid email or password";
    }
  } catch (error) {
    console.error("An error occurred:", error);
    msgEl.innerText = "An error occurred. Please try again later.";
  }
};

loginBtn.addEventListener("click", login);
