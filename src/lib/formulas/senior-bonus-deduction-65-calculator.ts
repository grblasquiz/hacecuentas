/**
 * Senior "bonus" deduction (age 65+) — OBBBA, tax years 2025-2028.
 * $6.000 por persona elegible de 65+ (hasta $12.000 en un matrimonio MFJ con ambos
 * de 65+). Phase-out del 6% del MAGI que excede el umbral ($75k single / $150k MFJ).
 * Estima el ahorro con la tasa marginal 2026. Se suma a la standard deduction y a la
 * additional standard deduction para mayores ya existente.
 * Fuente única de montos: src/lib/data/usa-2026.ts (OBBBA_2026).
 */
import {
  OBBBA_2026,
  STANDARD_DEDUCTION_2026,
  marginalRate2026,
  fmtUSD,
  fmtUSD0,
  type FilingStatus,
} from '../data/usa-2026.ts';

export interface Inputs {
  filing_status: string;   // single | mfj | hoh
  seniors_count: number;   // 1 o 2 (2 solo válido si MFJ y ambos 65+)
  magi: number;            // modified adjusted gross income
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

const STATUSES: FilingStatus[] = ['single', 'mfj', 'hoh'];

export function compute(i: Inputs): Outputs {
  const status = (STATUSES.includes(i.filing_status as FilingStatus) ? i.filing_status : 'single') as FilingStatus;
  const magi = Math.max(0, Number(i.magi) || 0);
  let count = Math.round(Number(i.seniors_count) || 1);
  if (count < 1) count = 1;
  if (count > 2) count = 2;
  if (status !== 'mfj') count = 1;   // solo un matrimonio MFJ puede reclamar por dos personas

  const s = OBBBA_2026.senior;
  const base = s.perPerson * count;

  const threshold = s.phaseoutStart[status];
  const excess = Math.max(0, magi - threshold);
  const reduction = Math.round(excess * s.phaseoutRate * 100) / 100;

  const deduction = Math.max(0, Math.round((base - reduction) * 100) / 100);

  const taxableProxy = Math.max(0, magi - STANDARD_DEDUCTION_2026[status]);
  const mr = marginalRate2026(taxableProxy, status);
  const taxSavings = Math.round(deduction * mr * 100) / 100;

  const fullyPhasedOut = deduction <= 0;

  const _insight = {
    title: fullyPhasedOut ? 'Your income phases out the senior deduction' : 'Your senior bonus deduction',
    text: fullyPhasedOut
      ? `With a MAGI of **${fmtUSD0(magi)}** you are above the phase-out ceiling, so the $6,000 senior deduction reduces to **$0**. It fades at 6% of income over ${fmtUSD0(threshold)} and disappears near ${fmtUSD0(threshold + base / s.phaseoutRate)}.`
      : `You qualify for a **${fmtUSD0(deduction)}** senior bonus deduction${count === 2 ? ' (two people 65+)' : ''}. At a **${(mr * 100).toFixed(0)}%** marginal rate that saves about **${fmtUSD0(taxSavings)}** in federal income tax. This is on top of the regular standard deduction and the existing age-65 additional standard deduction, and you can claim it whether you itemize or not.`,
    tone: fullyPhasedOut ? 'warn' : 'good',
    icon: '👵',
  };

  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Deduction kept', value: Math.round(deduction) },
      { label: 'Phased out', value: Math.max(0, Math.round(base - deduction)) },
    ],
    prefix: '$',
    centerValue: fmtUSD0(deduction),
    centerLabel: 'Deduction',
    ariaLabel: `Of a ${fmtUSD0(base)} base senior deduction, ${fmtUSD0(deduction)} is kept and ${fmtUSD0(base - deduction)} is phased out.`,
  };

  return {
    deduction: fmtUSD(deduction),
    tax_savings: fmtUSD0(taxSavings),
    base_deduction: fmtUSD0(base),
    phaseout_reduction: fmtUSD(reduction),
    marginal_rate: (mr * 100).toFixed(0) + '%',
    breakdown: `Base ${fmtUSD0(base)} (${count} × $6,000). Phase-out 6% over ${fmtUSD0(threshold)} MAGI: −${fmtUSD0(reduction)}. Deduction ${fmtUSD0(deduction)} × ${(mr * 100).toFixed(0)}% ≈ ${fmtUSD0(taxSavings)} saved.`,
    _insight,
    _chart,
  };
}
