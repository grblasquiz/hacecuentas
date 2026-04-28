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

  return {
    lbm_kg:          Math.round(lbm_kg * 100) / 100,
    lbm_lb:          Math.round(lbm_lb * 100) / 100,
    fat_mass_kg:     Math.round(fat_mass_kg * 100) / 100,
    fat_mass_lb:     Math.round(fat_mass_lb * 100) / 100,
    lbm_percent:     Math.round(lbm_percent * 10) / 10,
    body_fat_percent: Math.round(body_fat_percent * 10) / 10,
    formula_used,
  };
}
