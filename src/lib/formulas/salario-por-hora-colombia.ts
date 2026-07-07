/** Salario por hora y jornada parcial (Colombia) 2026 — valor que percibe el trabajador.
 *  Base de cálculo: 220 h/mes (jornada 44 h, hasta 14-jul-2026, Ley 2101/2021).
 *  Desde 15-jul-2026 la jornada baja a 42 h (base 210 h/mes) y la hora ordinaria sube.
 *  Valor hora = salario mensual / base · valor día = valor hora × 8. */
import { fmtCOP } from '../data/colombia-2026.ts';

const HORAS_MES = 220;          // 220 h/mes — jornada 44 h/semana (base hasta 14-jul-2026, Ley 2101)
const HORAS_DIA = 8;
const JORNADA_COMPLETA_SEMANAL = 44;   // 44 h vigente hasta 14-jul-2026 (luego 42 h)

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
    text: `Con un salario mensual de jornada completa de **${fmtCOP(sueldo)}**, cada hora vale **${fmtCOP(valorHora)}** y cada día (8 h) **${fmtCOP(valorDia)}**. Trabajando **${horasSemana} h/semana** te corresponderían **${fmtCOP(sueldoProporcional)}** al mes.`,
    tone: 'neutral',
    icon: '⏱️',
  };
  const _chart = {
    type: 'bar',
    segments: [
      { label: 'Valor hora', value: Math.round(valorHora) },
      { label: 'Valor día (8 h)', value: Math.round(valorDia) },
    ],
    ariaLabel: `Valor hora ${fmtCOP(valorHora)}, valor día ${fmtCOP(valorDia)}.`,
  };

  return {
    valorHora: fmtCOP(valorHora),
    sueldoProporcional: fmtCOP(sueldoProporcional),
    valorDia: fmtCOP(valorDia),
    detalle: `Valor hora = ${fmtCOP(sueldo)} ÷ 220 = ${fmtCOP(valorHora)}. Horas/mes a ${horasSemana} h/sem = ${horasMes.toLocaleString('es-CO')}. Proporcional = ${fmtCOP(sueldoProporcional)}. Desde 15-jul-2026 la base es 210 h (jornada 42 h).`,
    _insight,
    _chart,
  };
}
