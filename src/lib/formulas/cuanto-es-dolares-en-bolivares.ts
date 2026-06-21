/**
 * ¿Cuánto es X dólares en bolívares hoy? (Venezuela) — convertidor USD → Bs.
 *
 * Toma un monto en USD y devuelve su equivalente en bolívares a la tasa
 * elegida (BCV oficial o paralelo). Incluye una tabla de montos comunes
 * (1, 5, 10, 50, 100 USD) a esa tasa para SEO/long-tail.
 *
 * Datos: tasas desde src/lib/data/venezuela-2026.ts (NO hardcode).
 *   Fuentes: BCV, Monitor Dólar Venezuela.
 */
import { VENEZUELA_2026, usdToVes, fmtVES } from '../data/venezuela-2026';

export interface Inputs {
  monto?: number;     // USD
  tasa?: string;      // 'bcv' | 'paralelo'
}

export interface Outputs {
  [k: string]: any;
  _insight?: any;
  _table?: any;
}

const fmtUSD = (n: number): string =>
  '$ ' + new Intl.NumberFormat('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Math.round(n * 100) / 100);

export function cuantoEsDolaresEnBolivares(i: Inputs): Outputs {
  const fx = VENEZUELA_2026.fx;
  const monto = Math.max(0, Number(i.monto) || 0);

  const tasaRaw = String(i.tasa || 'bcv');
  const tasa: 'bcv' | 'paralelo' = tasaRaw === 'paralelo' ? 'paralelo' : 'bcv';
  const valorTasa = fx[tasa];
  const nombreTasa = tasa === 'bcv' ? 'oficial (BCV)' : 'paralelo (Monitor Dólar)';

  const enBolivares = usdToVes(monto, tasa);

  // Tabla de montos comunes a la tasa elegida.
  const comunes = [1, 5, 10, 20, 50, 100, 200, 500];
  const rows = comunes.map((u) => [fmtUSD(u), fmtVES(usdToVes(u, tasa))]);

  const narrativa = monto > 0
    ? `${fmtUSD(monto)} equivalen a ${fmtVES(enBolivares)} a la tasa ${nombreTasa} de hoy (${fmtVES(valorTasa)} por dólar).`
    : `A la tasa ${nombreTasa} de hoy (${fmtVES(valorTasa)} por dólar), 1 dólar son ${fmtVES(valorTasa)}. Ingresá un monto para ver el equivalente exacto.`;

  return {
    enBolivares,
    detalle: monto > 0
      ? `${fmtUSD(monto)} = ${fmtVES(enBolivares)} (tasa ${nombreTasa})`
      : 'Ingresá un monto en dólares',
    tasaUsada: `${fmtVES(valorTasa)} por USD (${nombreTasa})`,
    fechaTasa: tasa === 'bcv' ? fx.fechaBcv : fx.fechaParalelo,
    _insight: {
      type: 'highlight',
      icon: '💵',
      text: narrativa,
    },
    _table: {
      title: `Cuánto son los dólares en bolívares hoy (tasa ${nombreTasa})`,
      headers: ['Dólares (USD)', 'Bolívares (Bs.)'],
      rows,
      note: `Calculado a ${fmtVES(valorTasa)} por dólar, tasa ${nombreTasa}. La tasa cambia a diario; verificá el valor del día antes de operar.`,
    },
  };
}
