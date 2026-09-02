import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

// Integridad de src/lib/hub-families.json (bloque "la misma cuenta en otros
// países" en hubs). Cada url debe ser un hub real y el mapa debe ser
// bidireccional: si A lista a B, B lista a A.

const ROOT = join(__dirname, '..');
const families = JSON.parse(readFileSync(join(ROOT, 'src/lib/hub-families.json'), 'utf8')) as Record<
  string,
  { topic: string; siblings: Array<{ url: string; country: string; flag: string; label: string }> }
>;

function walk(dir: string, out: string[] = []): string[] {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (p.endsWith('.ts')) out.push(p);
  }
  return out;
}
const hubSlugs = new Set<string>();
for (const f of walk(join(ROOT, 'src/lib/hubs'))) {
  const m = readFileSync(f, 'utf8').match(/slug:\s*'([^']+)'/);
  if (m) hubSlugs.add('/' + m[1]);
}

describe('hub-families.json', () => {
  const keys = Object.keys(families);
  it('tiene cobertura (si el source existe)', () => {
    expect(keys.length).toBeGreaterThan(0);
  });
  it('cada key y cada sibling es un hub real', () => {
    for (const k of keys) {
      expect(hubSlugs.has(k), `key ${k}`).toBe(true);
      for (const s of families[k].siblings) expect(hubSlugs.has(s.url), `${k} → ${s.url}`).toBe(true);
    }
  });
  it('es bidireccional y sin self-links', () => {
    for (const k of keys) {
      for (const s of families[k].siblings) {
        expect(s.url).not.toBe(k);
        const back = families[s.url]?.siblings.map((x) => x.url) ?? [];
        expect(back, `${s.url} no apunta de vuelta a ${k}`).toContain(k);
      }
    }
  });
  it('cada sibling tiene país, bandera y label', () => {
    for (const k of keys) for (const s of families[k].siblings) {
      expect(s.country.length).toBeGreaterThan(1);
      expect(s.flag.length).toBeGreaterThan(0);
      expect(s.label.length).toBeGreaterThan(2);
    }
  });
});
