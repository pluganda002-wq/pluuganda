# PLU BOT — Telegram Mini App

**Connect. Participate. Build Uganda.**

Unified digital platform for the [Patriotic League of Uganda](https://plu.org.ug/): membership, endorsements, civic programmes, mobility services, PLU TV, corruption reporting, and community engagement — designed as a Telegram Mini App first, with a full website planned next.

## Navigation

| Tab | Purpose |
|-----|---------|
| **Home** | Stats, priority actions, organised programme shortcuts |
| **Programmes** | Seven PLU programme areas |
| **Services** | Full service directory |
| **Social** | Updates and engagement |
| **Profile** | Membership, values, assistant |

## Features (v0.1)

| Area | Screens |
|------|---------|
| Membership | Registration & verification flow (UI) |
| Endorsements | Presidential campaign form + live stats |
| Integrity | Secure corruption report + public case tracker |
| Programmes | All seven PLU programme areas from plu.org.ug |
| Services | Youth, charity, CSR, tasks, leadership, education, projects |
| Mobility & media | UGo Ride, Tugende, transport hubs, PLU TV (scaffolded) |
| Social | Feed hub for updates and engagement |

## Quick start

```bash
npm install
npm run dev
```

Open http://localhost:5173 in a browser (Telegram WebApp APIs activate inside Telegram).

## Build

```bash
npm run build
npm run preview
```

**Production:** see **[DEPLOY.md](./DEPLOY.md)** — MongoDB env, Vercel, BotFather, Telegram webhook.

Copy `.env.example` → `.env` and set `MONGODB_URI` when ready. API routes live under `/api/*` (members, endorsements, integrity reports).

## Stack

- React 18 + TypeScript + Vite
- React Router
- [@twa-dev/sdk](https://github.com/twa-dev/sdk) for Telegram Web App
- Mobile-first PLU-themed UI (gold / patriotic dark)

## Roadmap

1. Supabase backend + `initData` validation
2. Admin dashboard for PLU Secretariat
3. PLU TV streaming embeds
4. UGo Ride / Tugende partner APIs
5. Public marketing website sharing the same API

## Secretariat

Plot 7 Saddler Lane, Naguru, Kampala, Uganda — aligned with official PLU digital channels.
