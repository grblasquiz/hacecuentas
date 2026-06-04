export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number | any; }

/**
 * Snack calorie calculator — Colaciones intermedias
 *
 * Method: residual allocation from TDEE after assigning a % to main meals.
 * The remaining calories are divided equally among the day's snacks.
 *
 *   snack_kcal = (TDEE × (1 - meals_pct/100)) / num_snacks
 *
 * References:
 * - Academy of Nutrition and Dietetics — Smart Snacking (eatright.org)
 * - Westerterp-Plantenga et al., AJCN 2012 (protein satiety)
 * - OMS / Ministerio de Salud Argentina — Guías Alimentarias para la Población Argentina
 * - Dietary Guidelines for Americans 2020-2025 (USDA/HHS)
 */
export function colacionesIntermediasCaloriasSaludables(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';

  // Inputs
  const tdee = Number(i.tdee) || 0;
  const numSnacks = Number(i.num_snacks) || 2;
  const mealsPct = Number(i.meals_pct) || 80; // % of TDEE allocated to main meals

  // Guard: need a positive TDEE and valid snack count
  if (tdee <= 0 || numSnacks <= 0) {
    const err = __lang === 'en'
      ? 'Enter your daily calorie target (TDEE) and number of snacks.'
      : 'Ingresá tu requerimiento calórico diario (TDEE) y la cantidad de colaciones.';
    return { resultado: '—', resumen: err, _insight: { title: '', text: err, tone: 'warning', icon: '⚠️' } };
  }

  // Core calculation
  const snackFraction = 1 - mealsPct / 100;
  const totalSnackKcal = tdee * snackFraction;
  const kcalPerSnack = totalSnackKcal / numSnacks;

  // Round to nearest 5 kcal for practical use
  const kcalRounded = Math.round(kcalPerSnack / 5) * 5;

  // Category labels
  let category: string;
  let tone: string;
  let icon: string;

  if (kcalRounded < 100) {
    if (__lang === 'en') { category = 'Very light snack (under 100 kcal) — may not blunt hunger effectively.'; }
    else { category = 'Colación muy liviana (menos de 100 kcal) — puede no frenar el hambre.'; }
    tone = 'warning'; icon = '⚠️';
  } else if (kcalRounded <= 150) {
    if (__lang === 'en') { category = 'Light snack (100–150 kcal) — suitable for a light calorie target.'; }
    else { category = 'Colación liviana (100–150 kcal) — adecuada para un plan hipocalórico leve.'; }
    tone = 'info'; icon = '🍎';
  } else if (kcalRounded <= 250) {
    if (__lang === 'en') { category = 'Balanced snack (150–250 kcal) — ideal sweet spot for most adults.'; }
    else { category = 'Colación equilibrada (150–250 kcal) — rango ideal para la mayoría de adultos.'; }
    tone = 'success'; icon = '✅';
  } else if (kcalRounded <= 350) {
    if (__lang === 'en') { category = 'Substantial snack (250–350 kcal) — appropriate for active individuals or high TDEE.'; }
    else { category = 'Colación sustancial (250–350 kcal) — apropiada para personas activas o TDEE alto.'; }
    tone = 'info'; icon = '🏋️';
  } else {
    if (__lang === 'en') { category = 'Calorie-dense snack (over 350 kcal) — consider redistributing to fewer snacks.'; }
    else { category = 'Colación calórica densa (más de 350 kcal) — considerá reducir la cantidad de colaciones.'; }
    tone = 'warning'; icon = '⚠️';
  }

  // Human-readable summary
  const kcalStr = kcalRounded.toLocaleString('es-AR');
  const totalStr = Math.round(totalSnackKcal).toLocaleString('es-AR');
  let resumen: string;
  let insightText: string;

  if (__lang === 'en') {
    resumen = `With a ${tdee} kcal/day target and ${mealsPct}% assigned to main meals, you have ${Math.round(totalSnackKcal)} kcal left for snacks. Split across ${numSnacks} snack${numSnacks > 1 ? 's' : ''} = ${kcalRounded} kcal each. ${category}`;
    insightText = `Your **${numSnacks} daily snack${numSnacks > 1 ? 's' : ''}** should each be around **${kcalRounded} kcal**. Aim for 15-25 g protein + 5+ g fiber per snack to maximize satiety. Good options at ~${kcalRounded} kcal: Greek yogurt + berries, tuna pouch + crackers, or apple + 1 Tbsp peanut butter.`;
  } else {
    resumen = `Con un objetivo de ${tdee} kcal/día y ${mealsPct}% asignado a comidas principales, te quedan ${totalStr} kcal para colaciones. Repartidas en ${numSnacks} colación${numSnacks > 1 ? 'es' : ''} = ${kcalStr} kcal cada una. ${category}`;
    insightText = `Tus **${numSnacks} colaciones diarias** deberían aportar unas **${kcalStr} kcal cada una**. Apuntá a 15-20 g de proteína y 5+ g de fibra por colación para maximizar la saciedad. Ejemplos reales: yogur griego + fruta, atún en lata + tostada integral, o banana + cucharada de mantequilla de maní.`;
  }

  const insightTitle = __lang === 'en' ? 'Kcal per snack' : 'Kcal por colación';

  const _insight = {
    title: insightTitle,
    text: insightText,
    tone,
    icon,
  };

  return {
    resultado: `${kcalRounded} kcal`,
    resumen,
    _insight,
  };
}
