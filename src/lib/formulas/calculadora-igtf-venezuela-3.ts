/**
 * Calculadora de IGTF en Venezuela (3% en divisas).
 *
 * El Impuesto a las Grandes Transacciones Financieras grava con 3% los pagos
 * efectuados en divisas (efectivo / no bancarizado) por sujetos no exonerados.
 * Calcula el IGTF y el total a pagar sobre un monto en divisa (USD), y muestra
 * además el equivalente en bolívares a la tasa BCV.
 *
 * Datos: la alícuota y la tasa BCV se leen de src/lib/data/venezuela-2026.ts
 *   (VENEZUELA_2026.igtf, helper usdToVes), NO se hardcodean.
 *   Fuente: SENIAT, Ley del IGTF, Gaceta Oficial.
 */
import { VENEZUELA_2026, usdToVes, fmtVES } from '../data/venezuela-2026';

export interface Inputs {
  monto?: number; // monto de la operación en divisa (USD)
}

export interface Outputs {
  [k: string]: any;
  _insight?: any;
  _table?: any;
}

const fmtUSD = (n: number): string =>
  '$ ' + new Intl.NumberFormat('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Math.round(n * 100) / 100);

const fmtPct = (n: number): string =>
  new Intl.NumberFormat('de-DE', { maximumFractionDigits: 0 }).format(n) + ' %';

export function calculadoraIgtfVenezuela3(i: Inputs): Outputs {
  const tasa = VENEZUELA_2026.igtf; // 0,03
  const tasaPct = tasa * 100;
  const monto = Math.max(0, Number(i.monto) || 0);
  if (monto <= 0) throw new Error('Ingresá el monto de la operación en divisas (USD).');

  const igtf = monto * tasa;
  const total = monto + igtf;

  // Equivalente en bolívares a la tasa BCV (referencia).
  const igtfBs = usdToVes(igtf, 'bcv');
  const totalBs = usdToVes(total, 'bcv');

  const narrativa =
    `Una compra de ${fmtUSD(monto)} pagada en divisas genera ${fmtUSD(igtf)} de IGTF (${fmtPct(tasaPct)}), ` +
    `por lo que terminás pagando ${fmtUSD(total)}. A la tasa BCV, el IGTF equivale a ${fmtVES(igtfBs)}.`;

  return {
    igtf,
    total,
    monto,
    igtfBolivares: igtfBs,
    totalBolivares: totalBs,
    detalle: `${fmtUSD(monto)} + IGTF ${fmtPct(tasaPct)} (${fmtUSD(igtf)}) = ${fmtUSD(total)}`,
    _insight: {
      type: 'highlight',
      icon: '💳',
      text: narrativa,
    },
    _table: {
      title: 'Desglose del IGTF (pago en divisas)',
      headers: ['Concepto', 'En divisas (USD)', 'En bolívares (BCV)'],
      rows: [
        ['Monto de la operación', fmtUSD(monto), fmtVES(usdToVes(monto, 'bcv'))],
        [`IGTF ${fmtPct(tasaPct)}`, fmtUSD(igtf), fmtVES(igtfBs)],
        ['Total a pagar', fmtUSD(total), fmtVES(totalBs)],
      ],
      note: 'El IGTF del 3% aplica a pagos en divisas (efectivo / no bancarizado) por sujetos no exonerados (Ley del IGTF, SENIAT). Para pagos en bolívares de sujetos pasivos especiales la alícuota base es 2%.',
    },
  };
}
