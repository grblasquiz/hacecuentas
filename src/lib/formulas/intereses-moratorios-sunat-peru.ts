/** Intereses moratorios SUNAT Perú — TIM lineal (sin capitalizar) sobre deuda tributaria. */
import { fmtPEN } from '../data/peru-2026.ts';

// TIM mensual vigente (R.S. 044-2021/SUNAT): 0,90% mensual = 0,03% diario.
const TIM_MENSUAL = 0.009;
const TIM_DIARIA = TIM_MENSUAL / 30; // 0,0003 (0,03%)

export interface Inputs {
  deuda: number;
  diasAtraso: number;
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

export function compute(i: Inputs): Outputs {
  const deuda = Number(i.deuda) || 0;
  const dias = Math.max(0, Number(i.diasAtraso) || 0);
  if (deuda <= 0) throw new Error('Ingresá el monto de la deuda tributaria');

  // Interés moratorio = deuda × TIM diaria × días (lineal, sin capitalización).
  const interes = deuda * TIM_DIARIA * dias;
  const total = deuda + interes;

  const _insight = {
    title: 'Lo que crece tu deuda con SUNAT',
    text: `Una deuda de **${fmtPEN(deuda)}** con **${dias} días** de atraso genera **${fmtPEN(interes)}** de interés moratorio (TIM 0,90% mensual / 0,03% diario, sin capitalizar). Tendrías que pagar **${fmtPEN(total)}** en total. El interés se calcula día por día, así que cada día que pasa suma ${fmtPEN(deuda * TIM_DIARIA)}.`,
    tone: dias > 0 ? 'warn' : 'good',
    icon: '🧾',
  };
  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Deuda original', value: Math.round(deuda) },
      { label: 'Interés moratorio', value: Math.round(interes) },
    ].filter((s) => s.value > 0),
    prefix: 'S/ ',
    centerValue: fmtPEN(total),
    centerLabel: 'Total a pagar',
    ariaLabel: `Deuda ${fmtPEN(deuda)} más interés moratorio ${fmtPEN(interes)} igual a ${fmtPEN(total)}.`,
  };

  return {
    interes: fmtPEN(interes),
    total: fmtPEN(total),
    detalle: `TIM 0,03% diaria × ${dias} días = ${fmtPEN(interes)} de interés sobre ${fmtPEN(deuda)}. Total ${fmtPEN(total)}.`,
    _insight,
    _chart,
  };
}
