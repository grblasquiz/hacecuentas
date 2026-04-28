export interface Inputs {
  sex: string;          // 'male' | 'female'
  age: number;
  weight_lb: number;
  skinfold1: number;    // chest (men) / triceps (women), mm
  skinfold2: number;    // abdominal (men) / suprailiac (women), mm
  skinfold3: number;    // thigh (both), mm
}

export interface Outputs {
  body_fat_pct: number;
  classification: string;
  fat_mass_lb: number;
  lean_mass_lb: number;
  body_density: number;
}

// ─── Constants ───────────────────────────────────────────────────────────────
// Jackson & Pollock (1978) — Men: chest + abdominal + thigh
const JP_MALE_A = 1.10938;
const JP_MALE_B = 0.0008267;
const JP_MALE_C = 0.0000016;
const JP_MALE_D = 0.0002574;

// Jackson, Pollock & Ward (1980) — Women: triceps + suprailiac + thigh
const JP_FEMALE_A = 1.0994921;
const JP_FEMALE_B = 0.0009929;
const JP_FEMALE_C = 0.0000023;
const JP_FEMALE_D = 0.0001392;

// Siri (1956) two-compartment model: BF% = ((4.95 / Db) - 4.50) * 100
const SIRI_A = 4.95;
const SIRI_B = 4.50;

// ACE body fat classification thresholds (American Council on Exercise, 2024)
// [essential_max, athlete_max, fitness_max, average_max]
const ACE_MALE   = [5,  13, 17, 24]; // >=25 => obese
const ACE_FEMALE = [13, 20, 24, 31]; // >=32 => obese

function classify(bf: number, sex: string): string {
  const thresholds = sex === 'female' ? ACE_FEMALE : ACE_MALE;
  if (bf <= thresholds[0]) return 'Essential Fat';
  if (bf <= thresholds[1]) return 'Athlete';
  if (bf <= thresholds[2]) return 'Fitness';
  if (bf <= thresholds[3]) return 'Average';
  return 'Obese';
}

export function compute(i: Inputs): Outputs {
  const sex      = (i.sex || 'male').toLowerCase();
  const age      = Number(i.age)       || 0;
  const weightLb = Number(i.weight_lb) || 0;
  const sf1      = Number(i.skinfold1) || 0;
  const sf2      = Number(i.skinfold2) || 0;
  const sf3      = Number(i.skinfold3) || 0;

  const defaults: Outputs = {
    body_fat_pct:   0,
    classification: 'Enter valid values',
    fat_mass_lb:    0,
    lean_mass_lb:   0,
    body_density:   0,
  };

  if (age <= 0 || age > 120)         return { ...defaults, classification: 'Enter a valid age (1–120)' };
  if (weightLb <= 0)                  return { ...defaults, classification: 'Enter a valid body weight' };
  if (sf1 <= 0 || sf2 <= 0 || sf3 <= 0) return { ...defaults, classification: 'All skinfold values must be > 0 mm' };
  if (sf1 > 100 || sf2 > 100 || sf3 > 100) return { ...defaults, classification: 'Skinfold values seem too large (max 100 mm)' };

  const S  = sf1 + sf2 + sf3;  // sum of three skinfolds (mm)
  const S2 = S * S;

  let Db: number;
  if (sex === 'female') {
    // Jackson, Pollock & Ward (1980)
    Db = JP_FEMALE_A - (JP_FEMALE_B * S) + (JP_FEMALE_C * S2) - (JP_FEMALE_D * age);
  } else {
    // Jackson & Pollock (1978)
    Db = JP_MALE_A - (JP_MALE_B * S) + (JP_MALE_C * S2) - (JP_MALE_D * age);
  }

  // Guard against physically impossible density
  if (Db <= 0 || Db > 1.15) {
    return { ...defaults, classification: 'Calculated density out of range — check inputs' };
  }

  // Siri (1956)
  const bfPct = ((SIRI_A / Db) - SIRI_B) * 100;

  // Clamp to physiological range
  if (bfPct < 1 || bfPct > 70) {
    return { ...defaults, classification: 'Result out of physiological range — check skinfold values' };
  }

  const fatMassLb  = weightLb * (bfPct / 100);
  const leanMassLb = weightLb - fatMassLb;

  return {
    body_fat_pct:   Math.round(bfPct * 10) / 10,
    classification: classify(bfPct, sex),
    fat_mass_lb:    Math.round(fatMassLb  * 10) / 10,
    lean_mass_lb:   Math.round(leanMassLb * 10) / 10,
    body_density:   Math.round(Db * 100000) / 100000,
  };
}
