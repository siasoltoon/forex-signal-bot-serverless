# Forex Signal Bot — Telegram Serverless

**Status:** Phase 0 migration shell. No live market feed, signal scanner, or trading functionality is connected.

Original: `siasoltoon/forex-signal-bot`

## Boundary
Serverless is intended for Telegram commands, user preferences, watchlists, notification settings, and a compact delivery history. Keep market-data providers, scheduled scanning, and Python analysis (NumPy/Pandas/SciPy/scikit-learn) in the existing external service/worker.

## Setup
Node.js 18+; run `npm install`, enable Serverless in @BotFather, then `npx tgcloud login`. Check syntax with `npm run check` and run a local handler with `npx tgcloud run handlers/message '{ chat: { id: 123 }, from: { id: 123 }, text: "/start" }'`. Review `npx tgcloud diff` before `npx tgcloud push`; review and apply schema changes separately with `npx tgcloud migrate`.

## Database
Built-in SQLite is proposed for compact user settings and delivery metadata, not as a blind replacement for historical market-data storage. Signals shown to users must come from a trusted, authenticated analysis service; this starter does not generate financial signals.
