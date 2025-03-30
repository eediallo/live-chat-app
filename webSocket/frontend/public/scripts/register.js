import { setToken } from "./storage.js";

const endpoint = "http://localhost:3000/api/v1/auth/register";

const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const nameInput = document.getElementById("name");
const registerBtn = document.getElementById("register-btn");
const errMsg = document.getElementById("msg");

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

    if (response.ok) {
      alert("User registered successfully");
      setToken(data.token);
      window.location.href = "/login.html";
    } else {
      document.getElementById("msg").innerText = data.msg;
    }
  } catch (error) {
    console.error("Error occurred:", error);
    errMsg.innerText = data.msg;
  }
};

registerBtn.addEventListener("click", register);
