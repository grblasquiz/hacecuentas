/**
 * Impuesto a los cheques y transferencias electrónicas en República Dominicana
 * (ITF / "0.15%"). Ley 30-26 elevó la tasa de 0,15% a 0,20% desde el 3-jul-2026:
 * RD$2 por cada RD$1.000 de operación gravada. El agente de retención es la
 * entidad de intermediación financiera, que lo entera a la DGII.
 */
import { fmtDOP } from '../data/republica-dominicana-2026.ts';

export interface Inputs {
  monto: number;              // monto de la operación (RD$)
  tipo?: string;              // 'gravada' | 'exenta'
  operacionesMes?: number;    // cantidad de operaciones iguales por mes
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

const TASA_NUEVA = 0.0020;    // 0,20% desde el 3-jul-2026 (Ley 30-26)
const TASA_ANTERIOR = 0.0015; // 0,15% hasta el 2-jul-2026

export function compute(i: Inputs): Outputs {
  const monto = Number(i.monto) || 0;
  if (monto <= 0) throw new Error('Ingresá el monto de la transferencia o cheque');
  const exenta = String(i.tipo || 'gravada') === 'exenta';
  const ops = Math.max(1, Math.floor(Number(i.operacionesMes) || 1));

  const impuestoUnitario = exenta ? 0 : monto * TASA_NUEVA;
  const impuestoMensual = impuestoUnitario * ops;
  const impuestoAnterior = exenta ? 0 : monto * TASA_ANTERIOR;
  const incrementoUnitario = impuestoUnitario - impuestoAnterior;
  const netoRecibido = monto - impuestoUnitario;

  const _insight = {
    title: exenta ? 'Operación exenta del impuesto' : 'Impuesto a la transferencia',
    text: exenta
      ? `Las operaciones exentas (traspasos entre cuentas del mismo titular, retiros por cajero, nómina de la Seguridad Social, pagos de tarjeta e impuestos al Estado) **no pagan** el 0,20%.`
      : `Una operación de **${fmtDOP(monto)}** paga **${fmtDOP(impuestoUnitario)}** de impuesto (0,20%). Con la tasa anterior de 0,15% pagabas ${fmtDOP(impuestoAnterior)}: son **${fmtDOP(incrementoUnitario)}** más por operación. Si repetís la operación ${ops} vez/veces al mes, el impuesto mensual es **${fmtDOP(impuestoMensual)}**.`,
    tone: exenta ? 'good' : 'neutral',
    icon: '🏦',
  };
  const _chart = {
    type: 'bar',
    labels: ['Antes (0,15%)', 'Ahora (0,20%)'],
    values: [Math.round(impuestoAnterior * 100) / 100, Math.round(impuestoUnitario * 100) / 100],
    prefix: 'RD$ ',
    ariaLabel: 'Impuesto por operación antes y después de la Ley 30-26.',
  };

  return {
    impuesto: fmtDOP(impuestoUnitario),
    impuestoMensual: fmtDOP(impuestoMensual),
    impuestoAnterior: fmtDOP(impuestoAnterior),
    incremento: fmtDOP(incrementoUnitario),
    neto: fmtDOP(netoRecibido),
    detalle: exenta
      ? `Operación exenta: no aplica el impuesto del 0,20%.`
      : `${fmtDOP(monto)} × 0,20% = ${fmtDOP(impuestoUnitario)} por operación (${fmtDOP(impuestoMensual)} al mes por ${ops}).`,
    _insight,
    _chart,
  };
}
