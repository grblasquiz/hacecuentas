export interface Inputs {
  current_balance: number;
  current_rate: number;
  current_remaining_months: number;
  new_rate: number;
  new_term_months: string;
  closing_costs: number;
}

export interface Outputs {
  current_monthly_payment: number;
  new_monthly_payment: number;
  monthly_savings: number;
  break_even_months: number;
  total_interest_current: number;
  total_interest_new: number;
  total_interest_saved: number;
  recommendation: string;
}

/**
 * Standard fixed-rate amortization monthly payment formula:
 * M = P * [r(1+r)^n] / [(1+r)^n - 1]
 * where r = monthly rate, n = term in months, P = principal
 */
function monthlyPayment(principal: number, annualRatePct: number, termMonths: number): number {
  if (principal <= 0 || termMonths <= 0) return 0;
  const r = annualRatePct / 100 / 12;
  if (r === 0) return principal / termMonths;
  const factor = Math.pow(1 + r, termMonths);
  return (principal * r * factor) / (factor - 1);
}

export function compute(i: Inputs): Outputs {
  const balance = Number(i.current_balance) || 0;
  const currentRate = Number(i.current_rate) || 0;
  const remainingMonths = Math.round(Number(i.current_remaining_months) || 0);
  const newRate = Number(i.new_rate) || 0;
  const newTermMonths = Math.round(Number(i.new_term_months) || 360);
  const closingCosts = Number(i.closing_costs) || 0;

  // Defensive: require positive balance and terms
  if (balance <= 0 || remainingMonths <= 0 || newTermMonths <= 0) {
    return {
      current_monthly_payment: 0,
      new_monthly_payment: 0,
      monthly_savings: 0,
      break_even_months: 0,
      total_interest_current: 0,
      total_interest_new: 0,
      total_interest_saved: 0,
      recommendation: "Please enter a valid loan balance and term.",
    };
  }

  if (currentRate <= 0 || newRate <= 0) {
    return {
      current_monthly_payment: 0,
      new_monthly_payment: 0,
      monthly_savings: 0,
      break_even_months: 0,
      total_interest_current: 0,
      total_interest_new: 0,
      total_interest_saved: 0,
      recommendation: "Please enter valid interest rates greater than 0%.",
    };
  }

  // Step 1: Compute monthly payments
  const currentPayment = monthlyPayment(balance, currentRate, remainingMonths);
  const newPayment = monthlyPayment(balance, newRate, newTermMonths);

  // Step 2: Monthly savings (can be negative if new payment is higher)
  const savings = currentPayment - newPayment;

  // Step 3: Break-even months
  // If savings <= 0, break-even is not applicable (refinancing to shorter term scenario)
  let breakEvenMonths = 0;
  if (savings > 0 && closingCosts > 0) {
    breakEvenMonths = Math.ceil(closingCosts / savings);
  } else if (savings > 0 && closingCosts <= 0) {
    breakEvenMonths = 0; // No-cost refi: immediate break-even
  } else {
    // savings <= 0: monthly payment increases (e.g., shorter term)
    breakEvenMonths = 0;
  }

  // Step 4: Total interest over respective terms
  const totalInterestCurrent = currentPayment * remainingMonths - balance;
  const totalInterestNew = newPayment * newTermMonths - balance;
  const totalInterestSaved = totalInterestCurrent - totalInterestNew;

  // Step 5: Recommendation text
  let recommendation = "";

  if (savings <= 0) {
    // Higher payment — shorter-term refi
    const additionalMonthly = Math.abs(savings);
    if (totalInterestSaved > 0) {
      recommendation =
        `Your new monthly payment is $${additionalMonthly.toFixed(2)} higher, but you save $${totalInterestSaved.toFixed(2)} in total interest over the life of the loan. This makes sense if you can afford the higher payment and want to pay off your home faster.`;
    } else {
      recommendation =
        `Your new monthly payment is higher and total interest savings are negative. This refinance may not be financially advantageous — review the rate and term carefully.`;
    }
  } else if (closingCosts <= 0) {
    recommendation =
      `With no upfront closing costs, your break-even is immediate. You save $${savings.toFixed(2)}/month and $${totalInterestSaved.toFixed(2)} in total interest over the new loan term.`;
  } else {
    const breakEvenYears = (breakEvenMonths / 12).toFixed(1);
    if (totalInterestSaved < 0) {
      recommendation =
        `You break even on closing costs in ${breakEvenMonths} months (${breakEvenYears} yrs), but extending your term increases total interest paid by $${Math.abs(totalInterestSaved).toFixed(2)}. Consider a shorter new term to offset this.`;
    } else {
      recommendation =
        `You break even in ${breakEvenMonths} months (${breakEvenYears} yrs). If you plan to stay in your home longer than that, refinancing saves you $${savings.toFixed(2)}/month and $${totalInterestSaved.toFixed(2)} in total interest.`;
    }
  }

  return {
    current_monthly_payment: Math.round(currentPayment * 100) / 100,
    new_monthly_payment: Math.round(newPayment * 100) / 100,
    monthly_savings: Math.round(savings * 100) / 100,
    break_even_months: breakEvenMonths,
    total_interest_current: Math.round(totalInterestCurrent * 100) / 100,
    total_interest_new: Math.round(totalInterestNew * 100) / 100,
    total_interest_saved: Math.round(totalInterestSaved * 100) / 100,
    recommendation,
  };
}
