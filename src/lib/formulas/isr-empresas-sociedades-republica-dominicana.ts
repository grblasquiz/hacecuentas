/**
 * ISR de empresas / sociedades (personas jurídicas) en República Dominicana.
 * Tasa del 27% sobre la renta neta imponible (Art. 297 del Código Tributario).
 * La renta neta = ingresos gravados − gastos y costos deducibles. Existe además
 * un anticipo y un impuesto mínimo (1% de los activos), que se explican aparte.
 */
import { fmtDOP } from '../data/republica-dominicana-2026.ts';

export interface Inputs {
  ingresos: number;           // ingresos gravados del período (RD$)
  gastosDeducibles?: number;  // costos y gastos deducibles (RD$)
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

const TASA = 0.27; // 27% ISR personas jurídicas (Art. 297)

export function compute(i: Inputs): Outputs {
  const ingresos = Number(i.ingresos) || 0;
  if (ingresos <= 0) throw new Error('Ingresá los ingresos gravados en RD$');
  const gastos = Math.max(0, Number(i.gastosDeducibles) || 0);

  const rentaNeta = Math.max(0, ingresos - gastos);
  const isr = rentaNeta * TASA;
  const utilidadDespues = rentaNeta - isr;
  const tasaEfectiva = ingresos > 0 ? (isr / ingresos) * 100 : 0;

  const _insight = {
    title: 'ISR de la sociedad',
    text: `Con ingresos de **${fmtDOP(ingresos)}** y gastos deducibles de **${fmtDOP(gastos)}**, la renta neta imponible es **${fmtDOP(rentaNeta)}**. El ISR (27%) da **${fmtDOP(isr)}** y la utilidad después de impuestos es **${fmtDOP(utilidadDespues)}** (carga efectiva del ${tasaEfectiva.toFixed(1)}% sobre los ingresos).`,
    tone: 'neutral',
    icon: '🏢',
  };
  const _chart = {
    type: 'bar',
    labels: ['Utilidad después de ISR', 'ISR 27%'],
    values: [Math.round(utilidadDespues), Math.round(isr)],
    prefix: 'RD$ ',
    ariaLabel: 'Reparto de la renta neta entre utilidad e ISR.',
  };

  return {
    isr: fmtDOP(isr),
    rentaNeta: fmtDOP(rentaNeta),
    utilidadDespues: fmtDOP(utilidadDespues),
    tasaEfectiva: `${tasaEfectiva.toFixed(1)} %`,
    detalle: `Renta neta ${fmtDOP(rentaNeta)} × 27% = ${fmtDOP(isr)}; utilidad después de ISR ${fmtDOP(utilidadDespues)}.`,
    _insight,
    _chart,
  };
}
