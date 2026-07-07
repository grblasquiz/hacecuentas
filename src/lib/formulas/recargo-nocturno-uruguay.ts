/**
 * Prima por nocturnidad (recargo por trabajo nocturno) Uruguay 2026.
 * Sobretasa MÍNIMA del 20% sobre el salario básico por cada hora trabajada entre las
 * 22:00 y las 06:00, siempre que se trabajen MÁS DE 5 horas consecutivas en esa franja.
 * Base legal: Ley N° 19.313 (trabajo nocturno). Los Consejos de Salarios / laudos por
 * rama pueden fijar un porcentaje superior o compensarlo con reducción horaria; acá se
 * usa el mínimo legal del 20% (el más común como piso). El empleador puede optar por dar
 * reducción horaria equivalente en vez del pago.
 * Valor hora = salario mensual ÷ 200 (divisor legal de hora, Decreto N° 319/025: hora = SMN/200).
 */
import { fmtUYU } from '../data/uruguay-2026.ts';

const RECARGO_NOCTURNO_MIN = 0.20;   // +20% mínimo legal (Ley 19.313); laudos pueden fijar más
const DIVISOR_HORA = 200;            // salario mensual ÷ 200 = valor hora (Decreto 319/025)
const MIN_HORAS_CONSECUTIVAS = 5;    // se requiere trabajar >5 h consecutivas en 22:00–06:00

export interface Inputs {
  sueldoMensual: number | string;
  horasNocturnas: number | string;   // horas trabajadas entre 22:00 y 06:00 al mes
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
  if (sueldo <= 0) throw new Error('Ingresá tu salario mensual básico');

  const horas = Math.max(0, num(i.horasNocturnas, 0));
  if (horas <= 0) throw new Error('Ingresá cuántas horas nocturnas trabajás al mes');

  const valorHora = sueldo / DIVISOR_HORA;
  const recargoPorHora = valorHora * RECARGO_NOCTURNO_MIN;
  const valorHoraNocturna = valorHora * (1 + RECARGO_NOCTURNO_MIN);

  const recargo = horas * recargoPorHora;
  const pagoBase = horas * valorHora;
  const totalConRecargo = horas * valorHoraNocturna;

  const pct = (RECARGO_NOCTURNO_MIN * 100).toLocaleString('es-UY', { maximumFractionDigits: 0 });

  const _insight = {
    title: 'Tu prima por nocturnidad del mes',
    text: `Tu hora vale **${fmtUYU(valorHora)}** (salario ÷ ${DIVISOR_HORA}) y cada hora entre las 22:00 y las 06:00 suma una sobretasa mínima del **${pct}%**: **${fmtUYU(recargoPorHora)}** extra por hora. Por tus **${horas} horas nocturnas** te corresponde una prima de **${fmtUYU(recargo)}** este mes, y la hora nocturna completa queda en **${fmtUYU(valorHoraNocturna)}**. Ojo: la prima solo se genera si trabajás **más de ${MIN_HORAS_CONSECUTIVAS} horas consecutivas** en esa franja, y tu convenio de rama puede fijar un porcentaje mayor.`,
    tone: 'good' as const,
    icon: '🌙',
  };

  const _chart = {
    type: 'doughnut',
    slices: [
      { label: `Valor base de las ${horas} h`, value: Math.round(pagoBase) },
      { label: `Prima nocturna ${pct}%`, value: Math.round(recargo) },
    ],
    prefix: '$U ',
    centerValue: fmtUYU(recargo),
    centerLabel: 'prima del mes',
    ariaLabel: `Prima por nocturnidad mensual de ${fmtUYU(recargo)} sobre un pago base de ${fmtUYU(pagoBase)} por ${horas} horas nocturnas.`,
  };

  return {
    recargo: fmtUYU(recargo),
    valorHoraNocturna: `${fmtUYU(valorHoraNocturna)} (hora ${fmtUYU(valorHora)} + 20% mínimo)`,
    totalConRecargo: `${fmtUYU(totalConRecargo)} (las ${horas} h nocturnas con prima incluida)`,
    detalle: `${horas} h nocturnas × ${fmtUYU(recargoPorHora)} de prima (20% de ${fmtUYU(valorHora)}) = ${fmtUYU(recargo)} al mes. Aplica si trabajás +${MIN_HORAS_CONSECUTIVAS} h consecutivas de noche; el laudo de tu rama puede fijar más.`,
    _insight,
    _chart,
  };
}
