export interface Inputs {
  principal: number;
  annual_rate: number;
  years: number;
  compounding: string;
}

export interface Outputs {
  simple_total: number;
  simple_interest_earned: number;
  compound_total: number;
  compound_interest_earned: number;
  difference: number;
  multiplier: number;
  yearly_table: string;
}

// Compounding frequency map — periods per year
const COMPOUNDING_N: Record<string, number> = {
  annually: 1,
  semiannually: 2,
  quarterly: 4,
  monthly: 12,
  daily: 365,
  continuously: Infinity,
};

function calcCompound(principal: number, r: number, n: number, t: number): number {
  if (n === Infinity) {
    // Continuous compounding: A = P * e^(r*t)
    return principal * Math.exp(r * t);
  }
  // Standard compound: A = P * (1 + r/n)^(n*t)
  return principal * Math.pow(1 + r / n, n * t);
}

function calcSimple(principal: number, r: number, t: number): number {
  return principal * (1 + r * t);
}

export function compute(i: Inputs): Outputs {
  const principal = Number(i.principal) || 0;
  const annual_rate = Number(i.annual_rate) || 0;
  const years = Math.round(Number(i.years) || 0);
  const compounding = i.compounding || "monthly";

  // --- Input validation ---
  if (principal <= 0) {
    return {
      simple_total: 0,
      simple_interest_earned: 0,
      compound_total: 0,
      compound_interest_earned: 0,
      difference: 0,
      multiplier: 0,
      yearly_table: "Enter a valid principal amount greater than $0.",
    };
  }
  if (annual_rate <= 0) {
    return {
      simple_total: principal,
      simple_interest_earned: 0,
      compound_total: principal,
      compound_interest_earned: 0,
      difference: 0,
      multiplier: 1,
      yearly_table: "Enter an interest rate greater than 0%.",
    };
  }
  if (years <= 0) {
    return {
      simple_total: principal,
      simple_interest_earned: 0,
      compound_total: principal,
      compound_interest_earned: 0,
      difference: 0,
      multiplier: 1,
      yearly_table: "Enter a time period of at least 1 year.",
    };
  }

  const r = annual_rate / 100;
  const n = COMPOUNDING_N[compounding] ?? 12; // default monthly if unknown

  // --- Core calculations ---
  const simple_total = calcSimple(principal, r, years);
  const simple_interest_earned = simple_total - principal;

  const compound_total = calcCompound(principal, r, n, years);
  const compound_interest_earned = compound_total - principal;

  const difference = compound_total - simple_total;
  const multiplier = simple_total > 0 ? compound_total / simple_total : 0;

  // --- Year-by-year table (text) ---
  // Show up to 50 rows; for longer terms, show every 5 years plus final
  const MAX_FULL_ROWS = 30;
  let tableLines: string[] = [];
  tableLines.push("Year | Simple Balance | Compound Balance | Difference");
  tableLines.push("-----|---------------|------------------|----------");

  const step = years > MAX_FULL_ROWS ? 5 : 1;
  const yearPoints: number[] = [];

  for (let y = step; y <= years; y += step) {
    yearPoints.push(y);
  }
  // Always include the final year if not already present
  if (yearPoints.length === 0 || yearPoints[yearPoints.length - 1] !== years) {
    yearPoints.push(years);
  }

  for (const y of yearPoints) {
    const sBalance = calcSimple(principal, r, y);
    const cBalance = calcCompound(principal, r, n, y);
    const diff = cBalance - sBalance;

    const fmt = (val: number): string =>
      "$" + val.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");

    const diffStr = diff >= 0 ? "+" + fmt(diff) : "-" + fmt(Math.abs(diff));
    tableLines.push(
      `Yr ${String(y).padStart(3)} | ${fmt(sBalance).padStart(14)} | ${fmt(cBalance).padStart(16)} | ${diffStr}`
    );
  }

  const compoundingLabel: Record<string, string> = {
    annually: "annual",
    semiannually: "semi-annual",
    quarterly: "quarterly",
    monthly: "monthly",
    daily: "daily",
    continuously: "continuous",
  };
  const freqLabel = compoundingLabel[compounding] || compounding;
  tableLines.unshift(
    `Compounding: ${freqLabel} | Rate: ${annual_rate}% | Principal: $${principal.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`
  );
  tableLines.unshift("");

  const yearly_table = tableLines.join("\n");

  return {
    simple_total: Math.round(simple_total * 100) / 100,
    simple_interest_earned: Math.round(simple_interest_earned * 100) / 100,
    compound_total: Math.round(compound_total * 100) / 100,
    compound_interest_earned: Math.round(compound_interest_earned * 100) / 100,
    difference: Math.round(difference * 100) / 100,
    multiplier: Math.round(multiplier * 10000) / 10000,
    yearly_table,
  };
}
