/** Integridad del contrato programático REST/MCP después de la migración a hubs. */
import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import calcIndex from '../src/lib/calc-compute-index.json';

const ROOT = process.cwd();
const FORMULAS_DIR = join(ROOT, 'src/lib/formulas');
const EXPORTS_FN = /export\s+(async\s+)?function\s+[\p{L}\p{N}_$]+\s*\(|export\s+const\s+[\p{L}\p{N}_$]+\s*(:[^=]+)?=\s*(async\s*)?\(|export\s+default\s+(async\s+)?function|export\s*\{/u;

const calcs = Object.entries(calcIndex).map(([slug, entry]) => ({
  url: `/${entry.p ?? ''}${slug}`,
  formulaId: entry.f,
}));

describe('integridad calc ↔ fórmula', () => {
  it('preserva el catálogo programático tras consolidar las páginas en hubs', () => {
    expect(calcs.length).toBeGreaterThan(3000);
  });

  it('todo contrato programático tiene archivo de fórmula', () => {
    const missing = calcs.filter((c) => !existsSync(join(FORMULAS_DIR, `${c.formulaId}.ts`)));
    expect(missing, missing.slice(0, 15).map((c) => `${c.url} → ${c.formulaId}`).join('\n')).toEqual([]);
  });

  it('cada fórmula referenciada exporta una función', () => {
    const noFn = [...new Set(calcs.map((c) => c.formulaId))].filter((id) => {
      const path = join(FORMULAS_DIR, `${id}.ts`);
      return existsSync(path) && !EXPORTS_FN.test(readFileSync(path, 'utf8'));
    });
    expect(noFn, noFn.slice(0, 15).join(', ')).toEqual([]);
  });
});
