export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }

/**
 * 16/8 Intermittent Fasting Calorie Calculator
 *
 * Method:
 * 1. BMR via Mifflin-St. Jeor (1990) — recommended by the American Dietetic Association
 *    Men:   BMR = 10×weight + 6.25×height − 5×age + 5
 *    Women: BMR = 10×weight + 6.25×height − 5×age − 161
 * 2. TDEE = BMR × activity factor (Ainsworth et al.)
 * 3. Target calories = TDEE × goal multiplier (deficit/maintenance/surplus)
 * 4. Distribute across the 8-hour eating window:
 *    Meal 1 (break-fast): 35%
 *    Meal 2 (lunch/main): 40%
 *    Snack / Meal 3:      25%
 *
 * Source: Mifflin MD et al., Am J Clin Nutr. 1990;51(2):241-247
 */
export function ayunoIntermitente168Calorias(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';

  const peso    = Number(i.peso)    || 0;   // kg
  const altura  = Number(i.altura)  || 0;   // cm
  const edad    = Number(i.edad)    || 0;   // years
  const sexo    = String(i.sexo    || 'masculino');
  const actividad = String(i.actividad || '1.375');
  const objetivo  = String(i.objetivo  || 'mantenimiento');

  // --- guards ---
  if (peso <= 0 || altura <= 0 || edad <= 0) {
    const errMsg = __lang === 'en'
      ? 'Please enter valid weight, height and age.'
      : 'Ingresá peso, altura y edad válidos.';
    return { resultado: '', meal1: '', meal2: '', meal3: '', resumen: errMsg };
  }

  // 1. BMR — Mifflin-St. Jeor
  const sexConstant = (sexo === 'femenino' || sexo === 'female') ? -161 : 5;
  const bmr = 10 * peso + 6.25 * altura - 5 * edad + sexConstant;

  // 2. TDEE
  const actFactor = parseFloat(actividad) || 1.375;
  const tdee = bmr * actFactor;

  // 3. Goal adjustment
  let goalFactor = 1.0;
  if (objetivo === 'deficit_leve' || objetivo === 'mild_deficit')     goalFactor = 0.85; // −15% ≈ −500 kcal típico
  if (objetivo === 'deficit_moderado' || objetivo === 'mod_deficit')  goalFactor = 0.75; // −25%
  if (objetivo === 'superavit' || objetivo === 'surplus')             goalFactor = 1.10; // +10% bulk moderado
  const targetKcal = Math.round(tdee * goalFactor);

  // 4. 16:8 meal distribution (3 meals inside the 8-hour window)
  const m1 = Math.round(targetKcal * 0.35); // 35% — first meal (break fast)
  const m2 = Math.round(targetKcal * 0.40); // 40% — main meal
  const m3 = Math.round(targetKcal * 0.25); // 25% — snack / light meal

  // Macros at ~30% protein, 40% carbs, 30% fat (balanced IF approach)
  const protG = Math.round((targetKcal * 0.30) / 4);
  const carbG = Math.round((targetKcal * 0.40) / 4);
  const fatG  = Math.round((targetKcal * 0.30) / 9);

  // Human-readable labels
  const goalLabel: Record<string, { es: string; en: string }> = {
    mantenimiento:    { es: 'mantenimiento',    en: 'maintenance' },
    deficit_leve:     { es: 'déficit leve',     en: 'mild deficit' },
    mild_deficit:     { es: 'déficit leve',     en: 'mild deficit' },
    deficit_moderado: { es: 'déficit moderado', en: 'moderate deficit' },
    mod_deficit:      { es: 'déficit moderado', en: 'moderate deficit' },
    superavit:        { es: 'superávit',        en: 'surplus' },
    surplus:          { es: 'superávit',        en: 'surplus' },
  };
  const glabel = goalLabel[objetivo]?.[__lang] ?? objetivo;

  const resultado = `${targetKcal} kcal`;

  let resumen: string;
  let insightText: string;

  if (__lang === 'en') {
    resumen =
      `BMR: ${Math.round(bmr)} kcal/day · TDEE: ${Math.round(tdee)} kcal/day · ` +
      `Target (${glabel}): ${targetKcal} kcal · ` +
      `Macros: ${protG}g protein / ${carbG}g carbs / ${fatG}g fat`;
    insightText =
      `Your TDEE is **${Math.round(tdee)} kcal/day**. For **${glabel}**, aim for ` +
      `**${targetKcal} kcal** inside your 8-hour window. ` +
      `Split it as: Meal 1 (break-fast) **${m1} kcal** → Main meal **${m2} kcal** → Snack **${m3} kcal**. ` +
      `Prioritise protein (≥${protG}g) to preserve muscle mass and stay full until the next day's eating window.`;
  } else {
    resumen =
      `TMB: ${Math.round(bmr)} kcal/día · TDEE: ${Math.round(tdee)} kcal/día · ` +
      `Objetivo (${glabel}): ${targetKcal} kcal · ` +
      `Macros: ${protG}g proteína / ${carbG}g carbos / ${fatG}g grasas`;
    insightText =
      `Tu TDEE es **${Math.round(tdee)} kcal/día**. Para **${glabel}**, tu objetivo es ` +
      `**${targetKcal} kcal** dentro de la ventana de 8 horas. ` +
      `Distribuilo así: 1.ª comida (romper el ayuno) **${m1} kcal** → Comida principal **${m2} kcal** → Merienda **${m3} kcal**. ` +
      `Priorizá proteína (≥${protG}g) para preservar masa muscular y llegar saciado al próximo día.`;
  }

  const insight = __lang === 'en'
    ? { title: 'Calorie distribution for your 8-hour window', text: insightText, tone: 'positive', icon: '⏰' }
    : { title: 'Distribución calórica para tu ventana de 8 horas', text: insightText, tone: 'positive', icon: '⏰' };

  return {
    resultado,
    meal1: `${m1} kcal`,
    meal2: `${m2} kcal`,
    meal3: `${m3} kcal`,
    resumen,
    _insight: insight,
  };
}
