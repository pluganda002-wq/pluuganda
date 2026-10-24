# Deploy PLU BOT on Vercel + BotFather

## 1. Environment variables

Copy [`.env.example`](./.env.example) to `.env` locally. In **Vercel → Project → Settings → Environment Variables**, add:

| Variable | Required | Notes |
|----------|----------|--------|
| `MONGODB_URI` | Yes (for persistence) | MongoDB Atlas connection string |
| `MONGODB_DB_NAME` | No | Default `plu_bot` |
| `BOT_TOKEN` | For Telegram webhook | From [@BotFather](https://t.me/BotFather) |
| `WEB_APP_URL` | For Telegram webhook | `https://pluuganda-hifl.vercel.app` (no trailing slash) |

Redeploy after changing env vars.

## 2. Push to GitHub & import on Vercel

1. Push this repo to [pluganda002-wq/pluuganda](https://github.com/pluganda002-wq/pluuganda).
2. [vercel.com/new](https://vercel.com/new) → Import `pluganda002-wq/pluuganda`.
3. Framework: **Vite** (auto). Build: `npm run build`, output: `dist`.
4. Add env vars above → Deploy.

Check API: [pluuganda-hifl.vercel.app/api/health](https://pluuganda-hifl.vercel.app/api/health) → `"database":"configured"` after `MONGODB_URI` is set.

## 3. BotFather Mini App

1. `/newbot` or use existing bot → copy **token** → `BOT_TOKEN` on Vercel.
2. **Bot Settings → Menu Button → Configure** → set URL to `https://pluuganda-hifl.vercel.app`.
3. Optional: **/setdescription** — *PLU BOT — Connect. Participate. Build Uganda.*

## 4. Telegram webhook (recommended on Vercel)

After deploy, set webhook (replace values):

```text
https://api.telegram.org/bot<BOT_TOKEN>/setWebhook?url=https://pluuganda-hifl.vercel.app/api/webhook
```

Users send `/start` in Telegram; bot replies with **Open PLU BOT** web app button.

Alternative: run [`bot/index.js`](./bot/index.js) on Railway/Render with polling (same env vars).

## 5. Local dev with API

Terminal 1 — API + static via Vercel CLI:

```bash
npm install -g vercel   # once
cp .env.example .env    # add MONGODB_URI
npm run dev:api
```

Terminal 2 — Vite (proxies `/api` to port 3000):

```bash
npm run dev
```

## MongoDB collections (auto-created)

- `members`
- `endorsements`
- `integrity_reports`

Atlas: allow network access `0.0.0.0/0` (or Vercel IPs) for serverless.
