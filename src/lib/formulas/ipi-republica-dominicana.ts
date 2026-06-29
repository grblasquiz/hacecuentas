/**
 * IPI — Impuesto al Patrimonio Inmobiliario, República Dominicana 2026.
 * Grava el 1% sobre el EXCEDENTE del valor de los inmuebles por encima del
 * mínimo exento (RD$10.695.494 para 2026, ajustado por inflación cada año por
 * la DGII). Se paga en dos cuotas semestrales (11 de marzo y 11 de septiembre).
 *
 * Exenciones (Ley 18-88 y modificaciones):
 *  - Mayores de 65 años cuyo único patrimonio inmobiliario sea la vivienda: exentos.
 *  - Pensionados/rentistas de fuente extranjera: descuento del 50% del IPI
 *    (Ley 171-07 de incentivos a pensionados y rentistas extranjeros).
 *
 *   EXENTO = 10.695.494
 *   excedente = max(0, valorInmuebles − EXENTO)
 *   ipiAnual = excedente · 1%   (0 si mayor de 65 con único inmueble)
 *   if pensionadoExtranjero: ipiAnual ·= 0,5
 *   cuotaSemestral = ipiAnual / 2
 */
import { fmtDOP } from '../data/republica-dominicana-2026';

const EXENTO = 10_695_494;
const TASA = 0.01;

export interface Inputs {
  valorInmuebles: number;
  mayor65?: 'si' | 'no';
  pensionadoExtranjero?: 'si' | 'no';
}

export interface Outputs {
  ipiAnual: number | string;
  excedente: number;
  cuotaSemestral: number;
  formula: string;
  explicacion: string;
  _insight?: any;
  _table?: any;
}

export function ipiRepublicaDominicana(inp: Inputs): Outputs {
  const valorInmuebles = Number(inp.valorInmuebles);
  const mayor65 = inp.mayor65 === 'si';
  const pensionadoExtranjero = inp.pensionadoExtranjero === 'si';

  if (!(valorInmuebles >= 0)) throw new Error('Ingresá el valor de tus inmuebles en RD$');

  let excedente: number;
  let ipiAnual: number;

  if (mayor65) {
    // Mayor de 65 con único inmueble (vivienda): exento total.
    excedente = 0;
    ipiAnual = 0;
  } else {
    excedente = Math.max(0, valorInmuebles - EXENTO);
    ipiAnual = excedente * TASA;
    if (pensionadoExtranjero) ipiAnual *= 0.5; // descuento 50% pensionado/rentista extranjero
  }

  const cuotaSemestral = ipiAnual / 2;

  const formula = mayor65
    ? `Exento por ser mayor de 65 años con único inmueble → IPI = ${fmtDOP(0)}`
    : `excedente = max(0, ${fmtDOP(valorInmuebles)} − ${fmtDOP(EXENTO)}) = ${fmtDOP(excedente)} · ` +
      `IPI = ${fmtDOP(excedente)} × 1%${pensionadoExtranjero ? ' × 50%' : ''} = ${fmtDOP(ipiAnual)}`;

  const explicacion = mayor65
    ? `Por ser mayor de 65 años y tener un único inmueble (tu vivienda), estás exento del IPI: no pagás nada.`
    : excedente <= 0
      ? `El valor de tus inmuebles (${fmtDOP(valorInmuebles)}) no supera el mínimo exento de ${fmtDOP(EXENTO)}, ` +
        `así que no pagás IPI.`
      : `El IPI grava el 1% sobre el excedente del valor de tus inmuebles por encima de ${fmtDOP(EXENTO)}. ` +
        `Tu excedente es ${fmtDOP(excedente)}, lo que da un IPI anual de ${fmtDOP(ipiAnual)}` +
        (pensionadoExtranjero ? ' (ya con el descuento del 50% por ser pensionado/rentista extranjero)' : '') +
        `, que se paga en dos cuotas semestrales de ${fmtDOP(cuotaSemestral)} (11 de marzo y 11 de septiembre).`;

  const _insight = {
    title: ipiAnual > 0 ? `Tu IPI anual es ${fmtDOP(ipiAnual)}` : 'No pagás IPI',
    text:
      ipiAnual > 0
        ? `Sobre un excedente de **${fmtDOP(excedente)}** (lo que pasa de ${fmtDOP(EXENTO)}), el IPI del **1%** ` +
          `es **${fmtDOP(ipiAnual)}** al año, o **${fmtDOP(cuotaSemestral)}** por cuota semestral.` +
          (pensionadoExtranjero ? ' Incluye el **descuento del 50%** por pensionado/rentista extranjero.' : '')
        : mayor65
          ? `Estás **exento** por ser mayor de 65 años con un único inmueble.`
          : `El valor de tus inmuebles **no supera el mínimo exento** de ${fmtDOP(EXENTO)}, así que no te corresponde IPI.`,
    tone: (ipiAnual > 0 ? 'neutral' : 'good') as 'good' | 'warn' | 'neutral',
    icon: '🏘️',
  };

  const _table = {
    title: 'Cálculo del IPI (Impuesto al Patrimonio Inmobiliario)',
    headers: ['Concepto', 'Monto'],
    align: ['left', 'right'],
    rows: [
      ['Valor de los inmuebles', fmtDOP(valorInmuebles)],
      ['Mínimo exento 2026', fmtDOP(EXENTO)],
      ['Excedente gravado', fmtDOP(excedente)],
      ['Tasa', '1%'],
      ...(pensionadoExtranjero && !mayor65 ? [['Descuento pensionado extranjero', '−50%']] : []),
      ['Cuota semestral (11-mar / 11-sep)', fmtDOP(cuotaSemestral)],
    ],
    footer: ['IPI anual', fmtDOP(ipiAnual)],
    note: 'El IPI se paga sobre el excedente por encima del mínimo exento (RD$10.695.494 en 2026). Exento: mayores de 65 con único inmueble. Pensionados/rentistas extranjeros: −50%.',
  };

  return {
    ipiAnual: fmtDOP(ipiAnual) + ' / año',
    excedente: Math.round(excedente),
    cuotaSemestral: Math.round(cuotaSemestral),
    formula,
    explicacion,
    _insight,
    _table,
  };
}
