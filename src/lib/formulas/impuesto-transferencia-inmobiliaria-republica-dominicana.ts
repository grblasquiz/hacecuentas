/**
 * Impuesto de transferencia inmobiliaria — República Dominicana 2026.
 * Tasa del 3% sobre el MAYOR entre el precio del contrato y el valor que tasa
 * la DGII (Dirección General de Impuestos Internos). Es el impuesto que paga
 * el comprador al inscribir el traspaso del inmueble. Moneda: RD$.
 *
 *   baseImponible = max(precioContrato, valorDgii)
 *   impuesto = baseImponible · 3%
 */
import { fmtDOP } from '../data/republica-dominicana-2026';

const TASA = 0.03;

export interface Inputs {
  precioContrato: number;
  valorDgii?: number; // valor que estima/tasa la DGII, default 0 (usa el precio)
}

export interface Outputs {
  impuesto: number | string;
  baseImponible: number;
  formula: string;
  explicacion: string;
  _insight?: any;
  _table?: any;
}

export function impuestoTransferenciaInmobiliariaRepublicaDominicana(inp: Inputs): Outputs {
  const precioContrato = Number(inp.precioContrato);
  const valorDgii = Math.max(0, Number(inp.valorDgii) || 0);

  if (!precioContrato || precioContrato <= 0)
    throw new Error('Ingresá el precio del inmueble en RD$');

  const base = Math.max(precioContrato, valorDgii);
  const impuesto = base * TASA;
  const baseEsDgii = valorDgii > precioContrato;

  const formula =
    `base = max(${fmtDOP(precioContrato)}, ${fmtDOP(valorDgii)}) = ${fmtDOP(base)} · ` +
    `impuesto = ${fmtDOP(base)} × 3% = ${fmtDOP(impuesto)}`;

  const explicacion =
    `El impuesto de transferencia inmobiliaria es el 3% del mayor valor entre el precio del contrato ` +
    `(${fmtDOP(precioContrato)}) y la tasación de la DGII (${fmtDOP(valorDgii)}). ` +
    `La base imponible es ${fmtDOP(base)}${baseEsDgii ? ' (manda el valor de la DGII porque es mayor)' : ''}, ` +
    `así que el impuesto a pagar es ${fmtDOP(impuesto)}.`;

  const _insight = {
    title: `El traspaso te cuesta ${fmtDOP(impuesto)}`,
    text:
      `Sobre una base de **${fmtDOP(base)}** (el mayor entre precio y valor DGII), el impuesto de ` +
      `transferencia del **3%** es **${fmtDOP(impuesto)}**. ` +
      (baseEsDgii
        ? `Ojo: la DGII tasó el inmueble por encima del precio del contrato, y el 3% se aplica sobre ese valor mayor.`
        : `Como el precio del contrato es mayor o igual al valor DGII, se aplica el 3% sobre el precio.`),
    tone: 'neutral' as const,
    icon: '🏷️',
  };

  const _table = {
    title: 'Cómo se determina el impuesto de transferencia (3%)',
    headers: ['Concepto', 'Monto'],
    align: ['left', 'right'],
    rows: [
      ['Precio del contrato', fmtDOP(precioContrato)],
      ['Valor tasado por la DGII', fmtDOP(valorDgii)],
      ['Base imponible (el mayor)', fmtDOP(base)],
      ['Tasa', '3%'],
    ],
    footer: ['Impuesto de transferencia', fmtDOP(impuesto)],
    note: 'El impuesto se calcula sobre el mayor entre el precio del contrato y el valor que tasa la DGII. Lo paga el comprador al inscribir el traspaso.',
  };

  return {
    impuesto: fmtDOP(impuesto),
    baseImponible: Math.round(base),
    formula,
    explicacion,
    _insight,
    _table,
  };
}
