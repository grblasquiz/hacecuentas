/**
 * Ganancias escala (biannual) — auto-llm vía Claude + WebSearch en ARCA.
 *
 * ARCA (ex-AFIP) actualiza los valores del MNI y la escala progresiva del
 * Impuesto a las Ganancias (4ta categoría) cada 6 meses por RIPTE.
 * No hay API REST — viene en resoluciones generales con tablas embebidas.
 *
 * Patchea `src/lib/formulas/_ganancias-escala.ts`, que es el módulo compartido
 * que importan `sueldo-ar.ts` y `ganancias-sueldo.ts`. Actualizar acá propaga
 * a 3 calcs de una: impuesto-ganancias-sueldo, sueldo-neto-a-bruto, sueldo-en-mano.
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

const log = createLogger('ganancias-escala');
const FILE = join(process.cwd(), 'src/lib/formulas/_ganancias-escala.ts');

interface Tramo {
  /** Tope mensual del tramo en pesos. null = excedente (último tramo). */
  hasta: number | null;
  /** Alícuota marginal 0-1 (0.05 = 5%) */
  tasa: number;
  /** Impuesto acumulado al inicio del tramo */
  acumulado: number;
}

interface EscalaData {
  fechaVigencia: string;
  resolucion?: string;
  fuenteUrl: string;
  /** MNI mensual = (GNI anual + Deducción Especial anual) / 12, soltero sin cargas. */
  mniMensual: number;
  /** Deducción mensual por cónyuge a cargo (= CONYUGE_ANUAL / 12). */
  incrementoConyugeMensual: number;
  /** Deducción mensual por hijo regular a cargo (= HIJO_ANUAL / 12). */
  incrementoHijoMensual: number;
  tramos: Tramo[];
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

export async function fetchGananciasEscala({ dry = false }: { dry?: boolean }): Promise<boolean> {
  const year = new Date().getFullYear();
  log.info(`consultando Claude para escala Ganancias ${year}`);

  const result = await askClaudeStructured<EscalaData>({
    task:
      `Buscá en arca.gob.ar / afip.gob.ar / infoleg.gob.ar la tabla VIGENTE del Impuesto a las Ganancias 4ta categoría (trabajadores en relación de dependencia), año ${year}.\n\n` +
      `ARCA publica 2 PDFs por semestre: "Tabla Art 94 LIG" (escala) y "Deducciones personales Art 30" (MNI, cónyuge, hijo).\n\n` +
      `Necesito MENSUAL (si la fuente publica anual, dividir por 12):\n` +
      `- mniMensual: (Ganancia no imponible anual + Deducción especial apartado 1 anual) / 12. ` +
      `  Para enero-junio 2026 el valor oficial es $1.931.926 (= ($5.151.802,50 + $18.031.308,76) / 12).\n` +
      `- incrementoConyugeMensual: CONYUGE_ANUAL / 12. Para ene-jun 2026: $404.330.\n` +
      `- incrementoHijoMensual: HIJO_ANUAL / 12 (hijo regular, NO incapacitado). Para ene-jun 2026: $203.905.\n` +
      `- tramos: escala progresiva MENSUAL (tabla ENERO del PDF oficial, que es 1/12 de la anual). ` +
      `  Son 9 tramos (5%, 9%, 12%, 15%, 19%, 23%, 27%, 31%, 35%). Cada uno con:\n` +
      `    - hasta (tope mensual en pesos; el último tramo usa null para indicar "excedente sin tope")\n` +
      `    - tasa (alícuota marginal en decimal: 0.05 = 5%)\n` +
      `    - acumulado (impuesto acumulado al INICIO del tramo, calculado con tramos anteriores)\n` +
      `- fechaVigencia: YYYY-MM-DD desde cuándo rige.\n` +
      `- resolucion: número de la RG ARCA (opcional).\n` +
      `- fuenteUrl: URL oficial al PDF.\n\n` +
      `Sanity: tasas 5-35%, tramos ascendentes por hasta y por tasa. Cónyuge > Hijo (cónyuge suele ser ~2× que hijo).`,
    schema: {
      type: 'object',
      required: ['fechaVigencia', 'mniMensual', 'incrementoConyugeMensual', 'incrementoHijoMensual', 'tramos', 'fuenteUrl'],
      properties: {
        fechaVigencia: { type: 'string', pattern: '^\\d{4}-\\d{2}-\\d{2}$' },
        resolucion: { type: 'string' },
        fuenteUrl: { type: 'string' },
        mniMensual: { type: 'number', minimum: 500000, maximum: 20000000 },
        incrementoConyugeMensual: { type: 'number', minimum: 50000, maximum: 5000000 },
        incrementoHijoMensual: { type: 'number', minimum: 30000, maximum: 3000000 },
        tramos: {
          type: 'array',
          minItems: 5,
          maxItems: 9,
          items: {
            type: 'object',
            required: ['hasta', 'tasa', 'acumulado'],
            properties: {
              hasta: {
                oneOf: [
                  { type: 'number', minimum: 10000, maximum: 100000000 },
                  { type: 'null' },
                ],
              },
              tasa: { type: 'number', minimum: 0.01, maximum: 0.5 },
              acumulado: { type: 'number', minimum: 0, maximum: 50000000 },
            },
          },
        },
      },
    },
    validate: (data) => {
      const tramos = data.tramos;
      // Último tramo debe tener hasta=null (excedente)
      if (tramos[tramos.length - 1].hasta !== null) {
        return { ok: false, reason: 'último tramo debe tener hasta=null (excedente)' };
      }
      // Los demás deben tener hasta finito, ascendente
      for (let i = 0; i < tramos.length - 1; i++) {
        if (tramos[i].hasta === null) {
          return { ok: false, reason: `tramo ${i} no-final con hasta=null (solo el último)` };
        }
        if (i > 0) {
          const prev = tramos[i - 1].hasta;
          const curr = tramos[i].hasta;
          if (prev !== null && curr !== null && curr <= prev) {
            return { ok: false, reason: `tramo ${i}: hasta no ascendente` };
          }
        }
      }
      // Tasas ascendentes
      for (let i = 1; i < tramos.length; i++) {
        if (tramos[i].tasa < tramos[i - 1].tasa) {
          return { ok: false, reason: `tasa ${i} menor que anterior` };
        }
      }
      // Acumulado: primer tramo 0, ascendente
      if (tramos[0].acumulado !== 0) {
        return { ok: false, reason: 'primer tramo debe tener acumulado=0' };
      }
      for (let i = 1; i < tramos.length; i++) {
        if (tramos[i].acumulado < tramos[i - 1].acumulado) {
          return { ok: false, reason: `acumulado ${i} no ascendente` };
        }
      }
      return { ok: true };
    },
  });

  if (!result) return false;

  log.info(`vigencia ${result.fechaVigencia} (RG ${result.resolucion || '?'})`);
  log.info(`fuente: ${result.fuenteUrl}`);
  log.info(`MNI: $${result.mniMensual.toLocaleString('es-AR')}/mes · cónyuge: +$${result.incrementoConyugeMensual.toLocaleString('es-AR')} · hijo: +$${result.incrementoHijoMensual.toLocaleString('es-AR')}`);
  log.info(`${result.tramos.length} tramos: ${result.tramos.map((t) => `${(t.tasa * 100).toFixed(0)}%`).join(' → ')}`);

  const today = new Date().toISOString().slice(0, 10);

  if (dry) {
    log.info(`would patch MNI_MENSUAL_BASE = ${result.mniMensual}`);
    log.info(`would patch INCREMENTO_CONYUGE_MENSUAL = ${result.incrementoConyugeMensual}`);
    log.info(`would patch INCREMENTO_HIJO_MENSUAL = ${result.incrementoHijoMensual}`);
    log.info(`would patch ESCALA (${result.tramos.length} tramos)`);
    return true;
  }

  let anyChanged = false;
  const mniRes = replaceNumericConst(FILE, 'MNI_MENSUAL_BASE', result.mniMensual);
  if (mniRes.changed) {
    log.success(`MNI_MENSUAL_BASE: ${mniRes.oldValue} → ${result.mniMensual}`);
    anyChanged = true;
  }
  const conyRes = replaceNumericConst(FILE, 'INCREMENTO_CONYUGE_MENSUAL', result.incrementoConyugeMensual);
  if (conyRes.changed) {
    log.success(`INCREMENTO_CONYUGE_MENSUAL: ${conyRes.oldValue} → ${result.incrementoConyugeMensual}`);
    anyChanged = true;
  }
  const hijoRes = replaceNumericConst(FILE, 'INCREMENTO_HIJO_MENSUAL', result.incrementoHijoMensual);
  if (hijoRes.changed) {
    log.success(`INCREMENTO_HIJO_MENSUAL: ${hijoRes.oldValue} → ${result.incrementoHijoMensual}`);
    anyChanged = true;
  }
  if (replaceArrayLiteral(FILE, 'ESCALA', formatEscalaItems(result.tramos))) {
    log.success(`ESCALA actualizada (${result.tramos.length} tramos)`);
    anyChanged = true;
  }

  if (anyChanged) {
    for (const slug of [
      'calculadora-impuesto-ganancias-sueldo',
      'calculadora-sueldo-neto-a-bruto',
      'sueldo-en-mano-argentina',
    ]) {
      touchLastUpdated(slug, today);
    }
    return true;
  }
  log.skip('sin cambios');
  return false;
}
