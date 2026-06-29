/**
 * Calculadora de horas extras en Venezuela (LOTTT, 2026).
 *
 * Horas extras diurnas (HED): recargo del 50% sobre la hora normal (LOTTT art. 118).
 * Horas extras nocturnas (HEN): la hora nocturna ya lleva el bono nocturno del 30%
 *   (LOTTT art. 117) y sobre ESA hora se aplica el recargo extra del 50%.
 *
 * Valor hora normal = (salario mensual / 30) / horas de la jornada diaria.
 *
 * Datos: salario y jornada son inputs; los porcentajes (30% nocturno, 50% extra)
 * están fijados por la LOTTT. La moneda es el bolívar (VES).
 * Fuente: LOTTT arts. 117-118, MinTrabajo.
 */
import { fmtVES } from '../data/venezuela-2026';

export interface Inputs {
  salarioMensual?: number;
  horasJornada?: number;
  cantHED?: number;
  cantHEN?: number;
}

export interface Outputs {
  [k: string]: any;
  _insight?: any;
  _table?: any;
}

const RECARGO_EXTRA = 0.5;   // 50% horas extra (LOTTT art. 118)
const RECARGO_NOCT = 0.3;    // 30% bono nocturno (LOTTT art. 117)

export function horasExtrasVenezuela(i: Inputs): Outputs {
  const salarioMensual = Math.max(0, Number(i.salarioMensual) || 0);
  if (salarioMensual <= 0) throw new Error('Ingresá tu salario mensual en bolívares.');
  const horasJornada = Math.max(1, Number(i.horasJornada) || 8);
  const cantHED = Math.max(0, Number(i.cantHED) || 0);
  const cantHEN = Math.max(0, Number(i.cantHEN) || 0);

  const salarioDiario = salarioMensual / 30;
  const valorHora = salarioDiario / horasJornada;

  const valorHED = valorHora * (1 + RECARGO_EXTRA);          // hora extra diurna
  const valorHoraNoct = valorHora * (1 + RECARGO_NOCT);      // hora nocturna base
  const valorHEN = valorHoraNoct * (1 + RECARGO_EXTRA);      // hora extra nocturna

  const totalHED = cantHED * valorHED;
  const totalHEN = cantHEN * valorHEN;
  const totalExtras = totalHED + totalHEN;

  const narrativa =
    `Con un salario de ${fmtVES(salarioMensual)} y jornada de ${horasJornada} h, tu hora normal vale ${fmtVES(valorHora)}. ` +
    `Cada hora extra diurna se paga ${fmtVES(valorHED)} (+50%) y cada hora extra nocturna ${fmtVES(valorHEN)} (+30% nocturno y +50% extra). ` +
    `En total te corresponden ${fmtVES(totalExtras)} por horas extras.`;

  return {
    valorHora,
    valorHED,
    valorHEN,
    totalExtras,
    _insight: {
      type: 'highlight',
      icon: '⏱️',
      text: narrativa,
    },
    _table: {
      title: 'Desglose de horas extras (LOTTT)',
      headers: ['Concepto', 'Valor unitario', 'Cantidad', 'Total'],
      rows: [
        ['Hora normal', fmtVES(valorHora), '—', '—'],
        ['Hora extra diurna (+50%)', fmtVES(valorHED), String(cantHED), fmtVES(totalHED)],
        ['Hora extra nocturna (+30% noct. +50% extra)', fmtVES(valorHEN), String(cantHEN), fmtVES(totalHEN)],
        ['Total horas extras', '—', '—', fmtVES(totalExtras)],
      ],
      note: 'Hora extra diurna: recargo 50% (LOTTT art. 118). Hora extra nocturna: bono nocturno 30% (art. 117) más recargo 50% sobre la hora nocturna. Base = (salario mensual ÷ 30) ÷ horas de jornada.',
    },
  };
}
