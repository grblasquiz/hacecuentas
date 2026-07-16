/**
 * Mora y recargos de la DGII por pago tardío de impuestos en República
 * Dominicana. Recargo por mora: 10% el primer mes o fracción + 4% por cada mes
 * o fracción adicional (Art. 252). Interés indemnizatorio: 1,10% por mes o
 * fracción (Art. 27). Base legal: Código Tributario (Ley 11-92), mod. Ley 147-00.
 */
import { fmtDOP } from '../data/republica-dominicana-2026.ts';

export interface Inputs {
  impuesto: number;      // impuesto adeudado (RD$)
  mesesAtraso: number;   // meses (o fracción) de atraso
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

const REC_PRIMER = 0.10; // 10% primer mes o fracción
const REC_ADIC = 0.04;   // 4% por cada mes o fracción adicional
const INTERES = 0.011;   // 1,10% mensual de interés indemnizatorio (referencial DGII)

export function compute(i: Inputs): Outputs {
  const imp = Number(i.impuesto) || 0;
  if (imp <= 0) throw new Error('Ingresá el impuesto adeudado en RD$');
  const mesesRaw = Number(i.mesesAtraso) || 0;
  const meses = Math.max(0, Math.ceil(mesesRaw)); // cada fracción de mes cuenta como un mes

  if (meses === 0) {
    return {
      total: fmtDOP(imp),
      recargo: fmtDOP(0),
      interes: fmtDOP(0),
      recargoPct: '0 %',
      detalle: `Sin atraso: pagás el impuesto de ${fmtDOP(imp)} sin recargos ni intereses.`,
      _insight: {
        title: 'Al día',
        text: `No hay mora: se paga sólo el impuesto de **${fmtDOP(imp)}**.`,
        tone: 'good',
        icon: '✅',
      },
    };
  }

  const recargoPct = REC_PRIMER + REC_ADIC * (meses - 1);
  const recargo = imp * recargoPct;
  const interes = imp * INTERES * meses;
  const total = imp + recargo + interes;

  const _insight = {
    title: 'Mora y recargos DGII',
    text: `Un impuesto de **${fmtDOP(imp)}** con **${meses}** mes(es) de atraso acumula **${fmtDOP(recargo)}** de recargo (${(recargoPct * 100).toFixed(0)}%) y **${fmtDOP(interes)}** de interés indemnizatorio (1,10%/mes). Total a pagar: **${fmtDOP(total)}** — ${fmtDOP(total - imp)} por encima del impuesto original.`,
    tone: 'warn',
    icon: '⏰',
  };
  const _chart = {
    type: 'bar',
    labels: ['Impuesto', 'Recargo', 'Interés'],
    values: [Math.round(imp), Math.round(recargo), Math.round(interes)],
    prefix: 'RD$ ',
    ariaLabel: 'Impuesto original, recargo por mora e interés indemnizatorio.',
  };

  return {
    total: fmtDOP(total),
    recargo: fmtDOP(recargo),
    interes: fmtDOP(interes),
    recargoPct: `${(recargoPct * 100).toFixed(0)} %`,
    detalle: `Impuesto ${fmtDOP(imp)} + recargo ${fmtDOP(recargo)} (${(recargoPct * 100).toFixed(0)}%) + interés ${fmtDOP(interes)} = ${fmtDOP(total)}.`,
    _insight,
    _chart,
  };
}
