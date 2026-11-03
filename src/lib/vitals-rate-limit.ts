/** Atomic fixed-window counter in the existing D1 database, without KV writes. */
export async function consumeVitalsLimit(db: D1Database, key: string, now: number, limit: number, windowSec: number, legacy?: () => Promise<string | null>): Promise<number | null> {
  // Carry over any still-active KV window once, rather than reset its protection.
  if (legacy && !await db.prepare('SELECT key FROM vitals_rate_limits WHERE key = ?').bind(key).first()) {
    const raw = await legacy();
    let previous: {count?: number; resetAt?: number} | null = null;
    try { previous = raw ? JSON.parse(raw) : null; } catch { /* old corrupt counter */ }
    if (previous && Number.isFinite(previous.count) && previous.count! >= 0 &&
        Number.isFinite(previous.resetAt) && previous.resetAt! > now) {
      await db.prepare('INSERT OR IGNORE INTO vitals_rate_limits (key, count, reset_at) VALUES (?, ?, ?)')
        .bind(key, previous.count, previous.resetAt).run();
    }
  }
  const row = await db.prepare(`
    INSERT INTO vitals_rate_limits (key, count, reset_at) VALUES (?, 1, ?)
    ON CONFLICT(key) DO UPDATE SET
      count = CASE WHEN reset_at <= ? THEN 1 ELSE count + 1 END,
      reset_at = CASE WHEN reset_at <= ? THEN excluded.reset_at ELSE reset_at END
    WHERE reset_at <= ? OR count < ?
    RETURNING count, reset_at
  `).bind(key, now + windowSec * 1000, now, now, now, limit)
    .first<{count: number; reset_at: number}>();
  if (row) {
    // Bounded indexed cleanup only when a new window starts. No historical data.
    if (row.count === 1) {
      try {
        await db.prepare(`DELETE FROM vitals_rate_limits WHERE key IN
          (SELECT key FROM vitals_rate_limits WHERE reset_at <= ? LIMIT 32)`)
          .bind(now).run();
      } catch { /* cleanup failure must not consume this request again via KV */ }
    }
    return null;
  }
  const blocked = await db.prepare('SELECT reset_at FROM vitals_rate_limits WHERE key = ?')
    .bind(key).first<{reset_at: number}>();
  return Math.max(1, Math.ceil(((blocked?.reset_at ?? now + windowSec * 1000) - now) / 1000));
}
