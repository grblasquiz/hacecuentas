// ESPN rejects date ranges for these scoreboards. Request complete calendar days.
import { getJsonWithRetry } from './fetch-json.mjs';
export function calendarDays(start, end) {
  const parse = (key) => {
    if (!/^\d{8}$/.test(key)) throw new Error(`Invalid calendar day: ${key}`);
    const date = new Date(`${key.slice(0, 4)}-${key.slice(4, 6)}-${key.slice(6, 8)}T00:00:00Z`);
    if (!Number.isFinite(+date) || date.toISOString().slice(0, 10).replaceAll('-', '') !== key) throw new Error(`Invalid calendar day: ${key}`);
    return date;
  };
  const first = parse(start), last = parse(end);
  if (!Number.isFinite(+first) || !Number.isFinite(+last) || first > last || last - first > 31 * 86400000) {
    throw new Error(`Invalid scoreboard date window: ${start}-${end}`);
  }
  const days = [];
  for (let day = first; day <= last; day = new Date(+day + 86400000)) days.push(day.toISOString().slice(0, 10).replaceAll('-', ''));
  return days;
}
// Workers may reuse a module across requests. Never share pending I/O or
// semaphore waiters between requests: Cloudflare cancels cross-request waits.
export function createFootballClient({ apiBase = 'https://site.api.espn.com/apis' } = {}) {
  const getJson = (url) => limited(() => getJsonWithRetry(url));
  let active = 0;
  const waiting = [];
  async function limited(task) {
    if (active >= 6) await new Promise((resolve) => waiting.push(resolve));
    else active++;
    try { return await task(); }
    finally { const next = waiting.shift(); if (next) next(); else active--; }
  }
  async function scoreboard(code, start, end) {
    const pages = await Promise.all(calendarDays(start, end).map(async (day) => {
      const page = await getJson(`${apiBase}/site/v2/sports/soccer/${code}/scoreboard?dates=${day}&limit=100`);
      if (!Array.isArray(page.events)) throw new Error(`Invalid scoreboard for ${code} on ${day}`);
      return page.events;
    }));
    const events = new Map();
    for (const event of pages.flat()) {
      if (!event.id || !event.date) throw new Error(`Invalid event for ${code}`);
      events.set(event.id, event);
    }
    return { events: [...events.values()].sort((a, b) => a.date.localeCompare(b.date) || String(a.id).localeCompare(String(b.id))) };
  }
  return { getJson, scoreboard };
}
// CLI fetchers have one invocation; their leagues share this bounded client.
export const { getJson, scoreboard } = createFootballClient();
