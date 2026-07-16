/**
 * Descuento por día u hora no trabajada — PARAGUAY.
 *
 * Cuando un trabajador mensualero falta sin justificación (o con permiso sin goce
 * de sueldo), el empleador descuenta el valor proporcional del tiempo no trabajado.
 * La base habitual de cálculo:
 *
 *   valor del día  = salario mensual / 30
 *   valor de la hora = salario mensual / 240   (30 días × 8 horas de jornada)
 *
 * El descuento del día no trabajado también reduce la base para el aguinaldo
 * proporcional y el aporte al IPS de ese mes. Las faltas justificadas con goce de
 * sueldo (enfermedad certificada, licencias legales) NO se descuentan.
 *
 * Moneda: guaraníes (PYG).
 */
import { PARAGUAY_2026, fmtPYG } from '../data/paraguay-2026.ts';

export interface Inputs {
  salarioMensual: number;  // salario mensual, en Gs.
  cantidad?: number;       // cantidad de días u horas no trabajadas
  unidad?: string;         // 'dias' | 'horas'
}
export interface Outputs { [k: string]: any; _insight?: any; _table?: any; }

export function compute(i: Inputs): Outputs {
  const salario = Number(i.salarioMensual) || 0;
  if (salario <= 0) throw new Error('Ingresá tu salario mensual');
  const enHoras = String(i.unidad || 'dias') === 'horas';
  const cantidad = Math.max(1, Number(i.cantidad) || 1);

  const valorDia = salario / PARAGUAY_2026.diasMes;              // /30
  const valorHora = salario / PARAGUAY_2026.horasMesEstandar;    // /240

  const descuento = enHoras
    ? Math.round(valorHora * cantidad)
    : Math.round(valorDia * cantidad);
  const salarioRestante = Math.round(salario - descuento);

  const _table = {
    title: 'Valor del tiempo no trabajado',
    headers: ['Concepto', 'Cálculo', 'Monto'],
    rows: [
      ['Valor del día', `${fmtPYG(salario)} ÷ 30`, fmtPYG(Math.round(valorDia))],
      ['Valor de la hora', `${fmtPYG(salario)} ÷ 240`, fmtPYG(Math.round(valorHora))],
      [`Descuento (${cantidad} ${enHoras ? 'hora(s)' : 'día(s)'})`, enHoras ? 'valor hora × cantidad' : 'valor día × cantidad', fmtPYG(descuento)],
      ['Salario del mes tras el descuento', '', fmtPYG(salarioRestante)],
    ],
    note: 'Base: salario mensual ÷ 30 días (valor día) y ÷ 240 (valor hora, jornada de 8 h). Sólo se descuentan las faltas sin goce de sueldo; las licencias legales y la enfermedad certificada no se descuentan.',
  };

  const _insight = {
    type: 'highlight',
    icon: '📉',
    text: enHoras
      ? `Cada hora no trabajada vale **${fmtPYG(Math.round(valorHora))}**. Por **${cantidad} hora(s)** el descuento es **${fmtPYG(descuento)}**, y tu salario del mes queda en **${fmtPYG(salarioRestante)}**.`
      : `Cada día no trabajado vale **${fmtPYG(Math.round(valorDia))}**. Por **${cantidad} día(s)** el descuento es **${fmtPYG(descuento)}**, y tu salario del mes queda en **${fmtPYG(salarioRestante)}**.`,
  };

  return {
    valorDia: fmtPYG(Math.round(valorDia)),
    valorHora: fmtPYG(Math.round(valorHora)),
    descuentoTotal: fmtPYG(descuento),
    salarioRestante: fmtPYG(salarioRestante),
    detalle: enHoras
      ? `Valor hora ${fmtPYG(Math.round(valorHora))} × ${cantidad} = ${fmtPYG(descuento)}. Salario restante: ${fmtPYG(salarioRestante)}.`
      : `Valor día ${fmtPYG(Math.round(valorDia))} × ${cantidad} = ${fmtPYG(descuento)}. Salario restante: ${fmtPYG(salarioRestante)}.`,
    _insight,
    _table,
  };
}
