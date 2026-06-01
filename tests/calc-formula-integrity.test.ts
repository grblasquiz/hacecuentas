/**
 * Integridad calc ↔ fórmula (#50 del plan).
 *
 * Falla si una calc SERVIDA (no 410'd) referencia un `formulaId` que:
 *   - no tiene archivo en src/lib/formulas/, o
 *   - el archivo no exporta una función.
 *
 * Atrapa "renombré/borré una fórmula y dejé un calc vivo colgando" antes de que
 * sea un 501 en prod. Excluye las URLs en gone-410.ts (calcs muertas cuyo JSON
 * quedó de cruft — no son un problema vivo). Complementa a all-formulas-smoke
 * (que prueba ejecución). Correr: npm test
 */
import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const FORMULAS_DIR = join(ROOT, 'src/lib/formulas');
const CONTENT_DIR = join(ROOT, 'src/content');

// dir de colección → prefijo de URL (AR sin prefijo, el resto /locale).
const CALC_DIRS: Record<string, string> = {
  'calcs': '', 'calcs-en': '/en', 'calcs-pt': '/pt', 'calcs-mx': '/mx',
  'calcs-es': '/es', 'calcs-co': '/co', 'calcs-cl': '/cl',
};

// URLs que devuelven 410 (calcs muertas) — no se chequean.
function gone410(): Set<string> {
  try {
    const txt = readFileSync(join(ROOT, 'src/lib/gone-410.ts'), 'utf8');
    return new Set(txt.match(/"(\/[^"]+)"/g)?.map((s) => s.slice(1, -1)) ?? []);
  } catch { return new Set(); }
}

function liveCalcsWithFormula(): Array<{ file: string; url: string; formulaId: string }> {
  const dead = gone410();
  const out: Array<{ file: string; url: string; formulaId: string }> = [];
  for (const [dir, prefix] of Object.entries(CALC_DIRS)) {
    const full = join(CONTENT_DIR, dir);
    if (!existsSync(full)) continue;
    for (const f of readdirSync(full).filter((x) => x.endsWith('.json'))) {
      try {
        const j = JSON.parse(readFileSync(join(full, f), 'utf8'));
        if (typeof j.formulaId !== 'string' || !j.formulaId) continue;
        const url = `${prefix}/${j.slug}`;
        if (dead.has(url)) continue; // calc muerta → no es problema vivo
        out.push({ file: `${dir}/${f}`, url, formulaId: j.formulaId });
      } catch { /* JSON inválido lo agarra Zod en build */ }
    }
  }
  return out;
}

// Detecta un export de función (Unicode-aware: hay nombres con ñ, p.ej.
// caloriasSkiSnowboardMontaña). Soporta function, const = (... ) =>, named y default.
const EXPORTS_FN = /export\s+(async\s+)?function\s+[\p{L}\p{N}_$]+\s*\(|export\s+const\s+[\p{L}\p{N}_$]+\s*(:[^=]+)?=\s*(async\s*)?\(|export\s+default\s+(async\s+)?function|export\s*\{/u;

describe('integridad calc ↔ fórmula', () => {
  const calcs = liveCalcsWithFormula();

  it('hay calcs vivas con formulaId para chequear', () => {
    expect(calcs.length).toBeGreaterThan(1000);
  });

  it('todo formulaId de un calc VIVO tiene archivo .ts', () => {
    const missing = calcs.filter((c) => !existsSync(join(FORMULAS_DIR, `${c.formulaId}.ts`)));
    if (missing.length) {
      const sample = missing.slice(0, 15).map((c) => `  ${c.file} (${c.url}) → "${c.formulaId}" sin .ts`).join('\n');
      throw new Error(`${missing.length} calc(s) vivas apuntan a una fórmula inexistente:\n${sample}`);
    }
    expect(missing.length).toBe(0);
  });

  it('cada fórmula referenciada exporta una función', () => {
    const ids = [...new Set(calcs.map((c) => c.formulaId))];
    const noFn: string[] = [];
    for (const id of ids) {
      const p = join(FORMULAS_DIR, `${id}.ts`);
      if (!existsSync(p)) continue; // ya reportado arriba
      if (!EXPORTS_FN.test(readFileSync(p, 'utf8'))) noFn.push(id);
    }
    if (noFn.length) {
      throw new Error(`${noFn.length} fórmula(s) sin export de función: ${noFn.slice(0, 15).join(', ')}`);
    }
    expect(noFn.length).toBe(0);
  });
});
