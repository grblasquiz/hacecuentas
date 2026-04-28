export interface Inputs {
  weight: number;
  weight_unit: string;
  reps: number;
}

export interface Outputs {
  epley_1rm: number;
  brzycki_1rm: number;
  lombardi_1rm: number;
  average_1rm: number;
  pct_50: number;
  pct_60: number;
  pct_70: number;
  pct_80: number;
  pct_85: number;
  pct_90: number;
  pct_95: number;
  unit_label: string;
  notes: string;
}

// Epley (1985): 1RM = w * (1 + r/30)
// Brzycki (1993): 1RM = w * 36 / (37 - r)
// Lombardi (1989): 1RM = w * r^0.10
// Source: LeSuer et al. (1997), JSCR; NSCA ESTS 4th Ed.

export function compute(i: Inputs): Outputs {
  const weight = Number(i.weight) || 0;
  const reps = Math.round(Number(i.reps) || 0);
  const unit = i.weight_unit === "kg" ? "kg" : "lb";

  const defaultOut: Outputs = {
    epley_1rm: 0,
    brzycki_1rm: 0,
    lombardi_1rm: 0,
    average_1rm: 0,
    pct_50: 0,
    pct_60: 0,
    pct_70: 0,
    pct_80: 0,
    pct_85: 0,
    pct_90: 0,
    pct_95: 0,
    unit_label: unit,
    notes: "Enter a valid weight and reps (1–15) to estimate your 1RM.",
  };

  if (weight <= 0) {
    return { ...defaultOut, notes: "Please enter a weight greater than zero." };
  }

  if (reps < 1) {
    return { ...defaultOut, unit_label: unit, notes: "Please enter at least 1 rep." };
  }

  // For reps = 1, all formulas return exactly w (actual 1RM performed)
  // Brzycki denominator becomes 36 which is fine
  if (reps >= 37) {
    // Brzycki denominator (37 - reps) <= 0 → formula undefined
    return {
      ...defaultOut,
      unit_label: unit,
      notes: "Brzycki formula requires fewer than 37 reps. For sets above 15 reps, 1RM estimation is unreliable — use a heavier weight for 3–10 reps.",
    };
  }

  let notes = "";
  if (reps > 10) {
    notes = "Accuracy is reduced above 10 reps. For best results, re-test with a heavier weight for 3–5 reps.";
  } else if (reps === 1) {
    notes = "You entered 1 rep — this is your actual lift weight, used directly as the 1RM.";
  } else {
    notes = `Estimated from ${reps} reps at ${weight.toFixed(1)} ${unit}. Best accuracy at 3–5 reps.`;
  }

  // Epley: 1RM = w * (1 + r/30)
  const epley_1rm = reps === 1 ? weight : weight * (1 + reps / 30);

  // Brzycki: 1RM = w * 36 / (37 - r)
  const brzycki_1rm = reps === 1 ? weight : weight * 36 / (37 - reps);

  // Lombardi: 1RM = w * r^0.10
  const lombardi_1rm = reps === 1 ? weight : weight * Math.pow(reps, 0.10);

  // Average of three formulas
  const average_1rm = (epley_1rm + brzycki_1rm + lombardi_1rm) / 3;

  // Training percentage table (based on average 1RM, rounded to 1 decimal)
  const round1 = (v: number) => Math.round(v * 10) / 10;

  const pct_50 = round1(average_1rm * 0.50);
  const pct_60 = round1(average_1rm * 0.60);
  const pct_70 = round1(average_1rm * 0.70);
  const pct_80 = round1(average_1rm * 0.80);
  const pct_85 = round1(average_1rm * 0.85);
  const pct_90 = round1(average_1rm * 0.90);
  const pct_95 = round1(average_1rm * 0.95);

  return {
    epley_1rm: round1(epley_1rm),
    brzycki_1rm: round1(brzycki_1rm),
    lombardi_1rm: round1(lombardi_1rm),
    average_1rm: round1(average_1rm),
    pct_50,
    pct_60,
    pct_70,
    pct_80,
    pct_85,
    pct_90,
    pct_95,
    unit_label: unit,
    notes,
  };
}
