export interface Inputs {
  weight: number;
  weight_unit: string;
  goal: string;
  age: number;
}

export interface Outputs {
  protein_min: number;
  protein_max: number;
  protein_range: string;
  chicken_servings: string;
  egg_servings: string;
  tofu_servings: string;
  rate_applied: string;
}

// Evidence-based protein rate ranges (g per kg body weight per day)
// Sources: ISSN Position Stand 2017; Morton et al. BJSMed 2018; Helms et al. 2014
const RATES: Record<string, { low: number; high: number; label: string }> = {
  sedentary: { low: 0.8,  high: 0.8,  label: "0.8 g/kg (RDA, sedentary)" },
  active:    { low: 1.2,  high: 1.6,  label: "1.2–1.6 g/kg (active)" },
  build:     { low: 1.6,  high: 2.2,  label: "1.6–2.2 g/kg (muscle gain)" },
  cut:       { low: 1.8,  high: 2.4,  label: "1.8–2.4 g/kg (cut + lifting)" },
};

// USDA FoodData Central reference protein values per common serving
const CHICKEN_PROTEIN_PER_SERVING = 30;   // g — 4 oz (113 g) cooked chicken breast
const EGG_PROTEIN_PER_UNIT       = 6.3;  // g — one large egg
const TOFU_PROTEIN_PER_SERVING   = 20;   // g — 1/2 cup (126 g) firm tofu

// ESPEN 2019 senior adjustment factor for adults aged 65+
const SENIOR_AGE_THRESHOLD = 65;
const SENIOR_FACTOR        = 1.20;

export function compute(i: Inputs): Outputs {
  const weight = Number(i.weight) || 0;
  const weightUnit = i.weight_unit || "lb";
  const goal = i.goal || "active";
  const age = Number(i.age) || 30;

  if (weight <= 0) {
    return {
      protein_min: 0,
      protein_max: 0,
      protein_range: "Enter a valid body weight.",
      chicken_servings: "—",
      egg_servings: "—",
      tofu_servings: "—",
      rate_applied: "—",
    };
  }

  // Convert to kilograms
  const weightKg = weightUnit === "lb" ? weight / 2.2046 : weight;

  // Select rate range
  const rates = RATES[goal] ?? RATES["active"];

  // Senior adjustment
  const seniorFactor = age >= SENIOR_AGE_THRESHOLD ? SENIOR_FACTOR : 1.0;

  const proteinMin = Math.round(weightKg * rates.low  * seniorFactor);
  const proteinMax = Math.round(weightKg * rates.high * seniorFactor);

  // Midpoint for food equivalents
  const midpoint = (proteinMin + proteinMax) / 2;

  // Food equivalents based on midpoint
  const chickenServings = midpoint / CHICKEN_PROTEIN_PER_SERVING;
  const eggUnits        = midpoint / EGG_PROTEIN_PER_UNIT;
  const tofuServings    = midpoint / TOFU_PROTEIN_PER_SERVING;

  const seniorNote = age >= SENIOR_AGE_THRESHOLD
    ? " (+20% senior adjustment applied)"
    : "";

  const rangeText = proteinMin === proteinMax
    ? `${proteinMin} g/day${seniorNote}`
    : `${proteinMin}–${proteinMax} g/day${seniorNote}`;

  const rateNote = age >= SENIOR_AGE_THRESHOLD
    ? `${rates.label} × 1.20 (age ≥65)`
    : rates.label;

  return {
    protein_min: proteinMin,
    protein_max: proteinMax,
    protein_range: rangeText,
    chicken_servings: `~${chickenServings.toFixed(1)} servings (4 oz cooked each ≈ 30 g protein)`,
    egg_servings:     `~${eggUnits.toFixed(0)} large eggs (≈ 6.3 g each)`,
    tofu_servings:    `~${tofuServings.toFixed(1)} servings (½ cup firm tofu ≈ 20 g each)`,
    rate_applied:     rateNote,
  };
}
