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

-- Pedidos "recibí este resultado por email" de las calcs (/api/email-result).
-- sent=0 = pendiente de envío (backlog enviable cuando se active RESEND_API_KEY).
CREATE TABLE IF NOT EXISTS email_results (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL,
  slug TEXT NOT NULL,
  result TEXT,
  created_at INTEGER NOT NULL,          -- unix ms
  user_agent TEXT,
  ip_hash TEXT,
  sent INTEGER DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_email_results_created ON email_results(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_results_sent ON email_results(sent);

-- Leads del vertical legal-laboral (/api/lead). Se encienden con las ofertas
-- kind:'lead' de offers.ts cuando haya partner que compre el lead.
CREATE TABLE IF NOT EXISTS legal_leads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  result TEXT,
  offer_id TEXT,
  created_at INTEGER NOT NULL,          -- unix ms
  user_agent TEXT,
  ip_hash TEXT
);
CREATE INDEX IF NOT EXISTS idx_legal_leads_created ON legal_leads(created_at);

-- Snapshot de datos FX/indicadores en vivo por país, escrito por el cron Worker
-- `hacecuentas-fx-cron` (workers/fx-cron/) una vez al día. Las landings SSR
-- /dolar-hoy-{chile,colombia,mexico,peru} lo leen en cada request (con fallback
-- al JSON de build). `data` = JSON con la misma forma que src/data/live/<pais>.json.
CREATE TABLE IF NOT EXISTS fx_live (
  pais TEXT PRIMARY KEY,                 -- 'chile' | 'colombia' | 'mexico' | 'peru'
  data TEXT NOT NULL,                    -- JSON snapshot
  updated_at TEXT NOT NULL               -- ISO 8601
);

-- ── Cuentas "Mi Hacé Cuentas" (perfil numérico con login) ──────────────────
-- Login por OTP (código de un solo uso al mail) y/o Google. Los calcs siguen
-- siendo PÚBLICOS sin login; sólo la memoria-entre-herramientas pide cuenta.

-- Usuarios. email único. newsletter_optin se setea en el registro (casilla).
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  created_at INTEGER NOT NULL,          -- unix ms
  last_login_at INTEGER,
  newsletter_optin INTEGER DEFAULT 0,   -- 1 = suscripto al newsletter
  auth_provider TEXT DEFAULT 'otp',     -- 'otp' | 'google'
  email_verified INTEGER DEFAULT 0      -- OTP y Google entregan mail verificado
);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Perfil numérico server-side: espejo sincronizable del localStorage del cliente.
-- Una fila por (usuario, clave canónica de src/lib/profile/schema.ts).
CREATE TABLE IF NOT EXISTS user_profile (
  user_id INTEGER NOT NULL,
  key TEXT NOT NULL,                     -- clave canónica: 'trabajo.sueldoBruto'
  value TEXT NOT NULL,                   -- number/string/bool serializado
  updated_at INTEGER NOT NULL,          -- unix ms
  src TEXT,                              -- procedencia: 'calc:<slug>' | 'profile'
  PRIMARY KEY (user_id, key),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Códigos OTP de un solo uso. Guardamos el HASH del código (nunca el plano),
-- con expiración corta y contador anti fuerza-bruta. Se borran al consumirse.
CREATE TABLE IF NOT EXISTS auth_codes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL,
  code_hash TEXT NOT NULL,              -- SHA-256 del código de 6 dígitos
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL,          -- unix ms (~+10 min)
  attempts INTEGER DEFAULT 0,           -- intentos fallidos de verificación
  consumed INTEGER DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_auth_codes_email ON auth_codes(email);
CREATE INDEX IF NOT EXISTS idx_auth_codes_expires ON auth_codes(expires_at);

-- Sesiones: token opaco aleatorio (256-bit) en cookie httpOnly+Secure+SameSite.
-- Se valida contra esta tabla en cada request autenticado.
CREATE TABLE IF NOT EXISTS sessions (
  token TEXT PRIMARY KEY,               -- random base64url, nunca en JS del cliente
  user_id INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL,          -- unix ms (~+90 días, sliding)
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);

-- Alertas "avisame cuando este resultado cambie". El usuario guarda el resultado
-- de una calc (slug + inputs) y, cuando un cambio normativo modifica el número,
-- un cron reejecuta el cálculo y le manda el diff por mail. Híbrido: anda con
-- email solo; si hay sesión, se ata a user_id para gestionarla en el perfil.
CREATE TABLE IF NOT EXISTS result_alerts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL,
  user_id INTEGER,                       -- NULL si se creó sin sesión
  slug TEXT NOT NULL,                    -- slug canónico del calc (AR root)
  inputs TEXT NOT NULL,                  -- JSON de inputs para reejecutar
  headline_field TEXT,                   -- clave del result que es "el resultado"
  headline_label TEXT,                   -- etiqueta legible para el mail
  last_result TEXT NOT NULL,             -- JSON snapshot del result (para diff)
  last_headline TEXT,                    -- valor headline mostrable del snapshot
  sig TEXT NOT NULL,                     -- hash(email|slug|inputs) anti-duplicado
  unsub_token TEXT NOT NULL,             -- token opaco para baja por link
  created_at INTEGER NOT NULL,           -- unix ms
  last_checked_at INTEGER,               -- última vez que el cron la reejecutó
  last_changed_at INTEGER,               -- última vez que el resultado cambió
  status TEXT DEFAULT 'active',          -- 'active' | 'unsubscribed'
  UNIQUE(sig)
);
CREATE INDEX IF NOT EXISTS idx_result_alerts_email ON result_alerts(email);
CREATE INDEX IF NOT EXISTS idx_result_alerts_user ON result_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_result_alerts_status_slug ON result_alerts(status, slug);
CREATE INDEX IF NOT EXISTS idx_result_alerts_unsub ON result_alerts(unsub_token);

-- ── Cooperativa de datos anónimos ─────────────────────────────────────────────
-- Sistema y política SEPARADOS del feedback/votos. Tras ciertos resultados, el
-- usuario puede APORTAR EXPLÍCITAMENTE (consentimiento granular, nada automático)
-- un dato numérico anónimo para construir índices propios (sueldo neto, relación
-- alquiler/ingreso, tasas ofrecidas…). A cambio ve su percentil dentro del
-- segmento, sólo si el segmento tiene ≥30 observaciones.
--
-- INVARIANTES DE PRIVACIDAD (no romper):
--   · NUNCA se guarda email ni user_id acá. El aporte es anónimo por diseño:
--     el endpoint /api/coop/contribute ni siquiera lee la sesión.
--   · `value` (valor exacto) e `ip_hash`/`dedup_sig` son DATOS DETALLADOS: el
--     worker coop-aggregate los poda (NULL) pasado el período de retención, una
--     vez horneados en coop_aggregates. Sobreviven sólo `value_bucket` (rango),
--     `segment_key` y `period` para transparencia y conteos.
--   · `dedup_sig` = hash(ip|dataset|segment|period): un dispositivo aporta un
--     punto por segmento por mes (anti-skew), sin identificar a la persona.
--   · `revoke_token`: el cliente lo guarda en localStorage (atado al dispositivo,
--     NO al email) y puede revocar el aporte vía /api/coop/revoke.
CREATE TABLE IF NOT EXISTS coop_contributions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  dataset TEXT NOT NULL,                 -- id del índice: 'sueldo-neto' | 'alquiler-ingreso' | 'tasa-plazo-fijo'
  slug TEXT NOT NULL,                    -- calc de origen (atribución/auditoría)
  segment_key TEXT NOT NULL,             -- clave canónica del segmento: 'sueldo-neto|prov=caba|rol=it|sen=senior'
  value REAL,                            -- valor numérico exacto (para percentiles). Se poda con el tiempo.
  value_bucket TEXT,                     -- rango legible ('$800.000–$900.000') — sobrevive a la poda
  unit TEXT,                             -- 'ARS' | 'pct'
  period TEXT NOT NULL,                  -- 'YYYY-MM' (cohorte temporal)
  segments TEXT,                         -- JSON con dims legibles {provincia,rol,seniority}
  ip_hash TEXT,                          -- truncado; SOLO anti-spam; se poda
  dedup_sig TEXT,                        -- hash(ip|dataset|segment|period); UNIQUE para 1 punto/dispositivo. Se poda.
  revoke_token TEXT,                     -- token opaco para revocar (vive en localStorage del cliente)
  created_at INTEGER NOT NULL,           -- unix ms
  UNIQUE(dedup_sig)
);
CREATE INDEX IF NOT EXISTS idx_coop_dataset_seg ON coop_contributions(dataset, segment_key);
CREATE INDEX IF NOT EXISTS idx_coop_revoke ON coop_contributions(revoke_token);
CREATE INDEX IF NOT EXISTS idx_coop_created ON coop_contributions(created_at);
CREATE INDEX IF NOT EXISTS idx_coop_value_age ON coop_contributions(created_at) WHERE value IS NOT NULL;

-- Agregados materializados por (dataset, segment_key, period). Los recalcula el
-- worker coop-aggregate. period='all' = pool vivo actual; period='YYYY-MM' =
-- snapshot congelado que PERSISTE aunque después se poden los valores exactos
-- (esa es la durabilidad del índice). Sólo se exponen públicamente los segmentos
-- con n ≥ minObs (30). Esta tabla es la fuente de los "índices propios".
CREATE TABLE IF NOT EXISTS coop_aggregates (
  dataset TEXT NOT NULL,
  segment_key TEXT NOT NULL,             -- '__all__' = todo el dataset; o la clave del segmento
  period TEXT NOT NULL,                  -- 'all' (vivo) | 'YYYY-MM' (snapshot)
  n INTEGER NOT NULL,
  p10 REAL, p25 REAL, p50 REAL, p75 REAL, p90 REAL,
  mean REAL, min REAL, max REAL,
  unit TEXT,
  segments TEXT,                         -- JSON dims legibles del segmento (para render)
  updated_at INTEGER NOT NULL,
  PRIMARY KEY (dataset, segment_key, period)
);
CREATE INDEX IF NOT EXISTS idx_coop_agg_dataset ON coop_aggregates(dataset, period);
