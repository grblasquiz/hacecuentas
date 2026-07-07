/** Salario por hora y jornada parcial (Chile) 2026.
 *  Base de cálculo: 180 horas/mes (jornada 42 h semanales desde 26-abr-2026, Ley 21.561).
 *  Método Dirección del Trabajo: (sueldo/30)×28÷(42×4) = sueldo/180.
 *  Valor hora = sueldo mensual / 180 · valor día = valor hora × 8. */
import { fmtCLP } from '../data/chile-2026.ts';

const HORAS_MES = 180;          // 180 h/mes — jornada 42 h/semana × 30/7 (base DT 2026)
const HORAS_DIA = 8;
const JORNADA_COMPLETA_SEMANAL = 42;   // Ley 21.561, vigente desde 26-abr-2026

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
    text: `Con un sueldo mensual de jornada completa de **${fmtCLP(sueldo)}**, cada hora vale **${fmtCLP(valorHora)}** y cada día (8 h) **${fmtCLP(valorDia)}**. Trabajando **${horasSemana} h/semana** te corresponderían **${fmtCLP(sueldoProporcional)}** al mes.`,
    tone: 'neutral',
    icon: '⏱️',
  };
  const _chart = {
    type: 'bar',
    segments: [
      { label: 'Valor hora', value: Math.round(valorHora) },
      { label: 'Valor día (8 h)', value: Math.round(valorDia) },
    ],
    ariaLabel: `Valor hora ${fmtCLP(valorHora)}, valor día ${fmtCLP(valorDia)}.`,
  };

  return {
    valorHora: fmtCLP(valorHora),
    sueldoProporcional: fmtCLP(sueldoProporcional),
    valorDia: fmtCLP(valorDia),
    detalle: `Valor hora = ${fmtCLP(sueldo)} ÷ 180 = ${fmtCLP(valorHora)}. Horas/mes a ${horasSemana} h/sem = ${horasMes.toLocaleString('es-CL')}. Proporcional = ${fmtCLP(sueldoProporcional)}.`,
    _insight,
    _chart,
  };
}
