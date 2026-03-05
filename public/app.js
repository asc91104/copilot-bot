const chatBox = document.getElementById("chatBox");
const chatForm = document.getElementById("chatForm");
const messageInput = document.getElementById("messageInput");
const statusText = document.getElementById("status");
const startBtn = document.getElementById("startBtn");
const endBtn = document.getElementById("endBtn");

let userId = localStorage.getItem("copilotBotUserId") || "";

function addMessage(role, text) {
  const el = document.createElement("div");
  el.className = `msg ${role}`;
  el.textContent = `${role === "user" ? "你" : "Bot"}: ${text}`;
  chatBox.appendChild(el);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function setStatus(text) {
  statusText.textContent = text;
}

async function post(path, body) {
  const resp = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await resp.json();
  if (!resp.ok) {
    throw new Error(data.error || "Request failed");
  }

  return data;
}

async function handleMessage(input) {
  addMessage("user", input);
  setStatus("處理中...");

  try {
    const data = await post("/api/chat", { userId, message: input });

    if (data.userId) {
      userId = data.userId;
      localStorage.setItem("copilotBotUserId", userId);
    }

    addMessage("bot", data.reply);
    setStatus(data.sessionId ? `Session: ${data.sessionId}` : "完成");
  } catch (error) {
    addMessage("bot", `錯誤: ${error.message}`);
    setStatus("失敗");
  }
}

chatForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const text = messageInput.value.trim();
  if (!text) {
    return;
  }

  messageInput.value = "";
  await handleMessage(text);
});

startBtn.addEventListener("click", async () => {
  try {
    const data = await post("/api/start", { userId });
    userId = data.userId;
    localStorage.setItem("copilotBotUserId", userId);
    addMessage("bot", data.reply);
    setStatus(`Session: ${data.sessionId}`);
  } catch (error) {
    addMessage("bot", `錯誤: ${error.message}`);
    setStatus("失敗");
  }
});

endBtn.addEventListener("click", async () => {
  try {
    const data = await post("/api/end", { userId });
    addMessage("bot", data.reply);
    setStatus("Session closed");
  } catch (error) {
    addMessage("bot", `錯誤: ${error.message}`);
    setStatus("失敗");
  }
});

addMessage("bot", "輸入 /start 開始新會話，或直接按下 /start 按鈕。");
setStatus("就緒");
