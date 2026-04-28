export interface Inputs {
  annual_salary: number;
  hours_per_week: number;
  weeks_per_year: number;
}

export interface Outputs {
  hourly: number;
  daily: number;
  weekly: number;
  biweekly: number;
  monthly: number;
  total_hours: number;
  note: string;
}

// Standard U.S. work year: 2,080 hours (40 hrs/week x 52 weeks)
// Source: U.S. Office of Personnel Management
const STANDARD_HOURS_PER_YEAR = 2080;
const STANDARD_HOURS_PER_DAY = 8;

export function compute(i: Inputs): Outputs {
  const annual_salary = Number(i.annual_salary) || 0;
  const hours_per_week = Number(i.hours_per_week) || 0;
  const weeks_per_year = Number(i.weeks_per_year) || 0;

  // Defensive defaults
  if (annual_salary <= 0) {
    return {
      hourly: 0,
      daily: 0,
      weekly: 0,
      biweekly: 0,
      monthly: 0,
      total_hours: 0,
      note: "Enter a valid annual salary greater than $0.",
    };
  }

  if (hours_per_week <= 0 || hours_per_week > 168) {
    return {
      hourly: 0,
      daily: 0,
      weekly: 0,
      biweekly: 0,
      monthly: 0,
      total_hours: 0,
      note: "Enter valid hours per week (1–168).",
    };
  }

  if (weeks_per_year <= 0 || weeks_per_year > 52) {
    return {
      hourly: 0,
      daily: 0,
      weekly: 0,
      biweekly: 0,
      monthly: 0,
      total_hours: 0,
      note: "Enter valid weeks per year (1–52).",
    };
  }

  // Core calculation
  const total_hours = hours_per_week * weeks_per_year;
  const hourly = annual_salary / total_hours;
  const daily = hourly * STANDARD_HOURS_PER_DAY;
  const weekly = hourly * hours_per_week;
  const biweekly = weekly * 2;
  // Monthly uses annual / 12 (standard payroll method, not weekly x 4)
  const monthly = annual_salary / 12;

  // Build contextual note
  let note = "";
  const isStandard =
    hours_per_week === 40 && weeks_per_year === 52;

  if (isStandard) {
    note =
      "Based on the U.S. standard 2,080-hour work year (40 hrs/week \u00d7 52 weeks). All figures are gross (pre-tax).";
  } else if (total_hours < STANDARD_HOURS_PER_YEAR) {
    const diff = STANDARD_HOURS_PER_YEAR - total_hours;
    note = `Your schedule is ${diff.toFixed(0)} hrs/year below the 2,080-hour standard. Hourly rate reflects actual hours worked. All figures are gross (pre-tax).`;
  } else {
    const diff = total_hours - STANDARD_HOURS_PER_YEAR;
    note = `Your schedule is ${diff.toFixed(0)} hrs/year above the 2,080-hour standard. Your effective hourly rate is lower than a standard 40-hr week. All figures are gross (pre-tax).`;
  }

  return {
    hourly,
    daily,
    weekly,
    biweekly,
    monthly,
    total_hours,
    note,
  };
}
