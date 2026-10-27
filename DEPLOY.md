# Deploy PLU BOT on Vercel + BotFather

## 1. Environment variables

Use [`.env.example`](./.env.example) as the master list.

| File | Purpose |
|------|---------|
| `.env` | Server secrets (MongoDB, bot token, admin passwords, webhooks) |
| `.env.local` | Client `NEXT_PUBLIC_*`, Vercel CLI (`VERCEL_TOKEN`, project IDs) |

**Push to Vercel automatically** (after filling values and `VERCEL_TOKEN` in `.env.local`):

```bash
npm run env:vercel
```

This uploads every **non-empty** key from `.env` + `.env.local` to production, preview, and development (except `VERCEL_TOKEN`).

Core PLU vars:

| Variable | Required | Notes |
|----------|----------|--------|
| `MONGODB_URI` | Yes (for persistence) | MongoDB Atlas connection string |
| `MONGODB_DB_NAME` | No | Default `plu_bot` |
| `BOT_TOKEN` | For Telegram webhook | From [@BotFather](https://t.me/BotFather) |
| `WEB_APP_URL` | For Telegram webhook | `https://pluuganda-hifl.vercel.app` (no trailing slash) |
| `NEXT_PUBLIC_BOT_USERNAME` | Recommended | Bot username without `@` (invite links) |

Redeploy after changing env vars (required for `NEXT_PUBLIC_*` at build time).

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

**One command (API + UI):**

```bash
npm run dev:full
```

Or two terminals — API first (port **3000**), then Vite (proxies `/api`):

```bash
npm run dev:api
npm run dev
```

If you only run `npm run dev`, Tugende uses **browser local storage** and does not call `/api` (no proxy errors).

To test against local `vercel dev`, add to `.env.local`: `VITE_TUGENDE_USE_API=true` and run `npm run dev:full`.

Optional: point the UI at production APIs without local `vercel dev`:

```bash
# .env.local
VITE_API_BASE=https://pluuganda-hifl.vercel.app
```

## MongoDB collections (auto-created)

- `members`
- `endorsements`
- `integrity_reports`
- `tugende_users`, `tugende_rides`, `tugende_transactions`

Atlas: allow network access `0.0.0.0/0` (or Vercel IPs) for serverless.

## Tugende

- **Location:** Use the **Telegram mobile app** (Android/iOS). Telegram Desktop often shows a location prompt without a working **Allow** button — that is a Telegram client limitation, not PLU. In Tugende, tap **Enable live location**, then **Refresh location** after allowing.
- **Maps:** OpenStreetMap on the Ride tab (pickup + destination).
- **MoMo (optional):** Set `MOMO_API_USER`, `MOMO_API_KEY`, `MOMO_SUBSCRIPTION_KEY`, `MOMO_TARGET_ENVIRONMENT` on Vercel for real MTN STK top-ups. Without them, wallet top-up stays in demo mode.
