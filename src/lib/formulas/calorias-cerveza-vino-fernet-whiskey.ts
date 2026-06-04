export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }

/**
 * Alcohol calorie calculator
 *
 * Formula (international standard):
 *   kcal_alcohol = volume_ml × (abv / 100) × 0.789 × 7
 *   kcal_total   = kcal_alcohol + kcal_carbs_residual
 *
 * Residual carbs (kcal) by drink type:
 *   - cerveza_rubia (lager/rubia ~5%):     27 kcal per 100 ml (≈3.4 g carbs × 4 + extrapolated)
 *     actually scaled per actual volume from 8 g/100ml → 32 kcal/100ml
 *   - The carb adder is expressed as kcal_per_100ml specific to each category
 *
 * References:
 *   - USDA FoodData Central (ethanol 7 kcal/g, densidad 0.789 g/ml)
 *   - WHO — no safe level of alcohol consumption
 *   - Ministerio de Salud Argentina / ANMAT
 */

// Carbohydrate calorie contribution per 100 ml for each drink category
// (residual sugars after fermentation/distillation, not counting mixer)
const CARB_KCAL_PER_100ML: Record<string, number> = {
  cerveza_rubia:       15,  // ~3.7 g carbs/100ml × 4 kcal ≈ 15 kcal/100ml (USDA FoodData Central)
  cerveza_artesanal:   18,  // slightly more residual malt sugars (~4.5 g/100ml)
  cerveza_light:        8,  // reduced carbs (~2 g/100ml)
  vino_tinto_seco:      8,  // ~2 g residual carbs/100ml × 4 = 8 kcal (USDA: dry red wine ~2.4 g/100ml)
  vino_blanco_seco:     7,  // ~1.8 g residual carbs/100ml (dry white wine)
  vino_semidulce:      20,  // ~5 g/100ml (semi-sweet)
  vino_dulce:          40,  // ≥10 g/100ml (late harvest, dessert wine)
  espumante_brut:       3,
  fernet_puro:          2,  // bitter herbal, minimal carbs
  whiskey:              0,  // distilled, no residual carbs
  vodka:                0,
  gin:                  0,
  ron:                  0,
  tequila:              0,
  otro_destilado:       0,
  otro:                 8,  // generic fallback
};

// Mixer calorie adder (kcal total for the mixer volume implied per serving)
// The user enters total volume including mixer; we separate here by type
// We store a per-100ml carb kcal for the mixer portion if applicable
// For simplicity, the "mezclador" field is a separate select:
const MIXER_KCAL_PER_100ML: Record<string, number> = {
  sin_mezclador:    0,
  agua_soda_zero:   0,   // water, plain soda, sugar-free
  agua_tonica:      8,   // ~2 g carbs/100ml for regular tonic
  cola_regular:    42,   // ~10.6 g carbs/100ml (Coca-Cola)
  cola_zero:        0,
  jugo_naranja:    45,   // ~11 g carbs/100ml
  sprite_regular:  40,
  energizante:     45,
};

export function caloriasCervezaVinoFernetWhiskey(i: Inputs): Outputs {
  const lang = String(i.__lang || 'es');

  const tipoBebida  = String(i.tipo_bebida  || 'cerveza_rubia');
  const abv         = Math.max(0, Math.min(Number(i.graduacion)  || 5, 80));   // % vol
  const volumen     = Math.max(0, Math.min(Number(i.volumen_ml)  || 350, 5000)); // ml
  const mezclador   = String(i.mezclador    || 'sin_mezclador');
  const porciones   = Math.max(1, Math.min(Math.round(Number(i.porciones) || 1), 20));

  // --- Core formula ---
  // kcal from ethanol: volume × (abv/100) × 0.789 g/ml × 7 kcal/g
  const kcalAlcohol = volumen * (abv / 100) * 0.789 * 7;

  // kcal from residual carbohydrates in the base drink
  const carbBase = (CARB_KCAL_PER_100ML[tipoBebida] ?? 8) * (volumen / 100);

  // kcal from mixer: only applied if this is a mixed drink (the volume entered is
  // total drink volume; we assume mixer is roughly the non-alcohol portion for
  // destilados — but for simplicity we let the user pick mixer and we scale it
  // proportionally to the non-alcohol volume)
  const volumenAlcohol = volumen * (abv / 100);    // ml of pure ethanol
  const volumenMixer   = Math.max(0, volumen - volumenAlcohol * (1 / (abv / 100)));
  // Actually, mixer volume = total volume − (volume of base spirit before mixing)
  // For spirits, mixer portion ≈ total − spirit_shot; but since user enters total,
  // we estimate mixer fraction as (1 − abv/100) × volumen (the aqueous remainder)
  const volumenAguoso  = volumen * (1 - abv / 100);
  const carbMixer      = (MIXER_KCAL_PER_100ML[mezclador] ?? 0) * (volumenAguoso / 100);

  const kcalPorPorcion  = kcalAlcohol + carbBase + carbMixer;
  const kcalTotal       = kcalPorPorcion * porciones;
  const gramosAlcohol   = volumen * (abv / 100) * 0.789;    // g etanol

  // --- UBS (Unidades de Bebida Estándar) — Argentina: 1 UBS = 10 g alcohol ---
  const ubsPorPorcion   = gramosAlcohol / 10;
  const ubsTotal        = ubsPorPorcion * porciones;

  // --- Calorie equivalence ---
  const kcalRound       = Math.round(kcalPorPorcion);
  const kcalTotalRound  = Math.round(kcalTotal);
  const grAlcRound      = Math.round(gramosAlcohol * 10) / 10;
  const ubsRound        = Math.round(ubsPorPorcion * 10) / 10;
  const ubsTotalRound   = Math.round(ubsTotal * 10) / 10;

  // --- Interpretation text ---
  const moderadoMaxVarones = 2;   // UBS/día
  const moderadoMaxMujeres = 1;

  let tone: 'positive' | 'neutral' | 'warning' = 'neutral';
  if (ubsPorPorcion > moderadoMaxVarones) tone = 'warning';
  else if (ubsPorPorcion <= moderadoMaxMujeres) tone = 'positive';

  // --- Language strings ---
  const texts: Record<string, {
    labelKcal: string; labelAlc: string; labelUbs: string; labelTotal: string;
    resumen: string; insightTitle: string; insightText: string;
    disclaimer: string;
  }> = {
    es: {
      labelKcal:     `${kcalRound} kcal por porción`,
      labelAlc:      `${grAlcRound} g de alcohol puro`,
      labelUbs:      `${ubsRound} UBS por porción`,
      labelTotal:    porciones > 1 ? `${kcalTotalRound} kcal en ${porciones} porciones (${ubsTotalRound} UBS total)` : '—',
      resumen:       porciones === 1
        ? `Una porción de ${volumen} ml al ${abv}% aporta ${kcalRound} kcal (${grAlcRound} g de alcohol puro = ${ubsRound} UBS).`
        : `${porciones} porciones de ${volumen} ml al ${abv}% = ${kcalTotalRound} kcal en total (${ubsTotalRound} UBS).`,
      insightTitle:  'Calorías estimadas',
      insightText:   `**${kcalRound} kcal** por porción de ${volumen} ml al ${abv}% ABV. ${gramosAlcohol > 0 ? `Contiene **${grAlcRound} g de alcohol puro** (${ubsRound} UBS — referencia: consumo moderado = 1-2 UBS/día).` : ''} ${tone === 'warning' ? 'Esta porción supera el límite de consumo moderado.' : ''}`,
      disclaimer:    'Valores estimados. Consultá con un profesional de la salud. Línea Sedronar 141 (gratuita, 24 hs).',
    },
    en: {
      labelKcal:     `${kcalRound} kcal per serving`,
      labelAlc:      `${grAlcRound} g pure alcohol`,
      labelUbs:      `${ubsRound} standard drinks`,
      labelTotal:    porciones > 1 ? `${kcalTotalRound} kcal for ${porciones} servings (${ubsTotalRound} std drinks total)` : '—',
      resumen:       porciones === 1
        ? `One serving of ${volumen} ml at ${abv}% ABV provides ${kcalRound} kcal (${grAlcRound} g pure alcohol = ${ubsRound} standard drinks).`
        : `${porciones} servings of ${volumen} ml at ${abv}% = ${kcalTotalRound} kcal total (${ubsTotalRound} standard drinks).`,
      insightTitle:  'Estimated calories',
      insightText:   `**${kcalRound} kcal** per serving of ${volumen} ml at ${abv}% ABV. Contains **${grAlcRound} g pure alcohol** (${ubsRound} standard drinks — moderate: 1-2 per day). ${tone === 'warning' ? 'This serving exceeds moderate consumption guidelines.' : ''}`,
      disclaimer:    'Estimated values. Consult a healthcare professional.',
    },
  };

  const t = texts[lang] || texts.es;

  return {
    resultado:   t.labelKcal,
    resumen:     t.resumen,
    gramos_alcohol: `${grAlcRound} g`,
    ubs_porcion:    `${ubsRound} UBS`,
    kcal_total:     porciones > 1 ? t.labelTotal : `${kcalRound} kcal`,
    _insight: {
      title: t.insightTitle,
      text:  t.insightText,
      tone,
      icon:  '🍺',
      chart: {
        type: 'donut',
        data: [
          { label: lang === 'en' ? 'Alcohol' : 'Alcohol',         value: Math.round(kcalAlcohol) },
          { label: lang === 'en' ? 'Carbs/Sugars' : 'Hidratos',  value: Math.round(carbBase + carbMixer) },
        ],
        unit: 'kcal',
      },
      footer: t.disclaimer,
    },
  };
}
