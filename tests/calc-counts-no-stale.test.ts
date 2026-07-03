import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { TOTAL_PLAIN, CALC_COUNTS_PUBLIC } from '../src/lib/calc-counts';

/**
 * GUARDA DE CONTADORES (Fase 11).
 * Falla si alguna página/componente hardcodea un total de calculadoras que
 * difiere del display canónico de calc-counts.ts (única fuente de verdad).
 * El estado deseado es que TODA superficie use {TOTAL_PLAIN}/{TOTAL_DISPLAY}/
 * {CALC_COUNTS_PUBLIC.*}; entonces no hay literales y este test pasa.
 *
 * Objetivo explícito de la spec: "No deben existir diferencias entre 3.357,
 * 4.100, 4.200 o 4.300 por contenido desactualizado."
 */

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const ROOT = resolve(__dirname, '..');

function walk(dir: string, exts: string[]): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) out.push(...walk(full, exts));
    else if (exts.some((e) => name.endsWith(e))) out.push(full);
  }
  return out;
}

/** Total público real, redondeado hacia abajo al 100 (igual que TOTAL_DISPLAY). */
const canonical = parseInt(TOTAL_PLAIN.replace(/\./g, ''), 10);

// Un "reclamo de total del sitio" = número de 4+ dígitos (con o sin separador de
// miles) seguido de "+"? y de la palabra "calculadoras". Ej: "3.700 calculadoras",
// "3.357+ calculadoras". NO matchea "72 calculadoras" (conteo de categoría).
const CLAIM_RE = /(\d{1,3}(?:\.\d{3})+|\d{4,})\s*\+?\s+calculadoras/gi;
// Forma "más de N ..." donde N es claramente un total (4+ dígitos).
const MASDE_RE = /m[aá]s de\s+(\d{1,3}(?:\.\d{3})+|\d{4,})\s+calc/gi;

function scan(): Array<{ file: string; literal: string; value: number }> {
  const files = [
    ...walk(join(ROOT, 'src', 'pages'), ['.astro']),
    ...walk(join(ROOT, 'src', 'components'), ['.astro']),
  ];
  const hits: Array<{ file: string; literal: string; value: number }> = [];
  for (const file of files) {
    const src = readFileSync(file, 'utf8');
    for (const re of [CLAIM_RE, MASDE_RE]) {
      re.lastIndex = 0;
      let m: RegExpExecArray | null;
      while ((m = re.exec(src)) !== null) {
        const value = parseInt(m[1].replace(/\./g, ''), 10);
        if (value >= 1000) hits.push({ file: file.replace(ROOT + '/', ''), literal: m[0].trim(), value });
      }
    }
  }
  return hits;
}

describe('contadores de calculadoras — fuente única', () => {
  it('el display canónico es un entero válido', () => {
    expect(Number.isInteger(canonical)).toBe(true);
    expect(canonical).toBeGreaterThan(0);
    expect(canonical).toBeLessThanOrEqual(CALC_COUNTS_PUBLIC.publicTotal);
  });

  it('ninguna página/componente hardcodea un total de calcs distinto al canónico', () => {
    const stale = scan().filter((h) => h.value !== canonical);
    const msg = stale
      .map((h) => `  · ${h.file}: "${h.literal}" (${h.value}) ≠ canónico ${canonical}. Usá {TOTAL_PLAIN}/{TOTAL_DISPLAY}.`)
      .join('\n');
    expect(stale, `Contadores de calculadoras desactualizados:\n${msg}`).toEqual([]);
  });
});
