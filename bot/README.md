# PLU BOT — Telegram bot launcher

This bot opens the PLU Mini App from `/start`.

## Setup

1. Create a bot with [@BotFather](https://t.me/BotFather).
2. Deploy the web app (`npm run build` in the repo root) to **HTTPS** (required for Mini Apps).
3. In BotFather: **Bot Settings → Menu Button → Configure menu button** and set your Mini App URL.
4. Optionally set the Mini App URL via `/setmenubutton`.

## Run locally

```bash
cd bot
npm install
export BOT_TOKEN="your_token"
export WEB_APP_URL="https://your-deployed-app.example.com"
npm start
```

## Environment

| Variable | Description |
|----------|-------------|
| `BOT_TOKEN` | From BotFather |
| `WEB_APP_URL` | HTTPS URL of the Vite `dist/` deployment |
