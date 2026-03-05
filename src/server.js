import "dotenv/config";
import express from "express";
import { randomUUID } from "node:crypto";
import { CopilotClient } from "@github/copilot-sdk";

const app = express();
const port = Number(process.env.PORT || 3000);

app.use(express.json());
app.use(express.static("public"));

let client;
let clientStarted = false;

const sessions = new Map();

async function ensureClient() {
  if (!client) {
    client = new CopilotClient({
      githubToken: process.env.GITHUB_TOKEN || undefined,
    });
  }

  if (!clientStarted) {
    await client.start();
    clientStarted = true;
  }

  return client;
}

function getUserSession(userId) {
  return sessions.get(userId);
}

async function startSession(userId) {
  await ensureClient();

  const current = getUserSession(userId);
  if (current) {
    await current.destroy();
  }

  const session = await client.createSession({
    model: "claude-haiku-4.5",
  });

  sessions.set(userId, session);
  return session;
}

async function endSession(userId) {
  const current = getUserSession(userId);
  if (!current) {
    return false;
  }

  await current.destroy();
  sessions.delete(userId);
  return true;
}

app.post("/api/start", async (req, res) => {
  try {
    const userId = req.body.userId || randomUUID();
    const session = await startSession(userId);
    res.json({
      userId,
      sessionId: session.sessionId,
      reply: `Session started: ${session.sessionId}`,
    });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to start session",
    });
  }
});

app.post("/api/end", async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    const ended = await endSession(userId);
    if (!ended) {
      return res.status(400).json({ error: "No active session" });
    }

    res.json({ reply: "Session ended" });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to end session",
    });
  }
});

app.post("/api/chat", async (req, res) => {
  try {
    const { userId, message } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "message is required" });
    }

    const trimmed = message.trim();

    if (trimmed === "/start") {
      const session = await startSession(userId);
      return res.json({
        userId,
        sessionId: session.sessionId,
        reply: `Session started: ${session.sessionId}`,
      });
    }

    if (trimmed === "/end") {
      const ended = await endSession(userId);
      if (!ended) {
        return res.status(400).json({ error: "No active session" });
      }
      return res.json({ reply: "Session ended" });
    }

    const session = getUserSession(userId);
    if (!session) {
      return res.status(400).json({
        error: "No active session. Send /start first.",
      });
    }

    const response = await session.sendAndWait({ prompt: trimmed }, 120000);

    res.json({
      reply: response?.data?.content || "No response",
      sessionId: session.sessionId,
    });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : "Chat failed",
    });
  }
});

app.get("/health", (_, res) => {
  res.json({ ok: true });
});

const server = app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

async function shutdown() {
  server.close();

  for (const session of sessions.values()) {
    await session.destroy();
  }

  sessions.clear();

  if (clientStarted && client) {
    await client.stop();
    clientStarted = false;
  }
}

process.on("SIGINT", async () => {
  await shutdown();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await shutdown();
  process.exit(0);
});
