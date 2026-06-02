export interface Inputs {
  sex: string;          // 'male' | 'female'
  weight_unit: string;  // 'lb' | 'kg'
  weight: number;
  height_unit: string;  // 'in' | 'cm'
  height: number;
}

export interface Outputs {
  lbm_kg: number;
  lbm_lb: number;
  fat_mass_kg: number;
  fat_mass_lb: number;
  lbm_percent: number;
  body_fat_percent: number;
  formula_used: string;
  _insight?: any;
  _chart?: any;
}

// Boer (1984) formula coefficients — source: PubMed 6496691
// Male:   LBM (kg) = 0.407 * weight_kg + 0.267 * height_cm - 19.2
// Female: LBM (kg) = 0.252 * weight_kg + 0.473 * height_cm - 48.3
const BOER_MALE   = { wCoef: 0.407, hCoef: 0.267, intercept: -19.2 };
const BOER_FEMALE = { wCoef: 0.252, hCoef: 0.473, intercept: -48.3 };

const LB_PER_KG   = 2.20462;
const KG_PER_LB   = 1 / LB_PER_KG;   // 0.453592
const CM_PER_IN   = 2.54;

export function compute(i: Inputs): Outputs {
  const defaultOut: Outputs = {
    lbm_kg: 0,
    lbm_lb: 0,
    fat_mass_kg: 0,
    fat_mass_lb: 0,
    lbm_percent: 0,
    body_fat_percent: 0,
    formula_used: "Enter valid weight and height to calculate.",
  };

  const weight  = Number(i.weight)  || 0;
  const height  = Number(i.height)  || 0;
  const sex     = (i.sex         || "male").toLowerCase().trim();
  const wUnit   = (i.weight_unit || "lb").toLowerCase().trim();
  const hUnit   = (i.height_unit || "in").toLowerCase().trim();

  if (weight <= 0 || height <= 0) return defaultOut;

  // Convert to kg and cm
  const weight_kg: number = wUnit === "lb" ? weight * KG_PER_LB : weight;
  const height_cm: number = hUnit === "in" ? height * CM_PER_IN : height;

  // Guard against physiologically implausible values
  if (weight_kg < 20 || weight_kg > 300) {
    return { ...defaultOut, formula_used: "Weight out of range (20–300 kg). Please check your input." };
  }
  if (height_cm < 100 || height_cm > 250) {
    return { ...defaultOut, formula_used: "Height out of range (100–250 cm). Please check your input." };
  }

  const coef = sex === "female" ? BOER_FEMALE : BOER_MALE;
  const sexLabel = sex === "female" ? "Female" : "Male";

  let lbm_kg = coef.wCoef * weight_kg + coef.hCoef * height_cm + coef.intercept;

  // LBM cannot exceed total weight or be negative
  if (lbm_kg < 0)        lbm_kg = 0;
  if (lbm_kg > weight_kg) lbm_kg = weight_kg;

  const lbm_lb       = lbm_kg * LB_PER_KG;
  const fat_mass_kg  = weight_kg - lbm_kg;
  const fat_mass_lb  = fat_mass_kg * LB_PER_KG;
  const lbm_percent  = weight_kg > 0 ? (lbm_kg / weight_kg) * 100 : 0;
  const body_fat_percent = weight_kg > 0 ? (fat_mass_kg / weight_kg) * 100 : 0;

  const formula_used =
    sex === "female"
      ? `Boer (1984) ${sexLabel}: LBM = 0.252 × ${weight_kg.toFixed(1)} kg + 0.473 × ${height_cm.toFixed(1)} cm − 48.3`
      : `Boer (1984) ${sexLabel}: LBM = 0.407 × ${weight_kg.toFixed(1)} kg + 0.267 × ${height_cm.toFixed(1)} cm − 19.2`;

  const lbmKgR = Math.round(lbm_kg * 100) / 100;
  const fatKgR = Math.round(fat_mass_kg * 100) / 100;
  const lbmPctR = Math.round(lbm_percent * 10) / 10;
  const bfPctR = Math.round(body_fat_percent * 10) / 10;

  // Body-fat category bands (ACE general ranges), sex-aware
  const isFemale = sex === "female";
  let bfCategory: string;
  let tone: "good" | "warn" | "neutral";
  if (isFemale) {
    if (bfPctR < 14) { bfCategory = "very low (essential/athletic)"; tone = "warn"; }
    else if (bfPctR < 21) { bfCategory = "athletic"; tone = "good"; }
    else if (bfPctR < 25) { bfCategory = "fitness"; tone = "good"; }
    else if (bfPctR < 32) { bfCategory = "average"; tone = "neutral"; }
    else { bfCategory = "above average"; tone = "warn"; }
  } else {
    if (bfPctR < 6) { bfCategory = "very low (essential/athletic)"; tone = "warn"; }
    else if (bfPctR < 14) { bfCategory = "athletic"; tone = "good"; }
    else if (bfPctR < 18) { bfCategory = "fitness"; tone = "good"; }
    else if (bfPctR < 25) { bfCategory = "average"; tone = "neutral"; }
    else { bfCategory = "above average"; tone = "warn"; }
  }

  return {
    lbm_kg:          lbmKgR,
    lbm_lb:          Math.round(lbm_lb * 100) / 100,
    fat_mass_kg:     fatKgR,
    fat_mass_lb:     Math.round(fat_mass_lb * 100) / 100,
    lbm_percent:     lbmPctR,
    body_fat_percent: bfPctR,
    formula_used,
    _insight: {
      title: "Your body composition",
      text: `Your lean body mass is **${lbmKgR} kg** (${lbmPctR}% of body weight), with **${fatKgR} kg** of fat (**${bfPctR}%** body fat) — that lands in the **${bfCategory}** range for ${isFemale ? "women" : "men"}. LBM is the figure to protect when cutting calories.`,
      tone,
      icon: "💪",
    },
    _chart: {
      type: "doughnut",
      slices: [
        { label: "Lean mass", value: lbmKgR },
        { label: "Fat mass", value: fatKgR },
      ],
      prefix: "",
      centerValue: `${Math.round(weight_kg * 10) / 10} kg`,
      centerLabel: "body weight",
      ariaLabel: `Body weight ${Math.round(weight_kg * 10) / 10} kg: ${lbmKgR} kg lean mass plus ${fatKgR} kg fat mass`,
    },
  };
}
