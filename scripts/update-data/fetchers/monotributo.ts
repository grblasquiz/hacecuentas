/**
 * Monotributo (biannual) — auto-llm vía Claude + WebSearch en AFIP/ARCA.
 *
 * AFIP / ARCA publica los topes y cuotas del monotributo en resoluciones
 * generales con layout complejo (tablas embebidas en HTML, a veces PDFs).
 * No hay API estructurada, así que la vía práctica es que Claude investigue
 * la fuente oficial y devuelva la tabla parseada.
 *
 * Patchea `src/lib/formulas/monotributo.ts` reemplazando los arrays
 * `categoriasServicios` (A-H) y `categoriasBienes` (A-K).
 *
 * Nota: `monotributo-vs-inscripto.ts` tiene otra estructura (topeFactServ +
 * topeFactCom + cuota) — no se toca acá. Requiere su propio fetcher después.
 */

import { join } from 'node:path';
import { askClaudeStructured } from '../utils/ask-claude.ts';
import { replaceArrayLiteral } from '../patchers/ts-constant.ts';
import { touchLastUpdated } from '../patchers/data-update-date.ts';
import { createLogger } from '../utils/logger.ts';

const log = createLogger('monotributo');

const FILE = join(process.cwd(), 'src/lib/formulas/monotributo.ts');

interface Categoria {
  letra: string;
  limiteAnual: number;
  cuota: number;
}

interface MonotributoData {
  fechaVigencia: string;
  servicios: Categoria[];
  bienes: Categoria[];
  fuenteUrl: string;
  resolucion?: string;
}

function formatArrayItems(arr: Categoria[]): string {
  return arr
    .map((c) => `  { letra: '${c.letra}', limiteAnual: ${c.limiteAnual}, cuota: ${c.cuota} },`)
    .join('\n');
}

export async function fetchMonotributo({ dry = false }: { dry?: boolean }): Promise<boolean> {
  const year = new Date().getFullYear();
  log.info(`consultando Claude para categorías Monotributo ${year}`);

  const result = await askClaudeStructured<MonotributoData>({
    task:
      `Buscá en fuentes oficiales de Argentina (arca.gob.ar, afip.gob.ar, infoleg.gob.ar, boletín oficial) las categorías VIGENTES del Monotributo a la fecha de hoy. Año en curso: ${year}.\n\n` +
      `Necesito:\n` +
      `- servicios: 8 categorías (A-H) — cada una con limiteAnual (facturación tope anual en pesos) y cuota (total mensual = impositivo + SIPA + obra social).\n` +
      `- bienes: 11 categorías (A-K) — misma estructura. Notar que bienes agrega I/J/K con tope mayor.\n` +
      `- fechaVigencia: YYYY-MM-DD desde cuándo rigen estos valores (fecha de la resolución).\n` +
      `- fuenteUrl: URL exacta de la tabla oficial.\n` +
      `- resolucion: número de la resolución general (opcional).\n\n` +
      `Criterios para que el resultado sea aceptado:\n` +
      `- Valores en pesos argentinos, enteros.\n` +
      `- Ambas tablas ordenadas ascendente por limiteAnual.\n` +
      `- Cuota es el TOTAL mensual (no solo el componente impositivo).\n` +
      `- Si hay varias resoluciones del año, tomá la MÁS RECIENTE vigente.`,
    schema: {
      type: 'object',
      required: ['fechaVigencia', 'servicios', 'bienes', 'fuenteUrl'],
      properties: {
        fechaVigencia: { type: 'string', pattern: '^\\d{4}-\\d{2}-\\d{2}$' },
        servicios: {
          type: 'array',
          minItems: 8,
          maxItems: 8,
          items: {
            type: 'object',
            required: ['letra', 'limiteAnual', 'cuota'],
            properties: {
              letra: { type: 'string', enum: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'] },
              limiteAnual: { type: 'number', minimum: 100000, maximum: 1000000000 },
              cuota: { type: 'number', minimum: 1000, maximum: 10000000 },
            },
          },
        },
        bienes: {
          type: 'array',
          minItems: 11,
          maxItems: 11,
          items: {
            type: 'object',
            required: ['letra', 'limiteAnual', 'cuota'],
            properties: {
              letra: {
                type: 'string',
                enum: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K'],
              },
              limiteAnual: { type: 'number', minimum: 100000, maximum: 2000000000 },
              cuota: { type: 'number', minimum: 1000, maximum: 20000000 },
            },
          },
        },
        fuenteUrl: { type: 'string' },
        resolucion: { type: 'string' },
      },
    },
    validate: (data) => {
      for (const [name, arr] of [
        ['servicios', data.servicios],
        ['bienes', data.bienes],
      ] as const) {
        for (let i = 1; i < arr.length; i++) {
          if (arr[i].limiteAnual <= arr[i - 1].limiteAnual) {
            return { ok: false, reason: `${name}: limiteAnual no estrictamente ascendente en ${arr[i].letra}` };
          }
          if (arr[i].cuota < arr[i - 1].cuota) {
            return { ok: false, reason: `${name}: cuota baja en ${arr[i].letra} vs anterior` };
          }
        }
      }
      // Sanity: la H de bienes debe ser >= la H de servicios (mismo tope o mayor)
      const hServ = data.servicios.find((c) => c.letra === 'H');
      const hBien = data.bienes.find((c) => c.letra === 'H');
      if (hServ && hBien && hBien.limiteAnual < hServ.limiteAnual * 0.8) {
        return { ok: false, reason: 'H bienes muy por debajo de H servicios (posible confusión de tablas)' };
      }
      return { ok: true };
    },
  });

  if (!result) return false;

  log.info(`vigencia ${result.fechaVigencia} (RG ${result.resolucion || '?'})`);
  log.info(`fuente: ${result.fuenteUrl}`);
  log.info(
    `servicios H: $${result.servicios[7].limiteAnual.toLocaleString('es-AR')} anual · cuota $${result.servicios[7].cuota.toLocaleString('es-AR')}/mes`,
  );
  log.info(
    `bienes K:    $${result.bienes[10].limiteAnual.toLocaleString('es-AR')} anual · cuota $${result.bienes[10].cuota.toLocaleString('es-AR')}/mes`,
  );

  const today = new Date().toISOString().slice(0, 10);

  if (dry) {
    log.info('would patch categoriasServicios (8 items) + categoriasBienes (11 items)');
    log.info('would touch monotributo-2026 lastUpdated');
    return true;
  }

  let anyChanged = false;
  if (replaceArrayLiteral(FILE, 'categoriasServicios', formatArrayItems(result.servicios))) {
    log.success('categoriasServicios actualizado');
    anyChanged = true;
  }
  if (replaceArrayLiteral(FILE, 'categoriasBienes', formatArrayItems(result.bienes))) {
    log.success('categoriasBienes actualizado');
    anyChanged = true;
  }

  if (anyChanged) {
    touchLastUpdated('calculadora-monotributo-2026', today);
    log.success(`monotributo-2026 lastUpdated → ${today}`);
    return true;
  }
  log.skip('sin cambios (valores ya coincidían)');
  return false;
}
