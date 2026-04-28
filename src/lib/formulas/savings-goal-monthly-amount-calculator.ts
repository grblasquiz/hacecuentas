export interface Inputs {
  future_value: number;
  present_value: number;
  months: number;
  apy: number;
}

export interface Outputs {
  monthly_payment: number;
  total_contributed: number;
  interest_earned: number;
  interest_percent: number;
  explanation_note: string;
}

export function compute(i: Inputs): Outputs {
  const fv = Number(i.future_value) || 0;
  const pv = Number(i.present_value) || 0;
  const n = Math.round(Number(i.months) || 0);
  const apy = Number(i.apy) || 0;

  // Validate inputs
  if (fv <= 0) {
    return {
      monthly_payment: 0,
      total_contributed: 0,
      interest_earned: 0,
      interest_percent: 0,
      explanation_note: "Enter a savings goal greater than $0."
    };
  }
  if (n <= 0) {
    return {
      monthly_payment: 0,
      total_contributed: 0,
      interest_earned: 0,
      interest_percent: 0,
      explanation_note: "Enter a time horizon of at least 1 month."
    };
  }
  if (pv < 0) {
    return {
      monthly_payment: 0,
      total_contributed: 0,
      interest_earned: 0,
      interest_percent: 0,
      explanation_note: "Current balance cannot be negative."
    };
  }

  // Monthly interest rate derived from APY
  // Source: standard annuity math; APY / 12 / 100
  const r = apy / 12 / 100;

  // Future value of the existing balance after n months of compounding
  const fv_existing = pv * Math.pow(1 + r, n);

  // The gap that monthly deposits must cover
  const gap = fv - fv_existing;

  // If current balance already covers the goal, no deposits needed
  if (gap <= 0) {
    const interest_earned_passive = fv_existing - pv;
    return {
      monthly_payment: 0,
      total_contributed: pv,
      interest_earned: Math.max(0, fv_existing - fv + interest_earned_passive),
      interest_percent: pv > 0 ? Math.min(100, ((fv_existing - pv) / fv) * 100) : 0,
      explanation_note:
        "Your current balance is already on track to reach your goal through interest alone. No additional monthly contributions are needed."
    };
  }

  // PMT formula: periodic payment for future value of ordinary annuity
  // PMT = Gap * r / ((1 + r)^n - 1)  when r > 0
  // PMT = Gap / n                     when r = 0
  let monthly_payment: number;
  if (r === 0) {
    monthly_payment = gap / n;
  } else {
    const growth_factor = Math.pow(1 + r, n);
    monthly_payment = (gap * r) / (growth_factor - 1);
  }

  // Round up to the nearest cent to ensure goal is met
  monthly_payment = Math.ceil(monthly_payment * 100) / 100;

  // Total out-of-pocket contributions (initial balance + all monthly deposits)
  const total_contributed = pv + monthly_payment * n;

  // Interest earned = goal minus total contributed
  const interest_earned = Math.max(0, fv - total_contributed);

  // Percentage of the goal funded by interest
  const interest_percent = fv > 0 ? (interest_earned / fv) * 100 : 0;

  // Human-readable summary
  const years = Math.floor(n / 12);
  const rem_months = n % 12;
  const horizon_str =
    years > 0 && rem_months > 0
      ? `${years} yr ${rem_months} mo`
      : years > 0
      ? `${years} yr`
      : `${n} mo`;

  const explanation_note =
    `Save $${monthly_payment.toFixed(2)}/month for ${horizon_str} at ${apy.toFixed(2)}% APY. ` +
    `You contribute $${total_contributed.toFixed(2)} out of pocket; ` +
    `interest covers $${interest_earned.toFixed(2)} (${interest_percent.toFixed(1)}% of goal).`;

  return {
    monthly_payment,
    total_contributed,
    interest_earned,
    interest_percent,
    explanation_note
  };
}
