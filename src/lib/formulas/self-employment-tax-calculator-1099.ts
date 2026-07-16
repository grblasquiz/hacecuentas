/**
 * Self-employment (1099) tax calculator — tax year 2026.
 * Calcula el SE tax de la Schedule SE (12,4% Social Security hasta el wage base
 * + 2,9% Medicare + 0,9% Additional Medicare), la deducción de la mitad del SE
 * tax, un estimado del income tax sobre la ganancia y el pago trimestral (1040-ES).
 * Fuente única: src/lib/data/usa-2026.ts (FICA_2026, brackets, deducción).
 */
import {
  calcFederalTax,
  STANDARD_DEDUCTION_2026,
  FICA_2026,
  fmtUSD,
  fmtUSD0,
  type FilingStatus,
} from '../data/usa-2026.ts';

export interface Inputs {
  net_profit: number;        // ganancia neta del 1099 / Schedule C
  w2_wages?: number;         // sueldos W-2 ya sujetos a Social Security
  filing_status: string;     // single | mfj | mfs | hoh
  other_income?: number;     // otro ingreso gravable (para apilar el income tax)
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

const STATUSES: FilingStatus[] = ['single', 'mfj', 'mfs', 'hoh'];

export function compute(i: Inputs): Outputs {
  const netProfit = Math.max(0, Number(i.net_profit) || 0);
  const w2 = Math.max(0, Number(i.w2_wages) || 0);
  const otherIncome = Math.max(0, Number(i.other_income) || 0);
  const status = (STATUSES.includes(i.filing_status as FilingStatus) ? i.filing_status : 'single') as FilingStatus;

  if (netProfit <= 0) throw new Error('Enter your net self-employment profit');

  // ── Schedule SE ──
  const netEarnings = netProfit * FICA_2026.seNetEarningsFactor; // × 92,35%

  // Social Security: 12,4% sobre lo que quede del wage base tras los sueldos W-2.
  const ssRoom = Math.max(0, FICA_2026.ssWageBase - w2);
  const ssBase = Math.min(netEarnings, ssRoom);
  const ssTax = ssBase * FICA_2026.ssRateSelfEmployed;

  // Medicare: 2,9% sin tope.
  const medicareTax = netEarnings * FICA_2026.medicareRateSelfEmployed;

  // Additional Medicare 0,9% sobre las ganancias que superan el umbral (tras W-2).
  const addlThreshold = FICA_2026.addlMedicareThreshold[status];
  const addlRoom = Math.max(0, addlThreshold - w2);
  const addlBase = Math.max(0, netEarnings - addlRoom);
  const addlMedicare = addlBase * FICA_2026.addlMedicareRate;

  const seTax = Math.round((ssTax + medicareTax + addlMedicare) * 100) / 100;
  const halfSE = Math.round((seTax / 2) * 100) / 100; // deducible above-the-line

  // ── Estimado de income tax atribuible a la ganancia SE ──
  const std = STANDARD_DEDUCTION_2026[status];
  const taxableWith = Math.max(0, netProfit + w2 + otherIncome - halfSE - std);
  const taxableWithout = Math.max(0, w2 + otherIncome - std);
  const incomeTaxOnSE = Math.max(0, calcFederalTax(taxableWith, status) - calcFederalTax(taxableWithout, status));

  const totalEstimated = Math.round((seTax + incomeTaxOnSE) * 100) / 100;
  const quarterly = Math.round((totalEstimated / 4) * 100) / 100;
  const effRate = netProfit > 0 ? totalEstimated / netProfit : 0;

  const _insight = {
    title: 'Set aside about this much for taxes',
    text: `On **${fmtUSD0(netProfit)}** of 1099 profit, your self-employment tax is **${fmtUSD(seTax)}** (Social Security + Medicare), plus roughly **${fmtUSD0(incomeTaxOnSE)}** in federal income tax on the profit. Plan to set aside about **${fmtUSD0(totalEstimated)}** total — around **${fmtUSD0(quarterly)} every quarter** (Form 1040-ES). That is an effective **${(effRate * 100).toFixed(0)}%** of your profit. Remember: you can deduct **${fmtUSD0(halfSE)}** (half the SE tax) on your return.`,
    tone: 'warn',
    icon: '🧾',
  };

  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Self-employment tax', value: Math.round(seTax) },
      { label: 'Income tax on profit', value: Math.round(incomeTaxOnSE) },
      { label: 'Kept', value: Math.max(0, Math.round(netProfit - totalEstimated)) },
    ],
    prefix: '$',
    centerValue: fmtUSD0(netProfit),
    centerLabel: '1099 profit',
    ariaLabel: `Of ${fmtUSD0(netProfit)} profit, ${fmtUSD0(seTax)} is SE tax, ${fmtUSD0(incomeTaxOnSE)} income tax, and ${fmtUSD0(netProfit - totalEstimated)} is kept.`,
  };

  return {
    se_tax: fmtUSD(seTax),
    net_earnings_se: fmtUSD0(netEarnings),
    ss_portion: fmtUSD(ssTax),
    medicare_portion: fmtUSD(medicareTax + addlMedicare),
    half_se_deduction: fmtUSD(halfSE),
    income_tax_on_se: fmtUSD0(incomeTaxOnSE),
    total_estimated_tax: fmtUSD0(totalEstimated),
    quarterly_payment: fmtUSD0(quarterly),
    breakdown: `Net earnings ${fmtUSD0(netEarnings)} (${fmtUSD0(netProfit)} × 92.35%). SE tax: SS ${fmtUSD(ssTax)} + Medicare ${fmtUSD(medicareTax + addlMedicare)} = ${fmtUSD(seTax)}. Income tax on profit ≈ ${fmtUSD0(incomeTaxOnSE)}. Total ${fmtUSD0(totalEstimated)} → ${fmtUSD0(quarterly)}/quarter.`,
    _insight,
    _chart,
  };
}
