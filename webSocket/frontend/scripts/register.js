document.getElementById("google-register-btn").onclick = function () {
  window.location.href = "http://localhost:3000/api/v1/auth/google";;
};
// Handle Google OAuth redirect
if (
  window.location.pathname === "/register.html" &&
  window.location.search.includes("google_oauth")
) {
  fetch("/api/v1/auth/google/success", { credentials: "include" })
    .then((res) => res.json())
    .then((data) => {
      if (data.token) {
        localStorage.setItem("token", data.token);
        window.location.href = "/chat.html";
      }
    });
}
