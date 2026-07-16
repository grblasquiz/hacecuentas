/**
 * Contribución Inmobiliaria — Uruguay 2026 (escala de Montevideo).
 *
 * Es un tributo DEPARTAMENTAL (lo cobra cada Intendencia, no la DGI) sobre los
 * inmuebles urbanos y suburbanos, calculado sobre el VALOR REAL de catastro con
 * una escala progresiva por franjas: cada tasa se aplica sólo a la porción del
 * valor que cae en su tramo.
 *
 * Montevideo 2026: 6 franjas con alícuotas del 0,18% al 1,80%. Desde 2024, los
 * inmuebles cuyo valor imponible es menor a $2.481.577 acceden a una tasa
 * reducida del 0,18% en el primer tramo (en lugar del 0,25% general); ~70% de los
 * padrones de Montevideo entran en esa categoría.
 *
 * ⚠️ Los TOPES exactos de cada franja los publica la Intendencia (simulador
 * oficial de la IMM). Los cortes intermedios de esta escala son de REFERENCIA
 * para estimar; el primer tramo (donde cae la mayoría de los inmuebles) y las
 * tasas de extremo (0,18%/0,25% y 1,80%) sí son los oficiales.
 */
import { fmtUYU } from '../data/uruguay-2026.ts';

export interface Inputs {
  /** Valor real de catastro del inmueble, en pesos. */
  valorReal: number;
  /** Departamento (afecta la escala; por defecto Montevideo). */
  departamento?: string;
}

export interface Outputs {
  contribucionAnual: string;
  cuota: string;
  tasaEfectiva: string;
  detalle: string;
  _insight?: any;
  _table?: any;
}

const UMBRAL_REDUCIDA = 2481577; // valor imponible bajo el cual el 1er tramo va al 0,18%
// Franjas marginales (tope superior de cada tramo, en pesos) — Montevideo.
const FRANJAS: Array<{ hasta: number; tasa: number }> = [
  { hasta: 2481577, tasa: 0.0025 }, // 0,25% general (0,18% si el total < umbral)
  { hasta: 5000000, tasa: 0.005 }, // 0,50%
  { hasta: 10000000, tasa: 0.009 }, // 0,90%
  { hasta: 15000000, tasa: 0.012 }, // 1,20%
  { hasta: 25000000, tasa: 0.015 }, // 1,50%
  { hasta: Infinity, tasa: 0.018 }, // 1,80%
];
const CUOTAS = 3; // Montevideo cobra en 3 cuotas (marzo, julio, noviembre)

export function compute(i: Inputs): Outputs {
  const valor = Math.max(0, Number(i.valorReal) || 0);

  let contribucion = 0;
  if (valor > 0 && valor < UMBRAL_REDUCIDA) {
    // Tasa reducida sobre el total (primer tramo al 0,18%).
    contribucion = valor * 0.0018;
  } else {
    let anterior = 0;
    for (const f of FRANJAS) {
      const enTramo = Math.min(valor, f.hasta) - anterior;
      if (enTramo <= 0) break;
      contribucion += enTramo * f.tasa;
      anterior = f.hasta;
      if (valor <= f.hasta) break;
    }
  }

  const cuota = contribucion / CUOTAS;
  const tasaEfectiva = valor > 0 ? (contribucion / valor) * 100 : 0;

  const detalle =
    `Valor real de catastro ${fmtUYU(valor)}. Contribución anual estimada ${fmtUYU(contribucion)} ` +
    `(tasa efectiva ${tasaEfectiva.toFixed(3)}%). En 3 cuotas: ${fmtUYU(cuota)} cada una (marzo, julio, noviembre).`;

  return {
    contribucionAnual: fmtUYU(contribucion),
    cuota: fmtUYU(cuota),
    tasaEfectiva: `${tasaEfectiva.toFixed(3)}%`,
    detalle,
    _insight: {
      type: 'highlight',
      icon: '🏘️',
      text:
        valor > 0 && valor < UMBRAL_REDUCIDA
          ? `Tu inmueble entra en la **tasa reducida del 0,18%** (valor imponible menor a ${fmtUYU(UMBRAL_REDUCIDA)}): la contribución anual ronda **${fmtUYU(contribucion)}**, unos **${fmtUYU(cuota)}** por cuota.`
          : `Sobre un valor real de **${fmtUYU(valor)}**, la contribución anual estimada es **${fmtUYU(contribucion)}** (tasa efectiva ${tasaEfectiva.toFixed(2)}%), unos **${fmtUYU(cuota)}** por cuota. Pagando contado en marzo evitás el ajuste por IPC de julio y noviembre.`,
      tone: 'info' as const,
    },
    _table: {
      title: 'Contribución inmobiliaria anual estimada — Montevideo 2026',
      headers: ['Valor real de catastro', 'Contribución anual (estimada)', 'Por cuota (÷3)'],
      rows: [1500000, 2481577, 4000000, 7000000, 12000000].map((v) => {
        let c = 0;
        if (v < UMBRAL_REDUCIDA) {
          c = v * 0.0018;
        } else {
          let ant = 0;
          for (const f of FRANJAS) {
            const t = Math.min(v, f.hasta) - ant;
            if (t <= 0) break;
            c += t * f.tasa;
            ant = f.hasta;
            if (v <= f.hasta) break;
          }
        }
        return [fmtUYU(v), fmtUYU(c), fmtUYU(c / CUOTAS)];
      }),
      note: `Escala progresiva de Montevideo (0,18%–1,80%). El 0,18% aplica a inmuebles con valor imponible menor a ${fmtUYU(UMBRAL_REDUCIDA)}. Los cortes intermedios son de referencia para estimar; los topes exactos de cada franja están en el simulador oficial de la Intendencia. Otros departamentos tienen su propia escala.`,
    },
  };
}
