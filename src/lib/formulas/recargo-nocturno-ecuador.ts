/**
 * Recargo por trabajo nocturno Ecuador 2026.
 * Recargo del 25% sobre el valor de la hora ordinaria por cada hora trabajada
 * entre las 19:00 y las 06:00 del día siguiente (jornada nocturna).
 * Base legal: Código del Trabajo, art. 49 ("la jornada nocturna... tendrá la misma
 * duración y dará derecho a igual remuneración que la diurna, aumentada en un 25%").
 * Valor hora = sueldo mensual ÷ 240 (método del Ministerio del Trabajo, MDT).
 */
import { fmtUSDec } from '../data/ecuador-2026.ts';

const RECARGO_NOCTURNO = 0.25;   // +25% sobre el valor hora (Código del Trabajo, art. 49)
const HORAS_MES = 240;           // 240 h/mes — base del MDT (40 h/sem proyectadas al mes)
const SBU_2026 = 482;            // Salario Básico Unificado 2026 (Ministerio del Trabajo)

export interface Inputs {
  sueldoMensual: number | string;
  horasNocturnas: number | string;   // horas trabajadas entre 19:00 y 06:00 al mes
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

/** ''/null/undefined → default; nunca pisa un 0 válido. */
const num = (v: unknown, def = 0): number => {
  if (v === '' || v === null || v === undefined) return def;
  const n = Number(v);
  return Number.isFinite(n) ? n : def;
};

export function compute(i: Inputs): Outputs {
  const sueldo = num(i.sueldoMensual);
  if (sueldo <= 0) throw new Error('Ingresá tu sueldo mensual');

  const horas = Math.max(0, num(i.horasNocturnas, 0));
  if (horas <= 0) throw new Error('Ingresá cuántas horas nocturnas trabajás al mes');

  const valorHora = sueldo / HORAS_MES;
  const recargoPorHora = valorHora * RECARGO_NOCTURNO;
  const valorHoraNocturna = valorHora * (1 + RECARGO_NOCTURNO);

  const recargo = horas * recargoPorHora;
  const pagoBase = horas * valorHora;
  const totalConRecargo = horas * valorHoraNocturna;

  const pct = (RECARGO_NOCTURNO * 100).toLocaleString('es-EC', { maximumFractionDigits: 0 });

  const _insight = {
    title: 'Tu recargo nocturno del mes',
    text: `Tu hora ordinaria vale **${fmtUSDec(valorHora)}** (sueldo ÷ ${HORAS_MES}) y cada hora entre las 19:00 y las 06:00 suma un recargo del **${pct}%**: **${fmtUSDec(recargoPorHora)}** extra por hora. Por tus **${horas} horas nocturnas** te corresponde un recargo de **${fmtUSDec(recargo)}** este mes, y la hora nocturna completa queda en **${fmtUSDec(valorHoraNocturna)}**. Con el SBU ($${SBU_2026}) cada hora nocturna suma unos $0,50 extra.`,
    tone: 'good' as const,
    icon: '🌙',
  };

  const _chart = {
    type: 'doughnut',
    slices: [
      { label: `Valor base de las ${horas} h`, value: Math.round(pagoBase * 100) / 100 },
      { label: `Recargo nocturno ${pct}%`, value: Math.round(recargo * 100) / 100 },
    ],
    prefix: '$',
    centerValue: fmtUSDec(recargo),
    centerLabel: 'recargo del mes',
    ariaLabel: `Recargo nocturno mensual de ${fmtUSDec(recargo)} sobre un pago base de ${fmtUSDec(pagoBase)} por ${horas} horas nocturnas.`,
  };

  return {
    recargo: fmtUSDec(recargo),
    valorHoraNocturna: `${fmtUSDec(valorHoraNocturna)} (hora ordinaria ${fmtUSDec(valorHora)} + 25%)`,
    totalConRecargo: `${fmtUSDec(totalConRecargo)} (las ${horas} h nocturnas con recargo incluido)`,
    detalle: `${horas} h nocturnas × ${fmtUSDec(recargoPorHora)} de recargo (25% de ${fmtUSDec(valorHora)}) = ${fmtUSDec(recargo)} al mes. Base 240 h/mes (método MDT).`,
    _insight,
    _chart,
  };
}
