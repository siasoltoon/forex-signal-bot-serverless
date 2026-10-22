# Migration boundary

## Serverless
Telegram UI, per-user watchlists and notification preferences, and compact signal-delivery records.

## External service
Market data, indicator calculations, model inference, continuous/periodic scanning, and the source of truth for generated signals.

## Before production
- Define the canonical signal payload and source-event ID.
- Authenticate provider-to-bot delivery and reject replays.
- Set retention limits for signal history.
- Avoid storing full tick/candle history in this database without workload measurements.
- Clearly label timestamps/time zones and never imply a signal is guaranteed.
