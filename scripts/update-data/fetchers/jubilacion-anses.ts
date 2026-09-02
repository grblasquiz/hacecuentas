/**
 * Jubilación mínima ANSES (monthly) — DETERMINÍSTICO por movilidad DNU 274/2024.
 *
 * La movilidad post-marzo-2024 es 100% mecánica: el haber del mes m se ajusta
 * por el IPC de dos meses antes (m-2), que INDEC publica a mitad de mes. O sea:
 *
 *   haber_mínimo(m) = haber_mínimo(m-1) × (1 + IPC(m-2)/100)
 *
 * Anclamos con el valor oficial de AGOSTO 2026: $419.775,93 (haber mínimo puro,
 * +1,89% por IPC de junio), establecido por la Resolución ANSES 232/2026.
 * Desde el ancla se encadena hacia adelante (o atrás) con
 * la serie IPC de api.argentinadatos.com (misma fuente que el fetcher `ipc`).
 *
 * LLM: solo cross-check opcional. Si hay ANTHROPIC_API_KEY se le pregunta a
 * Claude el valor vigente y se loguea la discrepancia (>0,5% = WARN); el valor
 * que se escribe SIEMPRE es el determinístico. Sin key, corre igual.
 *
 * Patchea `src/lib/formulas/jubilacion-minima.ts` (HABER_MINIMO + BONO_EXTRA).
 */

import { join } from 'node:path';
import { askClaudeStructured } from '../utils/ask-claude.ts';
import { reportMode, reportWarn, hasLlmAccess } from '../utils/run-status.ts';
import { replaceNumericConst } from '../patchers/ts-constant.ts';
import { touchLastUpdated } from '../patchers/data-update-date.ts';
import { createLogger } from '../utils/logger.ts';

const log = createLogger('jubilacion-anses');
const FILE = join(process.cwd(), 'src/lib/formulas/jubilacion-minima.ts');

// ── Ancla oficial (verificar/actualizar cuando haya un valor confirmado nuevo) ──
// Agosto 2026: haber mínimo $419.775,93 (+1,89% = IPC jun-2026), Res. 232/2026.
const ANCLA = { periodo: '2026-08', haber: 419775.93 };
const BONO_EXTRA = 70000;

interface InflacionItem {
  fecha: string; // YYYY-MM-DD
  valor: number; // % mensual
}

/** '2026-08' + n meses */
function addMonths(periodo: string, n: number): string {
  const [y, m] = periodo.split('-').map(Number);
  const d = new Date(Date.UTC(y, m - 1 + n, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
}

/**
 * Haber mínimo del período pedido, encadenando IPC desde el ancla.
 * Devuelve null si falta algún IPC intermedio (aún no publicado).
 */
function haberPara(periodo: string, ipcByMes: Map<string, number>): number | null {
  let haber = ANCLA.haber;
  let cursor = ANCLA.periodo;
  // hacia adelante: haber(m) = haber(m-1) × (1 + IPC(m-2))
  while (cursor < periodo) {
    const next = addMonths(cursor, 1);
    const ipc = ipcByMes.get(addMonths(next, -2));
    if (ipc === undefined) return null;
    haber = haber * (1 + ipc / 100);
    cursor = next;
  }
  // hacia atrás (por si el ancla queda en el futuro respecto del mes vigente)
  while (cursor > periodo) {
    const ipc = ipcByMes.get(addMonths(cursor, -2));
    if (ipc === undefined) return null;
    haber = haber / (1 + ipc / 100);
    cursor = addMonths(cursor, -1);
  }
  return Math.round(haber * 100) / 100;
}

async function crossCheckLLM(mesLegible: string, haberDeterministico: number): Promise<void> {
  const result = await askClaudeStructured<{ haberMinimo: number; fuenteUrl: string }>({
    task:
      `Buscá en anses.gob.ar o notas oficiales recientes el HABER JUBILATORIO MÍNIMO puro (sin bonos) vigente en Argentina en ${mesLegible}. ` +
      `Devolvé haberMinimo (número en pesos) y fuenteUrl.`,
    schema: {
      type: 'object',
      required: ['haberMinimo', 'fuenteUrl'],
      properties: {
        haberMinimo: { type: 'number', minimum: 100000, maximum: 5000000 },
        fuenteUrl: { type: 'string' },
      },
    },
  });
  if (!result) {
    log.info('cross-check LLM no disponible — sigo con el valor determinístico');
    return;
  }
  const delta = Math.abs(result.haberMinimo - haberDeterministico) / haberDeterministico;
  if (delta > 0.005) {
    reportWarn(
      'jubilacion-anses',
      `cross-check LLM discrepa ${(delta * 100).toFixed(2)}%: determinístico $${haberDeterministico} vs LLM $${result.haberMinimo} (${result.fuenteUrl}) — se usa el determinístico; revisar ancla`,
    );
  } else {
    log.success(`cross-check LLM OK (delta ${(delta * 100).toFixed(2)}%, fuente ${result.fuenteUrl})`);
  }
}

export async function fetchJubilacionAnses({ dry = false }: { dry?: boolean }): Promise<boolean> {
  const today = new Date();
  const periodo = today.toISOString().slice(0, 7); // mes vigente
  const mesLegible = today.toLocaleString('es-AR', { month: 'long', year: 'numeric' });
  log.info(`calculando haber mínimo ${mesLegible} por movilidad DNU 274/2024 (ancla ${ANCLA.periodo} = $${ANCLA.haber})`);

  // Serie IPC (misma fuente que el fetcher `ipc`)
  let ipcByMes: Map<string, number>;
  try {
    const res = await fetch('https://api.argentinadatos.com/v1/finanzas/indices/inflacion');
    if (!res.ok) throw new Error(`argentinadatos respondió ${res.status}`);
    const data: InflacionItem[] = await res.json();
    ipcByMes = new Map(data.map((d) => [d.fecha.slice(0, 7), d.valor]));
  } catch (err) {
    reportWarn('jubilacion-anses', `no pude traer la serie IPC (${(err as Error).message}) — sin update este run`);
    reportMode('jubilacion-anses', 'pending');
    return false;
  }

  let haber = haberPara(periodo, ipcByMes);
  let periodoEfectivo = periodo;
  if (haber === null) {
    // IPC(m-2) todavía no publicado para el mes pedido: usar el último mes computable.
    for (let back = 1; back <= 3 && haber === null; back++) {
      periodoEfectivo = addMonths(periodo, -back);
      haber = haberPara(periodoEfectivo, ipcByMes);
    }
  }
  if (haber === null) {
    reportWarn('jubilacion-anses', 'no pude computar el haber: faltan IPC intermedios entre el ancla y el mes vigente');
    reportMode('jubilacion-anses', 'pending');
    return false;
  }

  reportMode('jubilacion-anses', 'deterministic');
  log.info(`haber mínimo ${periodoEfectivo}: $${haber.toLocaleString('es-AR')} · bono: $${BONO_EXTRA.toLocaleString('es-AR')}`);

  // Cross-check LLM opcional (nunca bloquea ni cambia el valor escrito)
  if (hasLlmAccess()) {
    try {
      await crossCheckLLM(mesLegible, haber);
    } catch (err) {
      log.warn(`cross-check LLM falló: ${(err as Error).message}`);
    }
  } else {
    log.info('sin ANTHROPIC_API_KEY ni CLI claude — cross-check LLM omitido (no hace falta: camino determinístico)');
  }

  if (dry) {
    log.info(`would patch HABER_MINIMO = ${haber}`);
    log.info(`would patch BONO_EXTRA = ${BONO_EXTRA}`);
    return true;
  }

  let anyChanged = false;
  const hRes = replaceNumericConst(FILE, 'HABER_MINIMO', haber);
  if (hRes.changed) {
    log.success(`HABER_MINIMO: ${hRes.oldValue} → ${haber}`);
    anyChanged = true;
  }
  const bRes = replaceNumericConst(FILE, 'BONO_EXTRA', BONO_EXTRA);
  if (bRes.changed) {
    log.success(`BONO_EXTRA: ${bRes.oldValue} → ${BONO_EXTRA}`);
    anyChanged = true;
  }

  if (anyChanged) {
    touchLastUpdated('calculadora-jubilacion-minima-anses', today.toISOString().slice(0, 10));
    return true;
  }
  log.skip('sin cambios');
  return false;
}
