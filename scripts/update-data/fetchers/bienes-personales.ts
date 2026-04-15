/**
 * Bienes Personales (yearly) — auto-llm vía Claude + WebSearch en ARCA/Ley 27.743.
 *
 * ARCA actualiza anualmente el Mínimo No Imponible (MNI), la deducción por
 * casa-habitación, la escala progresiva y la tasa del régimen REIBP.
 * La reforma Ley 27.743 unificó alícuotas país/exterior y baja gradualmente
 * 2024 → 2027.
 *
 * Patchea 2 consts numéricas (MNI, DEDUCCION_CASA) + la tabla ESCALA en
 * `src/lib/formulas/bienes-personales.ts`.
 */

import { join } from 'node:path';
import { askClaudeStructured } from '../utils/ask-claude.ts';
import {
  replaceArrayLiteral,
  replaceNumericConst,
  formatNumberWithUnderscores,
} from '../patchers/ts-constant.ts';
import { touchLastUpdated } from '../patchers/data-update-date.ts';
import { createLogger } from '../utils/logger.ts';

const log = createLogger('bienes-personales');
const FILE = join(process.cwd(), 'src/lib/formulas/bienes-personales.ts');

interface Tramo {
  hasta: number | null;
  tasa: number;
  acumulado: number;
}

interface BienesData {
  fechaVigencia: string;
  anoFiscal: number;
  resolucion?: string;
  fuenteUrl: string;
  mni: number;
  deduccionCasa: number;
  escala: Tramo[];
}

function formatEscalaItems(tramos: Tramo[]): string {
  return tramos
    .map((t) => {
      const hasta = t.hasta === null ? 'Infinity' : formatNumberWithUnderscores(t.hasta);
      const acum = formatNumberWithUnderscores(t.acumulado);
      return `  { hasta: ${hasta}, tasa: ${t.tasa}, acumulado: ${acum} },`;
    })
    .join('\n');
}

export async function fetchBienesPersonales({ dry = false }: { dry?: boolean }): Promise<boolean> {
  const year = new Date().getFullYear();
  log.info(`consultando Claude para Bienes Personales ${year}`);

  const result = await askClaudeStructured<BienesData>({
    task:
      `Buscá en arca.gob.ar / infoleg.gob.ar los valores VIGENTES del impuesto a los Bienes Personales de Argentina para el año fiscal ${year - 1} (se declara en ${year}).\n\n` +
      `Contexto: Ley 27.743 (Ley Bases 2024) unificó alícuotas país/exterior y baja alícuotas gradualmente hasta 2027.\n\n` +
      `Necesito:\n` +
      `- mni: Mínimo No Imponible general en pesos (2024≈$292M, 2025≈$350M, ajuste por inflación).\n` +
      `- deduccionCasa: Deducción adicional por casa-habitación (2024≈$450M).\n` +
      `- escala: 4 tramos de escala progresiva sobre el excedente del MNI. Cada uno:\n` +
      `    - hasta: tope del excedente (último tramo usa null para indicar "sin tope")\n` +
      `    - tasa: alícuota decimal (0.005 = 0.5%)\n` +
      `    - acumulado: impuesto acumulado al INICIO del tramo\n` +
      `- anoFiscal: año al que aplica la declaración (número).\n` +
      `- fechaVigencia: YYYY-MM-DD de la última actualización normativa.\n` +
      `- resolucion: RG ARCA (opcional).\n` +
      `- fuenteUrl: URL oficial.\n\n` +
      `Sanity: alícuotas 0.4%-1.75%, acumulado creciente, primer acumulado=0.`,
    schema: {
      type: 'object',
      required: ['fechaVigencia', 'anoFiscal', 'mni', 'deduccionCasa', 'escala', 'fuenteUrl'],
      properties: {
        fechaVigencia: { type: 'string', pattern: '^\\d{4}-\\d{2}-\\d{2}$' },
        anoFiscal: { type: 'number', minimum: 2023, maximum: 2030 },
        resolucion: { type: 'string' },
        fuenteUrl: { type: 'string' },
        mni: { type: 'number', minimum: 100_000_000, maximum: 5_000_000_000 },
        deduccionCasa: { type: 'number', minimum: 100_000_000, maximum: 10_000_000_000 },
        escala: {
          type: 'array',
          minItems: 3,
          maxItems: 6,
          items: {
            type: 'object',
            required: ['hasta', 'tasa', 'acumulado'],
            properties: {
              hasta: {
                oneOf: [
                  { type: 'number', minimum: 1_000_000, maximum: 100_000_000_000 },
                  { type: 'null' },
                ],
              },
              tasa: { type: 'number', minimum: 0.001, maximum: 0.03 },
              acumulado: { type: 'number', minimum: 0, maximum: 1_000_000_000 },
            },
          },
        },
      },
    },
    validate: (data) => {
      const e = data.escala;
      if (e[e.length - 1].hasta !== null) {
        return { ok: false, reason: 'último tramo debe tener hasta=null' };
      }
      if (e[0].acumulado !== 0) {
        return { ok: false, reason: 'primer tramo debe tener acumulado=0' };
      }
      for (let i = 1; i < e.length; i++) {
        if (e[i].tasa < e[i - 1].tasa) return { ok: false, reason: `tasa tramo ${i} decreciente` };
        if (e[i].acumulado < e[i - 1].acumulado) return { ok: false, reason: `acumulado tramo ${i} decreciente` };
      }
      return { ok: true };
    },
  });

  if (!result) return false;

  log.info(`vigencia ${result.fechaVigencia} — año fiscal ${result.anoFiscal}`);
  log.info(`fuente: ${result.fuenteUrl}`);
  log.info(`MNI: $${(result.mni / 1e6).toFixed(0)}M · deducción casa: $${(result.deduccionCasa / 1e6).toFixed(0)}M`);
  log.info(`${result.escala.length} tramos: ${result.escala.map((t) => `${(t.tasa * 100).toFixed(2)}%`).join(' → ')}`);

  const today = new Date().toISOString().slice(0, 10);

  if (dry) {
    log.info(`would patch MNI = ${result.mni}`);
    log.info(`would patch DEDUCCION_CASA = ${result.deduccionCasa}`);
    log.info(`would patch ESCALA (${result.escala.length} tramos)`);
    return true;
  }

  let anyChanged = false;
  const mniRes = replaceNumericConst(FILE, 'MNI', result.mni);
  if (mniRes.changed) {
    log.success(`MNI: ${mniRes.oldValue} → ${result.mni}`);
    anyChanged = true;
  }
  const dedRes = replaceNumericConst(FILE, 'DEDUCCION_CASA', result.deduccionCasa);
  if (dedRes.changed) {
    log.success(`DEDUCCION_CASA: ${dedRes.oldValue} → ${result.deduccionCasa}`);
    anyChanged = true;
  }
  if (replaceArrayLiteral(FILE, 'ESCALA', formatEscalaItems(result.escala))) {
    log.success(`ESCALA actualizada (${result.escala.length} tramos)`);
    anyChanged = true;
  }

  if (anyChanged) {
    touchLastUpdated('calculadora-bienes-personales-2026', today);
    return true;
  }
  log.skip('sin cambios');
  return false;
}
