/**
 * Jubilación mínima ANSES (monthly) — auto-llm vía Claude + WebSearch en ANSES.
 *
 * ANSES actualiza el haber jubilatorio mínimo mensualmente por movilidad IPC
 * (Ley 27.609 post-Milei: actualización mensual por inflación). El bono extra
 * para haberes mínimos lo anuncia el gobierno de nación discrecionalmente.
 *
 * Fuente: anses.gob.ar/informacion/haberes-previsionales o las gacetillas
 * mensuales de ANSES.
 *
 * Patchea `src/lib/formulas/jubilacion-minima.ts` (HABER_MINIMO + BONO_EXTRA).
 */

import { join } from 'node:path';
import { askClaudeStructured } from '../utils/ask-claude.ts';
import { replaceNumericConst } from '../patchers/ts-constant.ts';
import { touchLastUpdated } from '../patchers/data-update-date.ts';
import { createLogger } from '../utils/logger.ts';

const log = createLogger('jubilacion-anses');
const FILE = join(process.cwd(), 'src/lib/formulas/jubilacion-minima.ts');

interface JubilacionData {
  fechaVigencia: string;
  fuenteUrl: string;
  haberMinimo: number;
  bonoExtra: number;
  tieneBonoEsteMes: boolean;
}

export async function fetchJubilacionAnses({ dry = false }: { dry?: boolean }): Promise<boolean> {
  const today = new Date();
  const mesActual = today.toLocaleString('es-AR', { month: 'long', year: 'numeric' });
  log.info(`consultando Claude para haber jubilatorio mínimo ${mesActual}`);

  const result = await askClaudeStructured<JubilacionData>({
    task:
      `Buscá en anses.gob.ar o en notas oficiales recientes el HABER JUBILATORIO MÍNIMO vigente en Argentina este mes (${mesActual}).\n\n` +
      `Necesito:\n` +
      `- haberMinimo: monto del haber mínimo mensual puro (sin bonos).\n` +
      `- bonoExtra: si ANSES anunció bono complementario para haberes mínimos ESTE mes, cuánto es. Si no hay anuncio vigente, poner 0.\n` +
      `- tieneBonoEsteMes: boolean. True si hay bono anunciado que se paga este mes o el próximo.\n` +
      `- fechaVigencia: YYYY-MM-DD cuándo empezó a regir este haber.\n` +
      `- fuenteUrl: URL oficial (anses.gob.ar idealmente).\n\n` +
      `Contexto: en abril 2026 el haber mínimo ronda los $280.000 y el bono (cuando se anuncia) suele ser $70.000.\n` +
      `Ley 27.609 establece actualización mensual por IPC desde marzo 2024.`,
    schema: {
      type: 'object',
      required: ['fechaVigencia', 'haberMinimo', 'bonoExtra', 'tieneBonoEsteMes', 'fuenteUrl'],
      properties: {
        fechaVigencia: { type: 'string', pattern: '^\\d{4}-\\d{2}-\\d{2}$' },
        fuenteUrl: { type: 'string' },
        haberMinimo: { type: 'number', minimum: 100000, maximum: 5000000 },
        bonoExtra: { type: 'number', minimum: 0, maximum: 2000000 },
        tieneBonoEsteMes: { type: 'boolean' },
      },
    },
    validate: (data) => {
      // Sanity: bono debería ser <= haber (si es mayor, algo raro)
      if (data.bonoExtra > data.haberMinimo) {
        return { ok: false, reason: 'bono mayor que haber — poco probable' };
      }
      return { ok: true };
    },
  });

  if (!result) return false;

  log.info(`vigencia ${result.fechaVigencia}`);
  log.info(`fuente: ${result.fuenteUrl}`);
  log.info(`haber mínimo: $${result.haberMinimo.toLocaleString('es-AR')}`);
  log.info(`bono extra: $${result.bonoExtra.toLocaleString('es-AR')} (anunciado: ${result.tieneBonoEsteMes ? 'sí' : 'no'})`);

  const todayStr = today.toISOString().slice(0, 10);

  if (dry) {
    log.info(`would patch HABER_MINIMO = ${result.haberMinimo}`);
    if (result.tieneBonoEsteMes) log.info(`would patch BONO_EXTRA = ${result.bonoExtra}`);
    return true;
  }

  let anyChanged = false;
  const hRes = replaceNumericConst(FILE, 'HABER_MINIMO', result.haberMinimo);
  if (hRes.changed) {
    log.success(`HABER_MINIMO: ${hRes.oldValue} → ${result.haberMinimo}`);
    anyChanged = true;
  }
  // Solo patchear el bono si hay uno vigente — si no, dejamos el valor anterior
  // como referencia histórica (el usuario puede togglearlo en el calc).
  if (result.tieneBonoEsteMes && result.bonoExtra > 0) {
    const bRes = replaceNumericConst(FILE, 'BONO_EXTRA', result.bonoExtra);
    if (bRes.changed) {
      log.success(`BONO_EXTRA: ${bRes.oldValue} → ${result.bonoExtra}`);
      anyChanged = true;
    }
  }

  if (anyChanged) {
    touchLastUpdated('calculadora-jubilacion-minima-anses', todayStr);
    return true;
  }
  log.skip('sin cambios');
  return false;
}
