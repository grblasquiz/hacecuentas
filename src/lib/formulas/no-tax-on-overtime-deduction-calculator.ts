/**
 * No Tax on Overtime — OBBBA overtime deduction calculator (tax years 2025-2028).
 * Solo la porción "premium" de las horas extra (la mitad de time-and-a-half exigida
 * por la FLSA) es deducible, con tope y phase-out por MAGI. Estima además el ahorro
 * de impuesto federal usando la tasa marginal 2026.
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
  overtime_premium: number;  // porción premium (la "mitad" del 1.5×) exigida por FLSA
  filing_status: string;     // single | mfj | hoh
  magi: number;              // modified adjusted gross income
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

const STATUSES: FilingStatus[] = ['single', 'mfj', 'hoh'];

export function compute(i: Inputs): Outputs {
  const premium = Math.max(0, Number(i.overtime_premium) || 0);
  const magi = Math.max(0, Number(i.magi) || 0);
  const status = (STATUSES.includes(i.filing_status as FilingStatus) ? i.filing_status : 'single') as FilingStatus;

  if (premium <= 0) throw new Error('Enter your qualified overtime premium (the extra half-time pay)');

  const ot = OBBBA_2026.overtime;
  const cap = status === 'mfj' ? ot.capMFJ : ot.capSingle;

  // Paso 1 — la deducción no puede superar el tope ni el premium real.
  const eligible = Math.min(premium, cap);

  // Paso 2 — phase-out: $100 menos por cada $1.000 de MAGI sobre el umbral (= 10% del exceso).
  const threshold = ot.phaseoutStart[status];
  const excess = Math.max(0, magi - threshold);
  const reduction = Math.round(excess * (ot.reductionPer1000 / 1000) * 100) / 100;

  const deduction = Math.max(0, Math.round((eligible - reduction) * 100) / 100);

  // Paso 3 — ahorro estimado de impuesto federal = deducción × tasa marginal.
  const taxableProxy = Math.max(0, magi - STANDARD_DEDUCTION_2026[status]);
  const mr = marginalRate2026(taxableProxy, status);
  const taxSavings = Math.round(deduction * mr * 100) / 100;

  const fullyPhasedOut = deduction <= 0 && premium > 0;

  const _insight = {
    title: fullyPhasedOut ? 'Your income phases out this deduction' : 'Your overtime deduction',
    text: fullyPhasedOut
      ? `With a MAGI of **${fmtUSD0(magi)}**, you are above the phase-out range for the overtime deduction (${status === 'mfj' ? '$300,000 married' : '$150,000'}), so your qualified premium of **${fmtUSD0(premium)}** is fully reduced to **$0**. You still owe regular tax on that pay.`
      : `You can deduct **${fmtUSD0(deduction)}** of qualified overtime premium on your 2026 return. At your marginal rate of **${(mr * 100).toFixed(0)}%**, that trims your federal income tax by about **${fmtUSD0(taxSavings)}**. Remember: only the FLSA-required *premium* (the extra half of time-and-a-half) qualifies — and it is still subject to Social Security, Medicare, and any state tax.`,
    tone: fullyPhasedOut ? 'warn' : 'good',
    icon: '⏱️',
  };

  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Deductible premium', value: Math.round(deduction) },
      { label: 'Phased out / over cap', value: Math.max(0, Math.round(premium - deduction)) },
    ],
    prefix: '$',
    centerValue: fmtUSD0(deduction),
    centerLabel: 'Deduction',
    ariaLabel: `Of ${fmtUSD0(premium)} overtime premium, ${fmtUSD0(deduction)} is deductible and ${fmtUSD0(premium - deduction)} is not.`,
  };

  return {
    deduction: fmtUSD(deduction),
    tax_savings: fmtUSD0(taxSavings),
    eligible_premium: fmtUSD(eligible),
    phaseout_reduction: fmtUSD(reduction),
    marginal_rate: (mr * 100).toFixed(0) + '%',
    cap_applied: fmtUSD0(cap),
    breakdown: `Qualified premium ${fmtUSD0(premium)} capped at ${fmtUSD0(cap)} = ${fmtUSD0(eligible)}. Phase-out over ${fmtUSD0(threshold)} MAGI: −${fmtUSD0(reduction)}. Deduction ${fmtUSD0(deduction)} × ${(mr * 100).toFixed(0)}% marginal ≈ ${fmtUSD0(taxSavings)} federal tax saved.`,
    _insight,
    _chart,
  };
}
