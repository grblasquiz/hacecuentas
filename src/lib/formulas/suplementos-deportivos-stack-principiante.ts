export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }

/**
 * Beginner supplement stack calculator.
 *
 * Methodology sources:
 *  - ISSN Position Stand: Protein & Exercise (2017) — 1.4–2.0 g/kg for exercising individuals,
 *    up to 2.2 g/kg for hypertrophy. PMC5477153.
 *  - ISSN Position Stand: Creatine (2017, 2021) — loading: 0.3 g/kg/day × 5–7 d;
 *    maintenance: 0.03 g/kg/day (min 3 g). PMC5469049.
 *  - Omega-3 DHA/EPA supplementation: 1–2 g/day for vegans/vegetarians (EFSA NDA panel 2012).
 *  - Caffeine ergogenic use: 3–6 mg/kg body weight pre-workout (ISSN 2021 caffeine stand).
 */

// Protein multipliers (g/kg body weight) by goal — from ISSN 2017 Position Stand
const PROTEIN_FACTOR: Record<string, [number, number]> = {
  health:     [1.2, 1.4],  // general fitness / health maintenance
  definition: [1.6, 1.8],  // fat loss while preserving muscle mass
  muscle:     [1.8, 2.2],  // hypertrophy / muscle gain
  strength:   [1.6, 2.0],  // strength-focused (powerlifting, etc.)
};

// Creatine: ISSN formula — 0.03 g/kg/day maintenance, min 3 g; 0.3 g/kg/day loading (5–7 days)
function creatineDose(weightKg: number): { maintenance: number; loading: number } {
  const maintenance = Math.max(3, Math.round(weightKg * 0.03 * 10) / 10);
  const loading = Math.round(weightKg * 0.3 * 10) / 10;
  return { maintenance, loading };
}

export function suplementosDeportivosStackPrincipiante(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';

  const weightKg = Math.max(1, Number(i.peso_kg) || 70);
  const goal = String(i.objetivo || 'muscle');
  const diet = String(i.dieta || 'omnivore');
  const trainingDays = Math.min(7, Math.max(1, Number(i.dias_semana) || 3));

  // ── Protein target ─────────────────────────────────────────────────────────
  const [proteinLow, proteinHigh] = PROTEIN_FACTOR[goal] ?? PROTEIN_FACTOR['muscle'];
  const proteinMinG = Math.round(weightKg * proteinLow);
  const proteinMaxG = Math.round(weightKg * proteinHigh);
  // Mid-point for a single displayed target
  const proteinTargetG = Math.round((proteinMinG + proteinMaxG) / 2);

  // ── Creatine ───────────────────────────────────────────────────────────────
  const { maintenance: creatineMaint, loading: creatineLoad } = creatineDose(weightKg);
  // Vegans have depleted baseline, same dose but highlight in text
  const creatineNote = diet === 'vegan' || diet === 'vegetarian';

  // ── Caffeine ───────────────────────────────────────────────────────────────
  // Only relevant if training ≥3 days/week; 3–6 mg/kg, cap 400 mg absolute (EFSA)
  const caffeineMinMg = Math.round(weightKg * 3);
  const caffeineMaxMg = Math.min(400, Math.round(weightKg * 6));
  const showCaffeine = trainingDays >= 3;

  // ── Omega-3 ────────────────────────────────────────────────────────────────
  const showOmega3 = diet === 'vegan' || diet === 'vegetarian';

  // ── Build result strings ───────────────────────────────────────────────────
  const proteinText = `${proteinMinG}–${proteinMaxG} g/día (${proteinLow}–${proteinHigh} g/kg)`;
  const creatineText = `${creatineMaint} g/día (${creatineLoad} g/día × 5–7 días para carga rápida)`;
  const creatineTextEn = `${creatineMaint} g/day maintenance (${creatineLoad} g/day × 5–7 days loading phase)`;
  const caffeineText = showCaffeine
    ? `${caffeineMinMg}–${caffeineMaxMg} mg/entrenamiento`
    : ((__lang === 'en') ? 'Not needed at this frequency' : 'No necesario con esta frecuencia');
  const caffeineTextEn = showCaffeine
    ? `${caffeineMinMg}–${caffeineMaxMg} mg per training session`
    : 'Not needed at this frequency';

  // ── Priority stack label ───────────────────────────────────────────────────
  // Determines which supplements to prioritize based on goal
  let priorityStack: string;
  let priorityStackEn: string;

  if (goal === 'health') {
    priorityStack = 'Proteína en polvo (si no cubrís con dieta) · Creatina monohidrato';
    priorityStackEn = 'Protein powder (if diet falls short) · Creatine monohydrate';
  } else if (goal === 'definition') {
    priorityStack = 'Proteína en polvo · Creatina monohidrato';
    priorityStackEn = 'Protein powder · Creatine monohydrate';
  } else if (goal === 'strength') {
    priorityStack = 'Creatina monohidrato · Proteína en polvo';
    priorityStackEn = 'Creatine monohydrate · Protein powder';
  } else {
    // muscle (default)
    priorityStack = 'Creatina monohidrato · Proteína en polvo · Cafeína (pre-entreno opcional)';
    priorityStackEn = 'Creatine monohydrate · Protein powder · Caffeine (optional pre-workout)';
  }

  if (showOmega3) {
    priorityStack += ' · Omega-3 de algas (DHA/EPA)';
    priorityStackEn += ' · Algae omega-3 (DHA/EPA)';
  }

  // ── Insight ────────────────────────────────────────────────────────────────
  const vegaNote = creatineNote
    ? (__lang === 'en'
        ? ' As a vegan/vegetarian your baseline muscle creatine is ~20% lower — creatine is especially worthwhile for you.'
        : ' Como vegano/vegetariano, tus niveles musculares de creatina de base son ~20% menores — la suplementación es especialmente relevante para vos.')
    : '';

  const _insight = {
    title: __lang === 'en' ? 'Your beginner stack' : 'Tu stack de principiante',
    text: __lang === 'en'
      ? `Based on your **${weightKg} kg** body weight and **${trainingDays}×/week** training, your daily protein target is **${proteinMinG}–${proteinMaxG} g** and creatine maintenance is **${creatineMaint} g/day**. Priority supplements: ${priorityStackEn}.${vegaNote}`
      : `Con tu peso de **${weightKg} kg** y **${trainingDays} días/semana** de entrenamiento, tu objetivo proteico diario es **${proteinMinG}–${proteinMaxG} g** y la dosis de mantenimiento de creatina es **${creatineMaint} g/día**. Stack prioritario: ${priorityStack}.${vegaNote}`,
    tone: 'positive',
    icon: '💊',
  };

  // ── Resumen (secondary output) ─────────────────────────────────────────────
  const resumen = __lang === 'en'
    ? `Protein: ${proteinText.replace('g/día', 'g/day').replace('g/kg', 'g/kg')} | Creatine (maintenance): ${creatineTextEn} | Caffeine: ${caffeineTextEn}`
    : `Proteína: ${proteinText} | Creatina (mantenimiento): ${creatineText} | Cafeína: ${caffeineText}`;

  // Primary output: protein target (mid-range) in grams
  const resultado = `${proteinMinG}–${proteinMaxG}`;

  return { resultado, resumen, _insight };
}
