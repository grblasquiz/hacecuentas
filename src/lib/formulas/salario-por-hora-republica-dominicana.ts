/** Salario por hora y jornada parcial (República Dominicana) 2026.
 *  Base de cálculo: 190,67 horas/mes (jornada 44 h × 52 ÷ 12 = 23,83 días × 8 h).
 *  Valor hora = salario mensual / 190,67 · valor día = valor hora × 8.
 *  Fuente: Código de Trabajo (jornada 44 h) y mínimo no sectorizado 2026 (RD$21.000). */
import { fmtDOP } from '../data/republica-dominicana-2026.ts';

const JORNADA_COMPLETA_SEMANAL = 44;                 // Código de Trabajo, máximo 8 h/día
const HORAS_MES = (JORNADA_COMPLETA_SEMANAL * 52) / 12;  // 190,67 h/mes (23,83 días × 8 h)
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
    text: `Con un salario mensual de jornada completa de **${fmtDOP(sueldo)}**, cada hora vale **${fmtDOP(valorHora)}** y cada día (8 h) **${fmtDOP(valorDia)}**. Trabajando **${horasSemana} h/semana** te corresponderían **${fmtDOP(sueldoProporcional)}** al mes.`,
    tone: 'neutral',
    icon: '⏱️',
  };
  const _chart = {
    type: 'bar',
    segments: [
      { label: 'Valor hora', value: Math.round(valorHora * 100) / 100 },
      { label: 'Valor día (8 h)', value: Math.round(valorDia * 100) / 100 },
    ],
    ariaLabel: `Valor hora ${fmtDOP(valorHora)}, valor día ${fmtDOP(valorDia)}.`,
  };

  return {
    valorHora: fmtDOP(valorHora),
    sueldoProporcional: fmtDOP(sueldoProporcional),
    valorDia: fmtDOP(valorDia),
    detalle: `Valor hora = ${fmtDOP(sueldo)} ÷ 190,67 = ${fmtDOP(valorHora)}. Horas/mes a ${horasSemana} h/sem = ${(Math.round(horasMes * 100) / 100).toLocaleString('es-DO')}. Proporcional = ${fmtDOP(sueldoProporcional)}.`,
    _insight,
    _chart,
  };
}
