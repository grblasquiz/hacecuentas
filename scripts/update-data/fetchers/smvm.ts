/**
 * SMVM (biannual) — auto-llm vía Claude + WebSearch en Ministerio de Trabajo.
 *
 * El Consejo del Salario (CNEPySMVyM) actualiza el Salario Mínimo Vital y Móvil
 * por resolución, usualmente 1-2 veces por año. Fuente oficial:
 * argentina.gob.ar/trabajo/consejodelsalario.
 *
 * Patchea 3 constantes en `src/lib/formulas/salario-minimo.ts`:
 * SMVM_MENSUAL, SMVM_HORA, FECHA.
 */

import { join } from 'node:path';
import { askClaudeStructured } from '../utils/ask-claude.ts';
import { replaceNumericConst, replaceStringConst } from '../patchers/ts-constant.ts';
import { touchLastUpdated } from '../patchers/data-update-date.ts';
import { createLogger } from '../utils/logger.ts';

const log = createLogger('smvm');
const FILE = join(process.cwd(), 'src/lib/formulas/salario-minimo.ts');

interface SmvmData {
  fechaVigencia: string;
  fechaVigenciaLegible: string;
  resolucion?: string;
  fuenteUrl: string;
  mensual: number;
  porHora: number;
}

export async function fetchSmvm({ dry = false }: { dry?: boolean }): Promise<boolean> {
  const year = new Date().getFullYear();
  log.info(`consultando Claude para SMVM ${year}`);

  const result = await askClaudeStructured<SmvmData>({
    task:
      `Buscá en argentina.gob.ar/trabajo/consejodelsalario o en el Boletín Oficial la última resolución VIGENTE del Consejo del Salario que fija el SMVM (Salario Mínimo Vital y Móvil) para Argentina, año ${year}.\n\n` +
      `Necesito:\n` +
      `- mensual: SMVM mensual en pesos (jornada completa 48h semanales).\n` +
      `- porHora: SMVM por hora, mismo período.\n` +
      `- fechaVigencia: YYYY-MM-DD desde cuándo rige.\n` +
      `- fechaVigenciaLegible: 'abril 2026' / 'octubre 2025' (nombre del mes + año para UI).\n` +
      `- resolucion: nº de la resolución del CNEPySMVyM (opcional).\n` +
      `- fuenteUrl: URL oficial.\n\n` +
      `Contexto: en abril 2026 el SMVM ronda $340.000/mes y $1.700/hora (pueden haber variado).\n` +
      `Sanity: el mensual debe ser aprox 200× el porHora (48h × 4.33 semanas ≈ 208).`,
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
      // Sanity: mensual ≈ porHora × ~200 (jornada 48h/sem × 4.33 sem/mes ≈ 208h)
      const ratio = data.mensual / data.porHora;
      if (ratio < 150 || ratio > 250) {
        return { ok: false, reason: `ratio mensual/porHora=${ratio.toFixed(0)} fuera del rango 150-250` };
      }
      return { ok: true };
    },
  });

  if (!result) return false;

  log.info(`vigencia ${result.fechaVigencia} (${result.fechaVigenciaLegible})`);
  log.info(`fuente: ${result.fuenteUrl}`);
  log.info(`mensual: $${result.mensual.toLocaleString('es-AR')} · hora: $${result.porHora.toLocaleString('es-AR')}`);

  const today = new Date().toISOString().slice(0, 10);

  if (dry) {
    log.info(`would patch SMVM_MENSUAL = ${result.mensual}`);
    log.info(`would patch SMVM_HORA = ${result.porHora}`);
    log.info(`would patch FECHA = '${result.fechaVigenciaLegible}'`);
    return true;
  }

  let anyChanged = false;
  const mRes = replaceNumericConst(FILE, 'SMVM_MENSUAL', result.mensual);
  if (mRes.changed) {
    log.success(`SMVM_MENSUAL: ${mRes.oldValue} → ${result.mensual}`);
    anyChanged = true;
  }
  const hRes = replaceNumericConst(FILE, 'SMVM_HORA', result.porHora);
  if (hRes.changed) {
    log.success(`SMVM_HORA: ${hRes.oldValue} → ${result.porHora}`);
    anyChanged = true;
  }
  const fRes = replaceStringConst(FILE, 'FECHA', result.fechaVigenciaLegible);
  if (fRes.changed) {
    log.success(`FECHA: '${fRes.oldValue}' → '${result.fechaVigenciaLegible}'`);
    anyChanged = true;
  }

  if (anyChanged) {
    touchLastUpdated('salario-minimo-vital-movil-argentina', today);
    return true;
  }
  log.skip('sin cambios');
  return false;
}
