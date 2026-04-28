export interface Inputs {
  input_method: string;
  tdee_direct: number;
  weight: number;
  height: number;
  age: number;
  sex: string;
  activity: string;
  goal: string;
  protein_per_kg: string;
  fat_pct: string;
}

export interface Outputs {
  target_kcal: number;
  protein_g: string;
  fat_g: string;
  carbs_g: string;
  macro_summary: string;
  food_examples: string;
  tdee_used: string;
}

// Factores de actividad — Fuente: FAO/OMS/UNU 2004, Mifflin-St Jeor 1990
const ACTIVITY_FACTORS: Record<string, number> = {
  sedentary: 1.20,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.90,
};

// Ajuste calórico según objetivo
const GOAL_MULTIPLIERS: Record<string, number> = {
  deficit: 0.80,      // -20%
  maintenance: 1.00,
  surplus: 1.10,      // +10%
};

// Densidad calórica de macronutrientes (kcal/g)
const KCAL_PER_G_PROTEIN = 4;
const KCAL_PER_G_CARBS = 4;
const KCAL_PER_G_FAT = 9;

function calcTMB(weight: number, height: number, age: number, sex: string): number {
  // Ecuación de Mifflin-St Jeor (1990)
  // Hombres: 10*peso + 6.25*altura - 5*edad + 5
  // Mujeres: 10*peso + 6.25*altura - 5*edad - 161
  if (sex === 'female') {
    return 10 * weight + 6.25 * height - 5 * age - 161;
  }
  return 10 * weight + 6.25 * height - 5 * age + 5;
}

function getFoodExamples(proteinG: number, carbsG: number, fatG: number): string {
  const lines: string[] = [];

  // Proteína
  lines.push(`🥩 Proteína (~${Math.round(proteinG)} g): pechuga de pollo (~30 g proteína/100 g), atún en agua (~25 g/100 g), huevo entero (~6 g/unidad), queso cottage (~11 g/100 g), legumbres cocidas (~8 g/100 g).`);

  // Carbohidratos
  lines.push(`🌾 Carbohidratos (~${Math.round(carbsG)} g): arroz blanco cocido (~28 g/100 g), avena (~60 g/100 g seco), papa cocida (~17 g/100 g), plátano (~23 g/100 g), pan integral (~40 g/100 g).`);

  // Grasa
  lines.push(`🥑 Grasa (~${Math.round(fatG)} g): aguacate (~15 g grasa/100 g), aceite de oliva (~100 g/100 ml), nueces (~65 g/100 g), salmón (~13 g/100 g).`);

  return lines.join('\n');
}

export function compute(i: Inputs): Outputs {
  const weight = Number(i.weight) || 0;
  const height = Number(i.height) || 0;
  const age = Number(i.age) || 0;
  const sex = i.sex || 'male';
  const activity = i.activity || 'moderate';
  const goal = i.goal || 'maintenance';
  const proteinPerKg = parseFloat(i.protein_per_kg) || 1.8;
  const fatPct = parseFloat(i.fat_pct) || 28;
  const inputMethod = i.input_method || 'direct';
  const tdeeDirectRaw = Number(i.tdee_direct) || 0;

  const defaultOut: Outputs = {
    target_kcal: 0,
    protein_g: 'Datos insuficientes',
    fat_g: 'Datos insuficientes',
    carbs_g: 'Datos insuficientes',
    macro_summary: 'Completa los campos requeridos.',
    food_examples: '',
    tdee_used: 'Sin datos',
  };

  let tdee = 0;
  let tdeeLabel = '';

  if (inputMethod === 'direct') {
    if (tdeeDirectRaw <= 0) return defaultOut;
    tdee = tdeeDirectRaw;
    tdeeLabel = `${Math.round(tdee)} kcal/día (ingresado manualmente)`;
  } else {
    // Calcular desde TMB + actividad
    if (weight <= 0 || height <= 0 || age <= 0) return defaultOut;
    if (weight > 300 || height > 250 || age > 120) return defaultOut;

    const tmb = calcTMB(weight, height, age, sex);
    const actFactor = ACTIVITY_FACTORS[activity] ?? 1.55;
    tdee = tmb * actFactor;
    tdeeLabel = `${Math.round(tdee)} kcal/día (TMB ${Math.round(tmb)} kcal × factor ${actFactor})`;
  }

  if (tdee <= 0) return defaultOut;

  // Peso para cálculo de proteína (si se ingresa GET directo y no hay peso, usamos 70 kg como default)
  const effectiveWeight = weight > 0 ? weight : 70;

  const goalMultiplier = GOAL_MULTIPLIERS[goal] ?? 1.00;
  const targetKcal = Math.round(tdee * goalMultiplier);

  // Proteína
  const proteinGrams = proteinPerKg * effectiveWeight;
  const proteinKcal = proteinGrams * KCAL_PER_G_PROTEIN;

  // Grasa
  const fatKcal = targetKcal * (fatPct / 100);
  const fatGrams = fatKcal / KCAL_PER_G_FAT;

  // Carbohidratos (residual)
  const carbsKcal = targetKcal - proteinKcal - fatKcal;
  const carbsGrams = carbsKcal / KCAL_PER_G_CARBS;

  // Porcentajes reales
  const proteinPct = Math.round((proteinKcal / targetKcal) * 100);
  const fatPctActual = Math.round((fatKcal / targetKcal) * 100);
  const carbsPct = Math.round((carbsKcal / targetKcal) * 100);

  // Verificar que carbos no sean negativos
  if (carbsGrams < 0) {
    return {
      target_kcal: targetKcal,
      protein_g: `${Math.round(proteinGrams)} g (${proteinPct}% — ${Math.round(proteinKcal)} kcal)`,
      fat_g: `${Math.round(fatGrams)} g (${fatPctActual}% — ${Math.round(fatKcal)} kcal)`,
      carbs_g: '⚠️ Resultado negativo: reduce el ratio de proteína o el % de grasa',
      macro_summary: `Con ${proteinPerKg} g/kg de proteína y ${fatPct}% de grasa, las calorías objetivo de ${targetKcal} kcal no son suficientes. Considera reducir proteína a 1.6 g/kg o el % de grasa a 25%.`,
      food_examples: '',
      tdee_used: tdeeLabel,
    };
  }

  const goalLabels: Record<string, string> = {
    deficit: 'Déficit −20%',
    maintenance: 'Mantenimiento',
    surplus: 'Volumen +10%',
  };

  const macroSummary = `Objetivo: ${goalLabels[goal] ?? goal} | Proteína: ${proteinPct}% | Grasa: ${fatPctActual}% | Carbohidratos: ${carbsPct}% | Total: ${targetKcal} kcal/día`;

  const foodExamples = getFoodExamples(proteinGrams, carbsGrams, fatGrams);

  return {
    target_kcal: targetKcal,
    protein_g: `${Math.round(proteinGrams)} g  (${proteinPct}% — ${Math.round(proteinKcal)} kcal)`,
    fat_g: `${Math.round(fatGrams)} g  (${fatPctActual}% — ${Math.round(fatKcal)} kcal)`,
    carbs_g: `${Math.round(carbsGrams)} g  (${carbsPct}% — ${Math.round(carbsKcal)} kcal)`,
    macro_summary: macroSummary,
    food_examples: foodExamples,
    tdee_used: tdeeLabel,
  };
}
