/** Build-time feed validation shared with regression tests. */
export function validFreshDate(value: unknown): string | null {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}(?:$|T)/.test(value)) return null;
  const day = value.slice(0, 10);
  const parsed = Date.parse(`${day}T00:00:00Z`);
  return Number.isFinite(parsed) && new Date(parsed).toISOString().slice(0, 10) === day ? day : null;
}

export function filterFreshEntries<T extends { loc: string; lastmod: string }>(
  entries: T[], primaryUrls: Set<string>, now: number,
): T[] {
  const byUrl = new Map<string, T>();
  for (const entry of entries) {
    const date = validFreshDate(entry.lastmod);
    if (!date || !primaryUrls.has(entry.loc)) continue;
    const age = now - Date.parse(`${date}T00:00:00Z`);
    if (age < 0 || age > 14 * 86400000) continue;
    const previous = byUrl.get(entry.loc);
    if (!previous || entry.lastmod > previous.lastmod) byUrl.set(entry.loc, entry);
  }
  return [...byUrl.values()].sort((a, b) => b.lastmod.localeCompare(a.lastmod));
}
