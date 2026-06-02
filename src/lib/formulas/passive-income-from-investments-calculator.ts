export interface Inputs {
  portfolio_value: number;
  pct_bonds: number;
  pct_dividend: number;
  pct_reits: number;
  pct_hysa: number;
  pct_tbills: number;
  withdrawal_strategy: string;
  account_type: string;
  tax_bracket: string;
}

export interface Outputs {
  monthly_income_gross: number;
  annual_income_gross: number;
  blended_yield: number;
  annual_tax_estimate: number;
  monthly_income_net: number;
  allocation_note: string;
  _insight?: any;
  _chart?: any;
}

// 2026 benchmark yields per asset class
// Sources: TreasuryDirect, Vanguard, NAREIT, FDIC
const YIELD_BONDS = 0.040;       // Aggregate bond fund ~4.0%
const YIELD_DIVIDEND = 0.030;    // S&P 500 dividend yield ~3.0%
const YIELD_REITS = 0.050;       // REIT index payout ~5.0%
const YIELD_HYSA = 0.045;        // High-yield savings / money market ~4.5%
const YIELD_TBILLS = 0.048;      // 4-week to 1-year T-Bills ~4.8%

// Withdrawal rate for the 4% rule (Bengen 1994 / Trinity Study)
const FOUR_PERCENT_RATE = 0.04;

export function compute(i: Inputs): Outputs {
  const portfolio = Math.max(Number(i.portfolio_value) || 0, 0);
  const pBonds = Math.max(Number(i.pct_bonds) || 0, 0);
  const pDiv = Math.max(Number(i.pct_dividend) || 0, 0);
  const pREIT = Math.max(Number(i.pct_reits) || 0, 0);
  const pHYSA = Math.max(Number(i.pct_hysa) || 0, 0);
  const pTBills = Math.max(Number(i.pct_tbills) || 0, 0);
  const strategy = i.withdrawal_strategy || "yield_only";
  const accountType = i.account_type || "taxable";
  const bracketPct = Number(i.tax_bracket) || 22;

  if (portfolio <= 0) {
    return {
      monthly_income_gross: 0,
      annual_income_gross: 0,
      blended_yield: 0,
      annual_tax_estimate: 0,
      monthly_income_net: 0,
      allocation_note: "Enter a portfolio value greater than $0 to see results."
    };
  }

  // Allocation validation
  const totalAllocation = pBonds + pDiv + pREIT + pHYSA + pTBills;
  let allocationNote = "";

  if (Math.abs(totalAllocation - 100) > 0.5) {
    allocationNote = `⚠️ Your allocations sum to ${totalAllocation.toFixed(1)}%, not 100%. Results are proportionally scaled but may not reflect your intended portfolio.`;
  } else {
    allocationNote = `✅ Allocations sum to ${totalAllocation.toFixed(1)}%. Yields: Bonds ${(YIELD_BONDS*100).toFixed(1)}%, Dividends ${(YIELD_DIVIDEND*100).toFixed(1)}%, REITs ${(YIELD_REITS*100).toFixed(1)}%, HYSA ${(YIELD_HYSA*100).toFixed(1)}%, T-Bills ${(YIELD_TBILLS*100).toFixed(1)}%.`;
  }

  // Blended yield weighted by allocation percentages
  // If allocations don't sum to 100, we still compute the weighted average
  // using the actual sum as denominator so the blended yield is meaningful
  const effectiveTotal = totalAllocation > 0 ? totalAllocation : 100;
  const blendedYield =
    (pBonds * YIELD_BONDS +
      pDiv * YIELD_DIVIDEND +
      pREIT * YIELD_REITS +
      pHYSA * YIELD_HYSA +
      pTBills * YIELD_TBILLS) /
    effectiveTotal;

  // Annual gross income depends on withdrawal strategy
  let annualIncomeGross: number;
  if (strategy === "four_percent") {
    annualIncomeGross = portfolio * FOUR_PERCENT_RATE;
  } else {
    // yield_only: spend only what the portfolio earns
    annualIncomeGross = portfolio * blendedYield;
  }

  const monthlyIncomeGross = annualIncomeGross / 12;

  // Tax estimate — only for taxable accounts
  // Applied as flat marginal rate (conservative; LTCG/qualified dividends
  // are taxed at 0–20% in practice — see IRS Pub 550)
  let annualTaxEstimate = 0;
  let monthlyIncomeNet = monthlyIncomeGross;

  if (accountType === "taxable") {
    annualTaxEstimate = annualIncomeGross * (bracketPct / 100);
    monthlyIncomeNet = (annualIncomeGross - annualTaxEstimate) / 12;
  }

  const monthlyNetRounded = Math.round(monthlyIncomeNet * 100) / 100;
  const annualNetRounded = Math.round((annualIncomeGross - annualTaxEstimate) * 100) / 100;
  const yieldPct = (blendedYield * 100).toFixed(2);

  const fmtUsd = (n: number) =>
    "$" + Math.round(n).toLocaleString("en-US");

  const strategyLabel =
    strategy === "four_percent" ? "the 4% rule" : "a yield-only strategy";

  // Insight: interpret the monthly net income the portfolio throws off.
  let insText: string;
  let insTone: "good" | "warn" | "neutral";
  if (accountType === "taxable" && annualTaxEstimate > 0) {
    const taxPctOfGross =
      annualIncomeGross > 0 ? (annualTaxEstimate / annualIncomeGross) * 100 : 0;
    insText =
      `At a **${yieldPct}%** blended yield with ${strategyLabel}, your portfolio throws off **${fmtUsd(monthlyNetRounded)}/month** after an estimated **${fmtUsd(annualTaxEstimate)}/yr** in tax (~${taxPctOfGross.toFixed(0)}% of income). Holding income assets in a tax-advantaged account could meaningfully raise your take-home.`;
    insTone = "warn";
  } else {
    insText =
      `At a **${yieldPct}%** blended yield with ${strategyLabel}, your portfolio generates **${fmtUsd(monthlyNetRounded)}/month** (**${fmtUsd(annualNetRounded)}/yr**) — tax-free in this account type, so every dollar earned is yours to spend or reinvest.`;
    insTone = "good";
  }

  const _insight = {
    title: "What your money pays you",
    text: insText,
    tone: insTone,
    icon: "💵",
  };

  // Donut only when there's a real net-vs-tax split to show.
  let _chart: any = undefined;
  if (accountType === "taxable" && annualTaxEstimate > 0 && annualIncomeGross > 0) {
    _chart = {
      type: "doughnut",
      slices: [
        { label: "Net income (you keep)", value: annualNetRounded },
        { label: "Estimated tax", value: Math.round(annualTaxEstimate * 100) / 100 },
      ],
      prefix: "$",
      centerValue: fmtUsd(annualIncomeGross),
      centerLabel: "Gross / yr",
      ariaLabel: `Annual gross income of ${fmtUsd(annualIncomeGross)} split into ${fmtUsd(annualNetRounded)} net and ${fmtUsd(annualTaxEstimate)} estimated tax`,
    };
  }

  return {
    monthly_income_gross: Math.round(monthlyIncomeGross * 100) / 100,
    annual_income_gross: Math.round(annualIncomeGross * 100) / 100,
    blended_yield: Math.round(blendedYield * 100000) / 100000, // 3 decimal places as fraction
    annual_tax_estimate: Math.round(annualTaxEstimate * 100) / 100,
    monthly_income_net: monthlyNetRounded,
    allocation_note: allocationNote,
    _insight,
    ...(_chart ? { _chart } : {}),
  };
}
