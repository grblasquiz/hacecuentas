/** Horas extras (sobretiempo) Perú — DS 007-2002-TR: 1ª-2ª hora +25%, 3ª+ +35%,
 *  nocturno +35% sobre el valor hora, feriado/descanso +100% (doble). */
import { fmtPEN } from '../data/peru-2026.ts';

export interface Inputs {
  sueldo: number;          // sueldo bruto mensual
  horasExtra: number;      // cantidad de horas extra en el mes
  nocturna?: string;       // 'si' aplica recargo nocturno +35%
  feriado?: string;        // 'si' la jornada extra cae en feriado/descanso (+100%)
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

export function compute(i: Inputs): Outputs {
  const sueldo = Number(i.sueldo) || 0;
  const horasExtra = Number(i.horasExtra) || 0;
  const nocturna = String(i.nocturna || 'no') === 'si';
  const feriado = String(i.feriado || 'no') === 'si';
  if (sueldo <= 0) throw new Error('Ingresá tu sueldo mensual');
  if (horasExtra <= 0) throw new Error('Ingresá la cantidad de horas extra');

  // Valor hora ordinario = sueldo / 30 días / 8 horas (jornada legal).
  const valorHora = sueldo / 30 / 8;

  let pagoExtras = 0;
  let detalle = '';
  if (feriado) {
    // Trabajo en día feriado/descanso no compensado: se paga doble (+100%).
    pagoExtras = horasExtra * valorHora * 2.0;
    detalle = `${horasExtra} h en feriado a doble valor (${fmtPEN(valorHora)} × 2) = ${fmtPEN(pagoExtras)}`;
  } else {
    const factor = nocturna ? 1.35 : 1; // recargo nocturno aplica sobre el valor hora
    const h1 = Math.min(horasExtra, 2);      // primeras 2 horas: +25%
    const hRest = Math.max(horasExtra - 2, 0); // de la 3ª en adelante: +35%
    const pago1 = h1 * valorHora * factor * 1.25;
    const pagoRest = hRest * valorHora * factor * 1.35;
    pagoExtras = pago1 + pagoRest;
    detalle = `${h1} h al 25%${nocturna ? ' (+35% noct.)' : ''} = ${fmtPEN(pago1)}` +
      (hRest > 0 ? ` · ${hRest} h al 35%${nocturna ? ' (+35% noct.)' : ''} = ${fmtPEN(pagoRest)}` : '');
  }
  const total = pagoExtras;

  const _insight = {
    title: 'Pago por tus horas extras',
    text: `Tu valor hora ordinario es **${fmtPEN(valorHora)}** (sueldo ÷ 30 ÷ 8). ` +
      (feriado
        ? `Por trabajar **${horasExtra} h en un feriado/día de descanso** se paga el **doble** (+100%): **${fmtPEN(total)}**.`
        : `Por **${horasExtra} h extra**${nocturna ? ' en horario nocturno (+35%)' : ''} cobrás **${fmtPEN(total)}** (las 2 primeras al 25%, el resto al 35%).`),
    tone: 'good',
    icon: '⏰',
  };
  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Valor hora ordinario', value: Math.round(valorHora * horasExtra) },
      { label: 'Recargo extra', value: Math.round(Math.max(total - valorHora * horasExtra, 0)) },
    ].filter((s) => s.value > 0),
    prefix: 'S/ ',
    centerValue: fmtPEN(total),
    centerLabel: 'Total a cobrar',
    ariaLabel: `Pago por horas extra de ${fmtPEN(total)}.`,
  };

  return {
    valorHora: fmtPEN(valorHora),
    pagoExtras: fmtPEN(pagoExtras),
    total: fmtPEN(total),
    detalle,
    _insight,
    _chart,
  };
}
