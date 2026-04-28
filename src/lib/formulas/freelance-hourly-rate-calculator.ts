export interface Inputs {
  target_income: number;
  annual_expenses: number;
  billable_hours_per_week: number;
  weeks_worked: number;
  tax_rate_pct: string;
  custom_tax_rate_pct: number;
}

export interface Outputs {
  hourly_rate: number;
  daily_rate: number;
  weekly_rate: number;
  monthly_rate: number;
  total_billable_hours: number;
  gross_revenue_needed: number;
  summary: string;
}

// Default tax rates by bracket — source: IRS Publication 505 (2026)
const PRESET_TAX_RATES: Record<string, number> = {
  "25": 0.25,
  "28": 0.28,
  "30": 0.30,
  "33": 0.33,
};

const MAX_BILLABLE_HOURS_PER_WEEK = 80;
const MIN_BILLABLE_HOURS_PER_WEEK = 1;
const MAX_WEEKS = 52;
const MIN_WEEKS = 1;
const MAX_TAX_RATE = 0.95;
const MIN_TAX_RATE = 0;

export function compute(i: Inputs): Outputs {
  const defaultOut: Outputs = {
    hourly_rate: 0,
    daily_rate: 0,
    weekly_rate: 0,
    monthly_rate: 0,
    total_billable_hours: 0,
    gross_revenue_needed: 0,
    summary: "Please enter valid inputs to calculate your rate.",
  };

  // --- Parse and validate inputs ---
  const targetIncome = Number(i.target_income) || 0;
  const annualExpenses = Number(i.annual_expenses) || 0;
  const billableHrsPerWeek = Number(i.billable_hours_per_week) || 0;
  const weeksWorked = Number(i.weeks_worked) || 0;

  // Determine tax rate
  let taxRate: number;
  if (i.tax_rate_pct === "custom") {
    const customPct = Number(i.custom_tax_rate_pct) || 0;
    taxRate = customPct / 100;
  } else {
    taxRate = PRESET_TAX_RATES[i.tax_rate_pct] ?? 0.28;
  }

  // Guard: income must be positive
  if (targetIncome <= 0) {
    return { ...defaultOut, summary: "Enter a desired annual take-home income greater than $0." };
  }

  // Guard: expenses non-negative
  if (annualExpenses < 0) {
    return { ...defaultOut, summary: "Annual expenses cannot be negative." };
  }

  // Guard: billable hours
  if (
    billableHrsPerWeek < MIN_BILLABLE_HOURS_PER_WEEK ||
    billableHrsPerWeek > MAX_BILLABLE_HOURS_PER_WEEK
  ) {
    return {
      ...defaultOut,
      summary: `Billable hours per week must be between ${MIN_BILLABLE_HOURS_PER_WEEK} and ${MAX_BILLABLE_HOURS_PER_WEEK}.`,
    };
  }

  // Guard: weeks worked
  if (weeksWorked < MIN_WEEKS || weeksWorked > MAX_WEEKS) {
    return {
      ...defaultOut,
      summary: `Weeks worked must be between ${MIN_WEEKS} and ${MAX_WEEKS}.`,
    };
  }

  // Guard: tax rate
  if (taxRate < MIN_TAX_RATE || taxRate >= MAX_TAX_RATE) {
    return {
      ...defaultOut,
      summary: "Tax rate must be between 0% and 95%.",
    };
  }

  // --- Core formula ---
  // Gross Revenue = (Take-Home + Expenses) / (1 - Tax Rate)
  const netNeeded = targetIncome + annualExpenses;
  const grossRevenueNeeded = netNeeded / (1 - taxRate);

  // Total billable hours in the year
  const totalBillableHours = billableHrsPerWeek * weeksWorked;

  if (totalBillableHours <= 0) {
    return { ...defaultOut, summary: "Total billable hours must be greater than zero." };
  }

  // Minimum hourly rate
  const hourlyRate = grossRevenueNeeded / totalBillableHours;

  // Derived rates
  const dailyRate = hourlyRate * 8; // standard 8-hour day
  const weeklyRate = hourlyRate * billableHrsPerWeek;
  const monthlyRate = grossRevenueNeeded / 12;

  // Tax amount for summary
  const taxAmount = grossRevenueNeeded - netNeeded;
  const taxRatePct = (taxRate * 100).toFixed(0);

  const summary =
    `Target take-home: $${targetIncome.toLocaleString("en-US", { maximumFractionDigits: 0 })} | ` +
    `Expenses: $${annualExpenses.toLocaleString("en-US", { maximumFractionDigits: 0 })} | ` +
    `Taxes (${taxRatePct}%): $${taxAmount.toLocaleString("en-US", { maximumFractionDigits: 0 })} | ` +
    `Gross needed: $${grossRevenueNeeded.toLocaleString("en-US", { maximumFractionDigits: 0 })} ÷ ` +
    `${totalBillableHours.toLocaleString("en-US")} hrs = ` +
    `$${hourlyRate.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/hr`;

  return {
    hourly_rate: Math.round(hourlyRate * 100) / 100,
    daily_rate: Math.round(dailyRate * 100) / 100,
    weekly_rate: Math.round(weeklyRate * 100) / 100,
    monthly_rate: Math.round(monthlyRate * 100) / 100,
    total_billable_hours: Math.round(totalBillableHours),
    gross_revenue_needed: Math.round(grossRevenueNeeded * 100) / 100,
    summary,
  };
}
