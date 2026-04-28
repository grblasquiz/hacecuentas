export interface Inputs {
  age_group: string;
  cash_savings: number;
  investments: number;
  home_value: number;
  mortgage_balance: number;
  vehicle_value: number;
  other_assets: number;
  credit_card_debt: number;
  student_loans: number;
  auto_loans: number;
  other_debts: number;
}

export interface Outputs {
  net_worth: number;
  total_assets: number;
  total_liabilities: number;
  home_equity: number;
  debt_to_asset_ratio: number;
  age_median_comparison: string;
  percentile_estimate: string;
  breakdown_note: string;
}

// Median net worth by age group — Federal Reserve Survey of Consumer Finances 2022
// Source: https://www.federalreserve.gov/publications/files/scf23.pdf
const MEDIAN_BY_AGE: Record<string, number> = {
  under_35: 39000,
  "35_44": 135600,
  "45_54": 247200,
  "55_64": 364500,
  "65_74": 409900,
  "75_plus": 335600,
};

// Approximate percentile thresholds by age group (SCF 2022 distribution estimates)
// Each array: [10th, 25th, 50th (median), 75th, 90th] percentile values
const PERCENTILE_THRESHOLDS: Record<string, number[]> = {
  under_35:  [-10000,  6000,   39000,  120000,  310000],
  "35_44":   [ -5000, 30000,  135600,  380000,  850000],
  "45_54":   [  2000, 60000,  247200,  650000, 1400000],
  "55_64":   [  5000, 90000,  364500,  900000, 1900000],
  "65_74":   [ 10000,100000,  409900,  970000, 2100000],
  "75_plus": [  8000, 90000,  335600,  860000, 1800000],
};

function getAgeLabel(age_group: string): string {
  const labels: Record<string, string> = {
    under_35: "Under 35",
    "35_44":  "35–44",
    "45_54":  "45–54",
    "55_64":  "55–64",
    "65_74":  "65–74",
    "75_plus": "75 or older",
  };
  return labels[age_group] ?? age_group;
}

function formatCurrency(value: number): string {
  const abs = Math.abs(value);
  const formatted = abs >= 1000000
    ? `$${(abs / 1000000).toFixed(2)}M`
    : abs >= 1000
    ? `$${abs.toLocaleString("en-US", { maximumFractionDigits: 0 })}`
    : `$${abs.toFixed(0)}`;
  return value < 0 ? `-${formatted}` : formatted;
}

function estimatePercentile(netWorth: number, age_group: string): string {
  const thresholds = PERCENTILE_THRESHOLDS[age_group];
  if (!thresholds) return "Percentile data unavailable for this age group.";

  const [p10, p25, p50, p75, p90] = thresholds;

  if (netWorth < p10) return "Below the 10th percentile for your age group.";
  if (netWorth < p25) return "Approximately 10th–25th percentile for your age group.";
  if (netWorth < p50) return "Approximately 25th–50th percentile for your age group.";
  if (netWorth < p75) return "Approximately 50th–75th percentile for your age group (above median).";
  if (netWorth < p90) return "Approximately 75th–90th percentile for your age group.";
  return "Approximately top 10% for your age group.";
}

export function compute(i: Inputs): Outputs {
  const cashSavings      = Math.max(0, Number(i.cash_savings)      || 0);
  const investments      = Math.max(0, Number(i.investments)       || 0);
  const homeValue        = Math.max(0, Number(i.home_value)        || 0);
  const mortgageBalance  = Math.max(0, Number(i.mortgage_balance)  || 0);
  const vehicleValue     = Math.max(0, Number(i.vehicle_value)     || 0);
  const otherAssets      = Math.max(0, Number(i.other_assets)      || 0);
  const creditCardDebt   = Math.max(0, Number(i.credit_card_debt)  || 0);
  const studentLoans     = Math.max(0, Number(i.student_loans)     || 0);
  const autoLoans        = Math.max(0, Number(i.auto_loans)        || 0);
  const otherDebts       = Math.max(0, Number(i.other_debts)       || 0);
  const age_group        = i.age_group || "35_44";

  // Home equity = market value minus mortgage (cannot go below zero in asset count,
  // but negative equity is valid and reflected in net worth)
  const home_equity = homeValue - mortgageBalance;

  // Total assets: mortgage already netted via home_equity
  const total_assets =
    cashSavings +
    investments +
    Math.max(0, home_equity) + // positive equity only in asset sum
    vehicleValue +
    otherAssets;

  // Total liabilities: exclude mortgage (already netted above)
  const total_liabilities =
    creditCardDebt +
    studentLoans +
    autoLoans +
    otherDebts +
    (home_equity < 0 ? Math.abs(home_equity) : 0); // underwater mortgage counted as liability

  const net_worth = total_assets - total_liabilities;

  // Debt-to-asset ratio (as a decimal for percent format)
  const debt_to_asset_ratio =
    total_assets > 0 ? total_liabilities / total_assets : 0;

  // Median comparison
  const median = MEDIAN_BY_AGE[age_group] ?? 192700;
  const ageLabel = getAgeLabel(age_group);
  const diff = net_worth - median;
  const absDiff = formatCurrency(Math.abs(diff));
  const medianFormatted = formatCurrency(median);
  let age_median_comparison: string;
  if (diff >= 0) {
    age_median_comparison = `${absDiff} above the US median (${medianFormatted}) for ages ${ageLabel}.`;
  } else {
    age_median_comparison = `${absDiff} below the US median (${medianFormatted}) for ages ${ageLabel}.`;
  }

  // Percentile estimate
  const percentile_estimate = estimatePercentile(net_worth, age_group);

  // Breakdown note
  const debtRatioStr = (debt_to_asset_ratio * 100).toFixed(1);
  let debtHealthLabel: string;
  if (total_assets === 0) {
    debtHealthLabel = "No assets entered.";
  } else if (debt_to_asset_ratio <= 0.30) {
    debtHealthLabel = "Strong (below 30%).";
  } else if (debt_to_asset_ratio <= 0.50) {
    debtHealthLabel = "Manageable (30%–50%).";
  } else if (debt_to_asset_ratio <= 1.0) {
    debtHealthLabel = "High — focus on debt reduction (50%–100%).";
  } else {
    debtHealthLabel = "Critical — liabilities exceed assets.";
  }

  const breakdown_note =
    `Assets: ${formatCurrency(total_assets)} | ` +
    `Liabilities: ${formatCurrency(total_liabilities)} | ` +
    `Home Equity: ${formatCurrency(home_equity)} | ` +
    `Debt-to-Asset: ${debtRatioStr}% — ${debtHealthLabel}`;

  return {
    net_worth,
    total_assets,
    total_liabilities,
    home_equity,
    debt_to_asset_ratio,
    age_median_comparison,
    percentile_estimate,
    breakdown_note,
  };
}
