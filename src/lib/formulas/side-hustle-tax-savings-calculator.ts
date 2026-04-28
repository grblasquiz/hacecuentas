export interface Inputs {
  gross_income: number;
  business_expenses: number;
  fed_bracket: string;
  state_rate: number;
  apply_qbi: string;
}

export interface Outputs {
  net_profit: number;
  se_tax: number;
  fed_tax: number;
  state_tax: number;
  total_tax: number;
  net_keep: number;
  effective_rate: number;
  quarterly_payment: number;
  breakdown: string;
}

// 2026 constants — IRS Rev. Proc. 2025-28
const SS_WAGE_BASE_2026 = 176100;   // Social Security wage base
const SS_RATE = 0.124;              // 12.4% Social Security
const MEDICARE_RATE = 0.029;        // 2.9% Medicare
const SE_TAX_RATE = SS_RATE + MEDICARE_RATE; // 15.3% total SE tax
const SE_MULTIPLIER = 0.9235;       // Net profit × 92.35% = SE tax base (IRS Schedule SE)
const QBI_RATE = 0.20;              // 20% Qualified Business Income deduction (IRC §199A)

export function compute(i: Inputs): Outputs {
  const grossIncome = Math.max(Number(i.gross_income) || 0, 0);
  const businessExpenses = Math.max(Number(i.business_expenses) || 0, 0);
  const fedBracket = parseFloat(i.fed_bracket) || 0.22;
  const stateRatePct = Math.max(Number(i.state_rate) || 0, 0);
  const stateRate = stateRatePct / 100;
  const applyQbi = i.apply_qbi === "yes";

  // Guard: no income
  if (grossIncome <= 0) {
    return {
      net_profit: 0,
      se_tax: 0,
      fed_tax: 0,
      state_tax: 0,
      total_tax: 0,
      net_keep: 0,
      effective_rate: 0,
      quarterly_payment: 0,
      breakdown: "Enter a gross income amount to see your tax estimate."
    };
  }

  // Step 1: Net profit
  const netProfit = Math.max(grossIncome - businessExpenses, 0);

  if (netProfit < 400) {
    // Below IRS SE tax filing threshold
    return {
      net_profit: netProfit,
      se_tax: 0,
      fed_tax: 0,
      state_tax: 0,
      total_tax: 0,
      net_keep: netProfit,
      effective_rate: 0,
      quarterly_payment: 0,
      breakdown: "Net profit is below $400. No self-employment tax is owed (IRS threshold). Report income on Schedule C but no SE tax applies."
    };
  }

  // Step 2: SE tax base (92.35% of net profit)
  // Cap SS portion at $176,100 wage base; Medicare is unlimited
  const seBase = netProfit * SE_MULTIPLIER;
  const ssBase = Math.min(seBase, SS_WAGE_BASE_2026);
  const ssTax = ssBase * SS_RATE;
  const medicareTax = seBase * MEDICARE_RATE;
  const seTax = ssTax + medicareTax;

  // Step 3: Above-the-line deduction — half of SE tax (Schedule 1, Line 15)
  const halfSEDeduction = seTax / 2;

  // Step 4: QBI deduction — 20% of (net profit − half SE deduction)
  // Simplified: applies when user indicates eligibility
  const qbiBase = Math.max(netProfit - halfSEDeduction, 0);
  const qbiDeduction = applyQbi ? qbiBase * QBI_RATE : 0;

  // Step 5: Taxable side income for federal income tax
  const taxableSideIncome = Math.max(netProfit - halfSEDeduction - qbiDeduction, 0);

  // Step 6: Federal income tax on side income (marginal bracket applied to taxable side income)
  const fedTax = taxableSideIncome * fedBracket;

  // Step 7: State income tax on net profit (flat rate; no state-specific deductions modeled)
  const stateTax = netProfit * stateRate;

  // Step 8: Totals
  const totalTax = seTax + fedTax + stateTax;
  const netKeep = netProfit - totalTax;
  const effectiveRate = netProfit > 0 ? totalTax / netProfit : 0;
  const quarterlyPayment = totalTax / 4;

  // Step 9: Breakdown text
  const fedBracketPct = (fedBracket * 100).toFixed(0);
  const stateRateDisplay = stateRatePct.toFixed(1);
  const qbiNote = applyQbi
    ? `QBI deduction applied: $${qbiDeduction.toFixed(2)} (20% of $${qbiBase.toFixed(2)})`
    : "QBI deduction not applied.";
  const ssCapNote = seBase > SS_WAGE_BASE_2026
    ? ` (SS capped at $${SS_WAGE_BASE_2026.toLocaleString()} wage base)`
    : "";

  const breakdown =
    `Net Profit: $${netProfit.toFixed(2)}\n` +
    `SE Tax Base (×0.9235): $${seBase.toFixed(2)}${ssCapNote}\n` +
    `Self-Employment Tax (15.3%): $${seTax.toFixed(2)}\n` +
    `  → Half SE Tax Deduction: -$${halfSEDeduction.toFixed(2)}\n` +
    `  → ${qbiNote}\n` +
    `Taxable Side Income (for fed): $${taxableSideIncome.toFixed(2)}\n` +
    `Federal Income Tax (${fedBracketPct}% bracket): $${fedTax.toFixed(2)}\n` +
    `State Income Tax (${stateRateDisplay}%): $${stateTax.toFixed(2)}\n` +
    `Total Tax: $${totalTax.toFixed(2)} | Effective Rate: ${(effectiveRate * 100).toFixed(1)}%\n` +
    `Net You Keep: $${netKeep.toFixed(2)}\n` +
    `Quarterly Estimated Payment (Form 1040-ES): $${quarterlyPayment.toFixed(2)}`;

  return {
    net_profit: parseFloat(netProfit.toFixed(2)),
    se_tax: parseFloat(seTax.toFixed(2)),
    fed_tax: parseFloat(fedTax.toFixed(2)),
    state_tax: parseFloat(stateTax.toFixed(2)),
    total_tax: parseFloat(totalTax.toFixed(2)),
    net_keep: parseFloat(netKeep.toFixed(2)),
    effective_rate: parseFloat((effectiveRate * 100).toFixed(2)),
    quarterly_payment: parseFloat(quarterlyPayment.toFixed(2)),
    breakdown
  };
}
