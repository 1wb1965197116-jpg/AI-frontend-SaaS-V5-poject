const API_URL = "https://ai-saas-v5-project.onrender.com";

const chatForm = document.getElementById("chat-form");
const userInputEl = document.getElementById("user-input");
const chatBox = document.getElementById("chat-box");

function appendMessage(sender, message) {
  const msgEl = document.createElement("div");
  msgEl.classList.add("message", sender);
  msgEl.textContent = message;
  chatBox.appendChild(msgEl);
  chatBox.scrollTop = chatBox.scrollHeight;
}

chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const userMessage = userInputEl.value.trim();
  if (!userMessage) return;

  appendMessage("user", userMessage);
  userInputEl.value = "";

  try {
    const response = await fetch(`${API_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: userMessage })
    });
    const data = await response.json();
    appendMessage("bot", data.reply || "No reply from backend.");
  } catch (err) {
    console.error("Backend error:", err);
    appendMessage("bot", "Error: Could not connect to backend.");
  }
});

window.addEventListener("load", async () => {
  try {
    const res = await fetch(`${API_URL}/api/test`);
    const data = await res.json();
    console.log("Backend test:", data);
  } catch (err) {
    console.error("Backend test failed:", err);
  }
});
