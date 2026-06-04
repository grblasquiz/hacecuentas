export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }

/**
 * Mediterranean Diet Weekly Plan Calculator
 *
 * Inputs:
 *   kcal_dia   — Daily calorie target (kcal/day), integer 1200–4000
 *   objetivo   — "mantener" | "bajar" | "subir"
 *
 * Method:
 *  1. Adjust kcal for objective (−300 deficit / +250 surplus)
 *  2. Distribute macros per Mediterranean Diet pyramid:
 *       Carbs  50 % → 4 kcal/g
 *       Protein 18 % → 4 kcal/g
 *       Fat    32 % → 9 kcal/g   (mostly MUFA from olive oil/nuts)
 *  3. Map adjusted kcal to Mediterranean Diet Pyramid weekly servings
 *     (Fundación Dieta Mediterránea, 2020 revision):
 *       – Cereals: 1–2 portions / meal  → 3 meals × 7 days, scaled by 1 portion / 300 kcal bucket
 *       – Vegetables: ≥2 portions / meal (daily fixed)
 *       – Fruit: 1–2 portions / meal
 *       – Legumes: ≥3 portions / week (min 3, scales with kcal)
 *       – Fish/seafood: ≥2 portions / week (min 2, scales with kcal)
 *       – Lean meat (white): ≤2 portions / week
 *       – Red meat: ≤2 portions / week
 *       – Eggs: 2–4 portions / week
 *       – Nuts: 1–2 portions / day → 7–14/week
 *       – Olive oil: ≥3 tbsp / day → tablespoons per day
 *       – Dairy: 2 portions / day → 14/week
 *
 * Sources:
 *   • Fundación Dieta Mediterránea — Pirámide 2020 (mediterradiet.org)
 *   • PREDIMED study, NEJM 2013 / Diabetes Care 2014
 *   • WHO Healthy diet (2020): https://www.who.int/news-room/fact-sheets/detail/healthy-diet
 */
export function dietaMediterraneaPlanSemanalKcal(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';

  // ── Translations ────────────────────────────────────────────────────────────
  const T = ({
    es: {
      title: 'Tu plan mediterráneo semanal',
      icon: '🫒',
      mantener: 'Mantenimiento',
      bajar: 'Bajar peso (−300 kcal/día)',
      subir: 'Ganar masa (＋250 kcal/día)',
      kcalObjetivo: 'Kcal objetivo/día',
      proteinas: 'Proteínas/día',
      carbos: 'Carbohidratos/día',
      grasas: 'Grasas/día',
      cereales: 'Cereales integrales',
      verduras: 'Verduras',
      frutas: 'Frutas',
      legumbres: 'Legumbres',
      pescado: 'Pescado/mariscos',
      carneBlanc: 'Carne blanca',
      carneRoja: 'Carne roja (máx)',
      huevos: 'Huevos',
      lacteos: 'Lácteos',
      frutosSec: 'Frutos secos/aceitunas',
      aceitOliva: 'Aceite de oliva',
      porcSem: 'porciones/semana',
      porcDia: 'porciones/día',
      cucharadasDia: 'cucharadas/día',
      grDia: 'g/día',
      kcalDay: 'kcal/día',
      insightText: (kcal: number, obj: string, carb: number, prot: number, fat: number) =>
        `Con **${kcal} kcal/día** (${obj}) el plan mediterráneo aporta **${carb} g carbos**, **${prot} g proteína** y **${fat} g grasa** diarios.`,
      resumenText: (kcal: number, legum: number, pesc: number, cerealesW: number) =>
        `Plan ${kcal} kcal/día | ${cerealesW} porciones de cereales/semana | ${legum} porciones de legumbres/semana | ${pesc} porciones de pescado/semana.`,
    },
    en: {
      title: 'Your weekly Mediterranean plan',
      icon: '🫒',
      mantener: 'Maintenance',
      bajar: 'Lose weight (−300 kcal/day)',
      subir: 'Gain muscle (+250 kcal/day)',
      kcalObjetivo: 'Target kcal/day',
      proteinas: 'Protein/day',
      carbos: 'Carbohydrates/day',
      grasas: 'Fat/day',
      cereales: 'Whole-grain cereals',
      verduras: 'Vegetables',
      frutas: 'Fruits',
      legumbres: 'Legumes',
      pescado: 'Fish/seafood',
      carneBlanc: 'Lean poultry',
      carneRoja: 'Red meat (max)',
      huevos: 'Eggs',
      lacteos: 'Dairy',
      frutosSec: 'Nuts/olives',
      aceitOliva: 'Olive oil',
      porcSem: 'servings/week',
      porcDia: 'servings/day',
      cucharadasDia: 'tbsp/day',
      grDia: 'g/day',
      kcalDay: 'kcal/day',
      insightText: (kcal: number, obj: string, carb: number, prot: number, fat: number) =>
        `With **${kcal} kcal/day** (${obj}) the Mediterranean plan provides **${carb} g carbs**, **${prot} g protein** and **${fat} g fat** daily.`,
      resumenText: (kcal: number, legum: number, pesc: number, cerealesW: number) =>
        `Plan ${kcal} kcal/day | ${cerealesW} cereal servings/week | ${legum} legume servings/week | ${pesc} fish servings/week.`,
    },
  } as const)[__lang];

  // ── Parse inputs ─────────────────────────────────────────────────────────────
  const kcalRaw = Number(i.kcal_dia);
  const kcalBase = (Number.isFinite(kcalRaw) && kcalRaw >= 800) ? Math.round(kcalRaw) : 2000;

  const objetivo = String(i.objetivo || 'mantener').toLowerCase().trim();

  // ── Step 1: Adjust for objective ──────────────────────────────────────────────
  let kcalAdj = kcalBase;
  let objLabel = T.mantener;
  if (objetivo === 'bajar') {
    kcalAdj = Math.max(1200, kcalBase - 300);
    objLabel = T.bajar;
  } else if (objetivo === 'subir') {
    kcalAdj = kcalBase + 250;
    objLabel = T.subir;
  }

  // ── Step 2: Macronutrient distribution (Mediterranean pattern) ──────────────
  // Carbs 50 %, Protein 18 %, Fat 32 %  (Fundación Dieta Mediterránea / PREDIMED)
  const carbG = Math.round((kcalAdj * 0.50) / 4);
  const protG = Math.round((kcalAdj * 0.18) / 4);
  const fatG  = Math.round((kcalAdj * 0.32) / 9);

  // ── Step 3: Weekly food-group servings (Mediterranean Diet Pyramid 2020) ─────
  // Bucketed by 200 kcal increments starting from 1400 kcal.
  // Bucket index: 0=<1400, 1=1400-1599, 2=1600-1799, 3=1800-1999, 4=2000-2199,
  //               5=2200-2399, 6=2400-2599, 7=2600-2799, 8=≥2800
  const bucket = Math.min(8, Math.max(0, Math.floor((kcalAdj - 1400) / 200) + 1));

  // Cereals: 2 portions per main meal × 3 meals = 6/day; scales from 6 to 14/week
  // (1 portion ≈ 80 g cooked pasta/rice or 1 slice whole-grain bread)
  const cerealesW = [28, 28, 35, 35, 42, 42, 49, 49, 49][bucket];
  // → expressed as per-day for readability: 4–7 portions/day
  const cerealesD = Math.round(cerealesW / 7);

  // Vegetables: ≥2 portions per meal (fixed at ≥14/week for all calorie levels)
  // 1 portion = 200 g raw or 100 g cooked
  const verdurasW = Math.max(14, 14 + Math.floor((kcalAdj - 1600) / 400));
  const verdurasD = Math.round(verdurasW / 7);

  // Fruit: 1–2 per meal × 3 = 3–6/day; scale 21–28/week
  const frutasW = [21, 21, 21, 21, 21, 28, 28, 28, 28][bucket];
  const frutasD = Math.round(frutasW / 7);

  // Legumes: min 3/week, scale up to 5/week at high kcal (never below 3)
  const legumesW = Math.min(5, Math.max(3, 3 + Math.floor((kcalAdj - 1600) / 600)));

  // Fish & seafood: min 2/week, scale to 4/week (never below 2 — pyramid minimum)
  const pescadoW = Math.min(4, Math.max(2, 2 + Math.floor((kcalAdj - 1600) / 800)));

  // White meat: ≤2/week (fixed)
  const carneBW = 2;

  // Red meat: ≤2/week (fixed max, Mediterranean recommendation)
  const carneRW = 2;

  // Eggs: 2–4/week depending on kcal
  const huevosW = kcalAdj < 1800 ? 2 : kcalAdj < 2400 ? 3 : 4;

  // Dairy (yogurt, cheese): 2/day → 14/week
  const lacteosW = 14;

  // Nuts & olives: 1–2 portions/day → 7–14/week (1 portion = 28 g nuts or 10 olives)
  const frutosSecW = kcalAdj < 2000 ? 7 : 14;
  const frutosSecD = kcalAdj < 2000 ? 1 : 2;

  // Olive oil: min 3 tbsp/day; scale with fat kcal / 45 kcal per tbsp
  const aceiteTbsp = Math.min(6, Math.max(3, Math.round(fatG * 0.40 / 11)));
  // (40 % of fat from olive oil, 1 tbsp = ~11 g fat)

  // ── Format outputs ────────────────────────────────────────────────────────────
  const resultado = `${kcalAdj} ${T.kcalDay}`;

  const resumen = [
    `${T.kcalObjetivo}: ${kcalAdj} kcal (${objLabel})`,
    `${T.proteinas}: ${protG} ${T.grDia} · ${T.carbos}: ${carbG} ${T.grDia} · ${T.grasas}: ${fatG} ${T.grDia}`,
    `${T.cereales}: ${cerealesD} ${T.porcDia} (${cerealesW}/sem) · ${T.verduras}: ${verdurasD} ${T.porcDia} · ${T.frutas}: ${frutasD} ${T.porcDia}`,
    `${T.legumbres}: ${legumesW} ${T.porcSem} · ${T.pescado}: ${pescadoW} ${T.porcSem} · ${T.carneBlanc}: ${carneBW} ${T.porcSem} · ${T.carneRoja}: ≤${carneRW} ${T.porcSem}`,
    `${T.huevos}: ${huevosW} ${T.porcSem} · ${T.lacteos}: 2 ${T.porcDia} · ${T.frutosSec}: ${frutosSecD} ${T.porcDia} · ${T.aceitOliva}: ${aceiteTbsp} ${T.cucharadasDia}`,
  ].join('\n');

  const insightText = T.insightText(kcalAdj, objLabel, carbG, protG, fatG);
  const resumenText = T.resumenText(kcalAdj, legumesW, pescadoW, cerealesW);

  return {
    resultado,
    resumen: resumenText,
    _insight: {
      title: T.title,
      text: insightText,
      tone: 'positive',
      icon: T.icon,
    },
  };
}
