export interface Inputs {
  debt1_balance: number;
  debt1_apr: number;
  debt1_min: number;
  debt2_balance: number;
  debt2_apr: number;
  debt2_min: number;
  debt3_balance: number;
  debt3_apr: number;
  debt3_min: number;
  debt4_balance: number;
  debt4_apr: number;
  debt4_min: number;
  debt5_balance: number;
  debt5_apr: number;
  debt5_min: number;
  extra_payment: number;
}

export interface Outputs {
  months_snowball: number;
  total_interest_snowball: number;
  months_minimum: number;
  total_interest_minimum: number;
  interest_saved: number;
  months_saved: number;
  payoff_order: string;
}

interface Debt {
  id: number;
  balance: number;
  apr: number;
  min: number;
}

// Simulates debt payoff month by month.
// mode: 'snowball' sorts by balance asc + applies extra to smallest
// mode: 'minimum' pays only stated minimums (fixed)
function simulate(
  debts: Debt[],
  extraPayment: number,
  mode: 'snowball' | 'minimum'
): { months: number; totalInterest: number; payoffMonths: number[] } {
  const MAX_MONTHS = 1200; // 100-year safety cap

  // Deep clone so we don't mutate
  let balances = debts.map(d => Math.max(0, d.balance));
  const monthlyRates = debts.map(d => Math.max(0, d.apr) / 100 / 12);
  const minimums = debts.map(d => Math.max(0, d.min));
  const payoffMonths: number[] = new Array(debts.length).fill(0);

  // Sort order for snowball: indices by ascending balance
  // For minimum mode order doesn't matter for total, but we track payoff months
  const snowballOrder = debts
    .map((_, idx) => idx)
    .sort((a, b) => debts[a].balance - debts[b].balance);

  let totalInterest = 0;
  let month = 0;
  let rolledExtra = extraPayment;

  while (month < MAX_MONTHS) {
    // Check if all paid off
    if (balances.every(b => b <= 0)) break;
    month++;

    // Step 1: Accrue interest on all active debts
    for (let i = 0; i < balances.length; i++) {
      if (balances[i] <= 0) continue;
      const interest = balances[i] * monthlyRates[i];
      totalInterest += interest;
      balances[i] += interest;
    }

    // Step 2: Apply minimum payments to all debts
    for (let i = 0; i < balances.length; i++) {
      if (balances[i] <= 0) continue;
      const payment = Math.min(minimums[i], balances[i]);
      balances[i] -= payment;
      if (balances[i] <= 0.005) {
        balances[i] = 0;
        if (payoffMonths[i] === 0) payoffMonths[i] = month;
      }
    }

    // Step 3: Apply extra payment to target debt (snowball mode only)
    if (mode === 'snowball' && rolledExtra > 0) {
      // Find current snowball target: smallest original-balance debt still active
      const target = snowballOrder.find(idx => balances[idx] > 0);
      if (target !== undefined) {
        const extra = Math.min(rolledExtra, balances[target]);
        balances[target] -= extra;
        if (balances[target] <= 0.005) {
          balances[target] = 0;
          if (payoffMonths[target] === 0) payoffMonths[target] = month;
          // Roll this debt's minimum into extra pool
          rolledExtra += minimums[target];
        }
      }
    }
  }

  // Fill any remaining payoff months with current month (safety)
  for (let i = 0; i < payoffMonths.length; i++) {
    if (payoffMonths[i] === 0 && debts[i].balance > 0) {
      payoffMonths[i] = month;
    }
  }

  return { months: month, totalInterest: Math.round(totalInterest * 100) / 100, payoffMonths };
}

export function compute(i: Inputs): Outputs {
  // --- Parse and validate inputs ---
  const rawDebts: Debt[] = [
    { id: 1, balance: Number(i.debt1_balance) || 0, apr: Number(i.debt1_apr) || 0, min: Number(i.debt1_min) || 0 },
    { id: 2, balance: Number(i.debt2_balance) || 0, apr: Number(i.debt2_apr) || 0, min: Number(i.debt2_min) || 0 },
    { id: 3, balance: Number(i.debt3_balance) || 0, apr: Number(i.debt3_apr) || 0, min: Number(i.debt3_min) || 0 },
    { id: 4, balance: Number(i.debt4_balance) || 0, apr: Number(i.debt4_apr) || 0, min: Number(i.debt4_min) || 0 },
    { id: 5, balance: Number(i.debt5_balance) || 0, apr: Number(i.debt5_apr) || 0, min: Number(i.debt5_min) || 0 },
  ];
  const extra = Math.max(0, Number(i.extra_payment) || 0);

  // Filter to debts with a positive balance
  const activeDebts = rawDebts.filter(d => d.balance > 0);

  if (activeDebts.length === 0) {
    return {
      months_snowball: 0,
      total_interest_snowball: 0,
      months_minimum: 0,
      total_interest_minimum: 0,
      interest_saved: 0,
      months_saved: 0,
      payoff_order: "Enter at least one debt balance to calculate.",
    };
  }

  // Validate: minimum payments must cover at least first month's interest for snowball to work
  // (We warn in payoff_order text if a debt has min <= monthly interest)
  const warnings: string[] = [];
  for (const d of activeDebts) {
    const monthlyRate = d.apr / 100 / 12;
    const firstInterest = d.balance * monthlyRate;
    if (d.min > 0 && d.min <= firstInterest) {
      warnings.push(`Debt ${d.id}: minimum payment ($${d.min.toFixed(0)}) may not cover interest ($${firstInterest.toFixed(2)}). Increase minimum.`);
    }
  }

  // Sort active debts by balance ascending (snowball order)
  const snowballSorted = [...activeDebts].sort((a, b) => a.balance - b.balance);

  // --- Run snowball simulation ---
  const snowball = simulate(snowballSorted, extra, 'snowball');

  // --- Run minimums-only simulation ---
  const minimum = simulate(snowballSorted, 0, 'minimum');

  // --- Build payoff order text ---
  const orderLines: string[] = [];
  for (let rank = 0; rank < snowballSorted.length; rank++) {
    const d = snowballSorted[rank];
    const mo = snowball.payoffMonths[rank];
    const yrs = Math.floor(mo / 12);
    const mos = mo % 12;
    const timeStr = yrs > 0
      ? `${yrs} yr${yrs !== 1 ? 's' : ''} ${mos} mo${mos !== 1 ? 's' : ''}`
      : `${mos} mo${mos !== 1 ? 's' : ''}`;
    orderLines.push(
      `#${rank + 1} — Debt ${d.id}: $${d.balance.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} @ ${d.apr.toFixed(2)}% APR → paid off in ${timeStr} (month ${mo})`
    );
  }

  if (warnings.length > 0) {
    orderLines.push("");
    orderLines.push("⚠️ Warnings:");
    warnings.forEach(w => orderLines.push(w));
  }

  const interestSaved = Math.max(0, minimum.totalInterest - snowball.totalInterest);
  const monthsSaved = Math.max(0, minimum.months - snowball.months);

  return {
    months_snowball: snowball.months,
    total_interest_snowball: Math.round(snowball.totalInterest * 100) / 100,
    months_minimum: minimum.months,
    total_interest_minimum: Math.round(minimum.totalInterest * 100) / 100,
    interest_saved: Math.round(interestSaved * 100) / 100,
    months_saved: monthsSaved,
    payoff_order: orderLines.join("\n"),
  };
}
