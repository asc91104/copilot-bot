# Copilot Bot (GitHub Copilot SDK + Web Chat)

## Requirements
- Node.js 20+
- GitHub Copilot CLI installed and authenticated
- Access to model `claude-haiku-4.5`

## Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Create env file:
   ```bash
   copy .env.example .env
   ```
3. (Optional) set `GITHUB_TOKEN` in `.env`

## Run
```bash
npm start
```
Open [http://localhost:3000](http://localhost:3000).

## Chat Commands
- `/start`: create a new session (replaces existing one)
- `/end`: end current session

## API
- `POST /api/start` body: `{ "userId": "optional" }`
- `POST /api/end` body: `{ "userId": "required" }`
- `POST /api/chat` body: `{ "userId": "required", "message": "required" }`
