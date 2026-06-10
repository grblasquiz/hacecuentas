// Roth vs Traditional IRA Calculator
// 2026 IRS contribution limits: $7,500 (under 50) / $8,600 (50+, with $1,100 catch-up)
// Source: IRS Notice 2025-67 (Nov 2025), IRS Publication 590-A — fuente única src/lib/data/usa-2026.ts
//
// Methodology (equal out-of-pocket comparison):
//   Roth: contribute C after-tax → withdrawals tax-free → rothTotal = FV(C).
//   Traditional: contribute C pre-tax → withdrawals taxed at retirement rate,
//   AND the annual tax savings (C × currentRate) are invested at the same
//   return in a side account → tradTotal = FV(C)·(1−tRet) + FV(C·tNow).
//   Simplification (documented): the side account is modeled without taxes on
//   its own growth (as if it grew tax-free). With this, Traditional wins when
//   the retirement tax rate is LOWER than the current rate, and Roth wins when
//   it is higher — the standard textbook result.

import { IRA_2026 } from "../data/usa-2026";

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
  tax_savings_invested: number;
  difference: number;
  recommendation: string;
  years_of_growth: number;
  contribution_used: number;
  _insight?: any;
}

// IRS 2026 contribution limits — Notice 2025-67 (fuente única usa-2026.ts)
const IRA_LIMIT_UNDER_50 = IRA_2026.limit; // $7,500 — §219(b)(5)(A), 2026
const IRA_LIMIT_50_PLUS = IRA_2026.limit + IRA_2026.catchUp50; // $8,600 con catch-up (§219(b)(5)(B))

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
    tax_savings_invested: 0,
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
  // (nominal sum, not invested)
  const taxSavingsNow = contribution * tNow * n;

  // Equal out-of-pocket comparison: each year's tax saving (contribution × tNow)
  // is invested at the same return r → FV of that annuity = fv × tNow.
  // Simplification (documented in the methodology): the side account is modeled
  // without taxes on its own growth.
  const taxSavingsInvested = fv * tNow;
  const traditionalTotal = traditionalAfterTax + taxSavingsInvested;

  // Net difference (positive = Roth wins, negative = Traditional wins).
  // difference = fv·(tRet − tNow): Roth wins when the retirement rate is HIGHER
  // than the current rate; Traditional wins when it is LOWER.
  const difference = rothBalance - traditionalTotal;

  // Build recommendation string
  let recommendation: string;
  const absDiff = Math.abs(difference);
  const formattedDiff = absDiff.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

  if (Math.abs(difference) < 1) {
    recommendation =
      "Both accounts produce an identical after-tax result. When your current and retirement tax rates are equal, neither type has a mathematical advantage. Consider Roth for its tax-free growth, RMD exemption, and withdrawal flexibility.";
  } else if (difference > 0) {
    recommendation =
      `The Roth IRA comes out ahead by ${formattedDiff} after tax. Your retirement tax rate (${retirementTaxRate}%) is higher than your current rate (${currentTaxRate}%), so paying taxes now — while your rate is low — is the better deal. The Roth also has no Required Minimum Distributions starting at age 73.`;
  } else {
    recommendation =
      `The Traditional IRA comes out ahead by ${formattedDiff} after tax (IRA balance after taxes plus the invested tax savings). Your retirement tax rate (${retirementTaxRate}%) is lower than your current rate (${currentTaxRate}%), so deferring taxes is the better deal. Keep in mind Traditional IRAs require minimum distributions (RMDs) starting at age 73, which may push you into a higher bracket.`;
  }

  const fmtUsd = (x: number) =>
    x.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

  const winnerIsRoth = difference > 0;
  const tie = Math.abs(difference) < 1;
  const insight = {
    title: tie ? "It's a tie" : winnerIsRoth ? "Roth comes out ahead" : "Traditional comes out ahead",
    text: tie
      ? `With equal tax rates now and at retirement, both end at **${fmtUsd(rothBalance)}** after tax over **${n} years**. Pick Roth for tax-free growth and no RMDs.`
      : winnerIsRoth
      ? `After **${n} years** the Roth nets **${fmtUsd(rothBalance)}** tax-free vs **${fmtUsd(traditionalTotal)}** from the Traditional (after-tax balance plus invested tax savings) — a **${formattedDiff}** edge because your retirement rate (${retirementTaxRate}%) is higher than your current rate (${currentTaxRate}%).`
      : `After **${n} years** the Traditional route nets **${fmtUsd(traditionalTotal)}** (**${fmtUsd(traditionalAfterTax)}** after-tax balance + **${fmtUsd(taxSavingsInvested)}** from investing the yearly tax savings) vs **${fmtUsd(rothBalance)}** from the Roth — a **${formattedDiff}** edge because your retirement rate (${retirementTaxRate}%) is lower than your current rate (${currentTaxRate}%). Watch out for RMDs at 73.`,
    tone: winnerIsRoth || tie ? "good" : "neutral",
    icon: "🏦",
  };

  return {
    roth_balance: Math.round(rothBalance * 100) / 100,
    traditional_balance_after_tax: Math.round(traditionalAfterTax * 100) / 100,
    traditional_balance_pretax: Math.round(traditionalPreTax * 100) / 100,
    tax_savings_now: Math.round(taxSavingsNow * 100) / 100,
    tax_savings_invested: Math.round(taxSavingsInvested * 100) / 100,
    difference: Math.round(difference * 100) / 100,
    recommendation,
    years_of_growth: n,
    contribution_used: contribution,
    _insight: insight,
  };
}
