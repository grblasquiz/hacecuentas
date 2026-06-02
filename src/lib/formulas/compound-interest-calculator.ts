export interface Inputs {
  principal: number;
  monthly_contribution: number;
  annual_rate: number;
  years: number;
  compounding_frequency: string;
}

export interface Outputs {
  end_balance: number;
  total_contributions: number;
  total_interest: number;
  interest_ratio: number;
  yearly_breakdown: string;
  _insight?: any;
  _chart?: any;
}

// Builds the narrative insight + donut for a finished projection.
function buildVisuals(endBalance: number, totalContributions: number, totalInterest: number, years: number) {
  const fmt = (v: number) => '$' + Math.round(v).toLocaleString('en-US');
  const ratio = endBalance > 0 ? (totalInterest / endBalance) * 100 : 0;
  const insight = {
    title: 'Where your balance comes from',
    text: `After **${years} ${years === 1 ? 'year' : 'years'}**, you end with **${fmt(endBalance)}**. Of that, **${fmt(totalContributions)}** is money you put in and **${fmt(totalInterest)}** is compound interest — **${ratio.toFixed(0)}%** of the final balance is growth you never deposited.`,
    tone: ratio >= 40 ? 'good' : 'neutral',
    icon: '📈',
  };
  const chart = totalInterest > 0 ? {
    type: 'doughnut',
    slices: [
      { label: 'Contributions', value: Math.round(totalContributions) },
      { label: 'Interest', value: Math.round(totalInterest) },
    ],
    prefix: '$',
    centerValue: fmt(endBalance),
    centerLabel: 'End balance',
    ariaLabel: `End balance ${fmt(endBalance)}: ${fmt(totalContributions)} contributions plus ${fmt(totalInterest)} interest`,
  } : undefined;
  return { insight, chart };
}

// Compounding periods per year map
const FREQ_MAP: Record<string, number> = {
  annually: 1,
  quarterly: 4,
  monthly: 12,
  daily: 365,
};

export function compute(i: Inputs): Outputs {
  const principal = Number(i.principal) || 0;
  const monthlyContribution = Number(i.monthly_contribution) || 0;
  const annualRate = Number(i.annual_rate) || 0;
  const years = Math.max(0, Math.floor(Number(i.years) || 0));
  const freq = i.compounding_frequency || "monthly";

  // Defensive: zero/negative principal and rate
  if (principal < 0 || annualRate < 0 || years <= 0) {
    return {
      end_balance: 0,
      total_contributions: 0,
      total_interest: 0,
      interest_ratio: 0,
      yearly_breakdown: "Please enter valid positive values.",
    };
  }

  // n = compounding periods per year
  const n = FREQ_MAP[freq] ?? 12;

  // r = annual rate as decimal
  const r = annualRate / 100;

  // Rate per compounding period
  const rPerPeriod = r / n;

  // Total compounding periods
  const totalPeriods = n * years;

  // --- Year-by-year simulation ---
  // We simulate period-by-period to produce yearly snapshots.
  // Monthly contributions are applied each calendar month;
  // when compounding is not monthly, contributions accumulate
  // within the period and compound at period end.

  // To keep precision, we simulate at monthly resolution regardless
  // of compounding frequency, then apply interest at the right cadence.

  // Number of calendar months per compounding period
  const monthsPerPeriod = 12 / n; // may be fractional for daily — handled separately

  let balance = principal;
  const yearlyRows: string[] = [];
  yearlyRows.push("Year | Balance | Contributions | Interest Earned");

  let cumulativeContributions = principal;
  let monthlyInterestAccumulator = 0; // used for daily compounding path

  // For daily compounding we use a different approach:
  // compound daily, add contribution on first day of each month.
  if (freq === "daily") {
    const dailyRate = r / 365;
    let currentBalance = principal;
    let totalContrib = principal;
    const daysPerMonth = 365 / 12; // ~30.4167

    for (let year = 1; year <= years; year++) {
      const startBalance = currentBalance;
      // Simulate 12 months in this year
      for (let m = 0; m < 12; m++) {
        // Add monthly contribution at start of month
        currentBalance += monthlyContribution;
        totalContrib += monthlyContribution;
        // Compound daily for this month
        const daysThisMonth = Math.round(daysPerMonth);
        for (let d = 0; d < daysThisMonth; d++) {
          currentBalance *= 1 + dailyRate;
        }
      }
      const interestThisYear = currentBalance - startBalance - monthlyContribution * 12;
      yearlyRows.push(
        `Year ${year} | $${currentBalance.toFixed(2)} | $${totalContrib.toFixed(2)} | $${(currentBalance - totalContrib).toFixed(2)}`
      );
    }

    const endBalance = currentBalance;
    const totalContributions = totalContrib;
    const totalInterest = endBalance - totalContributions;
    const interestRatio = endBalance > 0 ? totalInterest / endBalance : 0;

    const v = buildVisuals(endBalance, totalContributions, totalInterest, years);
    return {
      end_balance: parseFloat(endBalance.toFixed(2)),
      total_contributions: parseFloat(totalContributions.toFixed(2)),
      total_interest: parseFloat(totalInterest.toFixed(2)),
      interest_ratio: parseFloat((interestRatio * 100).toFixed(4)),
      yearly_breakdown: yearlyRows.join("\n"),
      _insight: v.insight,
      _chart: v.chart,
    };
  }

  // --- Non-daily: annual / quarterly / monthly ---
  // Simulate period by period.
  // Contributions per period = monthlyContribution * monthsPerPeriod
  const contribPerPeriod = monthlyContribution * monthsPerPeriod;

  let runningBalance = principal;
  let runningContrib = principal;
  let periodsPerYear = n;

  for (let year = 1; year <= years; year++) {
    const startBalance = runningBalance;
    // Apply each compounding period within this year
    for (let p = 0; p < periodsPerYear; p++) {
      // Add contributions at end of period (standard assumption)
      // Interest compounds on existing balance first, then contribution added
      runningBalance = runningBalance * (1 + rPerPeriod) + contribPerPeriod;
      runningContrib += contribPerPeriod;
    }
    const interestThisYear = runningBalance - startBalance - contribPerPeriod * periodsPerYear;
    yearlyRows.push(
      `Year ${year} | $${runningBalance.toFixed(2)} | $${runningContrib.toFixed(2)} | $${(runningBalance - runningContrib).toFixed(2)}`
    );
  }

  const endBalance = runningBalance;
  const totalContributions = runningContrib;
  const totalInterest = endBalance - totalContributions;
  const interestRatio = endBalance > 0 ? totalInterest / endBalance : 0;

  const v = buildVisuals(endBalance, totalContributions, totalInterest, years);
  return {
    end_balance: parseFloat(endBalance.toFixed(2)),
    total_contributions: parseFloat(totalContributions.toFixed(2)),
    total_interest: parseFloat(totalInterest.toFixed(2)),
    interest_ratio: parseFloat((interestRatio * 100).toFixed(4)),
    yearly_breakdown: yearlyRows.join("\n"),
    _insight: v.insight,
    _chart: v.chart,
  };
}
