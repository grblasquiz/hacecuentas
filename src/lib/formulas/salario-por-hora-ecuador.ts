/** Salario por hora y jornada parcial (Ecuador) 2026.
 *  Base de cálculo: 240 horas/mes (método del Ministerio del Trabajo, MDT).
 *  Valor hora = sueldo mensual / 240 · valor día = valor hora × 8. */
import { fmtUSDec } from '../data/ecuador-2026.ts';

const HORAS_MES = 240;          // 240 h/mes — base del MDT (40 h/semana × 30 días / 5)
const HORAS_DIA = 8;
const JORNADA_COMPLETA_SEMANAL = 40;

export interface Inputs {
  sueldoMensual: number;
  horasSemana?: number;
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

export function compute(i: Inputs): Outputs {
  const sueldo = Number(i.sueldoMensual) || 0;
  const horasSemana = Number(i.horasSemana) || JORNADA_COMPLETA_SEMANAL;
  if (sueldo <= 0) throw new Error('Ingresá el sueldo mensual de jornada completa');
  if (horasSemana <= 0) throw new Error('Ingresá las horas semanales');

  const valorHora = sueldo / HORAS_MES;
  const horasMes = (horasSemana / JORNADA_COMPLETA_SEMANAL) * HORAS_MES;
  const sueldoProporcional = valorHora * horasMes;
  const valorDia = valorHora * HORAS_DIA;

  const _insight = {
    title: 'Tu salario por hora',
    text: `Con un sueldo mensual de jornada completa de **${fmtUSDec(sueldo)}**, cada hora vale **${fmtUSDec(valorHora)}** y cada día (8 h) **${fmtUSDec(valorDia)}**. Trabajando **${horasSemana} h/semana** te corresponderían **${fmtUSDec(sueldoProporcional)}** al mes.`,
    tone: 'neutral',
    icon: '⏱️',
  };
  const _chart = {
    type: 'bar',
    segments: [
      { label: 'Valor hora', value: Math.round(valorHora * 100) / 100 },
      { label: 'Valor día (8 h)', value: Math.round(valorDia * 100) / 100 },
    ],
    ariaLabel: `Valor hora ${fmtUSDec(valorHora)}, valor día ${fmtUSDec(valorDia)}.`,
  };

  return {
    valorHora: fmtUSDec(valorHora),
    sueldoProporcional: fmtUSDec(sueldoProporcional),
    valorDia: fmtUSDec(valorDia),
    detalle: `Valor hora = ${fmtUSDec(sueldo)} ÷ 240 = ${fmtUSDec(valorHora)}. Horas/mes a ${horasSemana} h/sem = ${horasMes.toLocaleString('es-EC')}. Proporcional = ${fmtUSDec(sueldoProporcional)}.`,
    _insight,
    _chart,
  };
}
