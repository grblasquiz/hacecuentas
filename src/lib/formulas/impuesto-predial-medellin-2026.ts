/**
 * Impuesto predial unificado Medellín 2026 — estimación REFERENCIAL por estrato.
 *
 * ⚠️ Medellín NO está en el módulo src/lib/data/colombia-2026.ts (que sólo trae
 * la tabla oficial de Bogotá). Por eso las tarifas por estrato y el % de
 * descuento por pronto pago de esta calculadora son REFERENCIALES: los fija el
 * Acuerdo / Estatuto Tributario del municipio de Medellín y se ajustan cada
 * vigencia. Esta herramienta estima un orden de magnitud; el valor exacto está
 * en el recibo oficial de la Alcaldía de Medellín (medellin.gov.co).
 *
 * VERIFICADO (Ley 44/1990, marco nacional del predial): la mecánica es
 *   impuesto = avalúo catastral × tarifa (por mil), aplicada sobre TODO el
 *   avalúo (no marginal). Lo REFERENCIAL es el valor de cada tarifa y el
 *   descuento, no la fórmula.
 */
import { fmtCOP } from '../data/colombia-2026.ts';

// Tarifas residenciales por estrato (por mil) — REFERENCIALES 2026 (Acuerdo municipal de Medellín).
// Rotan cada vigencia; verificá la tarifa exacta en tu recibo o en medellin.gov.co.
const TARIFA_POR_MIL_ESTRATO: Record<number, number> = {
  1: 5.0,
  2: 5.5,
  3: 6.5,
  4: 8.0,
  5: 9.5,
  6: 11.0,
};

// Descuento por pronto pago — REFERENCIAL (el municipio fija el % y la fecha cada año).
const DESCUENTO_PRONTO_PAGO = 0.10;

export interface Inputs {
  avaluoCatastral: number; // avalúo catastral 2026 (COP)
  estrato?: string;        // '1'..'6' (residencial)
  pagoPronto?: string;     // 'si' | 'no'
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

export function compute(i: Inputs): Outputs {
  const avaluo = i.avaluoCatastral === undefined || i.avaluoCatastral === null || (i.avaluoCatastral as any) === ''
    ? NaN : Number(i.avaluoCatastral);
  if (!Number.isFinite(avaluo) || avaluo <= 0) {
    throw new Error('Ingresa el avalúo catastral 2026 de tu predio en Medellín');
  }

  const estrato = Math.min(6, Math.max(1, Math.round(Number(String(i.estrato ?? '3')) || 3)));
  const prontoPago = String(i.pagoPronto ?? 'si') === 'si';

  const tarifaPorMil = TARIFA_POR_MIL_ESTRATO[estrato];
  // El impuesto se aproxima al múltiplo de mil más cercano, como en la factura.
  const impuesto = Math.round((avaluo * tarifaPorMil) / 1000 / 1000) * 1000;
  const descuentoValor = prontoPago ? Math.round(impuesto * DESCUENTO_PRONTO_PAGO) : 0;
  const valorAPagar = impuesto - descuentoValor;
  const tarifaTxt = String(tarifaPorMil).replace('.', ',');

  const _insight = {
    title: `Tarifa referencial ${tarifaTxt} por mil (estrato ${estrato})`,
    text: `Con un avalúo catastral de **${fmtCOP(avaluo)}** en estrato ${estrato}, el predial estimado es **${fmtCOP(impuesto)}** (tarifa referencial ${tarifaTxt} por mil).${prontoPago ? ` Con el descuento por pronto pago (10% referencial) pagarías **${fmtCOP(valorAPagar)}**.` : ' Sin descuento por pronto pago.'} ⚠️ Es una estimación: las tarifas por estrato y el descuento en Medellín los fija el Acuerdo municipal y cambian cada año — confirmá el valor en tu recibo oficial.`,
    tone: 'info',
    icon: '🏛️',
  };

  const _chart = {
    type: 'bar',
    labels: ['Impuesto pleno', 'A pagar'],
    values: [Math.round(impuesto), Math.round(valorAPagar)],
    prefix: '$ ',
    ariaLabel: `Impuesto predial pleno ${fmtCOP(impuesto)} y valor a pagar ${fmtCOP(valorAPagar)} tras el descuento por pronto pago.`,
  };

  return {
    impuestoAnual: fmtCOP(impuesto),
    tarifaAplicada: `${tarifaTxt} por mil — estrato ${estrato} (referencial)`,
    descuentoProntoPago: prontoPago
      ? `${fmtCOP(descuentoValor)} (10% referencial)`
      : '$0 (sin descuento por pronto pago)',
    valorAPagar: fmtCOP(valorAPagar),
    detalle: `${fmtCOP(avaluo)} × ${tarifaTxt} por mil = ${fmtCOP(impuesto)} (aprox. al múltiplo de mil). ${prontoPago ? `Menos 10% de descuento referencial (${fmtCOP(descuentoValor)}) → a pagar ${fmtCOP(valorAPagar)}.` : `Sin descuento por pronto pago → a pagar ${fmtCOP(valorAPagar)}.`} Estimación referencial: verificá tarifas y fechas en el recibo oficial de la Alcaldía de Medellín.`,
    _insight,
    _chart,
  };
}
