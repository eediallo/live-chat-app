import { setToken } from "./storage.js";

const endpoint = "http://localhost:3000/api/v1/auth/register";

const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const nameInput = document.getElementById("name");
const registerBtn = document.getElementById("register-btn");
const errMsgEl = document.getElementById("errorMsg");

const register = async (e) => {
  e.preventDefault();
  const name = nameInput.value;
  const email = emailInput.value;
  const password = passwordInput.value;
  const body = { name, email, password };

  try {
    const response = await fetch(endpoint, {
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

registerBtn.addEventListener("click", register);
