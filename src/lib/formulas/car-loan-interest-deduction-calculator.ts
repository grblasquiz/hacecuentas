/**
 * Car loan interest deduction — OBBBA, tax years 2025-2028.
 * Deduce hasta $10.000 de interés anual de un préstamo de auto NUEVO ensamblado en
 * EE.UU. (uso personal, préstamo originado después del 31-dic-2024). Phase-out de
 * $200 por cada $1.000 de MAGI sobre el umbral ($100k single / $200k MFJ). Disponible
 * también para quienes toman la standard deduction (no requiere itemizar).
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
  car_loan_interest: number;  // interés pagado en el año sobre un préstamo elegible
  filing_status: string;      // single | mfj | hoh
  magi: number;               // modified adjusted gross income
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

const STATUSES: FilingStatus[] = ['single', 'mfj', 'hoh'];

export function compute(i: Inputs): Outputs {
  const interest = Math.max(0, Number(i.car_loan_interest) || 0);
  const magi = Math.max(0, Number(i.magi) || 0);
  const status = (STATUSES.includes(i.filing_status as FilingStatus) ? i.filing_status : 'single') as FilingStatus;

  if (interest <= 0) throw new Error('Enter the car loan interest you paid this year');

  const c = OBBBA_2026.carLoan;
  const eligible = Math.min(interest, c.cap);

  const threshold = c.phaseoutStart[status];
  const excess = Math.max(0, magi - threshold);
  const reduction = Math.round(excess * (c.reductionPer1000 / 1000) * 100) / 100;

  const deduction = Math.max(0, Math.round((eligible - reduction) * 100) / 100);

  const taxableProxy = Math.max(0, magi - STANDARD_DEDUCTION_2026[status]);
  const mr = marginalRate2026(taxableProxy, status);
  const taxSavings = Math.round(deduction * mr * 100) / 100;

  const fullyPhasedOut = deduction <= 0 && interest > 0;

  const _insight = {
    title: fullyPhasedOut ? 'Your income phases out this deduction' : 'Your car loan interest deduction',
    text: fullyPhasedOut
      ? `At a MAGI of **${fmtUSD0(magi)}** you are past the phase-out (gone at ${status === 'mfj' ? '$250,000 married' : '$150,000'}), so your **${fmtUSD0(interest)}** of car loan interest gives a **$0** deduction.`
      : `You can deduct **${fmtUSD0(deduction)}** of car loan interest on your 2026 return. At a **${(mr * 100).toFixed(0)}%** marginal rate that saves about **${fmtUSD0(taxSavings)}** in federal income tax — even if you take the standard deduction. The car must be new, for personal use, and have final assembly in the U.S. (you report the VIN); the loan must be secured by the vehicle and originated after Dec 31, 2024.`,
    tone: fullyPhasedOut ? 'warn' : 'good',
    icon: '🚗',
  };

  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Deductible interest', value: Math.round(deduction) },
      { label: 'Phased out / over cap', value: Math.max(0, Math.round(interest - deduction)) },
    ],
    prefix: '$',
    centerValue: fmtUSD0(deduction),
    centerLabel: 'Deduction',
    ariaLabel: `Of ${fmtUSD0(interest)} car loan interest, ${fmtUSD0(deduction)} is deductible and ${fmtUSD0(interest - deduction)} is not.`,
  };

  return {
    deduction: fmtUSD(deduction),
    tax_savings: fmtUSD0(taxSavings),
    eligible_interest: fmtUSD(eligible),
    phaseout_reduction: fmtUSD(reduction),
    marginal_rate: (mr * 100).toFixed(0) + '%',
    cap_applied: fmtUSD0(c.cap),
    breakdown: `Interest ${fmtUSD0(interest)} capped at $10,000 = ${fmtUSD0(eligible)}. Phase-out $200/$1,000 over ${fmtUSD0(threshold)} MAGI: −${fmtUSD0(reduction)}. Deduction ${fmtUSD0(deduction)} × ${(mr * 100).toFixed(0)}% ≈ ${fmtUSD0(taxSavings)} saved.`,
    _insight,
    _chart,
  };
}
