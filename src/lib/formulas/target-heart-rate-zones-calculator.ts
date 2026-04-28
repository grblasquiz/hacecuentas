export interface Inputs {
  age: number;
  resting_hr: number;
  max_hr_override: number;
  max_hr_formula: string;
}

export interface Outputs {
  max_hr_used: number;
  heart_rate_reserve: number;
  zone1: string;
  zone2: string;
  zone3: string;
  zone4: string;
  zone5: string;
}

// Zone intensity boundaries (Karvonen / HRR method)
// Source: ACSM Guidelines for Exercise Testing and Prescription, 11th Ed. (2022)
const ZONES: Array<{ name: string; low: number; high: number }> = [
  { name: "Z1 — Recovery",   low: 0.50, high: 0.60 },
  { name: "Z2 — Fat Burn",   low: 0.60, high: 0.70 },
  { name: "Z3 — Aerobic",    low: 0.70, high: 0.80 },
  { name: "Z4 — Threshold",  low: 0.80, high: 0.90 },
  { name: "Z5 — VO2 Max",    low: 0.90, high: 1.00 },
];

function estimateMaxHR(age: number, formula: string): number {
  if (formula === "220_minus_age") {
    // Classic formula: 220 − Age
    return 220 - age;
  }
  // Tanaka et al. (2001): 208 − 0.7 × Age — lower prediction error for adults
  return Math.round(208 - 0.7 * age);
}

function karvonenBounds(
  intensity_low: number,
  intensity_high: number,
  hrr: number,
  resting_hr: number
): { lower: number; upper: number } {
  const lower = Math.round(hrr * intensity_low + resting_hr);
  const upper = Math.round(hrr * intensity_high + resting_hr);
  return { lower, upper };
}

export function compute(i: Inputs): Outputs {
  const age = Math.round(Number(i.age) || 0);
  const resting_hr = Math.round(Number(i.resting_hr) || 0);
  const max_hr_override = Math.round(Number(i.max_hr_override) || 0);
  const max_hr_formula = i.max_hr_formula || "tanaka";

  // Validation guards
  if (age <= 0 || age > 120) {
    return {
      max_hr_used: 0,
      heart_rate_reserve: 0,
      zone1: "Enter a valid age (1–120).",
      zone2: "—",
      zone3: "—",
      zone4: "—",
      zone5: "—",
    };
  }

  if (resting_hr < 20 || resting_hr > 120) {
    return {
      max_hr_used: 0,
      heart_rate_reserve: 0,
      zone1: "Enter a valid resting heart rate (20–120 bpm).",
      zone2: "—",
      zone3: "—",
      zone4: "—",
      zone5: "—",
    };
  }

  // Determine max HR
  let max_hr_used: number;
  if (max_hr_override > 0) {
    if (max_hr_override < 100 || max_hr_override > 250) {
      return {
        max_hr_used: 0,
        heart_rate_reserve: 0,
        zone1: "Measured max HR must be between 100 and 250 bpm.",
        zone2: "—",
        zone3: "—",
        zone4: "—",
        zone5: "—",
      };
    }
    max_hr_used = max_hr_override;
  } else {
    max_hr_used = estimateMaxHR(age, max_hr_formula);
  }

  // Sanity check: resting HR must be below max HR
  if (resting_hr >= max_hr_used) {
    return {
      max_hr_used,
      heart_rate_reserve: 0,
      zone1: "Resting HR must be lower than max HR.",
      zone2: "—",
      zone3: "—",
      zone4: "—",
      zone5: "—",
    };
  }

  const heart_rate_reserve = max_hr_used - resting_hr;

  // Compute all five zones using Karvonen formula
  const results: string[] = ZONES.map((zone) => {
    const { lower, upper } = karvonenBounds(
      zone.low,
      zone.high,
      heart_rate_reserve,
      resting_hr
    );
    // For Zone 5, cap upper bound at max_hr_used to avoid exceeding 100%
    const displayUpper = zone.high >= 1.0 ? max_hr_used : upper;
    return `${lower}–${displayUpper} bpm`;
  });

  return {
    max_hr_used,
    heart_rate_reserve,
    zone1: results[0],
    zone2: results[1],
    zone3: results[2],
    zone4: results[3],
    zone5: results[4],
  };
}
