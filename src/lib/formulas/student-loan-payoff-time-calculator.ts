export interface Inputs {
  balance: number;
  apr: number;
  monthly_payment: number;
  extra_payment: number;
}

export interface Outputs {
  months_without_extra: number;
  months_with_extra: number;
  months_saved: number;
  interest_without_extra: number;
  interest_with_extra: number;
  interest_saved: number;
  payoff_date_without_extra: string;
  payoff_date_with_extra: string;
}

// Federal undergraduate Direct Loan rate 2025-2026 per studentaid.gov
const DEFAULT_APR_2026 = 6.53;

/**
 * Formats a future date (offset by `months` from today) as "Month YYYY".
 */
function formatPayoffDate(months: number): string {
  if (!isFinite(months) || months <= 0) return "N/A";
  const date = new Date();
  date.setMonth(date.getMonth() + Math.ceil(months));
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

/**
 * Computes months to pay off a fixed-rate loan.
 * Formula: n = -ln(1 - (r * P) / M) / ln(1 + r)
 * Returns Infinity if the payment does not exceed monthly interest.
 */
function monthsToPayoff(principal: number, monthlyRate: number, payment: number): number {
  if (monthlyRate <= 0) {
    // No interest: simple division
    if (payment <= 0) return Infinity;
    return principal / payment;
  }
  const monthlyInterest = monthlyRate * principal;
  if (payment <= monthlyInterest) {
    // Payment doesn't cover interest — balance grows forever
    return Infinity;
  }
  const n = -Math.log(1 - monthlyInterest / payment) / Math.log(1 + monthlyRate);
  return n;
}

export function compute(i: Inputs): Outputs {
  const balance = Number(i.balance) || 0;
  const apr = Number(i.apr) || DEFAULT_APR_2026;
  const monthly_payment = Number(i.monthly_payment) || 0;
  const extra_payment = Math.max(Number(i.extra_payment) || 0, 0);

  const errorResult: Outputs = {
    months_without_extra: 0,
    months_with_extra: 0,
    months_saved: 0,
    interest_without_extra: 0,
    interest_with_extra: 0,
    interest_saved: 0,
    payoff_date_without_extra: "Enter valid inputs",
    payoff_date_with_extra: "Enter valid inputs",
  };

  if (balance <= 0) {
    return {
      ...errorResult,
      payoff_date_without_extra: "Enter a valid balance",
      payoff_date_with_extra: "Enter a valid balance",
    };
  }

  if (apr < 0) {
    return {
      ...errorResult,
      payoff_date_without_extra: "APR cannot be negative",
      payoff_date_with_extra: "APR cannot be negative",
    };
  }

  if (monthly_payment <= 0) {
    return {
      ...errorResult,
      payoff_date_without_extra: "Enter a valid monthly payment",
      payoff_date_with_extra: "Enter a valid monthly payment",
    };
  }

  const monthlyRate = apr / 12 / 100;

  // --- Without extra payment ---
  const nRaw = monthsToPayoff(balance, monthlyRate, monthly_payment);

  if (!isFinite(nRaw)) {
    return {
      ...errorResult,
      payoff_date_without_extra: "Payment too low — balance grows each month",
      payoff_date_with_extra: "Payment too low — balance grows each month",
    };
  }

  const n = Math.ceil(nRaw);
  // Total interest: sum of all payments minus original principal
  // For exact last payment, use simulation-style correction
  const interest_without_extra = Math.max(n * monthly_payment - balance, 0);

  // --- With extra payment ---
  const total_payment = monthly_payment + extra_payment;
  const nExtraRaw = monthsToPayoff(balance, monthlyRate, total_payment);
  const nExtra = isFinite(nExtraRaw) ? Math.ceil(nExtraRaw) : n;
  const interest_with_extra = isFinite(nExtraRaw)
    ? Math.max(nExtra * total_payment - balance, 0)
    : interest_without_extra;

  const months_saved = Math.max(n - nExtra, 0);
  const interest_saved = Math.max(interest_without_extra - interest_with_extra, 0);

  return {
    months_without_extra: n,
    months_with_extra: nExtra,
    months_saved,
    interest_without_extra: Math.round(interest_without_extra * 100) / 100,
    interest_with_extra: Math.round(interest_with_extra * 100) / 100,
    interest_saved: Math.round(interest_saved * 100) / 100,
    payoff_date_without_extra: formatPayoffDate(n),
    payoff_date_with_extra: isFinite(nExtraRaw) ? formatPayoffDate(nExtra) : "N/A",
  };
}
