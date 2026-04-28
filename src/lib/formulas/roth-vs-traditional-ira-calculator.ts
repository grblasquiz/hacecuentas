// Roth vs Traditional IRA Calculator
// 2026 IRS contribution limits: $7,000 (under 50) / $8,000 (50+)
// Source: IRS Publication 590-A, IRS Retirement Topics — IRA Contribution Limits

export interface Inputs {
  current_age: number;
  retirement_age: number;
  annual_contribution: number;
  current_tax_rate: number;
  retirement_tax_rate: number;
  annual_return: number;
  age_50_or_older: string; // "yes" | "no"
}

export interface Outputs {
  roth_balance: number;
  traditional_balance_after_tax: number;
  traditional_balance_pretax: number;
  tax_savings_now: number;
  difference: number;
  recommendation: string;
  years_of_growth: number;
  contribution_used: number;
}

// IRS 2026 contribution limits
const IRA_LIMIT_UNDER_50 = 7000; // Source: IRS Rev. Proc. 2025-xx
const IRA_LIMIT_50_PLUS = 8000;  // Includes $1,000 catch-up contribution

export function compute(i: Inputs): Outputs {
  const currentAge = Math.floor(Number(i.current_age) || 0);
  const retirementAge = Math.floor(Number(i.retirement_age) || 0);
  const rawContribution = Number(i.annual_contribution) || 0;
  const currentTaxRate = Number(i.current_tax_rate) || 0;
  const retirementTaxRate = Number(i.retirement_tax_rate) || 0;
  const annualReturn = Number(i.annual_return) || 0;
  const isCatchUp = i.age_50_or_older === "yes";

  // Defaults / guard rails
  const defaultOut: Outputs = {
    roth_balance: 0,
    traditional_balance_after_tax: 0,
    traditional_balance_pretax: 0,
    tax_savings_now: 0,
    difference: 0,
    recommendation: "Please enter valid inputs to see a recommendation.",
    years_of_growth: 0,
    contribution_used: 0,
  };

  if (currentAge <= 0 || retirementAge <= currentAge) {
    return {
      ...defaultOut,
      recommendation: "Retirement age must be greater than current age.",
    };
  }

  if (annualReturn < 0) {
    return {
      ...defaultOut,
      recommendation: "Expected return cannot be negative.",
    };
  }

  if (currentTaxRate < 0 || currentTaxRate > 100 || retirementTaxRate < 0 || retirementTaxRate > 100) {
    return {
      ...defaultOut,
      recommendation: "Tax rates must be between 0 and 100.",
    };
  }

  // Cap contribution to IRS 2026 limit
  const irsLimit = isCatchUp ? IRA_LIMIT_50_PLUS : IRA_LIMIT_UNDER_50;
  const contribution = Math.min(Math.max(rawContribution, 0), irsLimit);

  if (contribution <= 0) {
    return {
      ...defaultOut,
      recommendation: "Enter a contribution amount greater than $0.",
    };
  }

  const n = retirementAge - currentAge; // years of growth
  const r = annualReturn / 100;
  const tNow = currentTaxRate / 100;
  const tRet = retirementTaxRate / 100;

  // Future value of ordinary annuity: FV = C × [(1+r)^n − 1] / r
  // Special case when r = 0: FV = C × n
  let fv: number;
  if (r === 0) {
    fv = contribution * n;
  } else {
    fv = contribution * ((Math.pow(1 + r, n) - 1) / r);
  }

  // Roth IRA: contributions paid with after-tax dollars → withdrawals are tax-free
  const rothBalance = fv;

  // Traditional IRA: pre-tax contributions → withdrawals taxed at retirement rate
  const traditionalPreTax = fv;
  const traditionalAfterTax = fv * (1 - tRet);

  // Tax savings from Traditional IRA deductions over the contribution years
  const taxSavingsNow = contribution * tNow * n;

  // Net difference (positive = Roth wins, negative = Traditional wins)
  const difference = rothBalance - traditionalAfterTax;

  // Build recommendation string
  let recommendation: string;
  const absDiff = Math.abs(difference);
  const formattedDiff = absDiff.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

  if (Math.abs(difference) < 1) {
    recommendation =
      "Both accounts produce an identical after-tax balance. When your current and retirement tax rates are equal, neither type has a mathematical advantage. Consider Roth for its tax-free growth, RMD exemption, and withdrawal flexibility.";
  } else if (difference > 0) {
    recommendation =
      `The Roth IRA comes out ahead by ${formattedDiff} after tax. Your retirement tax rate (${retirementTaxRate}%) is equal to or higher than your current rate (${currentTaxRate}%), so paying taxes now is the better deal. The Roth also has no Required Minimum Distributions starting at age 73.`;
  } else {
    recommendation =
      `The Traditional IRA comes out ahead by ${formattedDiff} after tax. Your retirement tax rate (${retirementTaxRate}%) is lower than your current rate (${currentTaxRate}%), so deferring taxes is the better deal. Keep in mind Traditional IRAs require minimum distributions (RMDs) starting at age 73, which may push you into a higher bracket.`;
  }

  return {
    roth_balance: Math.round(rothBalance * 100) / 100,
    traditional_balance_after_tax: Math.round(traditionalAfterTax * 100) / 100,
    traditional_balance_pretax: Math.round(traditionalPreTax * 100) / 100,
    tax_savings_now: Math.round(taxSavingsNow * 100) / 100,
    difference: Math.round(difference * 100) / 100,
    recommendation,
    years_of_growth: n,
    contribution_used: contribution,
  };
}
