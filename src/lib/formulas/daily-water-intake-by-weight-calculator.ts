export interface Inputs {
  weight: number;
  weight_unit: string;
  exercise_hours: number;
  climate: string;
  pregnancy_status: string;
}

export interface Outputs {
  liters_per_day: number;
  oz_per_day: number;
  cups_per_day: number;
  breakdown: string;
}

// Base hydration rate: 35 ml per kg bodyweight
// Source: National Academies Dietary Reference Intakes (2005)
const BASE_ML_PER_KG = 35;

// Sweat loss estimate per hour of moderate exercise
// Source: ACSM Position Stand on Exercise and Fluid Replacement (2007)
const EXERCISE_ML_PER_HOUR = 600;

// Additional ml/day for hot or humid climate
// Source: WHO Technical Notes on Drinking-Water (2011)
const HOT_CLIMATE_ML = 500;

// Additional ml/day during pregnancy
// Source: ACOG Nutrition During Pregnancy FAQ (2023)
const PREGNANCY_ML = 500;

// Additional ml/day during lactation
// Source: CDC Breastfeeding and Maternal Nutrition (2024)
const LACTATION_ML = 700;

// US fluid ounces per milliliter
const ML_PER_FL_OZ = 29.5735;

// fl oz per standard US cup
const FL_OZ_PER_CUP = 8;

// Pounds to kilograms conversion
const LB_TO_KG = 0.453592;

export function compute(i: Inputs): Outputs {
  const weightRaw = Number(i.weight) || 0;
  const exerciseHours = Math.max(Number(i.exercise_hours) || 0, 0);

  if (weightRaw <= 0) {
    return {
      liters_per_day: 0,
      oz_per_day: 0,
      cups_per_day: 0,
      breakdown: "Please enter a valid body weight."
    };
  }

  // Convert weight to kg
  const weightKg =
    i.weight_unit === "lb" ? weightRaw * LB_TO_KG : weightRaw;

  // Step 1: base intake
  const baseML = weightKg * BASE_ML_PER_KG;

  // Step 2: exercise adjustment
  const exerciseML = exerciseHours * EXERCISE_ML_PER_HOUR;

  // Step 3: climate adjustment
  const climateML = i.climate === "hot" ? HOT_CLIMATE_ML : 0;

  // Step 4: pregnancy / lactation adjustment
  let statusML = 0;
  let statusLabel = "None";
  if (i.pregnancy_status === "pregnant") {
    statusML = PREGNANCY_ML;
    statusLabel = "Pregnant (+500 ml)";
  } else if (i.pregnancy_status === "lactating") {
    statusML = LACTATION_ML;
    statusLabel = "Lactating (+700 ml)";
  }

  const totalML = baseML + exerciseML + climateML + statusML;
  const liters = totalML / 1000;
  const oz = totalML / ML_PER_FL_OZ;
  const cups = oz / FL_OZ_PER_CUP;

  // Build human-readable breakdown
  const weightDisplay =
    i.weight_unit === "lb"
      ? `${weightRaw.toFixed(1)} lb (${weightKg.toFixed(1)} kg)`
      : `${weightRaw.toFixed(1)} kg`;

  const lines: string[] = [
    `Weight: ${weightDisplay}`,
    `Base intake (${weightKg.toFixed(1)} kg × ${BASE_ML_PER_KG} ml): ${baseML.toFixed(0)} ml`,
    `Exercise (${exerciseHours} hr × ${EXERCISE_ML_PER_HOUR} ml): ${exerciseML.toFixed(0)} ml`,
    `Climate (${i.climate === "hot" ? "hot/humid" : "temperate"}): ${climateML} ml`,
    `Pregnancy/Lactation status (${statusLabel}): ${statusML} ml`,
    `──────────────────────────`,
    `Total: ${totalML.toFixed(0)} ml = ${liters.toFixed(2)} L = ${oz.toFixed(1)} fl oz = ${cups.toFixed(1)} cups`
  ];

  return {
    liters_per_day: Math.round(liters * 100) / 100,
    oz_per_day: Math.round(oz * 10) / 10,
    cups_per_day: Math.round(cups * 10) / 10,
    breakdown: lines.join("\n")
  };
}
