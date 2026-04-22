-- D1 schema para formularios del sitio.
-- Tablas: newsletter_subs, calc_votes, error_reports.
--
-- Aplicar con:
--   npx wrangler d1 execute hacecuentas-forms --remote --file=db/schema.sql

-- Suscripciones al newsletter (reemplaza el mailto que no funcionaba).
-- UNIQUE en email para evitar duplicados si alguien se suscribe 2×.
CREATE TABLE IF NOT EXISTS newsletter_subs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  created_at INTEGER NOT NULL,        -- unix ms
  user_agent TEXT,
  referer TEXT,
  ip_hash TEXT,                       -- hash truncado, para dedupe sin guardar IP real
  source TEXT DEFAULT 'newsletter',   -- 'newsletter', 'footer', 'modal', etc.
  confirmed INTEGER DEFAULT 0         -- para double-opt-in futuro
);
CREATE INDEX IF NOT EXISTS idx_newsletter_created ON newsletter_subs(created_at DESC);

-- Votos 👍/👎 por calculadora.
-- Sin UNIQUE en slug — queremos agregar todos los votos, el frontend ya
-- bloquea re-voto por localStorage; si alguien burla eso queremos saberlo.
CREATE TABLE IF NOT EXISTS calc_votes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL,
  vote TEXT NOT NULL CHECK (vote IN ('up','down')),
  created_at INTEGER NOT NULL,
  user_agent TEXT,
  ip_hash TEXT
);
CREATE INDEX IF NOT EXISTS idx_votes_slug ON calc_votes(slug);
CREATE INDEX IF NOT EXISTS idx_votes_created ON calc_votes(created_at DESC);

-- Reportes de error (reemplaza el mailto viejo).
-- El user puede reportar desde cualquier calc con un motivo.
CREATE TABLE IF NOT EXISTS error_reports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL,
  message TEXT NOT NULL,
  email TEXT,                         -- opcional, para follow-up
  created_at INTEGER NOT NULL,
  user_agent TEXT,
  ip_hash TEXT,
  status TEXT DEFAULT 'new'           -- 'new', 'triaged', 'fixed', 'wontfix'
);
CREATE INDEX IF NOT EXISTS idx_errors_status ON error_reports(status);
CREATE INDEX IF NOT EXISTS idx_errors_created ON error_reports(created_at DESC);

-- Vista útil para panel: agregado de votos por slug.
CREATE VIEW IF NOT EXISTS calc_votes_summary AS
SELECT
  slug,
  SUM(CASE WHEN vote = 'up' THEN 1 ELSE 0 END) AS upvotes,
  SUM(CASE WHEN vote = 'down' THEN 1 ELSE 0 END) AS downvotes,
  COUNT(*) AS total,
  MAX(created_at) AS last_vote_at
FROM calc_votes
GROUP BY slug;
