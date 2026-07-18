/**
 * Subida salarial de funcionarios / empleados públicos (España) — acuerdo 2025-2028.
 * Sobre la retribución base de 2024: +2,5% en 2025 (retroactivo) y +1,5% en 2026,
 * más un posible +0,5% adicional si el IPC de 2026 ≥ 1,5% (se cobraría en el 1T-2027).
 * Datos en src/lib/data/espana-2026.ts. Euros (es-ES).
 */
import { FUNCIONARIOS_SUBIDA as F } from '../data/espana-2026.ts';

const fmtEur = (n: number): string =>
  new Intl.NumberFormat('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Math.round(n * 100) / 100) + ' €';

export interface Inputs {
  nominaBase2024: number | string; // retribución bruta mensual de 2024 (antes de subidas)
  numPagas?: string;               // '14' | '12'
  aplicarVariable?: string;        // 'si' | 'no' — incluir el 0,5% adicional de 2026
}

export interface Outputs { [k: string]: any; detalle: string; _insight?: any; _chart?: any; }

export function compute(i: Inputs): Outputs {
  const base = Number(i.nominaBase2024) || 0;
  const pagas = i.numPagas === '12' ? 12 : 14;
  const variable = i.aplicarVariable === 'si';
  if (base <= 0) throw new Error('Introduce tu retribución bruta mensual base (2024)');

  const factor2025 = 1 + F.pct2025 / 100;
  const pct2026 = F.pct2026Fijo + (variable ? F.pct2026Variable : 0);
  const factor2026 = 1 + pct2026 / 100;

  const nomina2025 = base * factor2025;
  const nomina2026 = nomina2025 * factor2026;

  const subida2025 = nomina2025 - base;
  const subida2026 = nomina2026 - nomina2025;
  const subidaTotalMensual = nomina2026 - base;
  const incrementoAnualTotal = subidaTotalMensual * pagas;
  const atrasos2025 = subida2025 * pagas; // 2025 completo abonado de forma retroactiva

  const _insight = {
    title: 'Tu subida como empleado público',
    text: `Partiendo de **${fmtEur(base)}/mes** (base 2024), tu nómina sube a **${fmtEur(nomina2025)}** en 2025 (+2,5%) y a **${fmtEur(nomina2026)}** en 2026 (+${pct2026.toString().replace('.', ',')}%). En total son **${fmtEur(subidaTotalMensual)} más al mes** y **${fmtEur(incrementoAnualTotal)} más al año** (${pagas} pagas). Los atrasos de 2025 (${fmtEur(atrasos2025)}) se abonan de forma retroactiva.${variable ? '' : ' El 0,5% adicional de 2026 solo se aplica si el IPC llega al 1,5%.'}`,
    tone: 'good',
    icon: '🏛️',
  };

  const _chart = {
    type: 'bar',
    segments: [
      { label: 'Base 2024', value: Math.round(base) },
      { label: 'Nómina 2025', value: Math.round(nomina2025) },
      { label: 'Nómina 2026', value: Math.round(nomina2026) },
    ],
    ariaLabel: `Nómina base 2024 ${fmtEur(base)}, 2025 ${fmtEur(nomina2025)}, 2026 ${fmtEur(nomina2026)}.`,
  };

  return {
    nomina2026: fmtEur(nomina2026),
    nomina2025: fmtEur(nomina2025),
    subidaMensualTotal: fmtEur(subidaTotalMensual),
    incrementoAnualTotal: fmtEur(incrementoAnualTotal),
    atrasos2025: fmtEur(atrasos2025),
    detalle: `Base ${fmtEur(base)} × 1,025 = ${fmtEur(nomina2025)} (2025). × ${factor2026.toFixed(3).replace('.', ',')} = ${fmtEur(nomina2026)} (2026, +${pct2026.toString().replace('.', ',')}%). Subida total ${fmtEur(subidaTotalMensual)}/mes; ${fmtEur(incrementoAnualTotal)}/año en ${pagas} pagas.`,
    _insight,
    _chart,
  };
}
