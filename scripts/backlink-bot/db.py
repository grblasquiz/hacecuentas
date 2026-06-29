"""Pipeline en SQLite. Una fila por link publicado."""
import sqlite3
from datetime import datetime, timezone
from pathlib import Path

DB_PATH = Path(__file__).resolve().parent / 'backlinks.db'

SCHEMA = """
CREATE TABLE IF NOT EXISTS links (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  target_url    TEXT NOT NULL,      -- a dónde apunta el link (site, o un tier1 si es tier2)
  anchor        TEXT NOT NULL,
  platform      TEXT NOT NULL,
  tier          INTEGER NOT NULL,
  published_url TEXT,               -- la URL viva donde quedó el backlink
  status        TEXT NOT NULL,      -- published | verified_live | dead | failed
  dofollow      INTEGER,            -- 1/0/NULL (NULL = no verificado aún)
  title         TEXT,
  created_at    TEXT NOT NULL,
  verified_at   TEXT,
  note          TEXT
);
CREATE INDEX IF NOT EXISTS idx_links_status   ON links(status);
CREATE INDEX IF NOT EXISTS idx_links_tier      ON links(tier);
CREATE INDEX IF NOT EXISTS idx_links_created   ON links(created_at);

CREATE TABLE IF NOT EXISTS kv (
  k TEXT PRIMARY KEY,
  v TEXT
);
"""


def now():
    return datetime.now(timezone.utc).isoformat()


def conn():
    c = sqlite3.connect(DB_PATH)
    c.row_factory = sqlite3.Row
    c.executescript(SCHEMA)
    return c


def record(c, *, target_url, anchor, platform, tier, published_url, status,
           title=None, note=None):
    cur = c.execute(
        """INSERT INTO links (target_url, anchor, platform, tier, published_url,
                              status, title, created_at, note)
           VALUES (?,?,?,?,?,?,?,?,?)""",
        (target_url, anchor, platform, tier, published_url, status, title, now(), note),
    )
    c.commit()
    return cur.lastrowid


def published_today(c, tier):
    today = now()[:10]
    row = c.execute(
        "SELECT COUNT(*) n FROM links WHERE tier=? AND substr(created_at,1,10)=? "
        "AND status IN ('published','verified_live')",
        (tier, today),
    ).fetchone()
    return row['n']


def published_today_total(c):
    today = now()[:10]
    row = c.execute(
        "SELECT COUNT(*) n FROM links WHERE substr(created_at,1,10)=? "
        "AND status IN ('published','verified_live')", (today,)).fetchone()
    return row['n']


def live_tier1_urls(c, limit=200):
    rows = c.execute(
        "SELECT published_url FROM links WHERE tier=1 AND published_url IS NOT NULL "
        "AND status IN ('published','verified_live') ORDER BY created_at DESC LIMIT ?",
        (limit,),
    ).fetchall()
    return [r['published_url'] for r in rows]


def kv_get(c, k, default=None):
    row = c.execute("SELECT v FROM kv WHERE k=?", (k,)).fetchone()
    return row['v'] if row else default


def kv_set(c, k, v):
    c.execute("INSERT INTO kv(k,v) VALUES(?,?) ON CONFLICT(k) DO UPDATE SET v=?", (k, v, v))
    c.commit()
