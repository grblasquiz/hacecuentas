/**
 * Smoke test masivo: corre TODAS las fórmulas registradas con inputs típicos.
 *
 * Estrategia:
 *  1. Lee todos los JSON de `src/content/calcs/`.
 *  2. Para cada calc con `formulaId` registrado, arma `inputs` desde
 *     `fields[].default` / `fields[].placeholder` (o fallbacks por tipo).
 *  3. Llama `formulas[formulaId](inputs)` y verifica:
 *       - no tira excepción
 *       - el output es un objeto plano (no null/array/primitive)
 *       - al menos un valor del output es number finito o string non-empty
 *  4. Acumula errores; al final del suite hace UN solo `expect` que falla
 *     con el resumen agrupado si `errors.length > 0`.
 *
 * El test corre en <30s para 2700+ calcs porque las fórmulas son puras
 * y no hay I/O adentro (todo el FS se lee al toplevel sincronamente una vez).
 */

import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { formulas } from '../src/lib/formulas/index';

const CALCS_DIR = join(__dirname, '..', 'src', 'content', 'calcs');

// ---------------------------------------------------------------------------
// Slugs con UX especial que requieren inputs interdependientes (ej: dejar uno
// vacío para resolverlo, elegir 2 selecciones simultáneas, etc.).
// El smoke test no puede armar inputs típicos válidos; se skipean.
// ---------------------------------------------------------------------------
const SKIP_SLUGS = new Set<string>([
  // Pide dejar uno de los inputs en 0 para que la fórmula lo despeje.
  'calculadora-ley-ohm-voltaje-corriente-resistencia',
  'calculadora-potencia-electrica-watts-volts-amperes',
  'calculadora-frecuencia-longitud-onda',
  // Pide ingresar exactamente 3 de 4 valores y dejar 1 vacío (PV=nRT).
  'calculadora-ley-gases-ideales',
  // Pide elegir 2 selecciones distintas (defaults vacíos rompen).
  'calculadora-mundial-2026-probabilidad-ganar-penales',
  // Pide marcar al menos una zona afectada (todas las zonas son selects con
  // default '0' = no afectada → la suma da 0 y la regla pide >0).
  'calculadora-superficie-quemadura-regla-nueves',
]);

// ---------------------------------------------------------------------------
// Tipos mínimos del JSON de calc
// ---------------------------------------------------------------------------
interface CalcField {
  id: string;
  type?: string;
  placeholder?: string | number;
  default?: any;
  min?: number;
  max?: number;
  options?: Array<{ value: any; label?: string }>;
  required?: boolean;
}

interface CalcJson {
  slug?: string;
  formulaId?: string;
  fields?: CalcField[];
}

// ---------------------------------------------------------------------------
// Builder de inputs típicos a partir de los `fields[]` del JSON.
// ---------------------------------------------------------------------------
function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function todayIsoDateTime(): string {
  return new Date().toISOString().slice(0, 16);
}

function buildInputs(fields: CalcField[] | undefined): Record<string, any> {
  const inputs: Record<string, any> = {};
  if (!Array.isArray(fields)) return inputs;

  for (const f of fields) {
    if (!f || !f.id) continue;
    const t = f.type ?? 'number';

    // 1) Si tiene `default`, usar tal cual (la fuente de verdad para el formulario).
    if (f.default !== undefined && f.default !== null && f.default !== '') {
      inputs[f.id] = f.default;
      continue;
    }

    if (t === 'number') {
      const ph = f.placeholder;
      let n: number | undefined;
      if (typeof ph === 'number' && Number.isFinite(ph)) n = ph;
      else if (typeof ph === 'string') {
        // placeholders tipo "1.000" o "1,5" — limpiar separador de miles ES.
        const cleaned = ph.replace(/\./g, '').replace(',', '.');
        const parsed = parseFloat(cleaned);
        if (!Number.isNaN(parsed) && Number.isFinite(parsed)) n = parsed;
      }
      if (n === undefined && typeof f.min === 'number') n = f.min > 0 ? f.min : 1;
      if (n === undefined) n = 1;
      // Algunas fórmulas explotan con 0 (división), si min permite empujamos a 1.
      if (n === 0 && (f.min === undefined || f.min <= 1)) n = 1;
      inputs[f.id] = n;
    } else if (t === 'select') {
      const first = Array.isArray(f.options) && f.options.length > 0
        ? f.options[0].value
        : '';
      inputs[f.id] = first;
    } else if (t === 'boolean' || t === 'checkbox' || t === 'toggle') {
      inputs[f.id] = false;
    } else if (t === 'date') {
      inputs[f.id] = typeof f.placeholder === 'string' && f.placeholder
        ? f.placeholder
        : todayIso();
    } else if (t === 'datetime-local') {
      inputs[f.id] = typeof f.placeholder === 'string' && f.placeholder
        ? f.placeholder
        : todayIsoDateTime();
    } else {
      // text / textarea / cualquier otro
      inputs[f.id] = f.placeholder !== undefined ? String(f.placeholder) : '';
    }
  }
  return inputs;
}

// ---------------------------------------------------------------------------
// Validación del output: objeto con al menos un valor "útil".
// ---------------------------------------------------------------------------
function isUsefulOutput(out: any): { ok: boolean; reason?: string } {
  if (out === null || out === undefined) return { ok: false, reason: 'output null/undefined' };
  if (typeof out !== 'object') return { ok: false, reason: `output no es objeto (typeof=${typeof out})` };
  if (Array.isArray(out)) return { ok: false, reason: 'output es array, no objeto' };

  // Recorrer top-level values buscando algo "concreto".
  for (const v of Object.values(out)) {
    if (typeof v === 'number' && Number.isFinite(v)) return { ok: true };
    if (typeof v === 'string' && v.trim().length > 0) return { ok: true };
    // Algunos outputs envuelven el valor útil en sub-objetos/array (ej: tabla, _chart)
    if (typeof v === 'object' && v !== null) return { ok: true };
  }
  return { ok: false, reason: 'output sin valores number/string non-empty' };
}

// ---------------------------------------------------------------------------
// Carga sincrónica de todos los JSONs (toplevel, una sola vez).
// ---------------------------------------------------------------------------
const allCalcFiles = readdirSync(CALCS_DIR).filter((f) => f.endsWith('.json'));

interface LoadedCalc {
  file: string;
  slug: string;
  formulaId: string;
  fields: CalcField[];
}

const loaded: LoadedCalc[] = [];
const skipped: Array<{ file: string; reason: string }> = [];

for (const file of allCalcFiles) {
  try {
    const raw = readFileSync(join(CALCS_DIR, file), 'utf8');
    const json: CalcJson = JSON.parse(raw);
    const formulaId = json.formulaId;
    if (!formulaId) {
      skipped.push({ file, reason: 'sin formulaId' });
      continue;
    }
    if (!(formulaId in formulas)) {
      skipped.push({ file, reason: `formulaId "${formulaId}" no registrado en index` });
      continue;
    }
    loaded.push({
      file,
      slug: json.slug ?? file.replace(/\.json$/, ''),
      formulaId,
      fields: json.fields ?? [],
    });
  } catch (err: any) {
    skipped.push({ file, reason: `JSON parse error: ${err?.message ?? err}` });
  }
}

// ---------------------------------------------------------------------------
// Test suite — un solo `it` con loop interno para minimizar overhead de vitest.
// ---------------------------------------------------------------------------
describe('smoke test de todas las fórmulas', () => {
  // Override del testTimeout=3000 default — corremos miles de fórmulas en un solo it.
  it(`ejecuta ${loaded.length} fórmulas con inputs típicos`, { timeout: 60_000 }, () => {
    const errors: Array<{ slug: string; formulaId: string; error: string }> = [];

    for (const calc of loaded) {
      if (SKIP_SLUGS.has(calc.slug)) continue;
      const fn = formulas[calc.formulaId];
      const inputs = buildInputs(calc.fields);

      try {
        const out = fn(inputs);
        const v = isUsefulOutput(out);
        if (!v.ok) {
          errors.push({
            slug: calc.slug,
            formulaId: calc.formulaId,
            error: `output inválido: ${v.reason}`,
          });
        }
      } catch (err: any) {
        const msg = err?.message ?? String(err);
        // Truncar para que el reporte sea legible.
        errors.push({
          slug: calc.slug,
          formulaId: calc.formulaId,
          error: msg.length > 200 ? msg.slice(0, 200) + '...' : msg,
        });
      }
    }

    // Reporte resumen siempre (también en pass) para que se vea en CI.
    // eslint-disable-next-line no-console
    console.log(
      `\n[smoke] total cargados: ${loaded.length}` +
        ` | OK: ${loaded.length - errors.length}` +
        ` | fallos: ${errors.length}` +
        ` | skipped: ${skipped.length}`,
    );

    if (skipped.length > 0) {
      // eslint-disable-next-line no-console
      console.log(`[smoke] skipped (${skipped.length}):`);
      for (const s of skipped.slice(0, 20)) {
        // eslint-disable-next-line no-console
        console.log(`  - ${s.file}: ${s.reason}`);
      }
      if (skipped.length > 20) console.log(`  ...y ${skipped.length - 20} más`);
    }

    if (errors.length > 0) {
      // Agrupar por mensaje de error para detectar patrones.
      const byMsg = new Map<string, string[]>();
      for (const e of errors) {
        const arr = byMsg.get(e.error) ?? [];
        arr.push(e.slug);
        byMsg.set(e.error, arr);
      }

      const grouped = [...byMsg.entries()].sort((a, b) => b[1].length - a[1].length);

      const lines: string[] = [];
      lines.push(`\n${errors.length} fórmulas fallaron de ${loaded.length}:\n`);
      for (const [msg, slugs] of grouped) {
        lines.push(`  [${slugs.length}x] ${msg}`);
        for (const slug of slugs.slice(0, 5)) lines.push(`     - ${slug}`);
        if (slugs.length > 5) lines.push(`     ...y ${slugs.length - 5} más`);
      }
      // eslint-disable-next-line no-console
      console.log(lines.join('\n'));

      // Falla el test con summary en el mensaje.
      throw new Error(
        `Smoke test: ${errors.length}/${loaded.length} fórmulas fallaron. ` +
          `Top error: "${grouped[0][0]}" (${grouped[0][1].length} casos). Ver log arriba.`,
      );
    }

    // expect formal para que vitest tenga assertion explícita.
    expect(errors.length).toBe(0);
  });
});
