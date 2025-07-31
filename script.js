// Setup default admin if none exists
if (!localStorage.getItem("users")) {
  const defaultUsers = [
    { username: "admin", password: "admin123", role: "admin" }
  ];
  localStorage.setItem("users", JSON.stringify(defaultUsers));
}
function login() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;
  const users = JSON.parse(localStorage.getItem("users")) || [];
  const user = users.find(u => u.username === username && u.password === password);
  if (user) {
    localStorage.setItem("currentUser", JSON.stringify(user));
    window.location.href = "dashboard.html";
  } else {
    document.getElementById("login-error").innerText = "Invalid username or password";
  }
}
