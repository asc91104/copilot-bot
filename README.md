# Copilot Bot (GitHub Copilot SDK + Web Chat + Telegram Webhook)

## Requirements
- Node.js 20+
- GitHub Copilot CLI installed and authenticated
- Access to model `claude-haiku-4.5`
- For Telegram: a Telegram Bot token from BotFather and a public HTTPS URL

## Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Create env file:
   ```bash
   copy .env.example .env
   ```
3. Set env values in `.env`
   - Optional: `GITHUB_TOKEN`
   - Telegram: `TELEGRAM_BOT_TOKEN`
   - Optional security: `TELEGRAM_WEBHOOK_SECRET`
   - Optional custom path: `TELEGRAM_WEBHOOK_PATH`

## Run
```bash
npm start
```
Open [http://localhost:3000](http://localhost:3000).

## Cron Scheduler
The application includes a built-in cron scheduler for recurring tasks.

### Task Folder Structure
All scheduled tasks are stored in `src/tasks/` with the naming convention: `<taskName>.task.js`

### Creating a Task
1. Create a file in `src/tasks/` named `<taskName>.task.js`
2. Export a default configuration object with:
   - `name`: Unique task identifier
   - `schedule`: Cron expression (see [crontab.guru](https://crontab.guru/))
   - `handler`: Async function to execute
   - `description` (optional): Task description

Example:
```javascript
// src/tasks/cleanup.task.js
export default {
  name: 'daily-cleanup',
  schedule: '0 2 * * *', // 2 AM daily
  description: 'Clean up temporary files',
  handler: async () => {
    console.log('Running cleanup...');
    // Your cleanup logic here
  }
};
```

### Task Management APIs
- `GET /api/tasks` - List all scheduled tasks
- `GET /api/tasks/:taskName` - Get task details
- `POST /api/tasks/:taskName/start` - Resume a paused task
- `POST /api/tasks/:taskName/stop` - Pause a task

### Common Cron Patterns
- Every 5 minutes: `*/5 * * * *`
- Every hour: `0 * * * *`
- Daily at midnight: `0 0 * * *`
- Every Monday at midnight: `0 0 * * 1`
- Weekday 9am-5pm: `0 9-17 * * 1-5`

## Chat Commands
- `/start`: create a new session (replaces existing one)
- `/end`: end current session

## API
- `POST /api/start` body: `{ "userId": "optional" }`
- `POST /api/end` body: `{ "userId": "required" }`
- `POST /api/chat` body: `{ "userId": "required", "message": "required" }`

## Telegram Webhook
1. Expose your app with a public HTTPS URL (e.g. `https://your-domain.com`).
2. Set env values:
   - `TELEGRAM_BOT_TOKEN=<bot token>`
   - `TELEGRAM_WEBHOOK_URL=https://your-domain.com` (or pass URL in API body)
   - Optional: `TELEGRAM_WEBHOOK_SECRET=<secret token>`
3. Register webhook:
   ```pwsh
   $body = @{ webhookUrl = "https://your-domain.com" } | ConvertTo-Json
   Invoke-RestMethod -Method POST -Uri "http://localhost:3000/api/telegram/set-webhook" -ContentType "application/json" -Body $body
   ```
4. Telegram will send updates to:
   - `<TELEGRAM_WEBHOOK_URL><TELEGRAM_WEBHOOK_PATH>`
   - default: `https://your-domain.com/webhooks/telegram`

The webhook endpoint reuses the same session behavior as web chat:
- Send `/start` in Telegram to create a session
- Send `/end` to close a session
- Any other text is sent to Copilot session

### Network Notes
- If Telegram webhook registration intermittently times out in Node but works in terminal, keep default TELEGRAM_PREFER_IPV4=true.
- You can tune timeout/retry with TELEGRAM_API_TIMEOUT_MS and TELEGRAM_API_RETRIES.

