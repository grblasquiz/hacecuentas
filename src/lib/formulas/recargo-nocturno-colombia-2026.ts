/**
 * Recargo nocturno Colombia 2026 — 35% sobre la hora ordinaria entre las 19:00 y las 06:00
 * (Ley 2466/2025, vigente desde el 25-dic-2025; antes la noche laboral empezaba a las 21:00).
 * Valor hora = salario ÷ 220 hasta el 14-jul-2026 y ÷ 210 desde el 15-jul-2026 (Ley 2101/2021).
 * Constantes de src/lib/data/colombia-2026.ts.
 */
import { COLOMBIA_2026, fmtCOP } from '../data/colombia-2026.ts';

export interface Inputs {
  salarioMensual: number | string;
  horasNocturnas: number | string;       // horas trabajadas entre 19:00 y 06:00 al mes (jornada ordinaria)
  horasNuevas19a21?: number | string;    // de esas, cuántas caen entre 19:00 y 21:00 (las "nuevas" de la Ley 2466)
  periodo?: string;                      // 'hasta-14-jul' | 'desde-15-jul'
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

/** ''/null/undefined → default; nunca pisa un 0 válido. */
const num = (v: unknown, def = 0): number => {
  if (v === '' || v === null || v === undefined) return def;
  const n = Number(v);
  return Number.isFinite(n) ? n : def;
};

export function compute(i: Inputs): Outputs {
  const C = COLOMBIA_2026;
  const salario = num(i.salarioMensual);
  if (salario <= 0) throw new Error('Ingresá tu salario mensual');

  const horas = Math.max(0, num(i.horasNocturnas, 0));
  if (horas <= 0) throw new Error('Ingresá cuántas horas nocturnas trabajás al mes');
  const horasNuevas = Math.min(horas, Math.max(0, num(i.horasNuevas19a21, 0)));
  const desde15Jul = String(i.periodo ?? 'hasta-14-jul') === 'desde-15-jul';

  const divisor = desde15Jul
    ? C.jornada.divisorMensualDesde15Jul2026
    : C.jornada.divisorMensualHasta14Jul2026;
  const valorHora = salario / divisor;
  const recargoPorHora = valorHora * C.recargos.nocturno;
  const valorHoraNocturna = valorHora * (1 + C.recargos.nocturno);

  const plusMensual = horas * recargoPorHora;
  const pagoBase = horas * valorHora;
  const pagoTotalNocturno = horas * valorHoraNocturna;

  // Comparación contra el régimen viejo (noche desde las 21:00): las horas 19:00–21:00
  // antes NO tenían recargo. Eso es plata nueva de la Ley 2466/2025.
  const plusNuevoLey2466 = horasNuevas * recargoPorHora;

  const pctNocturno = (C.recargos.nocturno * 100).toLocaleString('es-CO', { maximumFractionDigits: 0 });

  const _insight = {
    title: 'Tu plus nocturno del mes',
    text: `Tu hora ordinaria vale **${fmtCOP(valorHora)}** (salario ÷ ${divisor}) y cada hora entre las 19:00 y las 06:00 suma un recargo del **${pctNocturno}%**: **${fmtCOP(recargoPorHora)}** extra por hora. Por tus **${horas} horas nocturnas** te deben pagar **${fmtCOP(plusMensual)}** de recargo este mes (la hora nocturna completa queda en ${fmtCOP(valorHoraNocturna)}).${horasNuevas > 0 ? ` De ese plus, **${fmtCOP(plusNuevoLey2466)}** corresponde a las ${horasNuevas} horas entre las 7 p.m. y las 9 p.m. que antes de la Ley 2466 de 2025 no tenían recargo: plata nueva en tu bolsillo.` : ''}`,
    tone: 'good' as const,
    icon: '🌙',
  };

  const _chart = {
    type: 'doughnut',
    slices: [
      { label: `Valor base de las ${horas} h`, value: Math.round(pagoBase) },
      { label: `Recargo nocturno ${pctNocturno}%`, value: Math.round(plusMensual) },
    ],
    prefix: '$',
    centerValue: fmtCOP(plusMensual),
    centerLabel: 'recargo del mes',
    ariaLabel: `Recargo nocturno mensual de ${fmtCOP(plusMensual)} sobre un pago base de ${fmtCOP(pagoBase)} por ${horas} horas nocturnas.`,
  };

  return {
    plusMensual: fmtCOP(plusMensual),
    recargoPorHora: `${fmtCOP(recargoPorHora)} por hora (+${pctNocturno}%)`,
    valorHoraNocturna: `${fmtCOP(valorHoraNocturna)} (hora ordinaria ${fmtCOP(valorHora)} + recargo)`,
    pagoTotalNocturno: `${fmtCOP(pagoTotalNocturno)} (las ${horas} h nocturnas con recargo incluido)`,
    plusNuevoLey2466: horasNuevas > 0
      ? `${fmtCOP(plusNuevoLey2466)} (${horasNuevas} h entre 7 y 9 p.m. que antes no tenían recargo)`
      : 'No indicaste horas entre las 7 y las 9 p.m.',
    detalle: `${horas} h nocturnas × ${fmtCOP(recargoPorHora)} de recargo (35% de ${fmtCOP(valorHora)}) = ${fmtCOP(plusMensual)} de plus al mes.`,
    _insight,
    _chart,
  };
}
