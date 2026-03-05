import "dotenv/config";
import express from "express";
import { randomUUID } from "node:crypto";
import { setDefaultResultOrder } from "node:dns";
import https from "node:https";
import { CopilotClient, approveAll } from "@github/copilot-sdk";

const app = express();
const port = Number(process.env.PORT || 3000);
const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN || "";
const telegramWebhookPath = process.env.TELEGRAM_WEBHOOK_PATH || "/webhooks/telegram";
const telegramWebhookSecret = process.env.TELEGRAM_WEBHOOK_SECRET || "";
const telegramApiBaseUrl = process.env.TELEGRAM_API_BASE_URL || "https://api.telegram.org";
const telegramApiTimeoutMs = Number(process.env.TELEGRAM_API_TIMEOUT_MS || 15000);
const telegramApiRetries = Number(process.env.TELEGRAM_API_RETRIES || 1);
const telegramPreferIpv4 = (process.env.TELEGRAM_PREFER_IPV4 || "true").toLowerCase() !== "false";

if (telegramPreferIpv4) {
  setDefaultResultOrder("ipv4first");
}

app.use(express.json());
app.use(express.static("public"));

let client;
let clientStarted = false;

const sessions = new Map();

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

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
    onPermissionRequest: approveAll,
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

async function handleMessage(userId, message) {
  if (!userId) {
    throw new HttpError(400, "userId is required");
  }

  if (!message || typeof message !== "string") {
    throw new HttpError(400, "message is required");
  }

  const trimmed = message.trim();
  const command = trimmed.split(/\s+/, 1)[0].toLowerCase();

  if (command === "/start" || command.startsWith("/start@")) {
    const session = await startSession(userId);
    return {
      userId,
      sessionId: session.sessionId,
      reply: `Session started: ${session.sessionId}`,
    };
  }

  if (command === "/end" || command.startsWith("/end@")) {
    const ended = await endSession(userId);
    if (!ended) {
      throw new HttpError(400, "No active session");
    }

    return { reply: "Session ended" };
  }

  const session = getUserSession(userId);
  if (!session) {
    throw new HttpError(400, "No active session. Send /start first.");
  }

  const response = await session.sendAndWait({ prompt: trimmed }, 120000);
  const rawReply = response?.data?.content;
  const reply =
    typeof rawReply === "string"
      ? rawReply
      : rawReply === undefined || rawReply === null
        ? "No response"
        : JSON.stringify(rawReply);

  return {
    reply,
    sessionId: session.sessionId,
  };
}

function parseTelegramError(method, error) {
  const details =
    error && typeof error === "object" && "message" in error ? String(error.message) : "";

  return new Error(
    details
      ? `Telegram API network error (${method}): ${details}`
      : `Telegram API network error (${method}): request failed`,
  );
}

async function callTelegramApi(method, payload) {
  if (!telegramBotToken) {
    throw new Error("TELEGRAM_BOT_TOKEN is not configured");
  }

  const base = new URL(telegramApiBaseUrl);
  const basePath = base.pathname.replace(/\/$/, "");
  const requestPath = `${basePath}/bot${telegramBotToken}/${method}`;
  const requestBody = JSON.stringify(payload);
  const maxAttempts = Math.max(1, telegramApiRetries + 1);

  let lastError;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const result = await new Promise((resolve, reject) => {
        const req = https.request(
          {
            protocol: base.protocol,
            hostname: base.hostname,
            port: base.port || 443,
            path: requestPath,
            method: "POST",
            headers: {
              "content-type": "application/json",
              "content-length": Buffer.byteLength(requestBody),
            },
            timeout: telegramApiTimeoutMs,
            family: telegramPreferIpv4 ? 4 : 0,
          },
          (res) => {
            let raw = "";

            res.setEncoding("utf8");
            res.on("data", (chunk) => {
              raw += chunk;
            });
            res.on("end", () => {
              let parsed;
              try {
                parsed = JSON.parse(raw || "{}");
              } catch {
                reject(new Error(`Telegram API invalid JSON response: ${method}`));
                return;
              }

              if (res.statusCode < 200 || res.statusCode >= 300 || !parsed.ok) {
                reject(
                  new Error(parsed.description || `Telegram API request failed: ${method}`),
                );
                return;
              }

              resolve(parsed.result);
            });
          },
        );

        req.on("timeout", () => {
          req.destroy(new Error("ETIMEDOUT"));
        });

        req.on("error", (error) => {
          reject(parseTelegramError(method, error));
        });

        req.write(requestBody);
        req.end();
      });

      return result;
    } catch (error) {
      lastError = error instanceof Error ? error : parseTelegramError(method, error);

      if (attempt < maxAttempts) {
        continue;
      }

      throw lastError;
    }
  }

  throw lastError || new Error(`Telegram API request failed: ${method}`);
}

async function sendTelegramMessage(chatId, text) {
  const normalizedText = typeof text === "string" ? text : JSON.stringify(text);
  const safeText = normalizedText && normalizedText.trim() ? normalizedText : "No response";

  // Telegram sendMessage has a text size limit; split long replies.
  const chunkSize = 4000;
  for (let i = 0; i < safeText.length; i += chunkSize) {
    await callTelegramApi("sendMessage", {
      chat_id: chatId,
      text: safeText.slice(i, i + chunkSize),
    });
  }
}

async function processTelegramUpdate(update) {
  const message = update?.message;
  const text = message?.text;
  const chatId = message?.chat?.id;

  if (!text || chatId === undefined || chatId === null) {
    console.log("Telegram update ignored (non-text or missing chat id)");
    return;
  }

  const userId = String(message?.from?.id ?? chatId);
  console.log(`Telegram update received chatId=${chatId} userId=${userId}`);

  try {
    const result = await handleMessage(userId, text);
    await sendTelegramMessage(chatId, result.reply);
    console.log(`Telegram reply sent chatId=${chatId}`);
  } catch (error) {
    const errorMessage =
      error instanceof HttpError ? error.message : "Server error. Try again later.";

    try {
      await sendTelegramMessage(chatId, errorMessage);
      console.log(`Telegram error message sent chatId=${chatId}`);
    } catch (telegramError) {
      console.error("Failed to send Telegram message", telegramError);
    }

    if (!(error instanceof HttpError)) {
      console.error("Telegram update processing failed", error);
    }
  }
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
    const result = await handleMessage(userId, message);
    res.json(result);
  } catch (error) {
    if (error instanceof HttpError) {
      return res.status(error.status).json({ error: error.message });
    }

    res.status(500).json({
      error: error instanceof Error ? error.message : "Chat failed",
    });
  }
});

app.post(telegramWebhookPath, async (req, res) => {
  if (!telegramBotToken) {
    return res.status(503).json({ error: "Telegram bot is not configured" });
  }

  if (telegramWebhookSecret) {
    const headerSecret = req.get("x-telegram-bot-api-secret-token");
    if (headerSecret !== telegramWebhookSecret) {
      return res.status(401).json({ error: "Unauthorized webhook request" });
    }
  }

  res.json({ ok: true });
  void processTelegramUpdate(req.body);
});

app.post("/api/telegram/set-webhook", async (req, res) => {
  try {
    if (!telegramBotToken) {
      return res.status(400).json({ error: "TELEGRAM_BOT_TOKEN is required" });
    }

    const providedWebhookUrl = req.body.webhookUrl || process.env.TELEGRAM_WEBHOOK_URL;
    if (!providedWebhookUrl) {
      return res.status(400).json({
        error: "webhookUrl is required (or set TELEGRAM_WEBHOOK_URL)",
      });
    }

    const webhookBase = providedWebhookUrl.replace(/\/+$/, "");
    const fullWebhookUrl = `${webhookBase}${telegramWebhookPath}`;

    const payload = { url: fullWebhookUrl };
    if (telegramWebhookSecret) {
      payload.secret_token = telegramWebhookSecret;
    }

    const result = await callTelegramApi("setWebhook", payload);

    res.json({
      reply: "Webhook configured",
      webhookUrl: fullWebhookUrl,
      result,
    });
  } catch (error) {
    console.error("set-webhook failed", error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to set webhook",
    });
  }
});

app.get("/health", (_, res) => {
  res.json({ ok: true });
});

const server = app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
  if (telegramBotToken) {
    console.log(`Telegram webhook endpoint ready: ${telegramWebhookPath}`);
  }
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










