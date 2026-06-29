/**
 * Impuesto de traspaso de vehículos de motor — República Dominicana 2026.
 *
 * Al transferir la propiedad de un vehículo usado, la DGII cobra un 2% sobre el
 * MAYOR valor entre el precio pactado en el acto de venta y el valor que la DGII
 * asigna al vehículo en su tabla de referencia. A eso se suma el costo fijo de la
 * matrícula (RD$100). Base normativa: Norma General DGII sobre traspaso de
 * vehículos de motor (tasa del 2%); art. 8 de la Ley 557-05 / Código Tributario.
 *
 * Fórmula:
 *   base     = max(precioVenta, valorTabla)   // DGII toma el mayor de los dos
 *   impuesto = base × 2%
 *   total    = impuesto + RD$100 (matrícula)
 *
 * Data/símbolo de moneda: src/lib/data/republica-dominicana-2026.ts.
 */
import { fmtDOP } from '../data/republica-dominicana-2026';

/** Tasa de traspaso de vehículos (DGII). */
const TASA_TRASPASO = 0.02;
/** Costo fijo de la matrícula que se suma al impuesto. */
const COSTO_MATRICULA = 100;

export interface TraspasoVehiculoInputs {
  /** Precio pactado en el acto de venta (RD$). */
  precioVenta?: number | string;
  /** Valor de referencia DGII del vehículo (RD$). 0 = no informado. */
  valorTabla?: number | string;
}

export interface TraspasoVehiculoOutputs {
  base: number | string;
  impuesto: number;
  totalPagar: number;
  baseTexto: string;
  impuestoTexto: string;
  totalTexto: string;
  detalle: string;
  _insight?: any;
  _table?: any;
}

export function traspasoVehiculoRepublicaDominicana(
  i: TraspasoVehiculoInputs,
): TraspasoVehiculoOutputs {
  const precioVenta = Math.max(0, Number(i.precioVenta) || 0);
  const valorTabla = Math.max(0, Number(i.valorTabla) || 0);

  if (precioVenta <= 0 && valorTabla <= 0) {
    throw new Error('Ingresá el precio de venta del vehículo en RD$');
  }

  // La DGII liquida sobre el MAYOR entre el precio de venta y su valor de tabla.
  const base = Math.max(precioVenta, valorTabla);
  const impuesto = base * TASA_TRASPASO;
  const totalPagar = impuesto + COSTO_MATRICULA;

  const usaTabla = valorTabla > precioVenta;

  const detalle =
    `Base imponible = ${fmtDOP(base)} (` +
    (usaTabla
      ? `valor DGII, mayor que el precio de venta de ${fmtDOP(precioVenta)}`
      : `precio de venta, mayor o igual al valor DGII`) +
    `). Impuesto 2% = ${fmtDOP(impuesto)} + matrícula ${fmtDOP(COSTO_MATRICULA)} = ${fmtDOP(totalPagar)}.`;

  const _insight = {
    title: `Pagás ${fmtDOP(totalPagar)} por el traspaso`,
    text:
      `El impuesto de traspaso es el **2% sobre ${fmtDOP(base)}** ` +
      (usaTabla
        ? `(la DGII usa su **valor de tabla** porque es mayor que el precio pactado)`
        : `(el precio de venta, que es el valor más alto)`) +
      ` = **${fmtDOP(impuesto)}**, más la matrícula de **${fmtDOP(COSTO_MATRICULA)}**, total **${fmtDOP(totalPagar)}**.`,
    tone: 'info' as const,
    icon: '🚗',
  };

  const _table = {
    title: 'Desglose del traspaso de vehículo',
    headers: ['Concepto', 'Monto'],
    align: ['left', 'right'],
    rows: [
      ['Precio de venta declarado', fmtDOP(precioVenta)],
      ['Valor de referencia DGII', valorTabla > 0 ? fmtDOP(valorTabla) : 'No informado'],
      ['Base imponible (el mayor)', fmtDOP(base)],
      ['Impuesto de traspaso (2%)', fmtDOP(impuesto)],
      ['Matrícula (fijo)', fmtDOP(COSTO_MATRICULA)],
    ],
    footer: ['Total a pagar', fmtDOP(totalPagar)],
    note: 'La DGII liquida el 2% sobre el mayor valor entre el precio de venta y su tabla de referencia, más RD$100 de matrícula.',
  };

  return {
    base: fmtDOP(base) + ' · base imponible',
    impuesto: Math.round(impuesto * 100) / 100,
    totalPagar: Math.round(totalPagar * 100) / 100,
    baseTexto: fmtDOP(base),
    impuestoTexto: fmtDOP(impuesto),
    totalTexto: fmtDOP(totalPagar),
    detalle,
    _insight,
    _table,
  };
}
