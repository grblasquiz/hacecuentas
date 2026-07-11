/** Salario por hora y jornada parcial (Colombia) 2026 — valor que percibe el trabajador.
 *  Divisor legal por fecha (Ley 2101/2021, reducción gradual de jornada; Circular 101/2025
 *  MinTrabajo): hasta el 14-jul-2026 la jornada máxima es 44 h/sem y el divisor 220 h/mes;
 *  desde el 15-jul-2026 la jornada baja a 42 h/sem y el divisor a 210 h/mes, con lo que la
 *  hora ordinaria sube ~4,76% con el mismo salario mensual.
 *  Valor hora = salario mensual / divisor vigente · valor día = valor hora × 8. */
import { COLOMBIA_2026, fmtCOP } from '../data/colombia-2026.ts';

const HORAS_DIA = 8;

/** Divisor mensual y jornada completa vigentes según la fecha (switch 15-jul-2026). */
function baseVigente(fecha: Date = new Date()) {
  const J = COLOMBIA_2026.jornada;
  const desde15Jul = fecha >= new Date('2026-07-15');
  return {
    horasMes: desde15Jul ? J.divisorMensualDesde15Jul2026 : J.divisorMensualHasta14Jul2026, // 210 | 220
    jornadaSemanal: desde15Jul ? J.horasSemanaDesde15Jul2026 : J.horasSemanaHasta14Jul2026, // 42 | 44
    desde15Jul,
  };
}

export interface Inputs {
  sueldoMensual: number;
  horasSemana?: number;
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

export function compute(i: Inputs): Outputs {
  const { horasMes: HORAS_MES, jornadaSemanal, desde15Jul } = baseVigente();
  const sueldo = Number(i.sueldoMensual) || 0;
  const horasSemana = Number(i.horasSemana) || jornadaSemanal;
  if (sueldo <= 0) throw new Error('Ingresá el salario mensual de jornada completa');
  if (horasSemana <= 0) throw new Error('Ingresá las horas semanales');

  const valorHora = sueldo / HORAS_MES;
  const horasMes = (horasSemana / jornadaSemanal) * HORAS_MES;
  const sueldoProporcional = valorHora * horasMes;
  const valorDia = valorHora * HORAS_DIA;

  const notaJornada = desde15Jul
    ? `Desde el 15-jul-2026 rige la jornada de ${jornadaSemanal} h/semana: la base legal es ${HORAS_MES} h/mes y la hora vale ~4,76% más que con el divisor 220.`
    : `Hasta el 14-jul-2026 rige la jornada de ${jornadaSemanal} h/semana (base ${HORAS_MES} h/mes); desde el 15-jul-2026 la base baja a 210 h y la misma hora pasa a valer ~4,76% más.`;

  const _insight = {
    title: 'Tu salario por hora',
    text: `Con un salario mensual de jornada completa de **${fmtCOP(sueldo)}**, cada hora vale **${fmtCOP(valorHora)}** y cada día (8 h) **${fmtCOP(valorDia)}**. Trabajando **${horasSemana} h/semana** te corresponderían **${fmtCOP(sueldoProporcional)}** al mes. ${notaJornada}`,
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
    detalle: `Valor hora = ${fmtCOP(sueldo)} ÷ ${HORAS_MES} = ${fmtCOP(valorHora)}. Horas/mes a ${horasSemana} h/sem = ${horasMes.toLocaleString('es-CO')}. Proporcional = ${fmtCOP(sueldoProporcional)}. ${notaJornada}`,
    _insight,
    _chart,
  };
}
