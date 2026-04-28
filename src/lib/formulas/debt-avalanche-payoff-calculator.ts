export interface Inputs {
  debt1_name: string;
  debt1_balance: number;
  debt1_apr: number;
  debt1_min: number;
  debt2_name: string;
  debt2_balance: number;
  debt2_apr: number;
  debt2_min: number;
  debt3_name: string;
  debt3_balance: number;
  debt3_apr: number;
  debt3_min: number;
  extra_payment: number;
}

export interface Outputs {
  avalanche_total_interest: number;
  avalanche_months: number;
  snowball_total_interest: number;
  snowball_months: number;
  interest_saved: number;
  months_difference: number;
  payoff_order: string;
  payoff_schedule: string;
}

interface Debt {
  name: string;
  balance: number;
  apr: number;
  min: number;
}

interface SimResult {
  totalInterest: number;
  months: number;
  payoffOrder: string[];
  perDebtInterest: number[];
  perDebtMonths: number[];
}

// MAX_MONTHS guard: 600 months (50 years) prevents infinite loops
const MAX_MONTHS = 600;

function simulate(debts: Debt[], extra: number, sortByHighestAPR: boolean): SimResult {
  // Work on copies so we don't mutate originals
  const balances = debts.map(d => d.balance);
  const monthlyRates = debts.map(d => (d.apr / 100) / 12);
  const accInterest = debts.map(() => 0);
  const payoffMonth = debts.map(() => -1);

  // Sort order: indices sorted by target criterion
  // Avalanche: highest APR first; Snowball: lowest balance first (updated each month)
  function getTargetIndex(): number {
    // Find active debts (balance > 0)
    const active = balances
      .map((b, i) => ({ i, b, apr: debts[i].apr }))
      .filter(x => x.b > 0.005);
    if (active.length === 0) return -1;
    if (sortByHighestAPR) {
      // Highest APR first; tie-break: higher balance
      active.sort((a, z) => z.apr - a.apr || z.b - a.b);
    } else {
      // Lowest balance first; tie-break: higher APR
      active.sort((a, z) => a.b - z.b || z.apr - a.apr);
    }
    return active[0].i;
  }

  let months = 0;
  const orderCleared: { name: string; month: number }[] = [];

  while (months < MAX_MONTHS) {
    // Check if all paid off
    if (balances.every(b => b <= 0.005)) break;

    months++;

    // Compute available extra pool this month (minimums of paid-off debts freed up)
    let availableExtra = extra;

    // Determine target debt index
    const targetIdx = getTargetIndex();

    // Pay each debt
    for (let i = 0; i < debts.length; i++) {
      if (balances[i] <= 0.005) {
        balances[i] = 0;
        continue;
      }

      const interest = balances[i] * monthlyRates[i];
      accInterest[i] += interest;

      let payment: number;
      if (i === targetIdx) {
        // Minimum + all available extra
        payment = debts[i].min + availableExtra;
      } else {
        payment = debts[i].min;
      }

      // Cap payment at remaining balance + interest
      const totalOwed = balances[i] + interest;
      if (payment >= totalOwed) {
        payment = totalOwed;
        balances[i] = 0;
        if (payoffMonth[i] === -1) {
          payoffMonth[i] = months;
          orderCleared.push({ name: debts[i].name, month: months });
          // Freed minimum rolls into extra pool next month automatically
          // (handled by rechecking target each month)
        }
      } else {
        balances[i] = balances[i] + interest - payment;
      }
    }

    // Roll freed minimums into extra for next iteration
    // Recompute availableExtra based on cleared debts' minimums
    extra = extra + debts.reduce((sum, d, i) => {
      // Only add minimum once, when debt was just cleared this month
      return payoffMonth[i] === months ? sum + d.min : sum;
    }, 0);
  }

  const totalInterest = accInterest.reduce((a, b) => a + b, 0);
  const payoffOrder = orderCleared
    .sort((a, b) => a.month - b.month)
    .map(x => x.name);

  return {
    totalInterest,
    months,
    payoffOrder,
    perDebtInterest: accInterest,
    perDebtMonths: payoffMonth
  };
}

export function compute(i: Inputs): Outputs {
  // Parse and validate debts
  const rawDebts: Array<{ name: string; balance: number; apr: number; min: number }> = [
    {
      name: String(i.debt1_name || "Debt 1"),
      balance: Number(i.debt1_balance) || 0,
      apr: Number(i.debt1_apr) || 0,
      min: Number(i.debt1_min) || 0
    },
    {
      name: String(i.debt2_name || "Debt 2"),
      balance: Number(i.debt2_balance) || 0,
      apr: Number(i.debt2_apr) || 0,
      min: Number(i.debt2_min) || 0
    },
    {
      name: String(i.debt3_name || "Debt 3"),
      balance: Number(i.debt3_balance) || 0,
      apr: Number(i.debt3_apr) || 0,
      min: Number(i.debt3_min) || 0
    }
  ];

  const extra = Math.max(0, Number(i.extra_payment) || 0);

  // Filter to active debts (balance > 0 and min > 0)
  const activeDebts: Debt[] = rawDebts.filter(
    d => d.balance > 0 && d.min > 0 && d.apr >= 0
  );

  if (activeDebts.length === 0) {
    return {
      avalanche_total_interest: 0,
      avalanche_months: 0,
      snowball_total_interest: 0,
      snowball_months: 0,
      interest_saved: 0,
      months_difference: 0,
      payoff_order: "Enter at least one debt with balance, minimum, and APR.",
      payoff_schedule: ""
    };
  }

  // Validate that minimums cover more than interest for each debt
  // (otherwise it's a never-pay situation without extra)
  for (const d of activeDebts) {
    const monthlyRate = (d.apr / 100) / 12;
    const firstMonthInterest = d.balance * monthlyRate;
    if (d.min <= firstMonthInterest && extra === 0) {
      return {
        avalanche_total_interest: 0,
        avalanche_months: 0,
        snowball_total_interest: 0,
        snowball_months: 0,
        interest_saved: 0,
        months_difference: 0,
        payoff_order: `Warning: the minimum payment for "${d.name}" ($${d.min.toFixed(2)}) does not exceed its monthly interest ($${firstMonthInterest.toFixed(2)}). Increase the minimum or add an extra payment.`,
        payoff_schedule: ""
      };
    }
  }

  // Run avalanche simulation (highest APR first)
  const avalanche = simulate([...activeDebts.map(d => ({ ...d }))], extra, true);

  // Run snowball simulation (lowest balance first)
  const snowball = simulate([...activeDebts.map(d => ({ ...d }))], extra, false);

  const interestSaved = snowball.totalInterest - avalanche.totalInterest;
  const monthsDiff = snowball.months - avalanche.months;

  // Build per-debt schedule string for avalanche
  const scheduleLines: string[] = [];
  avalanche.payoffOrder.forEach((name, rank) => {
    const debtIdx = activeDebts.findIndex(d => d.name === name);
    const monthsVal = debtIdx >= 0 ? avalanche.perDebtMonths[debtIdx] : 0;
    const interestVal = debtIdx >= 0 ? avalanche.perDebtInterest[debtIdx] : 0;
    scheduleLines.push(
      `#${rank + 1} ${name}: paid off month ${monthsVal}, interest $${interestVal.toFixed(2)}`
    );
  });

  // Add any not in payoff order (edge case: reached MAX_MONTHS)
  activeDebts.forEach((d, idx) => {
    if (!avalanche.payoffOrder.includes(d.name)) {
      scheduleLines.push(
        `${d.name}: not fully paid within ${MAX_MONTHS} months — increase payments`
      );
    }
  });

  const payoffOrderStr =
    avalanche.payoffOrder.length > 0
      ? avalanche.payoffOrder.join(" → ")
      : "Could not determine order — check inputs";

  let comparisonNote = "";
  if (Math.abs(interestSaved) < 0.01) {
    comparisonNote = "Avalanche and snowball produce identical interest for these debts.";
  } else if (interestSaved > 0) {
    comparisonNote = `Avalanche saves $${interestSaved.toFixed(2)} in interest vs. snowball`;
    if (monthsDiff !== 0) {
      comparisonNote += ` and finishes ${Math.abs(monthsDiff)} month${Math.abs(monthsDiff) !== 1 ? "s" : ""} ${monthsDiff > 0 ? "faster" : "slower"}.`;
    } else {
      comparisonNote += " in the same number of months.";
    }
  } else {
    comparisonNote = `Snowball saves $${(-interestSaved).toFixed(2)} in interest vs. avalanche for this specific debt set.`;
  }

  scheduleLines.push(comparisonNote);

  return {
    avalanche_total_interest: Math.round(avalanche.totalInterest * 100) / 100,
    avalanche_months: avalanche.months,
    snowball_total_interest: Math.round(snowball.totalInterest * 100) / 100,
    snowball_months: snowball.months,
    interest_saved: Math.round(interestSaved * 100) / 100,
    months_difference: monthsDiff,
    payoff_order: payoffOrderStr,
    payoff_schedule: scheduleLines.join(" | ")
  };
}
