// script.js — clean and ready to use

// Backend API URL
const API_URL = "https://ai-saas-v5-project.onrender.com";

// Grab DOM elements
const chatForm = document.getElementById("chat-form");
const userInputEl = document.getElementById("user-input");
const chatBox = document.getElementById("chat-box");

// Helper to append messages to chat box
function appendMessage(sender, message) {
  const msgEl = document.createElement("div");
  msgEl.classList.add("message", sender);
  msgEl.textContent = message;
  chatBox.appendChild(msgEl);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// Handle form submission
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const userMessage = userInputEl.value.trim();
  if (!userMessage) return;

  // Show user message
  appendMessage("user", userMessage);
  userInputEl.value = "";

  try {
    // Send message to backend
    const response = await fetch(`${API_URL}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ message: userMessage })
    });

    if (!response.ok) throw new Error("Network response was not ok");

    const data = await response.json();
    appendMessage("bot", data.reply || "No reply from backend.");

  } catch (err) {
    console.error("Error connecting to backend:", err);
    appendMessage("bot", "Error: Could not connect to backend.");
  }
});

// Optional: Test backend connectivity on load
window.addEventListener("load", async () => {
  try {
    const res = await fetch(`${API_URL}/api/test`);
    const data = await res.json();
    console.log("Backend test:", data);
  } catch (err) {
    console.error("Backend test failed:", err);
  }
});
