const API_URL = "http://localhost:5678/api";

async function handleLogin(email, password) {
  try {
    const response = await fetch(`${API_URL}/users/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (response.ok) {
      const data = await response.json();
      localStorage.setItem("authToken", data.token);
      localStorage.setItem("userId", data.userId);
      return { success: true };
    } else {
      return { success: false, error: "Invalid credentials" };
    }
  } catch (error) {
    console.error("Login error:", error);
    return { success: false, error: "Network error" };
  }
}

function showError(message) {
  const errorMessage = document.getElementById("error-message");
  if (errorMessage) {
    errorMessage.textContent = message;
    errorMessage.style.display = "block";
  }
}

function clearForm() {
  document.getElementById("email").value = "";
  document.getElementById("password").value = "";
}

document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("login-form");

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    if (!email || !password) {
      showError("Please fill in all fields");
      return;
    }

    const result = await handleLogin(email, password);
    
    if (result.success) {
      window.location.href = "index.html";
    } else {
      showError(result.error);
      clearForm();
    }
  });
});
