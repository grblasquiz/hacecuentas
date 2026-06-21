/**
 * ¿Cuánto es X bolívares en dólares hoy? (Venezuela) — convertidor Bs. → USD.
 *
 * Gemelo inverso de cuanto-es-dolares-en-bolivares (intención de búsqueda
 * distinta: el usuario tiene bolívares y quiere saber a cuántos dólares
 * equivalen). Devuelve el equivalente en USD a la tasa elegida + tabla de
 * montos comunes en Bs.
 *
 * Datos: tasas desde src/lib/data/venezuela-2026.ts (NO hardcode).
 *   Fuentes: BCV, Monitor Dólar Venezuela.
 */
import { VENEZUELA_2026, vesToUsd, fmtVES } from '../data/venezuela-2026';

export interface Inputs {
  monto?: number;     // Bs.
  tasa?: string;      // 'bcv' | 'paralelo'
}

export interface Outputs {
  [k: string]: any;
  _insight?: any;
  _table?: any;
}

const fmtUSD = (n: number): string =>
  '$ ' + new Intl.NumberFormat('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Math.round(n * 100) / 100);

export function cuantoEsBolivaresEnDolares(i: Inputs): Outputs {
  const fx = VENEZUELA_2026.fx;
  const monto = Math.max(0, Number(i.monto) || 0);

  const tasaRaw = String(i.tasa || 'bcv');
  const tasa: 'bcv' | 'paralelo' = tasaRaw === 'paralelo' ? 'paralelo' : 'bcv';
  const valorTasa = fx[tasa];
  const nombreTasa = tasa === 'bcv' ? 'oficial (BCV)' : 'paralelo (Monitor Dólar)';

  const enDolares = vesToUsd(monto, tasa);

  // Tabla de montos comunes en Bs. a la tasa elegida.
  const comunes = [100, 500, 1000, 5000, 10000, 50000, 100000];
  const rows = comunes.map((b) => [fmtVES(b), fmtUSD(vesToUsd(b, tasa))]);

  const narrativa = monto > 0
    ? `${fmtVES(monto)} equivalen a ${fmtUSD(enDolares)} a la tasa ${nombreTasa} de hoy (${fmtVES(valorTasa)} por dólar).`
    : `A la tasa ${nombreTasa} de hoy (${fmtVES(valorTasa)} por dólar), hacen falta ${fmtVES(valorTasa)} para tener 1 dólar. Ingresá un monto para ver el equivalente.`;

  return {
    enDolares,
    detalle: monto > 0
      ? `${fmtVES(monto)} = ${fmtUSD(enDolares)} (tasa ${nombreTasa})`
      : 'Ingresá un monto en bolívares',
    tasaUsada: `${fmtVES(valorTasa)} por USD (${nombreTasa})`,
    fechaTasa: tasa === 'bcv' ? fx.fechaBcv : fx.fechaParalelo,
    _insight: {
      type: 'highlight',
      icon: '💵',
      text: narrativa,
    },
    _table: {
      title: `Cuánto son los bolívares en dólares hoy (tasa ${nombreTasa})`,
      headers: ['Bolívares (Bs.)', 'Dólares (USD)'],
      rows,
      note: `Calculado a ${fmtVES(valorTasa)} por dólar, tasa ${nombreTasa}. La tasa cambia a diario; verificá el valor del día antes de operar.`,
    },
  };
}
