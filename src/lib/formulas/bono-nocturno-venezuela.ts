/**
 * Calculadora de bono nocturno en Venezuela (LOTTT art. 117, 2026).
 *
 * La jornada nocturna (entre las 7:00 pm y las 5:00 am) genera un recargo del 30%
 * sobre el valor de la hora normal. Este cálculo devuelve solo el RECARGO (el plus
 * adicional), no la hora nocturna completa.
 *
 * Valor hora normal = (salario mensual / 30) / horas de la jornada diaria.
 *
 * Datos: salario y jornada son inputs; el porcentaje (30%) está fijado por la LOTTT.
 * Moneda: bolívar (VES). Fuente: LOTTT art. 117, MinTrabajo.
 */
import { fmtVES } from '../data/venezuela-2026';

export interface Inputs {
  salarioMensual?: number;
  horasNocturnas?: number;
  horasJornada?: number;
}

export interface Outputs {
  [k: string]: any;
  _insight?: any;
  _table?: any;
}

const RECARGO_NOCT = 0.3; // 30% bono nocturno (LOTTT art. 117)

export function bonoNocturnoVenezuela(i: Inputs): Outputs {
  const salarioMensual = Math.max(0, Number(i.salarioMensual) || 0);
  if (salarioMensual <= 0) throw new Error('Ingresá tu salario mensual en bolívares.');
  const horasNocturnas = Math.max(0, Number(i.horasNocturnas) || 0);
  const horasJornada = Math.max(1, Number(i.horasJornada) || 8);

  const valorHora = (salarioMensual / 30) / horasJornada;
  const recargoHora = valorHora * RECARGO_NOCT;
  const totalBono = horasNocturnas * recargoHora;

  const narrativa =
    `Tu hora normal vale ${fmtVES(valorHora)}. El bono nocturno (30%, LOTTT art. 117) suma ${fmtVES(recargoHora)} por cada hora trabajada de noche. ` +
    `Por ${horasNocturnas} horas nocturnas te corresponden ${fmtVES(totalBono)} de recargo adicional.`;

  return {
    valorHora,
    recargoHora,
    totalBono,
    _insight: {
      type: 'highlight',
      icon: '🌙',
      text: narrativa,
    },
    _table: {
      title: 'Desglose del bono nocturno (LOTTT art. 117)',
      headers: ['Concepto', 'Valor'],
      rows: [
        ['Valor hora normal', fmtVES(valorHora)],
        ['Recargo nocturno por hora (30%)', fmtVES(recargoHora)],
        [`Horas nocturnas trabajadas`, String(horasNocturnas)],
        ['Total bono nocturno', fmtVES(totalBono)],
      ],
      note: 'El bono nocturno es un recargo del 30% sobre la hora normal por trabajo entre las 7:00 pm y las 5:00 am (LOTTT art. 117). Base = (salario mensual ÷ 30) ÷ horas de jornada.',
    },
  };
}
