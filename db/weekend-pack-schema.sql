-- Segmentación para la captura evergreen del tráfico del Mundial.
-- Seguro para correr varias veces.
CREATE TABLE IF NOT EXISTS newsletter_interests (
  email TEXT NOT NULL,
  topic TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  source TEXT,
  referer TEXT,
  country TEXT,
  consent_version TEXT NOT NULL,
  active INTEGER NOT NULL DEFAULT 1,
  PRIMARY KEY (email, topic)
);

CREATE INDEX IF NOT EXISTS idx_newsletter_interests_topic
  ON newsletter_interests(topic, active, updated_at DESC);
