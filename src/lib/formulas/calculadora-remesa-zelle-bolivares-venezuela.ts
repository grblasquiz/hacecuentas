/**
 * Calculadora de remesas Zelle a bolívares (Venezuela).
 *
 * Convierte un monto enviado en USD (por Zelle u otro medio) a los bolívares
 * que recibe el destinatario, neto de la comisión de la casa de cambio /
 * intermediario, a la tasa elegida (paralelo por defecto, que es la que suelen
 * usar los cambistas).
 *
 *   Bs. recibidos = USD × (1 − comisión%) × tasa
 *
 * Datos: tasas desde src/lib/data/venezuela-2026.ts (NO hardcode).
 *   Fuentes: BCV, Monitor Dólar Venezuela.
 */
import { VENEZUELA_2026, usdToVes, vesToUsd, fmtVES } from '../data/venezuela-2026';

export interface Inputs {
  monto?: number;       // USD enviados
  comision?: number;    // % de comisión del cambista (default 0)
  tasa?: string;        // 'bcv' | 'paralelo' (default paralelo)
}

export interface Outputs {
  [k: string]: any;
  _insight?: any;
  _table?: any;
}

const fmtUSD = (n: number): string =>
  '$ ' + new Intl.NumberFormat('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Math.round(n * 100) / 100);

const fmtPct = (n: number): string =>
  new Intl.NumberFormat('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(n) + ' %';

export function calculadoraRemesaZelleBolivaresVenezuela(i: Inputs): Outputs {
  const fx = VENEZUELA_2026.fx;
  const monto = Math.max(0, Number(i.monto) || 0);
  // Comisión en %, acotada 0–100.
  const comisionPct = Math.min(100, Math.max(0, Number(i.comision) || 0));
  const comisionFrac = comisionPct / 100;

  const tasaRaw = String(i.tasa || 'paralelo');
  const tasa: 'bcv' | 'paralelo' = tasaRaw === 'bcv' ? 'bcv' : 'paralelo';
  const valorTasa = fx[tasa];
  const nombreTasa = tasa === 'bcv' ? 'oficial (BCV)' : 'paralelo (Monitor Dólar)';

  const usdNeto = monto * (1 - comisionFrac);
  const comisionUsd = monto * comisionFrac;
  const bolivaresRecibidos = usdToVes(usdNeto, tasa);
  const comisionEnBs = usdToVes(comisionUsd, tasa);
  // Tasa efectiva: Bs. recibidos por cada USD enviado (descontada la comisión).
  const tasaEfectiva = monto > 0 ? bolivaresRecibidos / monto : valorTasa * (1 - comisionFrac);

  const narrativa = monto > 0
    ? `Enviando ${fmtUSD(monto)} con ${fmtPct(comisionPct)} de comisión, el destinatario recibe ${fmtVES(bolivaresRecibidos)} ` +
      `a la tasa ${nombreTasa}. La comisión se queda con ${fmtUSD(comisionUsd)} (${fmtVES(comisionEnBs)}). ` +
      `La tasa efectiva que te queda es de ${fmtVES(tasaEfectiva)} por dólar.`
    : `A la tasa ${nombreTasa} de hoy (${fmtVES(valorTasa)} por dólar), una remesa Zelle sin comisión rinde ${fmtVES(valorTasa)} por cada dólar. ` +
      `Ingresá el monto y la comisión del cambista para ver los bolívares netos que recibe el destinatario.`;

  return {
    bolivaresRecibidos,
    usdNeto,
    comisionUsd,
    comisionEnBs,
    tasaEfectiva,
    detalle: monto > 0
      ? `${fmtUSD(monto)} → ${fmtVES(bolivaresRecibidos)} netos (comisión ${fmtPct(comisionPct)}, tasa ${nombreTasa})`
      : 'Ingresá el monto enviado en dólares',
    _insight: {
      type: 'highlight',
      icon: '📲',
      text: narrativa,
    },
    _table: {
      title: 'Desglose de la remesa Zelle a bolívares',
      headers: ['Concepto', 'Monto'],
      rows: [
        ['Enviado (Zelle)', fmtUSD(monto)],
        ['Comisión del cambista', `${fmtUSD(comisionUsd)} (${fmtPct(comisionPct)})`],
        ['Neto en dólares', fmtUSD(usdNeto)],
        ['Tasa aplicada', `${fmtVES(valorTasa)} por USD (${nombreTasa})`],
        ['Bolívares recibidos', fmtVES(bolivaresRecibidos)],
        ['Tasa efectiva (por USD enviado)', fmtVES(tasaEfectiva)],
      ],
      note: 'Bolívares recibidos = USD × (1 − comisión%) × tasa. La mayoría de los cambistas pagan a la tasa paralelo; algunos cobran comisión y otros ya la incluyen en una tasa más baja. La tasa cambia a diario.',
    },
  };
}
