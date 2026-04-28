export interface Inputs {
  balance: number;
  apr: number;
  mode: string; // 'payment_to_months' | 'months_to_payment'
  monthly_payment: number;
  target_months: number;
}

export interface Outputs {
  months_to_payoff: number;
  total_interest: number;
  total_paid: number;
  required_payment: number;
  interest_ratio: number;
  payoff_summary: string;
}

// Default APR reflects US Federal Reserve G.19 average for accounts assessed interest, 2025-2026
const DEFAULT_APR_2026 = 22.5;

export function compute(i: Inputs): Outputs {
  const balance = Number(i.balance) || 0;
  const apr = Number(i.apr) ?? DEFAULT_APR_2026;
  const mode = i.mode || 'payment_to_months';
  const monthlyPaymentInput = Number(i.monthly_payment) || 0;
  const targetMonths = Math.round(Number(i.target_months) || 24);

  const EMPTY: Outputs = {
    months_to_payoff: 0,
    total_interest: 0,
    total_paid: 0,
    required_payment: 0,
    interest_ratio: 0,
    payoff_summary: 'Enter a valid balance and APR to calculate.',
  };

  if (balance <= 0) {
    return { ...EMPTY, payoff_summary: 'Enter a balance greater than $0.' };
  }
  if (apr < 0) {
    return { ...EMPTY, payoff_summary: 'APR cannot be negative.' };
  }

  const monthlyRate = apr / 100 / 12;

  // ── MODE 1: Fixed payment → months to payoff ──────────────────────────────
  if (mode === 'payment_to_months') {
    const payment = monthlyPaymentInput;

    if (payment <= 0) {
      return { ...EMPTY, payoff_summary: 'Enter a monthly payment greater than $0.' };
    }

    // Special case: 0% APR
    if (monthlyRate === 0) {
      const months = Math.ceil(balance / payment);
      const totalPaid = balance; // no interest
      return {
        months_to_payoff: months,
        total_interest: 0,
        total_paid: totalPaid,
        required_payment: payment,
        interest_ratio: 0,
        payoff_summary:
          `At 0% APR, paying $${payment.toFixed(2)}/month, you will pay off $${balance.toFixed(2)} in ${months} month${months !== 1 ? 's' : ''} with $0 in interest.`,
      };
    }

    // Check if payment covers at least one month of interest
    const firstMonthInterest = balance * monthlyRate;
    if (payment <= firstMonthInterest) {
      return {
        ...EMPTY,
        payoff_summary:
          `Payment too low. At ${apr}% APR on a $${balance.toFixed(2)} balance, the first month's interest alone is $${firstMonthInterest.toFixed(2)}. Increase your payment above $${(firstMonthInterest + 0.01).toFixed(2)}/month.`,
      };
    }

    // n = -log(1 - (balance * r) / payment) / log(1 + r)
    const numerator = Math.log(1 - (balance * monthlyRate) / payment);
    const denominator = Math.log(1 + monthlyRate);
    const exactMonths = -numerator / denominator;
    const months = Math.ceil(exactMonths);

    // Total paid: full payments for (months-1) periods + remainder in final month
    // Simulate final month to avoid over-counting by a fraction
    let remainingBalance = balance;
    let totalInterestAccrued = 0;
    for (let m = 0; m < months; m++) {
      const interestThisMonth = remainingBalance * monthlyRate;
      totalInterestAccrued += interestThisMonth;
      remainingBalance = remainingBalance + interestThisMonth - payment;
      if (remainingBalance <= 0) {
        // Last payment is smaller
        remainingBalance = 0;
        break;
      }
    }
    // totalInterestAccrued may be slightly off due to loop ceiling; recalc cleanly
    // Use exact formula: totalPaid = payment*(months-1) + finalPayment
    // Recalculate via simulation result
    const simulatedTotalPaid = (months - 1) * payment + Math.max(0, payment + remainingBalance);
    const totalInterest = Math.max(0, simulatedTotalPaid - balance);
    const interestRatio = balance > 0 ? (totalInterest / balance) * 100 : 0;

    const summary =
      `At ${apr}% APR, paying $${payment.toFixed(2)}/month, you will pay off $${balance.toFixed(2)} in ${months} month${months !== 1 ? 's' : ''} ` +
      `(${ Math.floor(months / 12) > 0 ? Math.floor(months / 12) + ' yr ' : ''}${months % 12 > 0 ? (months % 12) + ' mo' : ''}) ` +
      `and pay $${totalInterest.toFixed(2)} in interest — ${interestRatio.toFixed(1)}% of your original balance.`;

    return {
      months_to_payoff: months,
      total_interest: Math.round(totalInterest * 100) / 100,
      total_paid: Math.round(simulatedTotalPaid * 100) / 100,
      required_payment: payment,
      interest_ratio: Math.round(interestRatio * 100) / 100,
      payoff_summary: summary,
    };
  }

  // ── MODE 2: Target months → required monthly payment ──────────────────────
  if (mode === 'months_to_payment') {
    if (targetMonths <= 0) {
      return { ...EMPTY, payoff_summary: 'Enter a target payoff period greater than 0 months.' };
    }

    let payment: number;

    if (monthlyRate === 0) {
      payment = balance / targetMonths;
    } else {
      // payment = balance * r * (1+r)^n / ((1+r)^n - 1)
      const factor = Math.pow(1 + monthlyRate, targetMonths);
      payment = (balance * monthlyRate * factor) / (factor - 1);
    }

    const totalPaid = payment * targetMonths;
    const totalInterest = Math.max(0, totalPaid - balance);
    const interestRatio = balance > 0 ? (totalInterest / balance) * 100 : 0;
    const years = Math.floor(targetMonths / 12);
    const remainingMos = targetMonths % 12;
    const periodLabel =
      years > 0
        ? `${years} year${years !== 1 ? 's' : ''}${remainingMos > 0 ? ' ' + remainingMos + ' month' + (remainingMos !== 1 ? 's' : '') : ''}`
        : `${targetMonths} month${targetMonths !== 1 ? 's' : ''}`;

    const summary =
      `To pay off $${balance.toFixed(2)} in ${periodLabel} at ${apr}% APR, ` +
      `you need to pay $${payment.toFixed(2)}/month. ` +
      `Total interest: $${totalInterest.toFixed(2)} (${interestRatio.toFixed(1)}% of original balance).`;

    return {
      months_to_payoff: targetMonths,
      total_interest: Math.round(totalInterest * 100) / 100,
      total_paid: Math.round(totalPaid * 100) / 100,
      required_payment: Math.round(payment * 100) / 100,
      interest_ratio: Math.round(interestRatio * 100) / 100,
      payoff_summary: summary,
    };
  }

  return { ...EMPTY, payoff_summary: 'Select a calculation mode.' };
}
