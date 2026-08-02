import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { WEEKEND_CLUSTERS } from '../src/lib/weekend-clusters';
import { ALL_HUBS } from '../src/lib/hubs/registry';

// Universo de slugs vivos (campo `slug`, NO filename).
const CALCS_DIR = join(process.cwd(), 'src/content/calcs');
const liveSlugs = new Set<string>();
const canonicalOf = new Map<string, string>();
for (const f of readdirSync(CALCS_DIR)) {
  if (!f.endsWith('.json')) continue;
  try {
    const c = JSON.parse(readFileSync(join(CALCS_DIR, f), 'utf8'));
    if (c.slug) {
      liveSlugs.add(c.slug);
      if (c.canonicalSlug) canonicalOf.set(c.slug, c.canonicalSlug);
    }
  } catch { /* validado por otro test */ }
}

const allSlugs = WEEKEND_CLUSTERS.flatMap((c) => [c.master, ...c.members]);
const replacementSlugs = new Set(
  ALL_HUBS.flatMap((hub) => (hub.replaces || []).map((path) => path.replace(/^\//, ''))),
);

describe('WEEKEND_CLUSTERS — integridad', () => {
  it('todo slug del config existe como calc viva', () => {
    const dead = allSlugs.filter((s) => !liveSlugs.has(s) && !replacementSlugs.has(s));
    expect(dead, `slugs muertos en weekend-clusters: ${dead.join(', ')}`).toEqual([]);
  });

  it('ningún master está canonicalizado a otra calc (debe ser la cabeza)', () => {
    const masters = WEEKEND_CLUSTERS.map((c) => c.master);
    const canonized = masters.filter((s) => canonicalOf.has(s));
    expect(canonized, `masters con canonicalSlug (deberían ser cabeza): ${canonized.join(', ')}`).toEqual([]);
  });

  it('un member no se repite como su propio master en el mismo cluster', () => {
    for (const c of WEEKEND_CLUSTERS) {
      expect(c.members, `${c.key}: el master está entre sus members`).not.toContain(c.master);
    }
  });

  it('keys de cluster únicas', () => {
    const keys = WEEKEND_CLUSTERS.map((c) => c.key);
    expect(new Set(keys).size).toBe(keys.length);
  });
});
