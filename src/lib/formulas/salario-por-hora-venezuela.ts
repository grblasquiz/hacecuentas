/** Salario por hora y jornada parcial (Venezuela) 2026.
 *  Base de cálculo: 173,33 horas/mes (jornada diurna 40 h × 52 ÷ 12, LOTTT).
 *  Valor hora = salario mensual / 173,33 · valor día = valor hora × 8.
 *  Salario mínimo base Bs. 130 (congelado desde mar-2022); ingreso mínimo integral
 *  US$240 vía bonos (guerra económica + cestaticket) que NO son salario. Bolívar volátil. */
import { fmtVES } from '../data/venezuela-2026.ts';

const JORNADA_COMPLETA_SEMANAL = 40;                 // jornada diurna LOTTT
const HORAS_MES = (JORNADA_COMPLETA_SEMANAL * 52) / 12;  // 173,33 h/mes
const HORAS_DIA = 8;

export interface Inputs {
  sueldoMensual: number;
  horasSemana?: number;
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

export function compute(i: Inputs): Outputs {
  const sueldo = Number(i.sueldoMensual) || 0;
  const horasSemana = Number(i.horasSemana) || JORNADA_COMPLETA_SEMANAL;
  if (sueldo <= 0) throw new Error('Ingresá el salario mensual de jornada completa');
  if (horasSemana <= 0) throw new Error('Ingresá las horas semanales');

  const valorHora = sueldo / HORAS_MES;
  const horasMes = (horasSemana / JORNADA_COMPLETA_SEMANAL) * HORAS_MES;
  const sueldoProporcional = valorHora * horasMes;
  const valorDia = valorHora * HORAS_DIA;

  const _insight = {
    title: 'Tu salario por hora',
    text: `Con un salario mensual de jornada completa de **${fmtVES(sueldo)}**, cada hora vale **${fmtVES(valorHora)}** y cada día (8 h) **${fmtVES(valorDia)}**. Trabajando **${horasSemana} h/semana** te corresponderían **${fmtVES(sueldoProporcional)}** al mes.`,
    tone: 'neutral',
    icon: '⏱️',
  };
  const _chart = {
    type: 'bar',
    segments: [
      { label: 'Valor hora', value: Math.round(valorHora * 100) / 100 },
      { label: 'Valor día (8 h)', value: Math.round(valorDia * 100) / 100 },
    ],
    ariaLabel: `Valor hora ${fmtVES(valorHora)}, valor día ${fmtVES(valorDia)}.`,
  };

  return {
    valorHora: fmtVES(valorHora),
    sueldoProporcional: fmtVES(sueldoProporcional),
    valorDia: fmtVES(valorDia),
    detalle: `Valor hora = ${fmtVES(sueldo)} ÷ 173,33 = ${fmtVES(valorHora)}. Horas/mes a ${horasSemana} h/sem = ${(Math.round(horasMes * 100) / 100).toLocaleString('es-VE')}. Proporcional = ${fmtVES(sueldoProporcional)}.`,
    _insight,
    _chart,
  };
}
