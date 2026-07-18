/**
 * Anticipos del ISR para personas jurídicas — República Dominicana (DGII,
 * Guía 12). El método depende de la Tasa Efectiva de Tributación (TET):
 *   TET = ISR liquidado ÷ ingresos brutos del año anterior
 *   - TET > 1,5%  → anticipo mensual = (ISR liquidado − saldo a favor) ÷ 12
 *   - TET ≤ 1,5%  → anticipo mensual = (1,5% × ingresos brutos) ÷ 12
 * Se pagan en 12 cuotas mensuales iguales. El saldo a favor de la declaración
 * anterior se descuenta de la base.
 */
import { ANTICIPOS_ISR_DO, fmtDOP } from '../data/republica-dominicana-2026';

export interface Inputs {
  ingresosBrutos: number; // ingresos brutos declarados el año anterior (RD$)
  isrLiquidado: number;   // ISR liquidado en la declaración anterior (RD$)
  saldoAFavor?: number;   // saldo a favor de la declaración (RD$), opcional
}

export interface Outputs { [k: string]: any; detalle: string; _insight?: any; _chart?: any; }

function num(v: unknown, d: number): number {
  if (v === '' || v === null || v === undefined) return d;
  const n = Number(v);
  return Number.isFinite(n) ? n : d;
}

export function compute(i: Inputs): Outputs {
  const ingresos = num(i.ingresosBrutos, 0);
  const isr = Math.max(0, num(i.isrLiquidado, 0));
  const saldoAFavor = Math.max(0, num(i.saldoAFavor, 0));
  if (!(ingresos > 0)) throw new Error('Ingresá los ingresos brutos del año anterior en RD$');

  const tet = isr / ingresos;
  const umbral = ANTICIPOS_ISR_DO.umbralTet; // 1,5%
  const cuotas = ANTICIPOS_ISR_DO.cuotas;    // 12

  let baseAnual: number;
  let metodo: string;
  if (tet > umbral) {
    baseAnual = Math.max(0, isr - saldoAFavor);
    metodo = 'ISR liquidado ÷ 12 (TET mayor a 1,5%)';
  } else {
    baseAnual = Math.max(0, ingresos * umbral - saldoAFavor);
    metodo = '1,5% de los ingresos ÷ 12 (TET 1,5% o menor)';
  }
  const anticipoMensual = baseAnual / cuotas;

  const detalle =
    `TET = ${fmtDOP(isr)} ÷ ${fmtDOP(ingresos)} = ${(tet * 100).toFixed(2)}%. ` +
    `${tet > umbral ? 'Mayor' : 'Menor o igual'} a 1,5% → base anual ${fmtDOP(baseAnual)}` +
    (saldoAFavor > 0 ? ` (ya descontado el saldo a favor de ${fmtDOP(saldoAFavor)})` : '') +
    ` ÷ 12 = ${fmtDOP(anticipoMensual)} por mes.`;

  const _insight = {
    title: `Anticipo mensual: ${fmtDOP(anticipoMensual)}`,
    text:
      `Tu **Tasa Efectiva de Tributación** es **${(tet * 100).toFixed(2)}%** (${fmtDOP(isr)} de ISR sobre ${fmtDOP(ingresos)} de ingresos). ` +
      (tet > umbral
        ? `Como supera el **1,5%**, el anticipo se calcula dividiendo el **ISR liquidado** en 12: **${fmtDOP(anticipoMensual)}** por mes.`
        : `Como es **1,5% o menos**, el anticipo se calcula sobre el **1,5% de los ingresos** dividido en 12: **${fmtDOP(anticipoMensual)}** por mes.`) +
      ` Total anual de anticipos: **${fmtDOP(baseAnual)}**, que se acredita contra tu ISR del año.`,
    tone: 'neutral' as const,
    icon: '📅',
  };

  const _chart = {
    type: 'bar' as const,
    labels: ['Anticipo mensual', 'Total anual (12 cuotas)'],
    values: [Math.round(anticipoMensual), Math.round(baseAnual)],
    prefix: 'RD$ ',
    ariaLabel: `Anticipo mensual ${fmtDOP(anticipoMensual)} y total anual ${fmtDOP(baseAnual)}.`,
  };

  return {
    anticipoMensual: fmtDOP(anticipoMensual),
    totalAnual: fmtDOP(baseAnual),
    tet: `${(tet * 100).toFixed(2)}%`,
    metodo,
    detalle,
    _insight,
    _chart,
  };
}
