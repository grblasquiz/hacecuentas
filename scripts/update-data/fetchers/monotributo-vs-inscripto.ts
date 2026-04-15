/**
 * Monotributo vs Responsable Inscripto (biannual) — auto-llm vía Claude.
 *
 * La calc `monotributo-vs-inscripto.ts` usa una tabla DISTINTA a la del fetcher
 * principal de Monotributo: acá cada categoría es un registro plano con letra
 * + topeFactServ + topeFactCom + cuota (cuota unificada, sin separar
 * impuesto integrado/aportes jubilación/obra social como en monotributo.ts).
 *
 * ARCA actualiza los topes y cuotas cada 6 meses (enero/julio).
 */

import { join } from 'node:path';
import { askClaudeStructured } from '../utils/ask-claude.ts';
import {
  replaceArrayLiteral,
  formatNumberWithUnderscores,
} from '../patchers/ts-constant.ts';
import { touchLastUpdated } from '../patchers/data-update-date.ts';
import { createLogger } from '../utils/logger.ts';

const log = createLogger('monotributo-vs-inscripto');
const FILE = join(process.cwd(), 'src/lib/formulas/monotributo-vs-inscripto.ts');

interface Categoria {
  letra: string;
  topeFactServ: number;
  topeFactCom: number;
  cuota: number;
}

interface MonotributoVsData {
  fechaVigencia: string;
  resolucion?: string;
  fuenteUrl: string;
  categorias: Categoria[];
}

function formatCategorias(cats: Categoria[]): string {
  return cats
    .map((c) => {
      const serv = formatNumberWithUnderscores(c.topeFactServ);
      const com = formatNumberWithUnderscores(c.topeFactCom);
      const cuota = formatNumberWithUnderscores(c.cuota);
      return `  { letra: '${c.letra}', topeFactServ: ${serv}, topeFactCom: ${com}, cuota: ${cuota} },`;
    })
    .join('\n');
}

export async function fetchMonotributoVsInscripto({ dry = false }: { dry?: boolean }): Promise<boolean> {
  const year = new Date().getFullYear();
  log.info(`consultando Claude para categorías Monotributo ${year} (tabla simplificada)`);

  const result = await askClaudeStructured<MonotributoVsData>({
    task:
      `Buscá en arca.gob.ar la tabla VIGENTE de categorías del Monotributo Argentina ${year}.\n\n` +
      `Necesito 11 categorías (A-K) con:\n` +
      `- letra: 'A' a 'K'.\n` +
      `- topeFactServ: tope de facturación anual para locación/prestación de servicios (pesos). Para categoría J es 0 porque no aplica a servicios.\n` +
      `- topeFactCom: tope de facturación anual para venta de cosas muebles (pesos).\n` +
      `- cuota: cuota mensual TOTAL a pagar (impuesto integrado + jubilación + obra social, sumados en un solo valor).\n` +
      `- fechaVigencia: YYYY-MM-DD desde cuándo rige.\n` +
      `- resolucion: RG ARCA (opcional).\n` +
      `- fuenteUrl: URL oficial (arca.gob.ar/monotributo).\n\n` +
      `Importante: la categoría J solo existe para "comercio" (cosas muebles), así que topeFactServ=0 y topeFactCom>0.\n` +
      `Sanity: los topes deben crecer de A a K; para servicios J=0 pero no rompe la monotonicidad si lo excluimos.`,
    schema: {
      type: 'object',
      required: ['fechaVigencia', 'categorias', 'fuenteUrl'],
      properties: {
        fechaVigencia: { type: 'string', pattern: '^\\d{4}-\\d{2}-\\d{2}$' },
        resolucion: { type: 'string' },
        fuenteUrl: { type: 'string' },
        categorias: {
          type: 'array',
          minItems: 11,
          maxItems: 11,
          items: {
            type: 'object',
            required: ['letra', 'topeFactServ', 'topeFactCom', 'cuota'],
            properties: {
              letra: { type: 'string', enum: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K'] },
              topeFactServ: { type: 'number', minimum: 0, maximum: 500_000_000 },
              topeFactCom: { type: 'number', minimum: 1_000_000, maximum: 500_000_000 },
              cuota: { type: 'number', minimum: 10_000, maximum: 20_000_000 },
            },
          },
        },
      },
    },
    validate: (data) => {
      const letras = data.categorias.map((c) => c.letra);
      const expected = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K'];
      if (JSON.stringify(letras) !== JSON.stringify(expected)) {
        return { ok: false, reason: `letras ${letras.join(',')} no coinciden con A-K` };
      }
      // Topes bienes (comercio) deben ser ascendentes
      for (let i = 1; i < data.categorias.length; i++) {
        if (data.categorias[i].topeFactCom <= data.categorias[i - 1].topeFactCom) {
          return { ok: false, reason: `topeFactCom de ${data.categorias[i].letra} no ascendente` };
        }
      }
      // Cuotas ascendentes
      for (let i = 1; i < data.categorias.length; i++) {
        if (data.categorias[i].cuota <= data.categorias[i - 1].cuota) {
          return { ok: false, reason: `cuota de ${data.categorias[i].letra} no ascendente` };
        }
      }
      return { ok: true };
    },
  });

  if (!result) return false;

  log.info(`vigencia ${result.fechaVigencia} (RG ${result.resolucion || '?'})`);
  log.info(`fuente: ${result.fuenteUrl}`);
  log.info(
    `${result.categorias.length} categorías · A=$${result.categorias[0].cuota.toLocaleString('es-AR')} → K=$${result.categorias[10].cuota.toLocaleString('es-AR')}`,
  );

  const today = new Date().toISOString().slice(0, 10);

  if (dry) {
    log.info(`would patch CATEGORIAS (${result.categorias.length} entries)`);
    return true;
  }

  const changed = replaceArrayLiteral(FILE, 'CATEGORIAS', formatCategorias(result.categorias));
  if (changed) {
    log.success(`CATEGORIAS actualizadas (${result.categorias.length} entries)`);
    touchLastUpdated('calculadora-monotributo-vs-responsable-inscripto', today);
    return true;
  }
  log.skip('sin cambios');
  return false;
}
