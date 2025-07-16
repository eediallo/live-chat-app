// On page load, fetch the token from the backend and redirect to chat
window.onload = async function () {
  try {
    const response = await fetch(
      "http://localhost:3000/api/v1/auth/google/success",
      {
        credentials: "include",
      }
    );
    if (!response.ok) throw new Error("Failed to fetch token");
    const data = await response.json();
    if (data.token) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      window.location.href = "/chat.html";
    } else {
      throw new Error("No token received");
    }
  } catch (err) {
    document.body.innerHTML = `<h2>Authentication failed</h2><p>${err.message}</p>`;
  }
};
