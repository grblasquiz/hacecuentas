/** Salario por hora y jornada parcial (España) 2026.
 *  Base de cálculo: 173,33 horas/mes (jornada 40 h semanales × 52 ÷ 12).
 *  Valor hora = salario mensual / 173,33 · valor día = valor hora × 8.
 *  Fuente: Estatuto de los Trabajadores (jornada 40 h) y SMI 2026 (1.221 €/mes, 14 pagas). */

// Helper de euros inline con 2 decimales (los valores hora requieren céntimos).
const fmtEur = (n: number): string =>
  new Intl.NumberFormat('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Math.round(n * 100) / 100) + ' €';

const HORAS_MES = (40 * 52) / 12;   // 173,33 h/mes — jornada 40 h/semana (máximo legal 2026)
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
  if (sueldo <= 0) throw new Error('Ingresá el salario mensual de jornada completa');
  if (horasSemana <= 0) throw new Error('Ingresá las horas semanales');

  const valorHora = sueldo / HORAS_MES;
  const horasMes = (horasSemana / JORNADA_COMPLETA_SEMANAL) * HORAS_MES;
  const sueldoProporcional = valorHora * horasMes;
  const valorDia = valorHora * HORAS_DIA;

  const _insight = {
    title: 'Tu salario por hora',
    text: `Con un salario mensual de jornada completa de **${fmtEur(sueldo)}**, cada hora vale **${fmtEur(valorHora)}** y cada día (8 h) **${fmtEur(valorDia)}**. Trabajando **${horasSemana} h/semana** te corresponderían **${fmtEur(sueldoProporcional)}** al mes.`,
    tone: 'neutral',
    icon: '⏱️',
  };
  const _chart = {
    type: 'bar',
    segments: [
      { label: 'Valor hora', value: Math.round(valorHora * 100) / 100 },
      { label: 'Valor día (8 h)', value: Math.round(valorDia * 100) / 100 },
    ],
    ariaLabel: `Valor hora ${fmtEur(valorHora)}, valor día ${fmtEur(valorDia)}.`,
  };

  return {
    valorHora: fmtEur(valorHora),
    sueldoProporcional: fmtEur(sueldoProporcional),
    valorDia: fmtEur(valorDia),
    detalle: `Valor hora = ${fmtEur(sueldo)} ÷ 173,33 = ${fmtEur(valorHora)}. Horas/mes a ${horasSemana} h/sem = ${(Math.round(horasMes * 100) / 100).toLocaleString('es-ES')}. Proporcional = ${fmtEur(sueldoProporcional)}.`,
    _insight,
    _chart,
  };
}
