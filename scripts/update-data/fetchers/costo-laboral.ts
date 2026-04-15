/**
 * Costo laboral empleador (yearly) — auto-llm vía Claude + WebSearch en ARCA/SRT.
 *
 * ARCA define las contribuciones patronales (Ley 24.241 + Ley 27.541 + DNU
 * 70/2023) que varían si la empresa es grande (Dec. 814/2001 inc. a) o PyME
 * (inc. b). La Superintendencia de Riesgos del Trabajo regula la ART.
 *
 * Patchea 3 consts en `src/lib/formulas/costo-laboral.ts`:
 *   CARGA_GRANDE, CARGA_PYME, ART_DEFAULT.
 */

import { join } from 'node:path';
import { askClaudeStructured } from '../utils/ask-claude.ts';
import { replaceNumericConst } from '../patchers/ts-constant.ts';
import { touchLastUpdated } from '../patchers/data-update-date.ts';
import { createLogger } from '../utils/logger.ts';

const log = createLogger('costo-laboral');
const FILE = join(process.cwd(), 'src/lib/formulas/costo-laboral.ts');

interface CostoLaboralData {
  fechaVigencia: string;
  fuenteUrl: string;
  cargaGrande: number;
  cargaPyme: number;
  artPromedio: number;
  notas?: string;
}

export async function fetchCostoLaboral({ dry = false }: { dry?: boolean }): Promise<boolean> {
  const year = new Date().getFullYear();
  log.info(`consultando Claude para cargas patronales ${year}`);

  const result = await askClaudeStructured<CostoLaboralData>({
    task:
      `Buscá en arca.gob.ar / infoleg.gob.ar / srt.gob.ar las alícuotas VIGENTES de contribuciones patronales en Argentina para ${year}.\n\n` +
      `Necesito en decimal (0.2040 = 20.40%):\n` +
      `- cargaGrande: alícuota total patronal para empresas grandes (Dec. 814/2001 art. 2 inc. a — comercio/servicios con facturación > tope). Suma: jubilación SIPA + asignaciones familiares + FNE + INSSJP. En 2026 ≈ 20.40%.\n` +
      `- cargaPyme: alícuota total patronal para PyMEs (inc. b). En 2026 ≈ 18.00%.\n` +
      `- artPromedio: alícuota promedio ART sobre sueldo bruto (varía por actividad, pero el promedio nacional para oficina/servicios ronda 3%). En decimal.\n` +
      `- fechaVigencia: YYYY-MM-DD de la última actualización (DNU o resolución).\n` +
      `- fuenteUrl: URL oficial.\n` +
      `- notas: breve contexto si hubo cambio reciente (DNU 70/2023, reforma laboral pendiente, etc.).\n\n` +
      `Sanity: cargaGrande > cargaPyme, ambas entre 10% y 30%, ART entre 1% y 8%.`,
    schema: {
      type: 'object',
      required: ['fechaVigencia', 'cargaGrande', 'cargaPyme', 'artPromedio', 'fuenteUrl'],
      properties: {
        fechaVigencia: { type: 'string', pattern: '^\\d{4}-\\d{2}-\\d{2}$' },
        fuenteUrl: { type: 'string' },
        cargaGrande: { type: 'number', minimum: 0.1, maximum: 0.3 },
        cargaPyme: { type: 'number', minimum: 0.1, maximum: 0.3 },
        artPromedio: { type: 'number', minimum: 0.01, maximum: 0.08 },
        notas: { type: 'string' },
      },
    },
    validate: (data) => {
      if (data.cargaGrande <= data.cargaPyme) {
        return { ok: false, reason: 'cargaGrande debe ser > cargaPyme' };
      }
      return { ok: true };
    },
  });

  if (!result) return false;

  log.info(`vigencia ${result.fechaVigencia}`);
  log.info(`fuente: ${result.fuenteUrl}`);
  log.info(
    `grande: ${(result.cargaGrande * 100).toFixed(2)}% · pyme: ${(result.cargaPyme * 100).toFixed(2)}% · ART: ${(result.artPromedio * 100).toFixed(2)}%`,
  );
  if (result.notas) log.info(`notas: ${result.notas}`);

  const today = new Date().toISOString().slice(0, 10);

  if (dry) {
    log.info(`would patch CARGA_GRANDE = ${result.cargaGrande}`);
    log.info(`would patch CARGA_PYME = ${result.cargaPyme}`);
    log.info(`would patch ART_DEFAULT = ${result.artPromedio}`);
    return true;
  }

  let anyChanged = false;
  const gRes = replaceNumericConst(FILE, 'CARGA_GRANDE', result.cargaGrande);
  if (gRes.changed) {
    log.success(`CARGA_GRANDE: ${gRes.oldValue} → ${result.cargaGrande}`);
    anyChanged = true;
  }
  const pRes = replaceNumericConst(FILE, 'CARGA_PYME', result.cargaPyme);
  if (pRes.changed) {
    log.success(`CARGA_PYME: ${pRes.oldValue} → ${result.cargaPyme}`);
    anyChanged = true;
  }
  const aRes = replaceNumericConst(FILE, 'ART_DEFAULT', result.artPromedio);
  if (aRes.changed) {
    log.success(`ART_DEFAULT: ${aRes.oldValue} → ${result.artPromedio}`);
    anyChanged = true;
  }

  if (anyChanged) {
    touchLastUpdated('calculadora-costo-laboral-empleado', today);
    return true;
  }
  log.skip('sin cambios');
  return false;
}
