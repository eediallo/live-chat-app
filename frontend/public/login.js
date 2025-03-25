const endpoint = "http://localhost:3000/api/v1/auth/login";

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
    const data = await response.json();
    if (response.ok) {
      alert("User logged in successfully");
      localStorage.setItem("token", data.token);
      window.location.href = "/api/v1/messages";
    } else {
      document.getElementById("msg").innerText = data.msg;
    }
  } catch (error) {
    console.error("An error occurred:", error);
    msgEl.innerText = data.msg;
  }
};

loginBtn.addEventListener("click", login);
