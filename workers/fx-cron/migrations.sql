-- Migración D1 para hacecuentas-fx-cron (DB: hacecuentas-forms).
-- Idempotente: el worker también hace CREATE TABLE IF NOT EXISTS defensivo,
-- pero correr esto explícito deja el schema listo antes del primer cron.
--
-- Correr con:
--   cd workers/fx-cron
--   npx wrangler d1 execute hacecuentas-forms --remote --file=migrations.sql

CREATE TABLE IF NOT EXISTS fx_live (
  pais TEXT PRIMARY KEY,        -- 'chile' | 'colombia' | ... | 'argentina'
  data TEXT NOT NULL,           -- JSON, misma forma que src/data/live/<pais>.json
  updated_at TEXT NOT NULL      -- ISO timestamp del refresh
);

-- Series no-FX (IPC, etc.). Clave '<cc>.<serie>', p. ej. 'ar.ipc'.
CREATE TABLE IF NOT EXISTS series_live (
  serie TEXT PRIMARY KEY,
  data TEXT NOT NULL,           -- JSON (para ar.ipc: last_month / last_12_months / acumulado_12m)
  updated_at TEXT NOT NULL
);
