-- Dedicated telemetry counters; never stores raw IPs or publication state.
CREATE TABLE IF NOT EXISTS vitals_rate_limits (
  key TEXT PRIMARY KEY,
  count INTEGER NOT NULL,
  reset_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS vitals_rate_limits_expiry ON vitals_rate_limits(reset_at);
