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

-- Feedback abierto del usuario después de votar (👍/👎).
-- El user puede agregar texto libre explicando qué le faltó / qué le gustó.
-- El vote en sí se registra en calc_votes; esta tabla guarda solo el texto
-- de seguimiento (que es opcional).
CREATE TABLE IF NOT EXISTS calc_feedback (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL,                      -- '/calculadora-X' (con slash inicial)
  vote TEXT NOT NULL CHECK (vote IN ('up','down')),
  feedback_text TEXT NOT NULL,             -- texto libre del usuario, max 500 chars
  created_at INTEGER NOT NULL,
  user_agent TEXT,
  ip_hash TEXT,
  status TEXT DEFAULT 'new'                -- 'new', 'read', 'actioned'
);
CREATE INDEX IF NOT EXISTS idx_feedback_status ON calc_feedback(status);
CREATE INDEX IF NOT EXISTS idx_feedback_created ON calc_feedback(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_feedback_slug ON calc_feedback(slug);

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

-- Core Web Vitals (LCP, INP, CLS, FCP, TTFB).
-- El cliente samplea al 25% antes de enviar — esto ya está filtrado.
-- Sin UNIQUE en (url, metric, ts) — queremos series temporales completas para
-- calcular percentiles (P75 según definición Google CrUX).
CREATE TABLE IF NOT EXISTS web_vitals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  url TEXT NOT NULL,                    -- pathname + query, sin host
  metric TEXT NOT NULL,                 -- 'LCP' | 'INP' | 'CLS' | 'FCP' | 'TTFB'
  value REAL NOT NULL,                  -- ms para LCP/INP/FCP/TTFB, ratio para CLS
  rating TEXT,                          -- 'good' | 'needs-improvement' | 'poor'
  country TEXT,                         -- ISO-2 desde cf-ipcountry, opcional
  ts INTEGER NOT NULL                   -- unix ms
);
CREATE INDEX IF NOT EXISTS idx_vitals_metric_ts ON web_vitals(metric, ts DESC);
CREATE INDEX IF NOT EXISTS idx_vitals_url ON web_vitals(url);
CREATE INDEX IF NOT EXISTS idx_vitals_ts ON web_vitals(ts DESC);

-- Sugerencias de calculadoras nuevas (UGC + voting público).
-- Flow: usuario sugiere desde /sugerir → status='pending' (oculto en listado público).
--       admin revisa en /admin → marca 'approved' (visible) o 'rejected' (descartado).
--       comunidad vota desde /sugerencias → vote_count desc.
--       cuando se construye la calc → status='built' (queda en archivo histórico).
CREATE TABLE IF NOT EXISTS calc_suggestions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,                  -- "Calculadora de X"
  description TEXT NOT NULL,            -- qué calcula, casos de uso
  category TEXT NOT NULL,               -- finanzas|salud|deportes|... (mismo set que calcs)
  email_optional TEXT,                  -- para notificar cuando se construye
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','built')),
  vote_count INTEGER NOT NULL DEFAULT 0,
  ip_hash TEXT,                         -- hash de IP del que la propuso (anti-spam)
  created_at INTEGER NOT NULL,          -- unix ms
  updated_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_suggestions_status ON calc_suggestions(status);
CREATE INDEX IF NOT EXISTS idx_suggestions_votes ON calc_suggestions(vote_count DESC);
CREATE INDEX IF NOT EXISTS idx_suggestions_created ON calc_suggestions(created_at DESC);

-- Votos individuales por sugerencia (anti-doble-voto por IP).
-- UNIQUE (suggestion_id, ip_hash) hace idempotente el INSERT OR IGNORE.
CREATE TABLE IF NOT EXISTS suggestion_votes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  suggestion_id INTEGER NOT NULL,
  ip_hash TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  UNIQUE (suggestion_id, ip_hash),
  FOREIGN KEY (suggestion_id) REFERENCES calc_suggestions(id)
);
CREATE INDEX IF NOT EXISTS idx_sugvotes_suggestion ON suggestion_votes(suggestion_id);

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
