import { IRS_401K } from "../data/usa-2026";

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
  _insight?: any;
  _chart?: any;
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

  // 2026 IRS elective deferral limits — fuente única src/lib/data/usa-2026.ts (IRS Notice 2025-67)
  const IRS_LIMIT_UNDER_50 = IRS_401K.deferralUnder50; // $24,500 (§402(g))
  const IRS_LIMIT_50_PLUS = IRS_401K.deferralUnder50 + IRS_401K.catchUp50; // $32,500 con catch-up 50+
  const IRS_LIMIT_60_63 = IRS_401K.deferralUnder50 + IRS_401K.superCatchUp60_63; // $35,750 super catch-up 60–63

  const irsLimit =
    ageBand === "60_63" ? IRS_LIMIT_60_63 :
    ageBand === "50_plus" ? IRS_LIMIT_50_PLUS :
    IRS_LIMIT_UNDER_50;

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

  // Narrative insight — interprets the real numbers (employer match = free money)
  const fmt0 = (n: number) => "$" + Math.round(n).toLocaleString("en-US");
  const matchShare = totalContribution > 0 ? (employerMatch / totalContribution) * 100 : 0;
  let insightText: string;
  let insightTone: "good" | "warn" | "neutral";
  if (matchRate <= 0 || matchCap <= 0) {
    insightText = `You're setting aside **${fmt0(employeeContribution)}/yr** of your own pay. With no employer match configured, every dollar here is yours alone — consider whether your plan offers a match you haven't entered.`;
    insightTone = "neutral";
  } else if (employeeRate >= matchCap) {
    insightText = `You're capturing the **full employer match of ${fmt0(employerMatch)}/yr** — free money that makes up **${matchShare.toFixed(0)}%** of your **${fmt0(totalContribution)}** total contribution. That's an instant, guaranteed return on top of market growth.`;
    insightTone = "good";
  } else {
    const uncapturedPct = matchCap - employeeRate;
    const uncapturedDollars = salary * (uncapturedPct / 100) * (matchRate / 100);
    insightText = `You're leaving **${fmt0(uncapturedDollars)}/yr** in employer match on the table. Raising your deferral by **${uncapturedPct.toFixed(1)}%** of salary would unlock that free money — it's a guaranteed return you can't get anywhere else.`;
    insightTone = "warn";
  }

  return {
    employee_contribution: parseFloat(employeeContribution.toFixed(2)),
    employer_match: parseFloat(employerMatch.toFixed(2)),
    total_contribution: parseFloat(totalContribution.toFixed(2)),
    irs_limit: irsLimit,
    limit_status: limitStatus,
    year_end_balance: parseFloat(yearEndBalance.toFixed(2)),
    match_efficiency: matchEfficiency,
    _insight: {
      title: "What your contribution really means",
      text: insightText,
      tone: insightTone,
      icon: "💰"
    },
    // Donut: total annual contribution split into your money vs. employer's match
    _chart: employerMatch > 0 ? {
      type: "doughnut",
      slices: [
        { label: "Your contribution", value: parseFloat(employeeContribution.toFixed(2)) },
        { label: "Employer match", value: parseFloat(employerMatch.toFixed(2)) }
      ],
      prefix: "$",
      centerValue: fmt0(totalContribution),
      centerLabel: "Total / yr",
      ariaLabel: `Annual 401(k) contribution of ${fmt0(totalContribution)}: ${fmt0(employeeContribution)} from you and ${fmt0(employerMatch)} from your employer's match.`
    } : undefined
  };
}
