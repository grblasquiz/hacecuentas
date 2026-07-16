/**
 * Gastos de cierre de la compra de una vivienda en República Dominicana:
 * impuesto de transferencia inmobiliaria (3%, Ley 288-04), honorarios legales
 * y otros gastos (deslinde, certificaciones, registro de título). El impuesto
 * se calcula sobre el mayor entre el precio pactado y el valor de la DGII.
 */
import { fmtDOP } from '../data/republica-dominicana-2026.ts';

export interface Inputs {
  precio: number;                 // precio / valor de referencia DGII (RD$)
  honorariosLegalesPct?: number;  // % de honorarios de abogado (default 1%)
  otrosGastos?: number;           // deslinde, certificaciones, registro (RD$)
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

const IMP_TRANSFERENCIA = 0.03;   // 3% impuesto de transferencia inmobiliaria (Ley 288-04)

export function compute(i: Inputs): Outputs {
  const precio = Number(i.precio) || 0;
  if (precio <= 0) throw new Error('Ingresá el precio de la vivienda en RD$');
  const legalPct = i.honorariosLegalesPct != null && Number(i.honorariosLegalesPct) >= 0
    ? Number(i.honorariosLegalesPct)
    : 1;
  const otros = Math.max(0, Number(i.otrosGastos) || 0);

  const transferencia = precio * IMP_TRANSFERENCIA;
  const legal = precio * (legalPct / 100);
  const totalGastos = transferencia + legal + otros;
  const costoTotal = precio + totalGastos;
  const pctSobrePrecio = precio > 0 ? (totalGastos / precio) * 100 : 0;

  const _insight = {
    title: 'Gastos de cierre estimados',
    text: `Comprar una vivienda de **${fmtDOP(precio)}** suma **${fmtDOP(totalGastos)}** en gastos de cierre (**${pctSobrePrecio.toFixed(1)}%** del precio): ${fmtDOP(transferencia)} de impuesto de transferencia (3%), ${fmtDOP(legal)} de honorarios legales (${legalPct}%) y ${fmtDOP(otros)} de otros gastos. Presupuestá un desembolso total de **${fmtDOP(costoTotal)}**.`,
    tone: 'neutral',
    icon: '🏠',
  };
  const _chart = {
    type: 'bar',
    labels: ['Transferencia 3%', `Legal ${legalPct}%`, 'Otros'],
    values: [Math.round(transferencia), Math.round(legal), Math.round(otros)],
    prefix: 'RD$ ',
    ariaLabel: 'Desglose de los gastos de cierre.',
  };

  return {
    totalGastos: fmtDOP(totalGastos),
    transferencia: fmtDOP(transferencia),
    legal: fmtDOP(legal),
    otros: fmtDOP(otros),
    costoTotal: fmtDOP(costoTotal),
    detalle: `Transferencia ${fmtDOP(transferencia)} + legal ${fmtDOP(legal)} + otros ${fmtDOP(otros)} = ${fmtDOP(totalGastos)} (${pctSobrePrecio.toFixed(1)}% del precio).`,
    _insight,
    _chart,
  };
}
