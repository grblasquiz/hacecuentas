/**
 * SMVM (monthly) — DETERMINÍSTICO por cronograma publicado + LLM solo de fallback.
 *
 * El Consejo del Salario (CNEPySMVyM) publica resoluciones con cronogramas de
 * varios meses, así que no hace falta LLM mientras el mes pedido caiga dentro
 * del último cronograma conocido. La Res. 9/2025 (BO 03-12-2025) fijó los
 * tramos nov-2025 → ago-2026 (verificado 22-07-2026: ago-2026 = $376.600,
 * $1.883/h). Valor hora oficial = mensual / 200.
 *
 * Vencimiento: si el mes vigente supera el último tramo, se intenta el camino
 * LLM (buscar la resolución nueva) si hay ANTHROPIC_API_KEY; sin key se emite
 * WARN "cronograma vencido, requiere resolución nueva" SIN romper el pipeline.
 * Al salir una resolución nueva: agregar sus tramos a CRONOGRAMA.
 *
 * Patchea `src/lib/data/smvm-ar-2026.ts`: SMVM_MENSUAL, SMVM_HORA, SMVM_FECHA.
 */

import { join } from 'node:path';
import { askClaudeStructured } from '../utils/ask-claude.ts';
import { reportMode, reportWarn, hasAnthropicKey } from '../utils/run-status.ts';
import { replaceNumericConst, replaceStringConst } from '../patchers/ts-constant.ts';
import { touchLastUpdated } from '../patchers/data-update-date.ts';
import { createLogger } from '../utils/logger.ts';

const log = createLogger('smvm');
const FILE = join(process.cwd(), 'src/lib/data/smvm-ar-2026.ts');
const SLUG = 'salario-minimo-vital-movil-argentina';

interface Tramo {
  periodo: string; // YYYY-MM
  mensual: number;
  hora: number; // = mensual / 200 (redondeado como publica la resolución)
  legible: string; // para SMVM_FECHA
}

// ── Cronograma conocido (última resolución publicada) ─────────────────────────
// Res. 9/2025 CNEPySMVyM — 10 tramos nov-2025 → ago-2026.
const CRONOGRAMA: Tramo[] = [
  { periodo: '2025-11', mensual: 328_400, hora: 1_642, legible: 'noviembre 2025' },
  { periodo: '2025-12', mensual: 334_800, hora: 1_674, legible: 'diciembre 2025' },
  { periodo: '2026-01', mensual: 341_000, hora: 1_705, legible: 'enero 2026' },
  { periodo: '2026-02', mensual: 346_800, hora: 1_734, legible: 'febrero 2026' },
  { periodo: '2026-03', mensual: 352_400, hora: 1_762, legible: 'marzo 2026' },
  { periodo: '2026-04', mensual: 357_800, hora: 1_789, legible: 'abril 2026' },
  { periodo: '2026-05', mensual: 363_000, hora: 1_815, legible: 'mayo 2026' },
  { periodo: '2026-06', mensual: 367_800, hora: 1_839, legible: 'junio 2026' },
  { periodo: '2026-07', mensual: 372_400, hora: 1_862, legible: 'julio 2026' },
  { periodo: '2026-08', mensual: 376_600, hora: 1_883, legible: 'agosto 2026' },
];

interface SmvmLLM {
  fechaVigencia: string;
  fechaVigenciaLegible: string;
  resolucion?: string;
  fuenteUrl: string;
  mensual: number;
  porHora: number;
}

async function fetchSmvmLLM(year: number): Promise<SmvmLLM | null> {
  return askClaudeStructured<SmvmLLM>({
    task:
      `Buscá en argentina.gob.ar/trabajo/consejodelsalario o en el Boletín Oficial la última resolución VIGENTE del Consejo del Salario que fija el SMVM (Salario Mínimo Vital y Móvil) para Argentina, año ${year}.\n\n` +
      `Necesito:\n` +
      `- mensual: SMVM mensual en pesos (jornada completa 48h semanales).\n` +
      `- porHora: SMVM por hora, mismo período.\n` +
      `- fechaVigencia: YYYY-MM-DD desde cuándo rige.\n` +
      `- fechaVigenciaLegible: 'abril 2026' / 'octubre 2025' (nombre del mes + año para UI).\n` +
      `- resolucion: nº de la resolución del CNEPySMVyM (opcional).\n` +
      `- fuenteUrl: URL oficial.\n\n` +
      `Contexto: la Res. 9/2025 terminó en agosto 2026 con $376.600/mes y $1.883/hora — busco la resolución POSTERIOR.\n` +
      `Sanity: el valor hora = mensual / 200.`,
    schema: {
      type: 'object',
      required: ['fechaVigencia', 'fechaVigenciaLegible', 'mensual', 'porHora', 'fuenteUrl'],
      properties: {
        fechaVigencia: { type: 'string', pattern: '^\\d{4}-\\d{2}-\\d{2}$' },
        fechaVigenciaLegible: { type: 'string', minLength: 3, maxLength: 30 },
        resolucion: { type: 'string' },
        fuenteUrl: { type: 'string' },
        mensual: { type: 'number', minimum: 100000, maximum: 10000000 },
        porHora: { type: 'number', minimum: 500, maximum: 50000 },
      },
    },
    validate: (data) => {
      const ratio = data.mensual / data.porHora;
      if (ratio < 150 || ratio > 250) {
        return { ok: false, reason: `ratio mensual/porHora=${ratio.toFixed(0)} fuera del rango 150-250` };
      }
      // Monotónico: el SMVM nominal nunca baja
      const last = CRONOGRAMA[CRONOGRAMA.length - 1];
      if (data.mensual < last.mensual) {
        return { ok: false, reason: `mensual ${data.mensual} < último tramo conocido ${last.mensual}` };
      }
      return { ok: true };
    },
  });
}

function patch(mensual: number, hora: number, legible: string, dry: boolean): boolean {
  if (dry) {
    log.info(`would patch SMVM_MENSUAL = ${mensual} · SMVM_HORA = ${hora} · SMVM_FECHA = '${legible}'`);
    return true;
  }
  let anyChanged = false;
  const mRes = replaceNumericConst(FILE, 'SMVM_MENSUAL', mensual);
  if (mRes.changed) {
    log.success(`SMVM_MENSUAL: ${mRes.oldValue} → ${mensual}`);
    anyChanged = true;
  }
  const hRes = replaceNumericConst(FILE, 'SMVM_HORA', hora);
  if (hRes.changed) {
    log.success(`SMVM_HORA: ${hRes.oldValue} → ${hora}`);
    anyChanged = true;
  }
  const fRes = replaceStringConst(FILE, 'SMVM_FECHA', legible);
  if (fRes.changed) {
    log.success(`SMVM_FECHA: '${fRes.oldValue}' → '${legible}'`);
    anyChanged = true;
  }
  if (anyChanged) {
    touchLastUpdated(SLUG, new Date().toISOString().slice(0, 10));
    return true;
  }
  log.skip('sin cambios');
  return false;
}

export async function fetchSmvm({ dry = false }: { dry?: boolean }): Promise<boolean> {
  const periodo = new Date().toISOString().slice(0, 7); // YYYY-MM vigente
  const ultimo = CRONOGRAMA[CRONOGRAMA.length - 1];

  // Tramo vigente = el último cuyo período <= mes actual
  const vigente = [...CRONOGRAMA].reverse().find((t) => t.periodo <= periodo);

  if (periodo <= ultimo.periodo && vigente) {
    reportMode('smvm', 'deterministic');
    log.info(`cronograma Res. 9/2025 cubre ${periodo}: $${vigente.mensual.toLocaleString('es-AR')}/mes · $${vigente.hora.toLocaleString('es-AR')}/h (${vigente.legible})`);
    return patch(vigente.mensual, vigente.hora, vigente.legible, dry);
  }

  // Cronograma vencido: intentar LLM si hay key; si no, WARN sin romper.
  log.warn(`cronograma conocido termina en ${ultimo.periodo} y estamos en ${periodo}`);
  if (hasAnthropicKey()) {
    log.info('consultando Claude por la resolución nueva del Consejo del Salario');
    const result = await fetchSmvmLLM(new Date().getFullYear());
    if (result) {
      reportMode('smvm', 'llm');
      log.info(`vigencia ${result.fechaVigencia} (${result.fechaVigenciaLegible}) · fuente: ${result.fuenteUrl}`);
      reportWarn('smvm', `cronograma Res. 9/2025 vencido — valor tomado por LLM (${result.resolucion || 'resolución s/n'}); agregar los tramos nuevos a CRONOGRAMA en fetchers/smvm.ts`);
      return patch(result.mensual, result.porHora, result.fechaVigenciaLegible, dry);
    }
    reportMode('smvm', 'pending');
    reportWarn('smvm', 'cronograma vencido y el LLM no devolvió resolución nueva — requiere resolución nueva en CRONOGRAMA');
    return false;
  }
  reportMode('smvm', 'pending');
  reportWarn('smvm', 'cronograma vencido, requiere resolución nueva (sin ANTHROPIC_API_KEY para buscarla) — agregar tramos a CRONOGRAMA en fetchers/smvm.ts');
  return false;
}
