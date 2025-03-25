const endpoint = "http://localhost:3000/api/v1/auth/login";

const loginBtn = document.getElementById("login-btn");
console.log(loginBtn);
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");

const login = async (e) => {
  e.preventDefault();
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
  console.log(data);
  if (response.ok) {
    alert("User logged in successfully");
    localStorage.setItem("token", data.token);
    window.location.href = "/api/v1/messages";
  } else {
    document.getElementById("msg").innerText = data.msg;
  }
};

loginBtn.addEventListener("click", login);
