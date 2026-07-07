/**
 * Recargo por trabajo nocturno República Dominicana 2026.
 * Aumento MÍNIMO del 15% sobre el valor de la hora normal por cada hora trabajada
 * entre las 21:00 (9 p.m.) y las 07:00 (7 a.m.). Base legal: Código de Trabajo, art. 204
 * ("las horas de la jornada nocturna serán pagadas... con un aumento no menor del 15%").
 * Regla del art. 149/163: si una jornada mixta incluye MÁS de 3 horas nocturnas, toda la
 * jornada se computa como nocturna.
 * Valor hora = salario mensual ÷ 191 (divisor universal de nómina, Reglamento 258-93).
 */
import { REPUBLICA_DOMINICANA_2026, fmtDOP, valorHora as valorHoraRD } from '../data/republica-dominicana-2026.ts';

export interface Inputs {
  sueldoMensual: number | string;
  horasNocturnas: number | string;   // horas trabajadas entre 21:00 y 07:00 al mes
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

/** ''/null/undefined → default; nunca pisa un 0 válido. */
const num = (v: unknown, def = 0): number => {
  if (v === '' || v === null || v === undefined) return def;
  const n = Number(v);
  return Number.isFinite(n) ? n : def;
};

export function compute(i: Inputs): Outputs {
  const RD = REPUBLICA_DOMINICANA_2026;
  const recargoPct = RD.laboral?.recargos?.nocturno ?? 0.15;   // +15% mínimo (art. 204 CT)

  const sueldo = num(i.sueldoMensual);
  if (sueldo <= 0) throw new Error('Ingresá tu salario mensual');

  const horas = Math.max(0, num(i.horasNocturnas, 0));
  if (horas <= 0) throw new Error('Ingresá cuántas horas nocturnas trabajás al mes');

  const valorHora = valorHoraRD(sueldo);   // salario ÷ 191
  const recargoPorHora = valorHora * recargoPct;
  const valorHoraNocturna = valorHora * (1 + recargoPct);

  const recargo = horas * recargoPorHora;
  const pagoBase = horas * valorHora;
  const totalConRecargo = horas * valorHoraNocturna;

  const pct = (recargoPct * 100).toLocaleString('es-DO', { maximumFractionDigits: 0 });

  const _insight = {
    title: 'Tu recargo nocturno del mes',
    text: `Tu hora normal vale **${fmtDOP(valorHora)}** (salario ÷ 191) y cada hora entre las 9 p.m. y las 7 a.m. suma un recargo mínimo del **${pct}%**: **${fmtDOP(recargoPorHora)}** extra por hora. Por tus **${horas} horas nocturnas** te corresponde un recargo de **${fmtDOP(recargo)}** este mes, y la hora nocturna completa queda en **${fmtDOP(valorHoraNocturna)}**. Si tu turno mixto tiene más de 3 horas de noche, toda la jornada se paga como nocturna.`,
    tone: 'good' as const,
    icon: '🌙',
  };

  const _chart = {
    type: 'doughnut',
    slices: [
      { label: `Valor base de las ${horas} h`, value: Math.round(pagoBase) },
      { label: `Recargo nocturno ${pct}%`, value: Math.round(recargo) },
    ],
    prefix: 'RD$ ',
    centerValue: fmtDOP(recargo),
    centerLabel: 'recargo del mes',
    ariaLabel: `Recargo nocturno mensual de ${fmtDOP(recargo)} sobre un pago base de ${fmtDOP(pagoBase)} por ${horas} horas nocturnas.`,
  };

  return {
    recargo: fmtDOP(recargo),
    valorHoraNocturna: `${fmtDOP(valorHoraNocturna)} (hora normal ${fmtDOP(valorHora)} + 15%)`,
    totalConRecargo: `${fmtDOP(totalConRecargo)} (las ${horas} h nocturnas con recargo incluido)`,
    detalle: `${horas} h nocturnas × ${fmtDOP(recargoPorHora)} de recargo (15% de ${fmtDOP(valorHora)}) = ${fmtDOP(recargo)} al mes. Divisor 191 h/mes (Reglamento 258-93).`,
    _insight,
    _chart,
  };
}
