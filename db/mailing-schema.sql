-- D1 schema para el mailing 2×/semana (newsletter de calculadoras).
-- Tablas: mailing_pool, mailing_log. Más columnas de baja en newsletter_subs.
--
-- Aplicar con:
--   npx wrangler d1 execute hacecuentas-forms --remote --file=db/mailing-schema.sql
--
-- El pool (mailing_pool) lo seedea aparte el script:
--   node scripts/build-mailing-pool.mjs   →  db/mailing-pool.sql
--   npx wrangler d1 execute hacecuentas-forms --remote --file=db/mailing-pool.sql

-- Pool curado de calcs elegibles para el mailing (top por tráfico GA4).
-- El worker hacecuentas-mailing-cron sortea 2 de acá que NO estén en mailing_log.
-- rank = posición por pageviews (1 = más tráfico). Se re-seedea con el script.
CREATE TABLE IF NOT EXISTS mailing_pool (
  slug TEXT PRIMARY KEY,                 -- slug interno, sin barra ('calculadora-imc')
  title TEXT NOT NULL,                   -- nombre para mostrar (h1 limpio)
  answer_snippet TEXT NOT NULL,          -- explicación corta (answerSnippet, markdown limpiado)
  category TEXT,                         -- finanzas|salud|... (para el chip)
  url TEXT NOT NULL,                     -- URL absoluta a la calc
  rank INTEGER NOT NULL                  -- 1 = más tráfico; orden de envío
);
CREATE INDEX IF NOT EXISTS idx_mailing_pool_rank ON mailing_pool(rank);

-- Log de cada calc enviada (1 fila por calc por edición).
-- "no repetidas antes" = anti-join: WHERE slug NOT IN (SELECT slug FROM mailing_log).
CREATE TABLE IF NOT EXISTS mailing_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL,                    -- calc enviada
  edition_at INTEGER NOT NULL,           -- unix ms de la edición
  recipients INTEGER DEFAULT 0,          -- a cuántos se mandó
  resend_ok INTEGER DEFAULT 0            -- 1 si Resend aceptó el batch
);
CREATE INDEX IF NOT EXISTS idx_mailing_log_slug ON mailing_log(slug);
CREATE INDEX IF NOT EXISTS idx_mailing_log_edition ON mailing_log(edition_at DESC);

-- Baja del newsletter. Web Crypto HMAC del email = token del link de baja.
-- ALTER TABLE no soporta IF NOT EXISTS en SQLite/D1: si ya corriste esto,
-- estas dos líneas tiran "duplicate column name" y se ignoran (es idempotente
-- a mano: corré el resto del archivo igual, el error de columna no aborta el wrangler).
ALTER TABLE newsletter_subs ADD COLUMN unsubscribed INTEGER DEFAULT 0;
ALTER TABLE newsletter_subs ADD COLUMN unsub_at INTEGER;
CREATE INDEX IF NOT EXISTS idx_newsletter_unsub ON newsletter_subs(unsubscribed);
