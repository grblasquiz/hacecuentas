export interface Inputs {
  gross_pay: number;
  pay_frequency: string;
  filing_status: string;
  extra_withholding: number;
  state: string;
  retirement_pct: number;
  health_insurance: number;
}

export interface Outputs {
  net_pay: number;
  federal_tax: number;
  social_security: number;
  medicare: number;
  state_tax: number;
  retirement_deduction: number;
  effective_rate: number;
  annual_net: number;
  breakdown: string;
}

// ── 2026 Constants ────────────────────────────────────────────────
// Source: IRS Rev. Proc. 2025-28 & IRS Publication 15-T (2026)
const SS_WAGE_BASE_2026 = 176100;   // SSA announcement Oct 2025
const SS_RATE = 0.062;
const MEDICARE_RATE = 0.0145;
const ADDL_MEDICARE_RATE = 0.009;   // IRC §3101(b)(2)
const ADDL_MEDICARE_THRESHOLD = 200000; // single; MFJ $250k handled at filing

// 2026 Standard Deductions (IRS Rev. Proc. 2025-28)
const STD_DEDUCTION: Record<string, number> = {
  single: 15000,
  married: 30000,
  hoh: 22500,
};

// 2026 Federal Brackets [threshold, rate]
// Each bracket: income > threshold gets marginal rate on the excess up to next threshold
const FEDERAL_BRACKETS: Record<string, [number, number][]> = {
  single: [
    [0, 0.10],
    [11925, 0.12],
    [48475, 0.22],
    [103350, 0.24],
    [197300, 0.32],
    [250525, 0.35],
    [626350, 0.37],
  ],
  married: [
    [0, 0.10],
    [23850, 0.12],
    [96950, 0.22],
    [206700, 0.24],
    [394600, 0.32],
    [501050, 0.35],
    [751600, 0.37],
  ],
  hoh: [
    [0, 0.10],
    [17000, 0.12],
    [64850, 0.22],
    [103350, 0.24],
    [197300, 0.32],
    [250500, 0.35],
    [626350, 0.37],
  ],
};

function calcBracketTax(taxableIncome: number, brackets: [number, number][]): number {
  if (taxableIncome <= 0) return 0;
  let tax = 0;
  for (let i = 0; i < brackets.length; i++) {
    const [threshold, rate] = brackets[i];
    const nextThreshold = i + 1 < brackets.length ? brackets[i + 1][0] : Infinity;
    if (taxableIncome <= threshold) break;
    const taxableInBracket = Math.min(taxableIncome, nextThreshold) - threshold;
    tax += taxableInBracket * rate;
  }
  return tax;
}

// ── California 2026 brackets (single & MFJ)
// Source: CA FTB 2026 withholding schedules (simplified)
const CA_BRACKETS_SINGLE: [number, number][] = [
  [0, 0.01],
  [10412, 0.02],
  [24684, 0.04],
  [38959, 0.06],
  [54081, 0.08],
  [68350, 0.093],
  [349137, 0.103],
  [418961, 0.113],
  [698274, 0.123],
  [1000000, 0.133],
];

const CA_BRACKETS_MARRIED: [number, number][] = [
  [0, 0.01],
  [20824, 0.02],
  [49368, 0.04],
  [77918, 0.06],
  [108162, 0.08],
  [136700, 0.093],
  [698274, 0.103],
  [837922, 0.113],
  [1000000, 0.123],
  [1396548, 0.133],
];

// ── New York 2026 brackets (statewide only, no NYC local)
// Source: NY Tax Dept. 2026 withholding tables (simplified)
const NY_BRACKETS_SINGLE: [number, number][] = [
  [0, 0.04],
  [8500, 0.045],
  [11700, 0.0525],
  [13900, 0.0585],
  [80650, 0.0625],
  [215400, 0.0685],
  [1077550, 0.0965],
  [5000000, 0.103],
  [25000000, 0.109],
];

const NY_BRACKETS_MARRIED: [number, number][] = [
  [0, 0.04],
  [17150, 0.045],
  [23600, 0.0525],
  [27900, 0.0585],
  [161550, 0.0625],
  [323200, 0.0685],
  [2155350, 0.0965],
  [5000000, 0.103],
  [25000000, 0.109],
];

function calcStateTax(
  annualTaxable: number,
  state: string,
  filingStatus: string
): number {
  if (state === 'TX' || state === 'FL') return 0;

  const isMarried = filingStatus === 'married';

  if (state === 'CA') {
    const brackets = isMarried ? CA_BRACKETS_MARRIED : CA_BRACKETS_SINGLE;
    // CA standard deduction 2026: single $5,202, MFJ $10,404
    const caStdDed = isMarried ? 10404 : 5202;
    const caTaxable = Math.max(0, annualTaxable - caStdDed);
    return calcBracketTax(caTaxable, brackets);
  }

  if (state === 'NY') {
    const brackets = isMarried ? NY_BRACKETS_MARRIED : NY_BRACKETS_SINGLE;
    // NY standard deduction 2026: single $8,000, MFJ $16,050 (approx)
    const nyStdDed = isMarried ? 16050 : 8000;
    const nyTaxable = Math.max(0, annualTaxable - nyStdDed);
    return calcBracketTax(nyTaxable, brackets);
  }

  return 0;
}

function periodsPerYear(frequency: string): number {
  switch (frequency) {
    case 'weekly':      return 52;
    case 'biweekly':   return 26;
    case 'semimonthly': return 24;
    case 'monthly':    return 12;
    default:           return 26;
  }
}

export function compute(i: Inputs): Outputs {
  const grossPay       = Math.max(0, Number(i.gross_pay)       || 0);
  const retirementPct  = Math.min(100, Math.max(0, Number(i.retirement_pct)  || 0));
  const healthIns      = Math.max(0, Number(i.health_insurance) || 0);
  const extraWith      = Math.max(0, Number(i.extra_withholding) || 0);
  const filingStatus   = ['single','married','hoh'].includes(i.filing_status) ? i.filing_status : 'single';
  const state          = ['CA','NY','TX','FL'].includes(i.state) ? i.state : 'CA';
  const periods        = periodsPerYear(i.pay_frequency);

  if (grossPay <= 0) {
    return {
      net_pay: 0,
      federal_tax: 0,
      social_security: 0,
      medicare: 0,
      state_tax: 0,
      retirement_deduction: 0,
      effective_rate: 0,
      annual_net: 0,
      breakdown: 'Please enter a valid gross pay amount.',
    };
  }

  // ── Step 1: Pre-tax deductions per period
  const retirementDeduction = grossPay * (retirementPct / 100);
  const pretaxTotal         = retirementDeduction + healthIns;

  // ── Step 2: Annualized figures
  const annualGross   = grossPay * periods;
  const annualPretax  = pretaxTotal * periods;
  const annualTaxable = Math.max(0, annualGross - annualPretax); // for income tax purposes

  // ── Step 3: Federal income tax
  const stdDed          = STD_DEDUCTION[filingStatus] ?? 15000;
  const federalTaxable  = Math.max(0, annualTaxable - stdDed);
  const brackets        = FEDERAL_BRACKETS[filingStatus] ?? FEDERAL_BRACKETS['single'];
  const annualFedTax    = calcBracketTax(federalTaxable, brackets);
  const perPeriodFedTax = annualFedTax / periods + extraWith;

  // ── Step 4: FICA — applied to gross wages (pre-tax 401k does NOT exempt FICA)
  // Social Security capped at SS_WAGE_BASE_2026
  const ssTaxableAnnual   = Math.min(annualGross, SS_WAGE_BASE_2026);
  const annualSSTax       = ssTaxableAnnual * SS_RATE;
  const perPeriodSSTax    = annualSSTax / periods;

  // Medicare — no wage cap; additional 0.9% over $200k
  const annualMedicareTax =
    annualGross * MEDICARE_RATE +
    Math.max(0, annualGross - ADDL_MEDICARE_THRESHOLD) * ADDL_MEDICARE_RATE;
  const perPeriodMedicare = annualMedicareTax / periods;

  // ── Step 5: State tax
  const annualStateTax   = calcStateTax(annualTaxable, state, filingStatus);
  const perPeriodStateTax = annualStateTax / periods;

  // ── Step 6: Net pay
  const netPay = grossPay
    - perPeriodFedTax
    - perPeriodSSTax
    - perPeriodMedicare
    - perPeriodStateTax
    - pretaxTotal;

  const annualNet = netPay * periods;

  // ── Effective federal rate (on gross)
  const effectiveRate = annualGross > 0 ? (annualFedTax / annualGross) * 100 : 0;

  // ── Breakdown summary text
  const stateLabel = state === 'TX' || state === 'FL'
    ? `${state} (no state income tax)`
    : state;

  const breakdown =
    `Gross: $${grossPay.toFixed(2)} | ` +
    `Federal tax: $${perPeriodFedTax.toFixed(2)} | ` +
    `SS: $${perPeriodSSTax.toFixed(2)} | ` +
    `Medicare: $${perPeriodMedicare.toFixed(2)} | ` +
    `${stateLabel} tax: $${perPeriodStateTax.toFixed(2)} | ` +
    `401(k): $${retirementDeduction.toFixed(2)} | ` +
    `Health ins: $${healthIns.toFixed(2)} | ` +
    `Net: $${netPay.toFixed(2)}`;

  return {
    net_pay:              Math.max(0, netPay),
    federal_tax:          perPeriodFedTax,
    social_security:      perPeriodSSTax,
    medicare:             perPeriodMedicare,
    state_tax:            perPeriodStateTax,
    retirement_deduction: retirementDeduction,
    effective_rate:       effectiveRate,
    annual_net:           Math.max(0, annualNet),
    breakdown,
  };
}
