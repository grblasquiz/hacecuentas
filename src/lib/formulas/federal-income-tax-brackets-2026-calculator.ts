export interface Inputs {
  filing_status: string;   // 'single' | 'mfj' | 'mfs' | 'hoh'
  income_type: string;     // 'taxable' | 'gross'
  gross_income: number;
  deduction_type: string;  // 'standard' | 'itemized'
  itemized_amount: number;
  taxable_income: number;
  withholding: number;
}

export interface Outputs {
  tax_owed: number;
  effective_rate: number;
  marginal_rate: number;
  taxable_income_used: number;
  refund_or_owed: number;
  refund_status: string;
  bracket_breakdown: string;
}

// ---------------------------------------------------------------------------
// 2026 Federal Income Tax Brackets (estimated, inflation-adjusted)
// Source: IRS Rev. Proc. 2024-40 methodology; Tax Foundation 2026 projections
// ---------------------------------------------------------------------------
interface Bracket {
  rate: number;
  min: number;
  max: number; // Infinity for top bracket
}

const BRACKETS_2026: Record<string, Bracket[]> = {
  // Single
  single: [
    { rate: 0.10, min: 0,       max: 11925 },
    { rate: 0.12, min: 11925,   max: 48475 },
    { rate: 0.22, min: 48475,   max: 103350 },
    { rate: 0.24, min: 103350,  max: 197300 },
    { rate: 0.32, min: 197300,  max: 250525 },
    { rate: 0.35, min: 250525,  max: 626350 },
    { rate: 0.37, min: 626350,  max: Infinity },
  ],
  // Married Filing Jointly
  mfj: [
    { rate: 0.10, min: 0,       max: 23850 },
    { rate: 0.12, min: 23850,   max: 96950 },
    { rate: 0.22, min: 96950,   max: 206700 },
    { rate: 0.24, min: 206700,  max: 394600 },
    { rate: 0.32, min: 394600,  max: 501050 },
    { rate: 0.35, min: 501050,  max: 751600 },
    { rate: 0.37, min: 751600,  max: Infinity },
  ],
  // Married Filing Separately (same as single except 37% threshold halved)
  mfs: [
    { rate: 0.10, min: 0,       max: 11925 },
    { rate: 0.12, min: 11925,   max: 48475 },
    { rate: 0.22, min: 48475,   max: 103350 },
    { rate: 0.24, min: 103350,  max: 197300 },
    { rate: 0.32, min: 197300,  max: 250525 },
    { rate: 0.35, min: 250525,  max: 375800 },
    { rate: 0.37, min: 375800,  max: Infinity },
  ],
  // Head of Household
  hoh: [
    { rate: 0.10, min: 0,       max: 17000 },
    { rate: 0.12, min: 17000,   max: 64850 },
    { rate: 0.22, min: 64850,   max: 103350 },
    { rate: 0.24, min: 103350,  max: 197300 },
    { rate: 0.32, min: 197300,  max: 250500 },
    { rate: 0.35, min: 250500,  max: 626350 },
    { rate: 0.37, min: 626350,  max: Infinity },
  ],
};

// 2026 Standard Deductions (estimated)
// Source: IRS Rev. Proc. 2024-40 methodology + TCJA extension
const STANDARD_DEDUCTION_2026: Record<string, number> = {
  single: 15000,
  mfj:    30000,
  mfs:    15000,
  hoh:    22500,
};

function formatUSD(n: number): string {
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function compute(i: Inputs): Outputs {
  const filing_status = (i.filing_status || 'single').toLowerCase();
  const income_type   = (i.income_type   || 'taxable').toLowerCase();
  const deduction_type = (i.deduction_type || 'standard').toLowerCase();

  const brackets = BRACKETS_2026[filing_status] ?? BRACKETS_2026['single'];
  const stdDeduction = STANDARD_DEDUCTION_2026[filing_status] ?? 15000;

  // Determine taxable income
  let taxableIncome = 0;

  if (income_type === 'gross') {
    const gross = Math.max(0, Number(i.gross_income) || 0);
    let deduction = 0;
    if (deduction_type === 'itemized') {
      deduction = Math.max(0, Number(i.itemized_amount) || 0);
    } else {
      deduction = stdDeduction;
    }
    taxableIncome = Math.max(0, gross - deduction);
  } else {
    taxableIncome = Math.max(0, Number(i.taxable_income) || 0);
  }

  if (taxableIncome <= 0) {
    return {
      tax_owed: 0,
      effective_rate: 0,
      marginal_rate: 0,
      taxable_income_used: 0,
      refund_or_owed: Math.max(0, Number(i.withholding) || 0),
      refund_status: (Number(i.withholding) || 0) > 0
        ? 'Full refund of withholding (no tax owed)'
        : 'No tax owed and no withholding entered.',
      bracket_breakdown: 'No taxable income — no tax calculated.',
    };
  }

  // Calculate tax using progressive brackets
  let totalTax = 0;
  let marginalRate = 0;
  const lines: string[] = [];

  for (const bracket of brackets) {
    if (taxableIncome <= bracket.min) break;
    const taxableInBracket = Math.min(taxableIncome, bracket.max) - bracket.min;
    if (taxableInBracket <= 0) continue;
    const taxInBracket = taxableInBracket * bracket.rate;
    totalTax += taxInBracket;
    marginalRate = bracket.rate;
    const pct = (bracket.rate * 100).toFixed(0) + '%';
    const maxLabel = bracket.max === Infinity ? 'and above' : 'to ' + formatUSD(bracket.max);
    lines.push(
      pct + ' on ' + formatUSD(taxableInBracket) +
      ' (' + formatUSD(bracket.min) + ' ' + maxLabel + ') = ' +
      formatUSD(taxInBracket)
    );
  }

  totalTax = Math.round(totalTax * 100) / 100;
  const effectiveRate = taxableIncome > 0 ? totalTax / taxableIncome : 0;

  const withholding = Math.max(0, Number(i.withholding) || 0);
  const refundOrOwed = withholding - totalTax;
  let refundStatus: string;
  if (withholding === 0) {
    refundStatus = 'No withholding entered — enter withholding to see refund or balance due.';
  } else if (refundOrOwed > 0.005) {
    refundStatus = 'Estimated refund of ' + formatUSD(refundOrOwed);
  } else if (refundOrOwed < -0.005) {
    refundStatus = 'Balance due at filing: ' + formatUSD(Math.abs(refundOrOwed));
  } else {
    refundStatus = 'Withholding exactly covers your tax — no refund, no balance due.';
  }

  const bracket_breakdown = lines.join('\n') +
    '\n─────────────────────────────\n' +
    'Total Tax: ' + formatUSD(totalTax) +
    '  |  Effective Rate: ' + (effectiveRate * 100).toFixed(2) + '%' +
    '  |  Marginal Rate: ' + (marginalRate * 100).toFixed(0) + '%';

  return {
    tax_owed: totalTax,
    effective_rate: Math.round(effectiveRate * 10000) / 10000,
    marginal_rate: marginalRate,
    taxable_income_used: taxableIncome,
    refund_or_owed: Math.round(refundOrOwed * 100) / 100,
    refund_status: refundStatus,
    bracket_breakdown,
  };
}
