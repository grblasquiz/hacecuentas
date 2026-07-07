/** Salario por hora y jornada parcial (Uruguay) 2026.
 *  Base de cálculo: 190,67 horas/mes (comercio, jornada 44 h × 52 ÷ 12).
 *  Industria (48 h): base ~208 h/mes. Método por jornal: SMN ÷ 200.
 *  Valor hora = sueldo mensual / base · valor día = valor hora × 8.
 *  Fuente: MTSS (SMN 2026 $25.383) y Decreto-Ley 14.320 (jornada comercio). */
import { fmtUYU } from '../data/uruguay-2026.ts';

const JORNADA_COMPLETA_SEMANAL = 44;                 // comercio (industria: 48 h)
const HORAS_MES = (JORNADA_COMPLETA_SEMANAL * 52) / 12;  // 190,67 h/mes (comercio 44 h)
const HORAS_DIA = 8;

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
    text: `Con un sueldo mensual de jornada completa de **${fmtUYU(sueldo)}**, cada hora vale **${fmtUYU(valorHora)}** y cada día (8 h) **${fmtUYU(valorDia)}**. Trabajando **${horasSemana} h/semana** te corresponderían **${fmtUYU(sueldoProporcional)}** al mes.`,
    tone: 'neutral',
    icon: '⏱️',
  };
  const _chart = {
    type: 'bar',
    segments: [
      { label: 'Valor hora', value: Math.round(valorHora) },
      { label: 'Valor día (8 h)', value: Math.round(valorDia) },
    ],
    ariaLabel: `Valor hora ${fmtUYU(valorHora)}, valor día ${fmtUYU(valorDia)}.`,
  };

  return {
    valorHora: fmtUYU(valorHora),
    sueldoProporcional: fmtUYU(sueldoProporcional),
    valorDia: fmtUYU(valorDia),
    detalle: `Valor hora = ${fmtUYU(sueldo)} ÷ 190,67 = ${fmtUYU(valorHora)}. Horas/mes a ${horasSemana} h/sem = ${(Math.round(horasMes * 100) / 100).toLocaleString('es-UY')}. Proporcional = ${fmtUYU(sueldoProporcional)}.`,
    _insight,
    _chart,
  };
}
