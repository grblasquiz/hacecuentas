export interface Inputs {
  rent: number;
  food: number;
  utilities: number;
  insurance: number;
  transport: number;
  debt_payments: number;
  other_essentials: number;
  income_type: string; // 'dual' | 'single' | 'freelance'
  dependents: string;  // '0' | '1' | '2' | '3plus'
  current_savings: number;
  monthly_saving: number;
}

export interface Outputs {
  total_monthly_essentials: number;
  recommended_months: number;
  target_amount: number;
  gap: number;
  months_to_goal: string;
  coverage_status: string;
}

// Coverage base months by income type — based on CFPB guidelines and BLS job search data (2026)
const BASE_MONTHS: Record<string, number> = {
  dual: 3,
  single: 5,
  freelance: 8,
};

// Additional months per dependent tier
const DEPENDENT_ADDON: Record<string, number> = {
  "0": 0,
  "1": 1,
  "2": 2,
  "3plus": 3,
};

const MIN_MONTHS = 3;
const MAX_MONTHS = 12;

export function compute(i: Inputs): Outputs {
  const rent = Math.max(Number(i.rent) || 0, 0);
  const food = Math.max(Number(i.food) || 0, 0);
  const utilities = Math.max(Number(i.utilities) || 0, 0);
  const insurance = Math.max(Number(i.insurance) || 0, 0);
  const transport = Math.max(Number(i.transport) || 0, 0);
  const debt_payments = Math.max(Number(i.debt_payments) || 0, 0);
  const other_essentials = Math.max(Number(i.other_essentials) || 0, 0);
  const current_savings = Math.max(Number(i.current_savings) || 0, 0);
  const monthly_saving = Math.max(Number(i.monthly_saving) || 0, 0);

  const income_type = i.income_type || "single";
  const dependents = i.dependents || "0";

  // Sum all essential monthly expenses
  const total_monthly_essentials =
    rent + food + utilities + insurance + transport + debt_payments + other_essentials;

  if (total_monthly_essentials <= 0) {
    return {
      total_monthly_essentials: 0,
      recommended_months: 3,
      target_amount: 0,
      gap: 0,
      months_to_goal: "Enter your monthly expenses to calculate.",
      coverage_status: "Enter your expenses to see current coverage.",
    };
  }

  // Determine recommended months
  const base = BASE_MONTHS[income_type] ?? BASE_MONTHS["single"];
  const addon = DEPENDENT_ADDON[dependents] ?? 0;
  const recommended_months = Math.min(Math.max(base + addon, MIN_MONTHS), MAX_MONTHS);

  // Target amount
  const target_amount = total_monthly_essentials * recommended_months;

  // Gap (cannot be negative)
  const gap = Math.max(target_amount - current_savings, 0);

  // Current coverage in months
  const current_months_covered =
    total_monthly_essentials > 0
      ? current_savings / total_monthly_essentials
      : 0;

  // Coverage status string
  let coverage_status: string;
  if (current_savings <= 0) {
    coverage_status = "No current emergency fund — starting from $0.";
  } else if (current_savings >= target_amount) {
    coverage_status = `Fully funded! Your $${current_savings.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })} covers ${current_months_covered.toFixed(1)} months — meets the ${recommended_months}-month target.`;
  } else {
    coverage_status = `$${current_savings.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })} saved covers ${current_months_covered.toFixed(1)} of ${recommended_months} recommended months.`;
  }

  // Months to goal
  let months_to_goal: string;
  if (gap <= 0) {
    months_to_goal = "Goal already reached — your fund is fully funded.";
  } else if (monthly_saving <= 0) {
    months_to_goal = "Enter a monthly saving amount to calculate time to goal.";
  } else {
    const rawMonths = gap / monthly_saving;
    const totalMonths = Math.ceil(rawMonths);
    if (totalMonths <= 0) {
      months_to_goal = "Goal already reached.";
    } else if (totalMonths === 1) {
      months_to_goal = "1 month to reach your goal.";
    } else if (totalMonths < 12) {
      months_to_goal = `${totalMonths} months to reach your goal.`;
    } else {
      const years = Math.floor(totalMonths / 12);
      const remainingMonths = totalMonths % 12;
      if (remainingMonths === 0) {
        months_to_goal = `${years} year${years !== 1 ? "s" : ""} to reach your goal.`;
      } else {
        months_to_goal = `${years} year${years !== 1 ? "s" : ""} and ${remainingMonths} month${remainingMonths !== 1 ? "s" : ""} to reach your goal.`;
      }
    }
  }

  return {
    total_monthly_essentials,
    recommended_months,
    target_amount,
    gap,
    months_to_goal,
    coverage_status,
  };
}
