/**
 * W-4 federal withholding calculator — tax year 2026 (IRS Pub. 15-T, método
 * porcentual, casilla de Step 2 SIN marcar). Estima cuánto impuesto federal
 * te retienen por cheque a partir de tu W-4 (status, dependientes, ajustes).
 * Fuente única de tramos/deducción: src/lib/data/usa-2026.ts.
 */
import {
  calcFederalTax,
  STANDARD_DEDUCTION_2026,
  fmtUSD,
  fmtUSD0,
  type FilingStatus,
} from '../data/usa-2026.ts';

export interface Inputs {
  annual_salary: number;
  pay_frequency: string;    // weekly | biweekly | semimonthly | monthly | annual
  filing_status: string;    // single | mfj | hoh
  qualifying_children?: number; // W-4 Step 3: $2,000 c/u
  other_dependents?: number;    // W-4 Step 3: $500 c/u
  other_income?: number;        // W-4 Step 4(a), anual
  deductions?: number;          // W-4 Step 4(b), anual sobre la deducción estándar
  extra_withholding?: number;   // W-4 Step 4(c), por cheque
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

const W4_STATUSES: FilingStatus[] = ['single', 'mfj', 'hoh'];

function periodsPerYear(freq: string): { n: number; label: string } {
  switch (freq) {
    case 'weekly': return { n: 52, label: 'weekly' };
    case 'semimonthly': return { n: 24, label: 'semi-monthly' };
    case 'monthly': return { n: 12, label: 'monthly' };
    case 'annual': return { n: 1, label: 'annual' };
    default: return { n: 26, label: 'bi-weekly' };
  }
}

export function compute(i: Inputs): Outputs {
  const salary = Math.max(0, Number(i.annual_salary) || 0);
  const status = (W4_STATUSES.includes(i.filing_status as FilingStatus) ? i.filing_status : 'single') as FilingStatus;
  const children = Math.max(0, Math.floor(Number(i.qualifying_children) || 0));
  const otherDeps = Math.max(0, Math.floor(Number(i.other_dependents) || 0));
  const otherIncome = Math.max(0, Number(i.other_income) || 0);
  const extraDeductions = Math.max(0, Number(i.deductions) || 0);
  const extra = Math.max(0, Number(i.extra_withholding) || 0);
  const { n: periods, label: freqLabel } = periodsPerYear(String(i.pay_frequency || 'biweekly'));

  if (salary <= 0) throw new Error('Enter your annual salary');

  // Ingreso anual ajustado y base gravable (Pub. 15-T resta la deducción estándar).
  const adjustedAnnual = salary + otherIncome - extraDeductions;
  const stdDeduction = STANDARD_DEDUCTION_2026[status];
  const taxable = Math.max(0, adjustedAnnual - stdDeduction);

  const annualTax = calcFederalTax(taxable, status);
  const dependentCredits = children * 2000 + otherDeps * 500; // W-4 Step 3
  const annualWithholding = Math.max(0, annualTax - dependentCredits);

  const perPaycheckBase = annualWithholding / periods;
  const perPaycheck = Math.round((perPaycheckBase + extra) * 100) / 100;
  const grossPerPaycheck = salary / periods;
  const withholdingRate = salary > 0 ? annualWithholding / salary : 0;

  const _insight = {
    title: `About ${fmtUSD(perPaycheck)} withheld each ${freqLabel} paycheck`,
    text: `On a ${fmtUSD0(salary)} salary filing as **${status.toUpperCase()}**, your W-4 withholds roughly **${fmtUSD(perPaycheck)} per ${freqLabel} paycheck** — about **${fmtUSD0(annualWithholding + extra * periods)}/year**, or **${(withholdingRate * 100).toFixed(1)}%** of gross pay for federal income tax.` +
      (dependentCredits > 0 ? ` Claiming ${fmtUSD0(dependentCredits)} in dependent credits (Step 3) lowers it.` : '') +
      (extra > 0 ? ` This includes ${fmtUSD(extra)} of extra withholding you requested (Step 4c).` : ''),
    tone: 'neutral',
    icon: '🧾',
  };

  const _chart = {
    type: 'bar',
    labels: ['Gross per paycheck', 'Federal withheld'],
    values: [Math.round(grossPerPaycheck), Math.round(perPaycheck)],
    prefix: '$',
    ariaLabel: `Gross ${fmtUSD(grossPerPaycheck)} per paycheck versus ${fmtUSD(perPaycheck)} federal withholding.`,
  };

  return {
    per_paycheck_withholding: fmtUSD(perPaycheck),
    annual_withholding: fmtUSD0(annualWithholding + extra * periods),
    taxable_wages: fmtUSD0(taxable),
    per_paycheck_gross: fmtUSD(grossPerPaycheck),
    effective_withholding_rate: (withholdingRate * 100).toFixed(1) + '%',
    breakdown: `Annual: (${fmtUSD0(salary)} + other ${fmtUSD0(otherIncome)} − deductions ${fmtUSD0(extraDeductions)} − std deduction ${fmtUSD0(stdDeduction)}) = taxable ${fmtUSD0(taxable)} → tax ${fmtUSD0(annualTax)} − credits ${fmtUSD0(dependentCredits)} = ${fmtUSD0(annualWithholding)} withheld. ÷ ${periods} + ${fmtUSD(extra)} extra = ${fmtUSD(perPaycheck)}/${freqLabel}.`,
    _insight,
    _chart,
  };
}
