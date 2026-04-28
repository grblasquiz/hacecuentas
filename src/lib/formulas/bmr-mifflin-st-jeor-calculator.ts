export interface Inputs {
  sex: string;           // 'male' | 'female'
  weight_unit: string;   // 'lb' | 'kg'
  weight: number;
  height_unit: string;   // 'in' | 'cm'
  height: number;
  age: number;
  activity: string;      // 'sedentary' | 'light' | 'moderate' | 'active' | 'extra'
}

export interface Outputs {
  bmr: number;
  tdee: number;
  activity_factor: number;
  weight_kg: number;
  height_cm: number;
  formula_used: string;
}

// Mifflin-St Jeor equation constants (Mifflin et al., Am J Clin Nutr 1990)
const WEIGHT_COEFF = 10;    // kg coefficient
const HEIGHT_COEFF = 6.25;  // cm coefficient
const AGE_COEFF    = 5;     // age coefficient
const MALE_CONST   = 5;     // additive constant for males
const FEMALE_CONST = -161;  // additive constant for females

// Harris-Benedict activity multipliers
const ACTIVITY_FACTORS: Record<string, number> = {
  sedentary: 1.200,
  light:     1.375,
  moderate:  1.550,
  active:    1.725,
  extra:     1.900,
};

const ACTIVITY_LABELS: Record<string, string> = {
  sedentary: "Sedentary (x1.2)",
  light:     "Lightly active (x1.375)",
  moderate:  "Moderately active (x1.55)",
  active:    "Very active (x1.725)",
  extra:     "Extra active (x1.9)",
};

export function compute(i: Inputs): Outputs {
  const weight = Number(i.weight) || 0;
  const height = Number(i.height) || 0;
  const age    = Number(i.age)    || 0;

  // Validation: return safe defaults if inputs are invalid
  if (weight <= 0 || height <= 0 || age <= 0 || age > 120) {
    return {
      bmr: 0,
      tdee: 0,
      activity_factor: 0,
      weight_kg: 0,
      height_cm: 0,
      formula_used: "Please enter valid weight, height, and age.",
    };
  }

  // Unit conversions to SI (formula defined in kg / cm)
  const weight_kg = i.weight_unit === "lb" ? weight / 2.20462 : weight;
  const height_cm = i.height_unit === "in" ? height * 2.54    : height;

  // Sex constant
  const sex_const = i.sex === "female" ? FEMALE_CONST : MALE_CONST;

  // Mifflin-St Jeor BMR
  const bmr = (WEIGHT_COEFF * weight_kg)
            + (HEIGHT_COEFF * height_cm)
            - (AGE_COEFF    * age)
            + sex_const;

  // Activity multiplier
  const activity_factor = ACTIVITY_FACTORS[i.activity] ?? ACTIVITY_FACTORS["sedentary"];

  // TDEE
  const tdee = bmr * activity_factor;

  // Human-readable formula label
  const sex_label    = i.sex === "female" ? "Female" : "Male";
  const activity_lbl = ACTIVITY_LABELS[i.activity] ?? "Sedentary (x1.2)";
  const formula_used = `Mifflin-St Jeor — ${sex_label}, ${activity_lbl}`;

  return {
    bmr:             Math.round(bmr * 10) / 10,
    tdee:            Math.round(tdee * 10) / 10,
    activity_factor: activity_factor,
    weight_kg:       Math.round(weight_kg * 100) / 100,
    height_cm:       Math.round(height_cm * 100) / 100,
    formula_used,
  };
}
