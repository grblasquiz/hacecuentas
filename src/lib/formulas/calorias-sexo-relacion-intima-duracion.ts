export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }

/**
 * Calories burned during sexual activity.
 *
 * Formula: Calories = (MET × 3.5 × weight_kg × duration_min) / 200
 * Source: Ainsworth BE et al. 2011 Compendium of Physical Activities;
 *         Frappier J et al. (2013) PLOS ONE 8(10):e79342 — empirical MET values.
 *
 * MET values per intensity:
 *   light    → 2.0  (foreplay, very passive; Compendium code 19011 ~1.5–2.0)
 *   moderate → 3.5  (typical encounter; between Compendium 2.8 and Frappier ~5.8 midpoint)
 *   vigorous → 6.0  (Frappier 2013: men 6.0, women 5.6 — using 6.0 as vigorous reference)
 *   very_vigorous → 7.5 (brief high-exertion episodes, upper empirical range)
 *
 * Sex-specific adjustment: women burn ~30–32% less than men at same intensity
 * (Frappier: men 101 kcal avg / women 69.1 kcal avg ≈ 68% ratio).
 * Applied as a sex multiplier: male=1.00, female=0.68.
 *
 * YMYL disclaimer: values are estimates for informational purposes only.
 */

const MET_MAP: Record<string, number> = {
  light: 2.0,
  moderate: 3.5,
  vigorous: 6.0,
  very_vigorous: 7.5,
};

const SEX_MULTIPLIER: Record<string, number> = {
  male: 1.0,
  female: 0.68,
};

const INTENSITY_LABELS: Record<string, Record<string, string>> = {
  es: {
    light: 'suave',
    moderate: 'moderada',
    vigorous: 'intensa',
    very_vigorous: 'muy intensa',
  },
  en: {
    light: 'light',
    moderate: 'moderate',
    vigorous: 'vigorous',
    very_vigorous: 'very vigorous',
  },
  pt: {
    light: 'leve',
    moderate: 'moderada',
    vigorous: 'intensa',
    very_vigorous: 'muito intensa',
  },
};

const SEX_LABELS: Record<string, Record<string, string>> = {
  es: { male: 'hombre', female: 'mujer' },
  en: { male: 'male', female: 'female' },
  pt: { male: 'homem', female: 'mulher' },
};

export function caloriasSexoRelacionIntimaDuracion(i: Inputs): Outputs {
  const lang = (typeof i.__lang === 'string' ? i.__lang : 'es') as string;
  const L = INTENSITY_LABELS[lang] ?? INTENSITY_LABELS['es'];
  const SL = SEX_LABELS[lang] ?? SEX_LABELS['es'];

  const weightKg = Number(i.peso_kg) || 70;
  const durationMin = Number(i.duracion_min) || 20;
  const intensity = typeof i.intensidad === 'string' ? i.intensidad : 'moderate';
  const sex = typeof i.sexo === 'string' ? i.sexo : 'male';

  const met = MET_MAP[intensity] ?? MET_MAP['moderate'];
  const sexMult = SEX_MULTIPLIER[sex] ?? 1.0;

  // Standard MET-based calorie formula: (MET × 3.5 × kg × min) / 200
  // Then apply sex-specific multiplier from Frappier 2013 empirical data
  const rawCalories = (met * 3.5 * weightKg * durationMin) / 200;
  const calories = rawCalories * sexMult;
  const calMin = calories / durationMin;

  const intensityLabel = L[intensity] ?? intensity;
  const sexLabel = SL[sex] ?? sex;
  const calFormatted = Math.round(calories);
  const calMinFormatted = calMin.toFixed(1);

  // Contextual comparison: calories to minutes of walking (~3.5 kcal/min at 70 kg)
  const walkingEquivMin = Math.round(calories / 3.5);

  let resultado: string;
  let resumen: string;
  let insightText: string;

  if (lang === 'en') {
    resultado = `${calFormatted} kcal`;
    resumen = `${calFormatted} kcal burned in ${durationMin} min of ${intensityLabel} activity (${calMinFormatted} kcal/min). Equivalent to ~${walkingEquivMin} min of brisk walking.`;
    insightText = `At **${intensityLabel}** intensity, a ${sexLabel} weighing ${weightKg} kg burns approximately **${calFormatted} kcal** in ${durationMin} minutes — about ${calMinFormatted} kcal per minute. That's roughly equivalent to ${walkingEquivMin} minutes of brisk walking. Remember: this is an estimate — individual physiology, position and role all vary.`;
  } else if (lang === 'pt') {
    resultado = `${calFormatted} kcal`;
    resumen = `${calFormatted} kcal queimadas em ${durationMin} min de atividade ${intensityLabel} (${calMinFormatted} kcal/min). Equivalente a ~${walkingEquivMin} min de caminhada rápida.`;
    insightText = `Com intensidade **${intensityLabel}**, um ${sexLabel} de ${weightKg} kg queima aproximadamente **${calFormatted} kcal** em ${durationMin} minutos — cerca de ${calMinFormatted} kcal por minuto. Isso equivale a ~${walkingEquivMin} minutos de caminhada rápida. Lembre: é uma estimativa — fisiologia individual, posição e papel variam.`;
  } else {
    resultado = `${calFormatted} kcal`;
    resumen = `${calFormatted} kcal quemadas en ${durationMin} min de actividad ${intensityLabel} (${calMinFormatted} kcal/min). Equivale a ~${walkingEquivMin} min de caminata a paso rápido.`;
    insightText = `Con intensidad **${intensityLabel}**, un ${sexLabel} de ${weightKg} kg quema aproximadamente **${calFormatted} kcal** en ${durationMin} minutos — unas ${calMinFormatted} kcal por minuto. Eso equivale a ~${walkingEquivMin} minutos de caminata a paso rápido. Recordá: es una estimación — la fisiología individual, la posición y el rol varían.`;
  }

  const _insight = {
    title: lang === 'en' ? 'Calories burned' : lang === 'pt' ? 'Calorias queimadas' : 'Calorías quemadas',
    text: insightText,
    tone: 'neutral',
    icon: '🔥',
    _chart: {
      type: 'donut',
      label: lang === 'en' ? 'Energy distribution (kcal)' : lang === 'pt' ? 'Distribuição de energia (kcal)' : 'Distribución energética (kcal)',
      segments: [
        {
          label: lang === 'en' ? 'Burned during sex' : lang === 'pt' ? 'Queimado durante o sexo' : 'Quemado en el encuentro',
          value: calFormatted,
        },
        {
          label: lang === 'en' ? 'Equivalent walking (min)' : lang === 'pt' ? 'Caminhada equivalente (min)' : 'Caminata equivalente (min)',
          value: walkingEquivMin,
        },
      ],
    },
  };

  return { resultado, resumen, _insight };
}
