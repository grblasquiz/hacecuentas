/**
 * Ingresos Brutos provincial (yearly) — auto-llm vía Claude + WebSearch.
 *
 * Cada jurisdicción publica su código fiscal y planilla anexa con alícuotas
 * por actividad. La mayoría de las modificaciones son a comienzo de año con
 * la ley tarifaria provincial; eventualmente hay ajustes puntuales.
 *
 * Cubre 5 provincias × 5 actividades = 25 claves `provincia:actividad`.
 * Patchea el Record `ALICUOTAS` en `src/lib/formulas/ingresos-brutos.ts`.
 */

import { join } from 'node:path';
import { askClaudeStructured } from '../utils/ask-claude.ts';
import { replaceObjectLiteral } from '../patchers/ts-constant.ts';
import { touchLastUpdated } from '../patchers/data-update-date.ts';
import { createLogger } from '../utils/logger.ts';

const log = createLogger('ingresos-brutos');
const FILE = join(process.cwd(), 'src/lib/formulas/ingresos-brutos.ts');

const PROVINCIAS = ['caba', 'buenos-aires', 'cordoba', 'santa-fe', 'mendoza'] as const;
const ACTIVIDADES = ['comercio', 'servicios', 'industria', 'construccion', 'profesional'] as const;

type Provincia = (typeof PROVINCIAS)[number];
type Actividad = (typeof ACTIVIDADES)[number];
type ClaveIB = `${Provincia}:${Actividad}`;

const CLAVES: ClaveIB[] = PROVINCIAS.flatMap((p) =>
  ACTIVIDADES.map((a) => `${p}:${a}` as ClaveIB),
);

interface IBData {
  fechaVigencia: string;
  fuenteUrl: string;
  alicuotas: Record<string, number>;
  notas?: string;
}

function formatAlicuotas(alicuotas: Record<string, number>): string {
  return CLAVES
    .map((k) => `  '${k}': ${alicuotas[k]},`)
    .join('\n');
}

export async function fetchIngresosBrutos({ dry = false }: { dry?: boolean }): Promise<boolean> {
  const year = new Date().getFullYear();
  log.info(`consultando Claude para alícuotas IIBB provinciales ${year}`);

  const result = await askClaudeStructured<IBData>({
    task:
      `Buscá la ley tarifaria ${year} de cada una de estas 5 jurisdicciones argentinas y devolvé las alícuotas de Ingresos Brutos (régimen general, NO convenio multilateral) para contribuyentes locales inscriptos:\n\n` +
      `- CABA (AGIP - agip.gob.ar)\n` +
      `- Buenos Aires (ARBA - arba.gov.ar)\n` +
      `- Córdoba (DGR - rentascordoba.gob.ar)\n` +
      `- Santa Fe (API - santafe.gob.ar/api)\n` +
      `- Mendoza (ATM - atm.mendoza.gov.ar)\n\n` +
      `Para cada jurisdicción, 5 actividades (alicuota en % como decimal, ej 3.5 para 3,5%):\n` +
      `- comercio: comercio minorista/mayorista, régimen general.\n` +
      `- servicios: prestación de servicios general.\n` +
      `- industria: industria manufacturera (en la mayoría exenta o reducida — típico 0.5-2%).\n` +
      `- construccion: construcción de obras (típico 2.5-4%).\n` +
      `- profesional: honorarios profesionales (típico 3.5-4.75%).\n\n` +
      `Devolvé el objeto "alicuotas" con 25 claves EXACTAMENTE con el formato 'provincia:actividad':\n` +
      `${CLAVES.map((k) => `  - ${k}`).join('\n')}\n\n` +
      `Sanity: industria < comercio en todas las jurisdicciones. Alícuotas típicas entre 0.5 y 6.0. No usar valores tipo 0 (hay alícuota reducida pero no 0 en régimen general).`,
    schema: {
      type: 'object',
      required: ['fechaVigencia', 'fuenteUrl', 'alicuotas'],
      properties: {
        fechaVigencia: { type: 'string', pattern: '^\\d{4}-\\d{2}-\\d{2}$' },
        fuenteUrl: { type: 'string' },
        notas: { type: 'string' },
        alicuotas: {
          type: 'object',
          required: [...CLAVES],
          properties: Object.fromEntries(
            CLAVES.map((k) => [k, { type: 'number', minimum: 0.1, maximum: 7 }]),
          ),
        },
      },
    },
    validate: (data) => {
      const missing = CLAVES.filter((k) => typeof data.alicuotas[k] !== 'number');
      if (missing.length) return { ok: false, reason: `faltan claves: ${missing.join(',')}` };
      // Cordura por provincia: industria debería ser < comercio
      for (const p of PROVINCIAS) {
        const ind = data.alicuotas[`${p}:industria` as ClaveIB];
        const com = data.alicuotas[`${p}:comercio` as ClaveIB];
        if (ind >= com) {
          return { ok: false, reason: `${p}: industria (${ind}) debería ser menor que comercio (${com})` };
        }
      }
      return { ok: true };
    },
  });

  if (!result) return false;

  log.info(`vigencia ${result.fechaVigencia} · fuente: ${result.fuenteUrl}`);
  log.info(`${Object.keys(result.alicuotas).length} alícuotas (5 provincias × 5 actividades)`);
  // Sumario por provincia (rango)
  for (const p of PROVINCIAS) {
    const vals = ACTIVIDADES.map((a) => result.alicuotas[`${p}:${a}` as ClaveIB]);
    log.info(`  ${p}: ${Math.min(...vals)}% – ${Math.max(...vals)}%`);
  }
  if (result.notas) log.info(`notas: ${result.notas}`);

  const today = new Date().toISOString().slice(0, 10);

  if (dry) {
    log.info(`would patch ALICUOTAS (${CLAVES.length} entries)`);
    return true;
  }

  if (replaceObjectLiteral(FILE, 'ALICUOTAS', formatAlicuotas(result.alicuotas))) {
    log.success(`ALICUOTAS actualizadas (${CLAVES.length} entries)`);
    touchLastUpdated('calculadora-ingresos-brutos-provincial', today);
    return true;
  }
  log.skip('sin cambios');
  return false;
}
