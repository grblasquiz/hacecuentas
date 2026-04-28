export interface Inputs {
  annual_salary: number;
  employee_rate: number;
  age_band: string;
  match_rate: number;
  match_cap: number;
  current_balance: number;
  annual_return: number;
}

export interface Outputs {
  employee_contribution: number;
  employer_match: number;
  total_contribution: number;
  irs_limit: number;
  limit_status: string;
  year_end_balance: number;
  match_efficiency: string;
}

export function compute(i: Inputs): Outputs {
  // Defensive coercion
  const salary = Math.max(Number(i.annual_salary) || 0, 0);
  const employeeRate = Math.min(Math.max(Number(i.employee_rate) || 0, 0), 100);
  const matchRate = Math.min(Math.max(Number(i.match_rate) || 0, 0), 100);
  const matchCap = Math.min(Math.max(Number(i.match_cap) || 0, 0), 100);
  const currentBalance = Math.max(Number(i.current_balance) || 0, 0);
  const annualReturnPct = Math.max(Number(i.annual_return) || 0, 0);
  const ageBand = i.age_band || "under_50";

  if (salary <= 0) {
    return {
      employee_contribution: 0,
      employer_match: 0,
      total_contribution: 0,
      irs_limit: 0,
      limit_status: "Enter a valid annual salary to calculate.",
      year_end_balance: 0,
      match_efficiency: "N/A"
    };
  }

  // 2026 IRS elective deferral limits — Source: IRS Rev. Proc. 2025-XX
  const IRS_LIMIT_UNDER_50 = 23500; // 2026 base limit
  const IRS_LIMIT_50_PLUS = 31000;  // 2026 base + $7,500 catch-up

  const irsLimit = ageBand === "50_plus" ? IRS_LIMIT_50_PLUS : IRS_LIMIT_UNDER_50;

  // Employee raw contribution (before IRS cap)
  const employeeRaw = salary * (employeeRate / 100);

  // Effective employee contribution (capped at IRS limit)
  const employeeContribution = Math.min(employeeRaw, irsLimit);

  // Employer match: based on the lesser of actual employee rate or match cap
  // Match is always calculated on the original salary percentage, not the capped dollar amount
  const eligibleRate = Math.min(employeeRate, matchCap);
  const employerMatch = salary * (eligibleRate / 100) * (matchRate / 100);

  // Total annual contribution
  const totalContribution = employeeContribution + employerMatch;

  // IRS limit status
  let limitStatus: string;
  if (employeeRaw > irsLimit) {
    const excess = employeeRaw - irsLimit;
    limitStatus = `⚠️ Your intended deferral ($${employeeRaw.toFixed(0)}) exceeds the 2026 IRS limit by $${excess.toFixed(0)}. Contribution was capped at $${irsLimit.toLocaleString("en-US")}.`;
  } else {
    const remaining = irsLimit - employeeContribution;
    limitStatus = `✅ Within limit. You can contribute $${remaining.toLocaleString("en-US")} more in 2026.`;
  }

  // Year-end balance projection
  // Assumes existing balance earns full-year return; contributions earn half-year return (mid-year approximation)
  const r = annualReturnPct / 100;
  const yearEndBalance =
    currentBalance * (1 + r) +
    totalContribution * (1 + r / 2);

  // Match efficiency message
  let matchEfficiency: string;
  if (matchRate <= 0 || matchCap <= 0) {
    matchEfficiency = "No employer match configured.";
  } else if (employeeRate >= matchCap) {
    matchEfficiency = `✅ Full match captured — you contribute ≥${matchCap}% of salary.`;
  } else {
    const uncapturedPct = matchCap - employeeRate;
    const uncapturedDollars = salary * (uncapturedPct / 100) * (matchRate / 100);
    matchEfficiency = `⚠️ Partial match — increase contribution by ${uncapturedPct.toFixed(1)}% to capture an additional $${uncapturedDollars.toFixed(0)}/yr in employer match.`;
  }

  return {
    employee_contribution: parseFloat(employeeContribution.toFixed(2)),
    employer_match: parseFloat(employerMatch.toFixed(2)),
    total_contribution: parseFloat(totalContribution.toFixed(2)),
    irs_limit: irsLimit,
    limit_status: limitStatus,
    year_end_balance: parseFloat(yearEndBalance.toFixed(2)),
    match_efficiency: matchEfficiency
  };
}
