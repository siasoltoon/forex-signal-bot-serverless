# Repository instructions

Do not modify `siasoltoon/forex-signal-bot`. This is a separate migration shell. Keep market-data integrations, Python numerical/ML packages, and periodic scanning in an external worker. Runtime imports must be limited to `sdk`, `sdk/db`, `sdk/api`, `sdk/fetch`, and relative project modules ending in `.js`. Never claim a signal is live unless the authenticated provider/analysis integration is actually connected.
