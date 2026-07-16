/**
 * Impuesto de Primaria — Uruguay 2026 (DGI).
 *
 * Tributo NACIONAL que administra la DGI y grava los inmuebles para financiar la
 * educación primaria. Se calcula sobre el VALOR IMPONIBLE de catastro de cada
 * padrón, con una escala progresiva.
 *
 *   - Mínimo no imponible 2026: $282.612. Los padrones con valor imponible MENOR
 *     a ese monto están EXENTOS (se evalúa por padrón).
 *   - Sobre el excedente se aplican 4 franjas con tasas del 0,15% al 0,30%.
 *
 * ⚠️ CALCULADORA ORIENTATIVA (borrador, sin revisión profesional). El mínimo no
 * imponible ($282.612) es el oficial 2026; los cortes intermedios de la escala
 * son de referencia para estimar. Verificá el monto exacto en la DGI. Existen
 * exoneraciones (p. ej. productores rurales de hasta 300 há CONEAT 100).
 */
import { fmtUYU } from '../data/uruguay-2026.ts';

export interface Inputs {
  /** Valor imponible de catastro del padrón, en pesos. */
  valorCatastral: number;
}

export interface Outputs {
  impuestoAnual: string;
  tasaEfectiva: string;
  exento: string;
  detalle: string;
  _insight?: any;
  _table?: any;
}

const MINIMO_NO_IMPONIBLE = 282612; // 2026 (DGI)
// Franjas marginales sobre el VALOR TOTAL (tope superior, en pesos).
const FRANJAS: Array<{ hasta: number; tasa: number }> = [
  { hasta: MINIMO_NO_IMPONIBLE, tasa: 0 }, // exento
  { hasta: 2500000, tasa: 0.0015 }, // 0,15%
  { hasta: 5000000, tasa: 0.002 }, // 0,20%
  { hasta: 10000000, tasa: 0.0025 }, // 0,25%
  { hasta: Infinity, tasa: 0.003 }, // 0,30%
];

export function compute(i: Inputs): Outputs {
  const valor = Math.max(0, Number(i.valorCatastral) || 0);
  const exento = valor > 0 && valor < MINIMO_NO_IMPONIBLE;

  let impuesto = 0;
  if (!exento) {
    let anterior = 0;
    for (const f of FRANJAS) {
      const enTramo = Math.min(valor, f.hasta) - anterior;
      if (enTramo <= 0) break;
      impuesto += enTramo * f.tasa;
      anterior = f.hasta;
      if (valor <= f.hasta) break;
    }
  }

  const tasaEfectiva = valor > 0 ? (impuesto / valor) * 100 : 0;

  const detalle = exento
    ? `Valor imponible ${fmtUYU(valor)} < mínimo no imponible ${fmtUYU(MINIMO_NO_IMPONIBLE)}: el padrón está EXENTO del impuesto de primaria.`
    : `Valor imponible ${fmtUYU(valor)}. Impuesto de primaria anual estimado ${fmtUYU(impuesto)} (tasa efectiva ${tasaEfectiva.toFixed(3)}%).`;

  return {
    impuestoAnual: fmtUYU(impuesto),
    tasaEfectiva: `${tasaEfectiva.toFixed(3)}%`,
    exento: exento ? 'Sí (bajo el mínimo no imponible)' : 'No',
    detalle,
    _insight: {
      type: 'highlight',
      icon: '🏫',
      text: exento
        ? `Tu padrón está **exento**: su valor imponible (${fmtUYU(valor)}) es menor al mínimo no imponible de ${fmtUYU(MINIMO_NO_IMPONIBLE)}.`
        : `Con un valor imponible de **${fmtUYU(valor)}**, el impuesto de primaria anual estimado es **${fmtUYU(impuesto)}** (tasa efectiva ${tasaEfectiva.toFixed(2)}%). El mínimo no imponible 2026 es ${fmtUYU(MINIMO_NO_IMPONIBLE)}.`,
      tone: exento ? 'good' : 'info',
    },
    _table: {
      title: 'Impuesto de primaria anual estimado — 2026',
      headers: ['Valor imponible de catastro', 'Impuesto de primaria (estimado)'],
      rows: [200000, 282612, 800000, 3000000, 6000000].map((v) => {
        if (v < MINIMO_NO_IMPONIBLE) return [fmtUYU(v), 'Exento'];
        let imp = 0;
        let ant = 0;
        for (const f of FRANJAS) {
          const t = Math.min(v, f.hasta) - ant;
          if (t <= 0) break;
          imp += t * f.tasa;
          ant = f.hasta;
          if (v <= f.hasta) break;
        }
        return [fmtUYU(v), fmtUYU(imp)];
      }),
      note: `Mínimo no imponible 2026: ${fmtUYU(MINIMO_NO_IMPONIBLE)} por padrón (DGI). Tasas del 0,15% al 0,30%; los cortes intermedios son de referencia. Estimación orientativa: verificá el valor exacto en la DGI.`,
    },
  };
}
