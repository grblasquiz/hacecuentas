/**
 * No Tax on Tips — OBBBA qualified-tips deduction calculator (tax years 2025-2028).
 * Deduce hasta $25.000 de propinas calificadas del ingreso federal, con phase-out por
 * MAGI ($150k single / $300k MFJ). Estima el ahorro con la tasa marginal 2026.
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
  qualified_tips: number;   // propinas calificadas recibidas (cash + charged, reportadas)
  filing_status: string;    // single | mfj | hoh
  magi: number;             // modified adjusted gross income
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

const STATUSES: FilingStatus[] = ['single', 'mfj', 'hoh'];

export function compute(i: Inputs): Outputs {
  const tips = Math.max(0, Number(i.qualified_tips) || 0);
  const magi = Math.max(0, Number(i.magi) || 0);
  const status = (STATUSES.includes(i.filing_status as FilingStatus) ? i.filing_status : 'single') as FilingStatus;

  if (tips <= 0) throw new Error('Enter your qualified tip income for the year');

  const t = OBBBA_2026.tips;
  const eligible = Math.min(tips, t.cap);

  const threshold = t.phaseoutStart[status];
  const excess = Math.max(0, magi - threshold);
  const reduction = Math.round(excess * (t.reductionPer1000 / 1000) * 100) / 100;

  const deduction = Math.max(0, Math.round((eligible - reduction) * 100) / 100);

  const taxableProxy = Math.max(0, magi - STANDARD_DEDUCTION_2026[status]);
  const mr = marginalRate2026(taxableProxy, status);
  const taxSavings = Math.round(deduction * mr * 100) / 100;

  const fullyPhasedOut = deduction <= 0 && tips > 0;

  const _insight = {
    title: fullyPhasedOut ? 'Your income phases out this deduction' : 'Your tip deduction',
    text: fullyPhasedOut
      ? `At a MAGI of **${fmtUSD0(magi)}** you are past the phase-out range (${status === 'mfj' ? '$300,000 married' : '$150,000'}), so your **${fmtUSD0(tips)}** of tips gives a **$0** deduction this year.`
      : `You can deduct **${fmtUSD0(deduction)}** of qualified tips (capped at **$25,000**) on your 2026 return. At a **${(mr * 100).toFixed(0)}%** marginal rate that lowers your federal income tax by about **${fmtUSD0(taxSavings)}**. Tips are still subject to Social Security, Medicare, and any state income tax — this only removes federal income tax on the deducted amount.`,
    tone: fullyPhasedOut ? 'warn' : 'good',
    icon: '🪙',
  };

  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Deductible tips', value: Math.round(deduction) },
      { label: 'Phased out / over cap', value: Math.max(0, Math.round(tips - deduction)) },
    ],
    prefix: '$',
    centerValue: fmtUSD0(deduction),
    centerLabel: 'Deduction',
    ariaLabel: `Of ${fmtUSD0(tips)} in tips, ${fmtUSD0(deduction)} is deductible and ${fmtUSD0(tips - deduction)} is not.`,
  };

  return {
    deduction: fmtUSD(deduction),
    tax_savings: fmtUSD0(taxSavings),
    eligible_tips: fmtUSD(eligible),
    phaseout_reduction: fmtUSD(reduction),
    marginal_rate: (mr * 100).toFixed(0) + '%',
    cap_applied: fmtUSD0(t.cap),
    breakdown: `Tips ${fmtUSD0(tips)} capped at $25,000 = ${fmtUSD0(eligible)}. Phase-out over ${fmtUSD0(threshold)} MAGI: −${fmtUSD0(reduction)}. Deduction ${fmtUSD0(deduction)} × ${(mr * 100).toFixed(0)}% ≈ ${fmtUSD0(taxSavings)} federal tax saved.`,
    _insight,
    _chart,
  };
}
