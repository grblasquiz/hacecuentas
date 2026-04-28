export interface Inputs {
  hourly_rate: number;
  hours_per_week: number;
  weeks_per_year: number;
  overtime_mode: string;
}

export interface Outputs {
  annual: number;
  monthly: number;
  biweekly: number;
  weekly: number;
  daily: number;
  effective_hourly: number;
  breakdown: string;
}

// US FLSA overtime multiplier — 29 U.S.C. § 207
const OT_MULTIPLIER = 1.5;
// Standard OT threshold per FLSA (hours/week)
const OT_THRESHOLD = 40;

export function compute(i: Inputs): Outputs {
  const hourlyRate = Number(i.hourly_rate) || 0;
  const hoursPerWeek = Number(i.hours_per_week) || 0;
  const weeksPerYear = Number(i.weeks_per_year) || 0;
  const overtimeMode = i.overtime_mode || "none";

  const defaultOutputs: Outputs = {
    annual: 0,
    monthly: 0,
    biweekly: 0,
    weekly: 0,
    daily: 0,
    effective_hourly: 0,
    breakdown: "Please enter a valid hourly rate, hours per week, and weeks per year.",
  };

  if (hourlyRate <= 0 || hoursPerWeek <= 0 || weeksPerYear <= 0) {
    return defaultOutputs;
  }

  if (weeksPerYear > 52) {
    return {
      ...defaultOutputs,
      breakdown: "Weeks per year cannot exceed 52.",
    };
  }

  if (hoursPerWeek > 168) {
    return {
      ...defaultOutputs,
      breakdown: "Hours per week cannot exceed 168 (total hours in a week).",
    };
  }

  let weeklyGross: number;
  let breakdownText: string;

  if (overtimeMode === "ot_1_5x" && hoursPerWeek > OT_THRESHOLD) {
    const regularHours = OT_THRESHOLD;
    const overtimeHours = hoursPerWeek - OT_THRESHOLD;
    const regularPay = regularHours * hourlyRate;
    const overtimePay = overtimeHours * hourlyRate * OT_MULTIPLIER;
    weeklyGross = regularPay + overtimePay;
    breakdownText =
      `Rate: $${hourlyRate.toFixed(2)}/hr | ` +
      `${regularHours} regular hrs @ $${hourlyRate.toFixed(2)} = $${regularPay.toFixed(2)} + ` +
      `${overtimeHours.toFixed(1)} OT hrs @ $${(hourlyRate * OT_MULTIPLIER).toFixed(2)} (1.5×) = $${overtimePay.toFixed(2)} | ` +
      `Weekly: $${weeklyGross.toFixed(2)} × ${weeksPerYear} weeks`;
  } else {
    weeklyGross = hourlyRate * hoursPerWeek;
    breakdownText =
      `Rate: $${hourlyRate.toFixed(2)}/hr × ${hoursPerWeek} hrs/week × ${weeksPerYear} weeks | ` +
      `No overtime applied`;
  }

  const annual = weeklyGross * weeksPerYear;
  const monthly = annual / 12;
  const biweekly = annual / 26;
  // Weekly output: actual weekly gross (consistent with entered weeks/year)
  const weekly = weeklyGross;
  // Daily: assumes 5-day workweek
  const daily = weeklyGross / 5;
  const totalHoursWorked = hoursPerWeek * weeksPerYear;
  const effectiveHourly = totalHoursWorked > 0 ? annual / totalHoursWorked : 0;

  return {
    annual,
    monthly,
    biweekly,
    weekly,
    daily,
    effective_hourly: effectiveHourly,
    breakdown: breakdownText,
  };
}
