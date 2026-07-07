export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }

/**
 * Aquatic turtle daily feeding calculator
 *
 * Formula: Daily_portion_g = Body_weight_g × Feeding_rate
 * Where Feeding_rate varies by life stage (derived from age):
 *   Hatchling (0–1 yr):   3.0% per day, feed daily (7×/week)
 *   Juvenile  (1–4 yrs):  2.0% per day, feed 4–5×/week
 *   Sub-adult (4–7 yrs):  1.5% per day, feed 3–4×/week
 *   Adult     (7+ yrs):   1.0% per day, feed 3×/week
 *
 * Sources: ARAV herpetological veterinary guidelines; Mader "Reptile Medicine
 * and Surgery" (3rd ed.); Trachemys scripta husbandry literature.
 */
export function tortugaAguaDietaPesoEdad(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : i.__lang === 'pt' ? 'pt' : 'es';

  const peso = Number(i.peso_g) || 0;
  const edad = Number(i.edad_anios) || 0;

  // Determine life stage
  let stage: 'hatchling' | 'juvenile' | 'subadult' | 'adult';
  let feedingRate: number; // fraction of body weight per day
  let sessionsPerWeek: number;
  let proteinPct: number;
  let vegPct: number;

  if (edad < 1) {
    stage = 'hatchling';
    feedingRate = 0.030;
    sessionsPerWeek = 7;
    proteinPct = 60;
    vegPct = 40;
  } else if (edad < 4) {
    stage = 'juvenile';
    feedingRate = 0.020;
    sessionsPerWeek = 4;
    proteinPct = 35;
    vegPct = 65;
  } else if (edad < 7) {
    stage = 'subadult';
    feedingRate = 0.015;
    sessionsPerWeek = 3;
    proteinPct = 25;
    vegPct = 75;
  } else {
    stage = 'adult';
    feedingRate = 0.010;
    sessionsPerWeek = 3;
    proteinPct = 20;
    vegPct = 80;
  }

  const dailyGrams = peso * feedingRate;
  const weeklyGrams = dailyGrams * sessionsPerWeek;
  const perSessionGrams = sessionsPerWeek > 0 ? weeklyGrams / sessionsPerWeek : 0;

  const dailyStr = dailyGrams.toFixed(1);
  const weeklyStr = weeklyGrams.toFixed(1);
  const perSessionStr = perSessionGrams.toFixed(1);

  // Stage labels
  const stageLabel = {
    es: { hatchling: 'cría (0–1 año)', juvenile: 'juvenil (1–4 años)', subadult: 'sub-adulto (4–7 años)', adult: 'adulto (7+ años)' },
    en: { hatchling: 'hatchling (0–1 yr)', juvenile: 'juvenile (1–4 yrs)', subadult: 'sub-adult (4–7 yrs)', adult: 'adult (7+ yrs)' },
    pt: { hatchling: 'filhote (0–1 ano)', juvenile: 'jovem (1–4 anos)', subadult: 'sub-adulto (4–7 anos)', adult: 'adulto (7+ anos)' },
  }[__lang][stage];

  let resultado: string;
  let resumen: string;
  let insightText: string;

  if (peso <= 0) {
    resultado = __lang === 'en' ? '0.0 g/day' : '0,0 g/día';
    resumen = __lang === 'en'
      ? 'Enter the turtle\'s weight in grams to get a feeding recommendation.'
      : __lang === 'pt'
      ? 'Informe o peso da tartaruga em gramas para obter a recomendação.'
      : 'Ingresá el peso de la tortuga en gramos para obtener la recomendación.';
    insightText = resumen;
  } else if (__lang === 'en') {
    resultado = `${dailyStr} g/day`;
    resumen = `Stage: ${stageLabel} — ${perSessionStr} g per session, ${sessionsPerWeek}×/week (${weeklyStr} g/week). Diet: ${proteinPct}% protein, ${vegPct}% vegetation.`;
    insightText = `Your **${peso} g** turtle is in the **${stageLabel}** stage. Offer approximately **${perSessionStr} g per session**, **${sessionsPerWeek} times/week** (≈ ${weeklyStr} g total/week). Split the diet into **${proteinPct}% animal protein** (pellets, bloodworms, small feeder fish) and **${vegPct}% leafy greens**. Always weigh food on a kitchen scale — visual estimation can be off by 50%.`;
  } else if (__lang === 'pt') {
    resultado = `${dailyStr} g/dia`;
    resumen = `Fase: ${stageLabel} — ${perSessionStr} g por sessão, ${sessionsPerWeek}×/semana (${weeklyStr} g/semana). Dieta: ${proteinPct}% proteína, ${vegPct}% vegetal.`;
    insightText = `Sua tartaruga de **${peso} g** está na fase **${stageLabel}**. Ofereça aproximadamente **${perSessionStr} g por sessão**, **${sessionsPerWeek} vezes/semana** (≈ ${weeklyStr} g total/semana). Distribua a dieta em **${proteinPct}% de proteína animal** (ração, minhoca, camarão) e **${vegPct}% de vegetais** folhosos. Pese sempre o alimento em uma balança digital — estimar "a olho" pode errar em 50% ou mais.`;
  } else {
    resultado = `${dailyStr} g/día`;
    resumen = `Etapa: ${stageLabel} — ${perSessionStr} g por sesión, ${sessionsPerWeek}×/semana (${weeklyStr} g/semana). Dieta: ${proteinPct}% proteína, ${vegPct}% vegetales.`;
    insightText = `Tu tortuga de **${peso} g** está en etapa **${stageLabel}**. Ofrecé aproximadamente **${perSessionStr} g por sesión**, **${sessionsPerWeek} veces/semana** (≈ ${weeklyStr} g totales/semana). Distribuí la dieta en **${proteinPct}% proteína animal** (pellets, lombrices, camarones) y **${vegPct}% vegetales de hoja**. Pesá siempre la comida en balanza de cocina — estimar a ojo puede errar un 50%.`;
  }

  const _insight = {
    title: __lang === 'en' ? 'Feeding result' : __lang === 'pt' ? 'Resultado da dieta' : 'Resultado de dieta',
    text: insightText,
    tone: 'info',
    icon: '🐢',
  };

  return { resultado, resumen, _insight };
}
