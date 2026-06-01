export interface Inputs {
  present_value: number;
  annual_rate: number;
  input_mode: string;
  payout_years: number;
  current_age: number;
  end_age: number;
}

export interface Outputs {
  monthly_payout: number;
  total_received: number;
  interest_earned: number;
  effective_years: string;
  monthly_rate_display: number;
  _insight?: any;
  _chart?: any;
}

export function compute(i: Inputs): Outputs {
  const pv = Number(i.present_value) || 0;
  const annualRate = Number(i.annual_rate) || 0;
  const inputMode = i.input_mode || "years";

  // Determine payout years based on input mode
  let payoutYears: number;
  if (inputMode === "age") {
    const currentAge = Number(i.current_age) || 0;
    const endAge = Number(i.end_age) || 0;
    payoutYears = endAge - currentAge;
  } else {
    payoutYears = Number(i.payout_years) || 0;
  }

  // Defensive defaults
  if (pv <= 0) {
    return {
      monthly_payout: 0,
      total_received: 0,
      interest_earned: 0,
      effective_years: "Enter a valid lump sum",
      monthly_rate_display: 0,
    };
  }

  if (payoutYears <= 0) {
    return {
      monthly_payout: 0,
      total_received: 0,
      interest_earned: 0,
      effective_years: "Enter a valid payout period (years must be > 0)",
      monthly_rate_display: 0,
    };
  }

  if (annualRate < 0) {
    return {
      monthly_payout: 0,
      total_received: 0,
      interest_earned: 0,
      effective_years: "Interest rate cannot be negative",
      monthly_rate_display: 0,
    };
  }

  const n = Math.round(payoutYears * 12); // total monthly periods

  // Monthly interest rate (decimal)
  // Source: standard time-value-of-money convention; annual rate / 12
  const r_m = annualRate / 100 / 12;

  let pmt: number;

  if (r_m === 0) {
    // Special case: 0% interest — straight division
    pmt = pv / n;
  } else {
    // Present-value ordinary annuity formula:
    // PMT = PV * r_m / (1 - (1 + r_m)^(-n))
    const denominator = 1 - Math.pow(1 + r_m, -n);
    if (denominator <= 0) {
      // Numerically degenerate edge case
      return {
        monthly_payout: 0,
        total_received: 0,
        interest_earned: 0,
        effective_years: "Unable to compute — check your inputs",
        monthly_rate_display: r_m * 100,
      };
    }
    pmt = (pv * r_m) / denominator;
  }

  const totalReceived = pmt * n;
  const interestEarned = totalReceived - pv;

  const yearLabel = payoutYears === 1 ? "year" : "years";
  const effectiveYears = `${payoutYears} ${yearLabel} (${n} monthly payments)`;

  const fmt0 = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`;
  const fmt2 = (n: number) =>
    `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const interestPct = totalReceived > 0 ? (interestEarned / totalReceived) * 100 : 0;

  let insight: any;
  if (interestEarned > 0) {
    insight = {
      title: "Your monthly income",
      text: `A **${fmt0(pv)}** lump sum pays out **${fmt2(pmt)}/month** for ${n} months. Interest adds **${fmt0(interestEarned)}** on top, so you collect **${fmt0(totalReceived)}** in total — **${interestPct.toFixed(0)}%** of it is growth, not principal.`,
      tone: "good",
      icon: "💸",
    };
  } else {
    insight = {
      title: "Your monthly income",
      text: `With 0% interest, your **${fmt0(pv)}** is simply divided into ${n} payments of **${fmt2(pmt)}/month**. No interest is earned — you just draw down the principal.`,
      tone: "neutral",
      icon: "💸",
    };
  }

  const out: Outputs = {
    monthly_payout: pmt,
    total_received: totalReceived,
    interest_earned: interestEarned,
    effective_years: effectiveYears,
    monthly_rate_display: r_m * 100,
    _insight: insight,
  };

  if (interestEarned > 0) {
    out._chart = {
      type: "doughnut",
      slices: [
        { label: "Your principal", value: Math.round(pv) },
        { label: "Interest earned", value: Math.round(interestEarned) },
      ],
      prefix: "$",
      centerValue: fmt0(totalReceived),
      centerLabel: "Total received",
      ariaLabel: `Of ${fmt0(totalReceived)} received, ${fmt0(pv)} is your principal and ${fmt0(interestEarned)} is interest earned.`,
    };
  }

  return out;
}
