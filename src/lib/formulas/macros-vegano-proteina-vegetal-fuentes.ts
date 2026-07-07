/**
 * Calculadora de macros para dieta vegana con proteína vegetal
 *
 * Metodología:
 * 1. TMB (Tasa Metabólica Basal) via Mifflin-St Jeor (ACSM, 2021)
 * 2. TDEE = TMB × factor de actividad
 * 3. Calorías objetivo ajustadas por meta (−15 % / 0 % / +15 %)
 * 4. Proteína: factor aumentado 10 % para veganos por menor PDCAAS medio
 *    (Academy of Nutrition and Dietetics / Dietitians of Canada, 2016)
 * 5. Grasa: 28 % de las calorías objetivo (dentro del rango saludable 20-35 %)
 * 6. Carbohidratos: calorías restantes ÷ 4
 *
 * Fuentes:
 * - Mifflin MD et al. (1990) J Am Diet Assoc 90:1106-1110
 * - Academy of Nutrition and Dietetics, Dietitians of Canada, ACSM (2016)
 *   "Nutrition and Athletic Performance" Med Sci Sports Exerc 48(3):543-568
 * - Messina M et al. (2019) "No Difference Between the Effects of
 *   Supplementing With Soy Protein Versus Animal Protein on Gains in
 *   Muscle Mass and Strength in Response to Resistance Exercise"
 * - Dietary Reference Intakes for Energy (NASEM, 2023)
 */

export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }

// ─── Lookup tables ────────────────────────────────────────────────────────────

const ACTIVITY_FACTORS: Record<string, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  veryActive: 1.9,
};

// Protein g/kg vegan-adjusted (omnivore baseline ×1.1)
// Goal: lose=1.65, maintain=1.0, gain=1.87 (capped recs from ISSN 2017)
const PROTEIN_FACTOR: Record<string, number> = {
  lose: 1.65,
  maintain: 1.0,
  gain: 1.87,
};

// Top plant protein sources (protein g / 100 g cooked or as-is)
const PLANT_SOURCES = [
  { name_es: 'Seitán', name_en: 'Seitan', g: 25 },
  { name_es: 'Tempeh', name_en: 'Tempeh', g: 21 },
  { name_es: 'Tofu firme', name_en: 'Firm tofu', g: 17 },
  { name_es: 'Lentejas (cocidas)', name_en: 'Lentils (cooked)', g: 9 },
  { name_es: 'Garbanzos (cocidos)', name_en: 'Chickpeas (cooked)', g: 9 },
  { name_es: 'Edamame', name_en: 'Edamame', g: 11 },
  { name_es: 'Semillas de cáñamo', name_en: 'Hemp seeds', g: 32 },
  { name_es: 'Quinoa (cocida)', name_en: 'Quinoa (cooked)', g: 4 },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

function activityLabel(key: string, lang: 'es' | 'en'): string {
  const labels: Record<string, [string, string]> = {
    sedentary:  ['Sedentario/a', 'Sedentary'],
    light:      ['Ligeramente activo/a', 'Lightly active'],
    moderate:   ['Moderadamente activo/a', 'Moderately active'],
    active:     ['Activo/a', 'Active'],
    veryActive: ['Muy activo/a', 'Very active'],
  };
  const pair = labels[key] ?? ['Moderadamente activo/a', 'Moderately active'];
  return lang === 'en' ? pair[1] : pair[0];
}

function goalLabel(key: string, lang: 'es' | 'en'): string {
  const labels: Record<string, [string, string]> = {
    lose:     ['Perder peso', 'Lose weight'],
    maintain: ['Mantener peso', 'Maintain weight'],
    gain:     ['Ganar masa muscular', 'Build muscle'],
  };
  const pair = labels[key] ?? ['Mantener peso', 'Maintain weight'];
  return lang === 'en' ? pair[1] : pair[0];
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function macrosVeganoProteinaVegetalFuentes(i: Inputs): Outputs {
  const __lang: 'es' | 'en' = i.__lang === 'en' ? 'en' : 'es';

  // ── Parse inputs ───────────────────────────────────────────────────────────
  const pesoKg   = Number(i.pesoKg)   || 70;   // default 70 kg
  const altCm    = Number(i.altCm)    || 170;   // default 170 cm
  const edad     = Number(i.edad)     || 30;    // default 30 años
  const sexo     = String(i.sexo     || 'mujer');
  const actividad= String(i.actividad || 'moderate');
  const meta     = String(i.meta     || 'maintain');

  // ── Clamp extremes ─────────────────────────────────────────────────────────
  const kg   = Math.max(30, Math.min(200, pesoKg));
  const cm   = Math.max(100, Math.min(250, altCm));
  const age  = Math.max(15, Math.min(90,  edad));

  // ── Mifflin-St Jeor BMR ────────────────────────────────────────────────────
  // Male:   BMR = 10×kg + 6.25×cm − 5×age + 5
  // Female: BMR = 10×kg + 6.25×cm − 5×age − 161
  const bmr = sexo === 'hombre'
    ? 10 * kg + 6.25 * cm - 5 * age + 5
    : 10 * kg + 6.25 * cm - 5 * age - 161;

  // ── TDEE ───────────────────────────────────────────────────────────────────
  const af   = ACTIVITY_FACTORS[actividad] ?? 1.55;
  const tdee = bmr * af;

  // ── Goal-adjusted calories ─────────────────────────────────────────────────
  const goalAdj: Record<string, number> = {
    lose: 0.85, maintain: 1.0, gain: 1.15,
  };
  const kcalObjetivo = tdee * (goalAdj[meta] ?? 1.0);

  // ── Macros ─────────────────────────────────────────────────────────────────
  const pFactor   = PROTEIN_FACTOR[meta] ?? 1.0;
  const protG     = round1(kg * pFactor);
  const protKcal  = protG * 4;

  const fatPct    = 0.28;
  const grasaKcal = kcalObjetivo * fatPct;
  const grasaG    = round1(grasaKcal / 9);

  const carbKcal  = Math.max(0, kcalObjetivo - protKcal - grasaKcal);
  const carbG     = round1(carbKcal / 4);

  const kcalFinal = round1(kcalObjetivo);
  const protPct   = round1((protKcal / kcalObjetivo) * 100);
  const grasaPct  = round1((grasaKcal / kcalObjetivo) * 100);
  const carbPct   = round1((carbKcal  / kcalObjetivo) * 100);

  // ── Plant source table ─────────────────────────────────────────────────────
  // How many grams of each source needed to hit the daily protein target
  const sourcesText = PLANT_SOURCES.map(s => {
    const gramsNeeded = Math.round((protG / s.g) * 100);
    const srcName = __lang === 'en' ? s.name_en : s.name_es;
    return __lang === 'en'
      ? `${srcName}: ${s.g} g protein/100 g → ~${gramsNeeded} g/day to reach goal`
      : `${srcName}: ${s.g} g proteína/100 g → ~${gramsNeeded} g/día para tu meta`;
  }).join('\n');

  // ── Text outputs ───────────────────────────────────────────────────────────
  const actLbl  = activityLabel(actividad, __lang);
  const metaLbl = goalLabel(meta, __lang);

  const resultado = __lang === 'en'
    ? `${kcalFinal} kcal/day → Protein ${protG} g · Fat ${grasaG} g · Carbs ${carbG} g`
    : `${kcalFinal} kcal/día → Proteína ${protG} g · Grasa ${grasaG} g · Carbohidratos ${carbG} g`;

  const resumen = __lang === 'en'
    ? `**Goal:** ${metaLbl} | **Activity:** ${actLbl}\n`
    + `**Calories:** ${kcalFinal} kcal/day (BMR ${Math.round(bmr)} × ${af} activity factor)\n`
    + `**Protein:** ${protG} g (${protPct}%) — vegan-adjusted ${pFactor} g/kg\n`
    + `**Fat:** ${grasaG} g (${grasaPct}%)\n`
    + `**Carbohydrates:** ${carbG} g (${carbPct}%)\n\n`
    + `**Plant protein sources to meet your ${protG} g target:**\n${sourcesText}`
    : `**Meta:** ${metaLbl} | **Actividad:** ${actLbl}\n`
    + `**Calorías:** ${kcalFinal} kcal/día (TMB ${Math.round(bmr)} × factor ${af})\n`
    + `**Proteína:** ${protG} g (${protPct}%) — ajuste vegano ${pFactor} g/kg\n`
    + `**Grasa:** ${grasaG} g (${grasaPct}%)\n`
    + `**Carbohidratos:** ${carbG} g (${carbPct}%)\n\n`
    + `**Fuentes de proteína vegetal para tus ${protG} g/día:**\n${sourcesText}`;

  const insightTitle = __lang === 'en' ? 'Your vegan macros' : 'Tus macros veganos';
  const insightText = __lang === 'en'
    ? `You need **${protG} g of protein** per day to ${metaLbl.toLowerCase()} (${pFactor} g/kg, vegan-adjusted). `
    + `Total energy: **${kcalFinal} kcal/day**. `
    + `Top sources: seitan (25 g/100 g), hemp seeds (32 g/100 g), tempeh (21 g/100 g), edamame (11 g/100 g).`
    : `Necesitás **${protG} g de proteína** por día para ${metaLbl.toLowerCase()} (${pFactor} g/kg, ajuste vegano). `
    + `Energía total: **${kcalFinal} kcal/día**. `
    + `Mejores fuentes: seitán (25 g/100 g), semillas de cáñamo (32 g/100 g), tempeh (21 g/100 g), edamame (11 g/100 g).`;

  const insightTone = meta === 'lose' ? 'warning' : meta === 'gain' ? 'positive' : 'neutral';

  return {
    resultado,
    resumen,
    _insight: {
      title: insightTitle,
      text:  insightText,
      tone:  insightTone,
      icon:  '🌱',
    },
  };
}
