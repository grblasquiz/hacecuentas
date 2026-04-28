export interface Inputs {
  input_mode: string;       // 'direct' | 'bmr'
  tdee_direct: number;      // kcal/day (used when input_mode === 'direct')
  weight_lb: number;        // lb
  height_in: number;        // inches
  age: number;              // years
  sex: string;              // 'male' | 'female'
  activity: string;         // sedentary | light | moderate | active | extra
  goal: string;             // 'cut' | 'maintain' | 'bulk'
  protein_target: string;   // '1.0_per_lb' | '0.9_per_lb' | '0.8_per_lb' | '0.7_per_lb'
  fat_pct: string;          // '25' | '27' | '30'
}

export interface Outputs {
  target_kcal: number;
  protein_g: number;
  protein_pct: number;
  fat_g: number;
  fat_pct_out: number;
  carbs_g: number;
  carbs_pct: number;
  tdee_used: number;
  notes: string;
}

// Activity multipliers — Mifflin-St Jeor / Harris-Benedict convention
const ACTIVITY_MULTIPLIERS: Record<string, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  extra: 1.9,
};

// Goal calorie adjustments
const GOAL_MULTIPLIERS: Record<string, number> = {
  cut: 0.80,
  maintain: 1.00,
  bulk: 1.10,
};

// Protein multipliers (g per lb of bodyweight)
const PROTEIN_MULTIPLIERS: Record<string, number> = {
  "1.0_per_lb": 1.0,
  "0.9_per_lb": 0.9,
  "0.8_per_lb": 0.8,
  "0.7_per_lb": 0.7,
};

// Caloric density constants (kcal/g)
const KCAL_PER_G_PROTEIN = 4;
const KCAL_PER_G_CARB    = 4;
const KCAL_PER_G_FAT     = 9;

// Minimum fat floor (g) to protect hormonal health
const MIN_FAT_G = 40;

export function compute(i: Inputs): Outputs {
  const defaultOut: Outputs = {
    target_kcal: 0,
    protein_g: 0,
    protein_pct: 0,
    fat_g: 0,
    fat_pct_out: 0,
    carbs_g: 0,
    carbs_pct: 0,
    tdee_used: 0,
    notes: "Please fill in all required fields.",
  };

  // ── Step 1: Determine TDEE ──────────────────────────────────────────────
  let tdee = 0;
  const mode = (i.input_mode || "direct").trim();

  if (mode === "direct") {
    tdee = Number(i.tdee_direct) || 0;
    if (tdee <= 0) {
      return { ...defaultOut, notes: "Enter a valid TDEE greater than 0 kcal/day." };
    }
  } else {
    // BMR via Mifflin-St Jeor
    // Inputs conversion: lb → kg, inches → cm
    const weight_lb = Number(i.weight_lb) || 0;
    const height_in = Number(i.height_in) || 0;
    const age       = Number(i.age)       || 0;

    if (weight_lb <= 0 || height_in <= 0 || age <= 0) {
      return { ...defaultOut, notes: "Enter valid weight, height, and age to calculate BMR." };
    }

    const weight_kg = weight_lb / 2.20462;
    const height_cm = height_in * 2.54;
    const sex = (i.sex || "male").trim();

    // Mifflin-St Jeor (1990), validated by Frankenfield et al. JADA 2005
    let bmr: number;
    if (sex === "female") {
      bmr = (10 * weight_kg) + (6.25 * height_cm) - (5 * age) - 161;
    } else {
      bmr = (10 * weight_kg) + (6.25 * height_cm) - (5 * age) + 5;
    }

    if (bmr <= 0) {
      return { ...defaultOut, notes: "BMR calculation returned an invalid result. Check inputs." };
    }

    const activityKey = (i.activity || "moderate").trim();
    const activityMultiplier = ACTIVITY_MULTIPLIERS[activityKey] ?? 1.55;
    tdee = bmr * activityMultiplier;
  }

  tdee = Math.round(tdee);

  // ── Step 2: Apply goal adjustment ──────────────────────────────────────
  const goalKey = (i.goal || "cut").trim();
  const goalMultiplier = GOAL_MULTIPLIERS[goalKey] ?? 0.80;
  const target_kcal = Math.round(tdee * goalMultiplier);

  // ── Step 3: Protein grams ───────────────────────────────────────────────
  const weight_lb_num = Number(i.weight_lb) || 0;
  // When input_mode is 'direct', we still need weight_lb for protein
  // If weight_lb is 0 (direct mode, not entered), we cannot compute protein
  let usedWeightLb = weight_lb_num;
  if (mode === "direct" && usedWeightLb <= 0) {
    return { ...defaultOut, notes: "Enter your bodyweight (lb) to calculate protein targets." };
  }

  const proteinKey = (i.protein_target || "1.0_per_lb").trim();
  const proteinMultiplier = PROTEIN_MULTIPLIERS[proteinKey] ?? 1.0;
  const protein_g = Math.round(usedWeightLb * proteinMultiplier);
  const protein_kcal = protein_g * KCAL_PER_G_PROTEIN;

  // ── Step 4: Fat grams ───────────────────────────────────────────────────
  const fatPctValue = Number(i.fat_pct) || 27;
  const fat_pct_decimal = fatPctValue / 100;
  let fat_g = Math.round((target_kcal * fat_pct_decimal) / KCAL_PER_G_FAT);

  // Enforce minimum fat floor
  fat_g = Math.max(fat_g, MIN_FAT_G);
  const fat_kcal = fat_g * KCAL_PER_G_FAT;

  // ── Step 5: Carbohydrates (remainder) ──────────────────────────────────
  const remaining_kcal = target_kcal - protein_kcal - fat_kcal;
  let carbs_g = Math.round(remaining_kcal / KCAL_PER_G_CARB);
  let notesArr: string[] = [];

  if (carbs_g < 0) {
    // Protein + fat exceed target calories — cap protein
    notesArr.push(
      "⚠️ Protein + fat exceed target calories. Protein has been reduced to fit. Consider a less aggressive deficit, lower fat %, or a lower protein multiplier."
    );
    const available_for_protein_kcal = target_kcal - fat_kcal;
    const capped_protein_g = Math.max(0, Math.round(available_for_protein_kcal / KCAL_PER_G_PROTEIN));
    // Recalculate with capped protein
    const new_protein_kcal = capped_protein_g * KCAL_PER_G_PROTEIN;
    const new_remaining = target_kcal - new_protein_kcal - fat_kcal;
    carbs_g = Math.max(0, Math.round(new_remaining / KCAL_PER_G_CARB));

    // Use capped values
    const actual_protein_g = capped_protein_g;
    const actual_protein_kcal = actual_protein_g * KCAL_PER_G_PROTEIN;
    const actual_carbs_kcal = carbs_g * KCAL_PER_G_CARB;
    const actual_fat_kcal = fat_g * KCAL_PER_G_FAT;
    const total_kcal_check = actual_protein_kcal + actual_fat_kcal + actual_carbs_kcal;

    const protein_pct_out = total_kcal_check > 0 ? Math.round((actual_protein_kcal / total_kcal_check) * 100) : 0;
    const fat_pct_out_val  = total_kcal_check > 0 ? Math.round((actual_fat_kcal    / total_kcal_check) * 100) : 0;
    const carbs_pct_out    = total_kcal_check > 0 ? Math.round((actual_carbs_kcal  / total_kcal_check) * 100) : 0;

    if (target_kcal < 1200) {
      notesArr.push("⚠️ Target calories are below 1,200 kcal/day — consult a registered dietitian before proceeding.");
    }

    return {
      target_kcal,
      protein_g: actual_protein_g,
      protein_pct: protein_pct_out,
      fat_g,
      fat_pct_out: fat_pct_out_val,
      carbs_g,
      carbs_pct: carbs_pct_out,
      tdee_used: tdee,
      notes: notesArr.join(" "),
    };
  }

  // ── Percentages ─────────────────────────────────────────────────────────
  const actual_protein_kcal = protein_g * KCAL_PER_G_PROTEIN;
  const actual_fat_kcal     = fat_g * KCAL_PER_G_FAT;
  const actual_carbs_kcal   = carbs_g * KCAL_PER_G_CARB;
  const total_kcal_check = actual_protein_kcal + actual_fat_kcal + actual_carbs_kcal;

  const protein_pct_out = total_kcal_check > 0 ? Math.round((actual_protein_kcal / total_kcal_check) * 100) : 0;
  const fat_pct_out_val  = total_kcal_check > 0 ? Math.round((actual_fat_kcal    / total_kcal_check) * 100) : 0;
  const carbs_pct_out    = total_kcal_check > 0 ? Math.round((actual_carbs_kcal  / total_kcal_check) * 100) : 0;

  // Low-calorie warning
  if (target_kcal < 1200) {
    notesArr.push("⚠️ Target calories are below 1,200 kcal/day — consult a registered dietitian before proceeding.");
  } else if (target_kcal < 1500) {
    notesArr.push("Note: Target calories are below 1,500 kcal/day. Monitor energy levels closely and consider whether this deficit is sustainable.");
  }

  const goalLabel: Record<string, string> = {
    cut: "Cut (−20% deficit)",
    maintain: "Maintenance",
    bulk: "Lean Bulk (+10% surplus)",
  };

  if (notesArr.length === 0) {
    notesArr.push(
      `Goal: ${goalLabel[goalKey] ?? goalKey}. Recalculate every 4–6 weeks or after a 5 lb weight change.`
    );
  }

  return {
    target_kcal,
    protein_g,
    protein_pct: protein_pct_out,
    fat_g,
    fat_pct_out: fat_pct_out_val,
    carbs_g,
    carbs_pct: carbs_pct_out,
    tdee_used: tdee,
    notes: notesArr.join(" "),
  };
}
