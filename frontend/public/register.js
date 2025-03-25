const endpoint = "http://localhost:3000/api/v1/auth/register";

const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const nameInput = document.getElementById("name");
const registerBtn = document.getElementById("register-btn");

const register = async (e) => {
  e.preventDefault();
  const name = nameInput.value;
  const email = emailInput.value;
  const password = passwordInput.value;
  const body = { name, email, password };
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
    alert("User registered successfully");
    localStorage.setItem("token", data.token);
    window.location.href = "/login.html";
  } else {
    document.getElementById("msg").innerText = data.msg;
  }
};

registerBtn.addEventListener("click", register);
