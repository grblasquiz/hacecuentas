export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }

/**
 * Parrot / Parakeet weekly seed & fresh food distribution
 *
 * Methodology:
 *  - Daily total intake = body_weight_g × intake_pct (species-dependent)
 *    Small psittacines (budgie, lovebird, parrotlet): 10% BW/day
 *    Medium psittacines (cockatiel, conure, caique, Senegal): 10% BW/day
 *    Large psittacines (Amazon, African Grey, Eclectus): 8% BW/day
 *    Very large (macaw, cockatoo): 6% BW/day
 *  - Diet ratios by species group (from AAV / Lafeber / Merck Vet Manual guidelines):
 *    budgie/lovebird/parrotlet : pellets 40%, seeds 35%, veggies 15%, fruit 10%
 *    cockatiel/conure/caique/senegal: pellets 50%, seeds 20%, veggies 20%, fruit 10%
 *    amazon/african-grey/eclectus: pellets 60%, seeds 10%, veggies 22%, fruit 8%
 *    macaw/cockatoo: pellets 55%, seeds 15%, veggies 20%, fruit 10%
 *
 * Sources:
 *  - AAV (Association of Avian Veterinarians) dietary guidelines
 *  - Lafeber Vet: Clinical Perspectives on Principles of Avian Nutrition
 *  - Merck Veterinary Manual: Nutrition in Psittacines
 *  - Brightsmith (2012) JAMS 26(3):149-160 – captive Amazon diets
 */

interface SpeciesProfile {
  label_es: string;
  label_en: string;
  intakePct: number;  // fraction of body weight consumed daily
  pelletPct: number;
  seedPct: number;
  veggiePct: number;
  fruitPct: number;
  weightRange_es: string;
  weightRange_en: string;
}

const SPECIES: Record<string, SpeciesProfile> = {
  budgie: {
    label_es: 'Periquito australiano / Agapornis',
    label_en: 'Budgerigar / Lovebird',
    intakePct: 0.10,
    pelletPct: 0.40,
    seedPct:   0.35,
    veggiePct: 0.15,
    fruitPct:  0.10,
    weightRange_es: '25–60 g',
    weightRange_en: '25–60 g',
  },
  cockatiel: {
    label_es: 'Ninfa / Cotorrita / Caique / Senegal',
    label_en: 'Cockatiel / Conure / Caique / Senegal',
    intakePct: 0.10,
    pelletPct: 0.50,
    seedPct:   0.20,
    veggiePct: 0.20,
    fruitPct:  0.10,
    weightRange_es: '70–200 g',
    weightRange_en: '70–200 g',
  },
  amazon: {
    label_es: 'Loro amazónico / Gris africano / Eclectus',
    label_en: 'Amazon / African Grey / Eclectus',
    intakePct: 0.08,
    pelletPct: 0.60,
    seedPct:   0.10,
    veggiePct: 0.22,
    fruitPct:  0.08,
    weightRange_es: '300–600 g',
    weightRange_en: '300–600 g',
  },
  macaw: {
    label_es: 'Guacamayo / Cacatúa',
    label_en: 'Macaw / Cockatoo',
    intakePct: 0.06,
    pelletPct: 0.55,
    seedPct:   0.15,
    veggiePct: 0.20,
    fruitPct:  0.10,
    weightRange_es: '700–1500 g',
    weightRange_en: '700–1500 g',
  },
};

function round1(n: number): number { return Math.round(n * 10) / 10; }
function round0(n: number): number { return Math.round(n); }

export function loroPeriquitoSemillasFrutasSemana(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';

  const speciesKey = String(i.especie || 'cockatiel');
  const pesoG = Math.max(0, Number(i.peso_g) || 0);

  const profile = SPECIES[speciesKey] ?? SPECIES['cockatiel'];

  if (pesoG <= 0) {
    const errMsg = __lang === 'en'
      ? 'Enter the bird\'s weight in grams to get the weekly feeding plan.'
      : 'Ingresá el peso del ave en gramos para obtener el plan semanal.';
    return {
      resultado: '-',
      semillas_semana_g: '-',
      frutas_verduras_semana_g: '-',
      pellets_semana_g: '-',
      resumen: errMsg,
      _insight: {
        title: __lang === 'en' ? 'Weekly feeding plan' : 'Plan semanal de alimentación',
        text: errMsg,
        tone: 'neutral',
        icon: '🦜',
      },
    };
  }

  // Daily totals in grams
  const dailyTotal_g = pesoG * profile.intakePct;
  const dailySeeds_g   = dailyTotal_g * profile.seedPct;
  const dailyFruit_g   = dailyTotal_g * profile.fruitPct;
  const dailyVeggies_g = dailyTotal_g * profile.veggiePct;
  const dailyFruitVeg_g = dailyFruit_g + dailyVeggies_g;
  const dailyPellets_g = dailyTotal_g * profile.pelletPct;

  // Weekly totals
  const weeklySeedsG    = round1(dailySeeds_g * 7);
  const weeklyFruitVegG = round1(dailyFruitVeg_g * 7);
  const weeklyPelletsG  = round1(dailyPellets_g * 7);
  const weeklyTotalG    = round1(dailyTotal_g * 7);

  // Daily rounded for display
  const dailySeedsDisp    = round1(dailySeeds_g);
  const dailyFruitVegDisp = round1(dailyFruitVeg_g);
  const dailyPelletsDisp  = round1(dailyPellets_g);

  // Human-readable percentages
  const seedPct  = round0(profile.seedPct  * 100);
  const fruitVegPct = round0((profile.fruitPct + profile.veggiePct) * 100);
  const pelletPct = round0(profile.pelletPct * 100);

  const speciesLabel = __lang === 'en' ? profile.label_en : profile.label_es;
  const weightRange  = __lang === 'en' ? profile.weightRange_en : profile.weightRange_es;

  const resultado = `${weeklySeedsG} g`;

  const resumen = __lang === 'en'
    ? `${speciesLabel} (typical weight ${weightRange}) — diet: ${seedPct}% seeds, ${fruitVegPct}% fruit+veggies, ${pelletPct}% pellets. Daily total: ${round1(dailyTotal_g)} g.`
    : `${speciesLabel} (peso típico ${weightRange}) — dieta: ${seedPct}% semillas, ${fruitVegPct}% frutas+verduras, ${pelletPct}% pellets. Total diario: ${round1(dailyTotal_g)} g.`;

  const insightText = __lang === 'en'
    ? `A **${pesoG} g ${speciesLabel}** needs approximately **${dailySeedsDisp} g of seeds per day** (${weeklySeedsG} g/week), **${dailyFruitVegDisp} g of fresh fruit & vegetables** (${weeklyFruitVegG} g/week), and **${dailyPelletsDisp} g of formulated pellets** (${weeklyPelletsG} g/week). Total weekly: **${weeklyTotalG} g**. Offer pellets and seeds as the morning bowl; replace fresh food after 4 hours to avoid bacterial growth.`
    : `Un **${speciesLabel} de ${pesoG} g** necesita aproximadamente **${dailySeedsDisp} g de semillas por día** (${weeklySeedsG} g/semana), **${dailyFruitVegDisp} g de frutas y verduras frescas** (${weeklyFruitVegG} g/semana) y **${dailyPelletsDisp} g de pellets formulados** (${weeklyPelletsG} g/semana). Total semanal: **${weeklyTotalG} g**. Ofrecé pellets y semillas por la mañana; retirá la comida fresca después de 4 horas para evitar proliferación bacteriana.`;

  const _insight = {
    title: __lang === 'en' ? 'Weekly feeding plan' : 'Plan semanal de alimentación',
    text: insightText,
    tone: 'positive',
    icon: '🦜',
  };

  return {
    resultado,
    semillas_semana_g: `${weeklySeedsG} g`,
    frutas_verduras_semana_g: `${weeklyFruitVegG} g`,
    pellets_semana_g: `${weeklyPelletsG} g`,
    resumen,
    _insight,
  };
}
