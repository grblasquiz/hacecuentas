/**
 * Recargo por trabajo nocturno Paraguay 2026.
 * Recargo del 30% sobre el salario ordinario por cada hora trabajada entre las 20:00
 * y las 06:00 (jornada nocturna). Base legal: Código del Trabajo (Ley N° 213/93), art. 234
 * ("el trabajo nocturno será pagado con 30% sobre el salario ordinario fijado para el
 * trabajo diurno"). La jornada nocturna máxima es de 7 h diarias o 42 h semanales.
 * Valor hora = salario mensual ÷ 240 (30 días × 8 h, divisor estándar de mensualizados).
 */
import { PARAGUAY_2026, fmtPYG } from '../data/paraguay-2026.ts';

export interface Inputs {
  sueldoMensual: number | string;
  horasNocturnas: number | string;   // horas trabajadas entre 20:00 y 06:00 al mes
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

/** ''/null/undefined → default; nunca pisa un 0 válido. */
const num = (v: unknown, def = 0): number => {
  if (v === '' || v === null || v === undefined) return def;
  const n = Number(v);
  return Number.isFinite(n) ? n : def;
};

export function compute(i: Inputs): Outputs {
  const P = PARAGUAY_2026;
  const recargoPct = P.laboral?.recargoNocturno ?? 0.30;   // +30% (art. 234, Ley 213/93)
  const horasMes = P.horasMesEstandar ?? 240;              // 30 días × 8 h

  const sueldo = num(i.sueldoMensual);
  if (sueldo <= 0) throw new Error('Ingresá tu salario mensual');

  const horas = Math.max(0, num(i.horasNocturnas, 0));
  if (horas <= 0) throw new Error('Ingresá cuántas horas nocturnas trabajás al mes');

  const valorHora = sueldo / horasMes;
  const recargoPorHora = valorHora * recargoPct;
  const valorHoraNocturna = valorHora * (1 + recargoPct);

  const recargo = horas * recargoPorHora;
  const pagoBase = horas * valorHora;
  const totalConRecargo = horas * valorHoraNocturna;

  const pct = (recargoPct * 100).toLocaleString('es-PY', { maximumFractionDigits: 0 });

  const _insight = {
    title: 'Tu recargo nocturno del mes',
    text: `Tu hora ordinaria vale **${fmtPYG(valorHora)}** (salario ÷ ${horasMes}) y cada hora entre las 20:00 y las 06:00 suma un recargo del **${pct}%**: **${fmtPYG(recargoPorHora)}** extra por hora. Por tus **${horas} horas nocturnas** te corresponde un recargo de **${fmtPYG(recargo)}** este mes, y la hora nocturna completa queda en **${fmtPYG(valorHoraNocturna)}**. Recordá que la jornada nocturna máxima es de 7 horas diarias.`,
    tone: 'good' as const,
    icon: '🌙',
  };

  const _chart = {
    type: 'doughnut',
    slices: [
      { label: `Valor base de las ${horas} h`, value: Math.round(pagoBase) },
      { label: `Recargo nocturno ${pct}%`, value: Math.round(recargo) },
    ],
    prefix: 'Gs. ',
    centerValue: fmtPYG(recargo),
    centerLabel: 'recargo del mes',
    ariaLabel: `Recargo nocturno mensual de ${fmtPYG(recargo)} sobre un pago base de ${fmtPYG(pagoBase)} por ${horas} horas nocturnas.`,
  };

  return {
    recargo: fmtPYG(recargo),
    valorHoraNocturna: `${fmtPYG(valorHoraNocturna)} (hora ordinaria ${fmtPYG(valorHora)} + 30%)`,
    totalConRecargo: `${fmtPYG(totalConRecargo)} (las ${horas} h nocturnas con recargo incluido)`,
    detalle: `${horas} h nocturnas × ${fmtPYG(recargoPorHora)} de recargo (30% de ${fmtPYG(valorHora)}) = ${fmtPYG(recargo)} al mes. Salario mínimo de referencia: ${fmtPYG(P.salarioMinimo)}.`,
    _insight,
    _chart,
  };
}
