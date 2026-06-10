/**
 * Horas extras Colombia 2026 — diurnas (+25%) y nocturnas (+75%).
 * Valor hora ordinaria = salario mensual ÷ 220 hasta el 14-jul-2026 (jornada 44 h/sem)
 * y ÷ 210 desde el 15-jul-2026 (jornada 42 h/sem, Ley 2101/2021): la hora "sube" ~4,76%.
 * Extra nocturna desde las 19:00 (Ley 2466/2025). Constantes de src/lib/data/colombia-2026.ts.
 */
import { COLOMBIA_2026, fmtCOP } from '../data/colombia-2026.ts';

export interface Inputs {
  salarioMensual: number | string;
  horasExtraDiurnas?: number | string;
  horasExtraNocturnas?: number | string;
  periodo?: string; // 'hasta-14-jul' | 'desde-15-jul'
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

  const hd = Math.max(0, num(i.horasExtraDiurnas, 0));
  const hn = Math.max(0, num(i.horasExtraNocturnas, 0));
  const desde15Jul = String(i.periodo ?? 'hasta-14-jul') === 'desde-15-jul';

  const divisor = desde15Jul
    ? C.jornada.divisorMensualDesde15Jul2026
    : C.jornada.divisorMensualHasta14Jul2026;
  const valorHora = salario / divisor;
  const valorExtraDiurna = valorHora * (1 + C.recargos.extraDiurna);
  const valorExtraNocturna = valorHora * (1 + C.recargos.extraNocturna);

  const totalDiurnas = hd * valorExtraDiurna;
  const totalNocturnas = hn * valorExtraNocturna;
  const total = totalDiurnas + totalNocturnas;

  // Cuánto encarece el cambio de divisor 220 → 210 (~+4,76%)
  const saltoHora = C.jornada.divisorMensualHasta14Jul2026 / C.jornada.divisorMensualDesde15Jul2026 - 1;
  const pctSalto = (saltoHora * 100).toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  // Tope legal: 2 horas extras/día y 12/semana (≈52/mes)
  const topeMensualAprox = 52;
  const excedeTope = hd + hn > topeMensualAprox;

  const _insight = {
    title: 'Tus horas extras del mes',
    text: `Con un salario de **${fmtCOP(salario)}**, tu hora ordinaria vale **${fmtCOP(valorHora)}** (÷${divisor}). ${hd + hn > 0 ? `Por **${hd + hn} horas extras** (${hd} diurnas a ${fmtCOP(valorExtraDiurna)} y ${hn} nocturnas a ${fmtCOP(valorExtraNocturna)}) te deben pagar **${fmtCOP(total)}** este mes.` : `La hora extra diurna te la deben pagar a ${fmtCOP(valorExtraDiurna)} (+25%) y la nocturna a ${fmtCOP(valorExtraNocturna)} (+75%).`} ${desde15Jul ? `Ya estás en jornada de 42 h: la hora vale ${pctSalto}% más que con el divisor 220.` : `Desde el 15-jul-2026 la jornada baja a 42 h y la misma hora extra pasará a valer ${pctSalto}% más.`}${excedeTope ? ` ⚠️ Ojo: superás el tope legal de 2 horas extras diarias y 12 semanales (≈52 al mes).` : ''}`,
    tone: excedeTope ? ('warn' as const) : ('good' as const),
    icon: '⏰',
  };

  const _chart = total > 0
    ? {
        type: 'doughnut',
        slices: [
          ...(totalDiurnas > 0 ? [{ label: `Extras diurnas (${hd} h, +25%)`, value: Math.round(totalDiurnas) }] : []),
          ...(totalNocturnas > 0 ? [{ label: `Extras nocturnas (${hn} h, +75%)`, value: Math.round(totalNocturnas) }] : []),
        ],
        prefix: '$',
        centerValue: fmtCOP(total),
        centerLabel: 'extras del mes',
        ariaLabel: `Total de horas extras del mes: ${fmtCOP(total)} (${fmtCOP(totalDiurnas)} diurnas y ${fmtCOP(totalNocturnas)} nocturnas).`,
      }
    : undefined;

  return {
    totalMes: fmtCOP(total),
    valorHoraOrdinaria: `${fmtCOP(valorHora)} (salario ÷ ${divisor})`,
    valorExtraDiurna: `${fmtCOP(valorExtraDiurna)} por hora (+25%)`,
    valorExtraNocturna: `${fmtCOP(valorExtraNocturna)} por hora (+75%)`,
    pagoDiurnas: hd > 0 ? `${fmtCOP(totalDiurnas)} (${hd} h)` : 'Sin horas extra diurnas',
    pagoNocturnas: hn > 0 ? `${fmtCOP(totalNocturnas)} (${hn} h)` : 'Sin horas extra nocturnas',
    detalle: `Hora ordinaria ${fmtCOP(valorHora)} → ${hd} extras diurnas × ${fmtCOP(valorExtraDiurna)} + ${hn} extras nocturnas × ${fmtCOP(valorExtraNocturna)} = ${fmtCOP(total)}.`,
    _insight,
    ...(_chart ? { _chart } : {}),
  };
}
