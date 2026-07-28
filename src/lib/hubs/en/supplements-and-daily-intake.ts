import type { HubData } from '../types';

/**
 * Decision hub EN — "How much of this vitamin, mineral or supplement do I need per day?"
 *
 * Absorbs 16 loose calculators: daily calcium (two of them), iron by sex and
 * age, magnesium (two of them), vitamin B12 for vegans (two of them), vitamin D
 * with sun exposure, omega-3 EPA/DHA, iodine in pregnancy, probiotic CFU,
 * creatine loading and maintenance, whey protein scoops, a beginner supplement
 * stack, and the two caffeine calculators.
 *
 * CONSTANTS — the DRI tables below are taken verbatim from the live formulas
 * this hub replaces, and cross-checked against the NIH Office of Dietary
 * Supplements fact sheets and the IOM/NASEM Dietary Reference Intakes:
 *  - calcium RDA and UL: src/lib/formulas/calcio-diario-edad-lactancia-menopausia.ts
 *  - iron RDA: src/lib/formulas/hierro-diario-hombre-mujer-embarazo.ts
 *  - magnesium RDA: src/lib/formulas/magnesio-diario-requerido.ts and
 *    src/lib/formulas/magnesio-dosis-deficiencia-sintomas.ts (350 mg supplemental UL)
 *  - B12 schedules: src/lib/formulas/vitamina-b12-vegano.ts and
 *    src/lib/formulas/vitamina-b12-dosis-vegano-mensual.ts
 *  - vitamin D sun model: src/lib/formulas/vitamina-d-dosis-sol-diaria-edad.ts
 *  - omega-3 thresholds: src/lib/formulas/omega-3-dosis-diaria-dha-epa.ts (AHA)
 *  - iodine: src/lib/formulas/yodo-diario-embarazo.ts
 *  - probiotic CFU: src/lib/formulas/probiotico-dosis-ufc-diaria-bebe-adulto.ts
 *  - creatine: src/lib/formulas/creatina-carga-mantenimiento-peso.ts
 *  - whey protein rates: src/lib/formulas/whey-protein-dosis-diaria-scoop.ts (ISSN 2017)
 *  - caffeine: src/lib/formulas/cafeina-dosis-segura-diaria-peso.ts and
 *    src/lib/formulas/cafeina-diaria-tazas-cafe-tope-seguro.ts
 *
 * NOT taken from the old formulas: the vitamin D RDA itself, which none of the
 * absorbed calculators stated. It comes from the NIH ODS fact sheet directly.
 */

/** YMYL disclaimer — verbatim from src/lib/disclaimers.ts, COPY.en, domain 'medical-dose'. */
const DISCLAIMER =
  'Doses are general references, not medical advice or a prescription. Do not self-medicate or change professional guidance; consult a physician or pharmacist.';

export const LB_PER_KG = 2.2046226218;

/**
 * Calcium RDA and tolerable upper intake level, in mg per day, by life stage.
 * Verbatim from calcio-diario-edad-lactancia-menopausia.ts; matches NIH ODS.
 */
export const CALCIUM = {
  infant0to6: { rda: 200, ul: 1000, ai: true, label: 'Infant 0–6 months (adequate intake)' },
  infant7to12: { rda: 260, ul: 1500, ai: true, label: 'Infant 7–12 months (adequate intake)' },
  child1to3: { rda: 700, ul: 2500, ai: false, label: 'Child 1–3 years' },
  child4to8: { rda: 1000, ul: 2500, ai: false, label: 'Child 4–8 years' },
  teen9to18: { rda: 1300, ul: 3000, ai: false, label: 'Adolescent 9–18 years' },
  adult19to50: { rda: 1000, ul: 2500, ai: false, label: 'Adult 19–50 years' },
  woman51to70: { rda: 1200, ul: 2000, ai: false, label: 'Woman 51–70 years (post-menopause)' },
  man51to70: { rda: 1000, ul: 2000, ai: false, label: 'Man 51–70 years' },
  adult71plus: { rda: 1200, ul: 2000, ai: false, label: 'Adult 71 years and over' },
  pregnantTeen: { rda: 1300, ul: 3000, ai: false, label: 'Pregnant or lactating, 18 or under' },
  pregnantAdult: { rda: 1000, ul: 2500, ai: false, label: 'Pregnant or lactating adult, 19–50' },
};
/** Milligrams of calcium in one cup of milk — the serving unit the old calculator used. */
export const CALCIUM_PER_SERVING = 300;

/** Iron RDA in mg per day. Verbatim from hierro-diario-hombre-mujer-embarazo.ts; matches NIH ODS. */
export const IRON = {
  teenMale: { rda: 11, label: 'Adolescent male, 14–18' },
  teenFemale: { rda: 15, label: 'Adolescent female, 14–18' },
  adultMale: { rda: 8, label: 'Adult man, 19–50' },
  adultFemale: { rda: 18, label: 'Adult woman, 19–50 (menstruating)' },
  olderMale: { rda: 8, label: 'Man over 50' },
  olderFemale: { rda: 8, label: 'Woman over 50 (post-menopause)' },
  pregnancy: { rda: 27, label: 'Pregnancy, any age' },
  lactation: { rda: 9, label: 'Lactation, 19 and over' },
};
/** Tolerable upper intake level for iron, mg per day, adults. */
export const IRON_UL = 45;

/** Magnesium RDA in mg per day. Verbatim from magnesio-diario-requerido.ts; matches NIH ODS. */
export const MAGNESIUM = {
  under4: 80,
  age4to8: 130,
  age9to13: 240,
  teenMale: 410,
  teenFemale: 360,
  male19to30: 400,
  female19to30: 310,
  male31plus: 420,
  female31plus: 320,
};
/** Upper limit for SUPPLEMENTAL magnesium only, mg per day. Food magnesium does not count. */
export const MAGNESIUM_SUPPLEMENT_UL = 350;

/** Vitamin B12: the official RDA, and the practical vegan supplement schedules. */
export const B12 = {
  rdaMcg: 2.4,
  pregnancyMcg: 2.6,
  lactationMcg: 2.8,
  veganDailyAdult: 250,
  veganDaily65plus: 500,
  veganWeekly: 2000,
  microDailyRange: '25 to 100',
};

/**
 * Vitamin D. The RDA is NOT in any of the absorbed formulas — it comes from the
 * NIH ODS fact sheet. The sun-exposure model IS from vitamina-d-dosis-sol-diaria-edad.ts.
 */
export const VITAMIN_D = {
  aiInfantIU: 400,
  rda1to70IU: 600,
  rda71plusIU: 800,
  ulAdultIU: 4000,
  /** Baseline minutes of midday sun to make roughly 1,000 IU, by Fitzpatrick phototype. */
  baseMinutesByPhototype: { 1: 5, 2: 8, 3: 13, 4: 20, 5: 28, 6: 45 },
  latitudeMultiplier: { tropical: 0.5, subtropical: 0.75, temperate: 1.0, high: 1.8 },
  seasonMultiplier: { summer: 1.0, spring: 1.4, autumn: 1.6, winter: 3.5 },
  ageFactor: { under5: 0.85, standard: 1.0, from50: 1.15, from70: 1.35 },
  /** The model is calibrated so one full exposure yields about this many IU. */
  iuPerFullExposure: 1000,
  /** Beyond this many minutes the model treats synthesis as impractical. */
  maxUsefulMinutes: 180,
};

/** Omega-3 EPA+DHA thresholds in mg per day, from the AHA and FDA. */
export const OMEGA3 = { ahaMin: 250, ahaMax: 500, cardiacUpper: 1000, supervisionAbove: 3000, standardConcentration: '18 to 30' };

/** Iodine RDA in mcg per day. Verbatim from yodo-diario-embarazo.ts; matches NIH ODS. */
export const IODINE = { child: 90, adult: 150, pregnancy: 220, lactation: 290, mcgPerGramIodizedSalt: 30 };

/** Probiotic daily dose in BILLIONS of CFU, by age group. */
export const PROBIOTIC: Record<string, { min: number; max: number; label: string }> = {
  infant0to6: { min: 0.1, max: 1, label: 'Infant 0–6 months' },
  infant6to12: { min: 1, max: 5, label: 'Infant 6–12 months' },
  child1to3: { min: 2, max: 5, label: 'Child 1–3 years' },
  child4to12: { min: 5, max: 10, label: 'Child 4–12 years' },
  teen: { min: 5, max: 20, label: 'Adolescent 13–17 years' },
  adult: { min: 5, max: 20, label: 'Adult 18–64 years' },
  senior: { min: 5, max: 15, label: 'Adult 65 and over' },
};

/** Creatine monohydrate, grams per kg of bodyweight per day. */
export const CREATINE = { loadingPerKg: 0.3, maintenancePerKg: 0.03, maintenanceFloorG: 3, flatDoseG: 5, loadingDays: '5 to 7', saturationWeeksNoLoad: '3 to 4' };

/** Protein targets in g per kg per day, ISSN 2017. Verbatim from whey-protein-dosis-diaria-scoop.ts. */
export const PROTEIN_RATE: Record<string, { rate: number; label: string }> = {
  sedentary: { rate: 0.8, label: 'Sedentary — the RDA floor' },
  maintenance: { rate: 1.2, label: 'Active, maintaining' },
  hypertrophy: { rate: 1.8, label: 'Building muscle' },
  bulk: { rate: 2.0, label: 'Lean bulk' },
  cutting: { rate: 2.3, label: 'Cutting in a deficit' },
};

/** Caffeine caps in mg per day, and the mg in a typical serving. */
export const CAFFEINE = {
  adultMax: 400,
  pregnancyMax: 200,
  adolescentMax: 100,
  perKg: 6,
  brewedCoffee: 95,
  espresso: 65,
  blackTea: 47,
  greenTea: 28,
  energyDrink: 80,
  cola: 35,
};

export const hub: HubData = {
slug: 'en/health/supplements-and-daily-intake',
  title: 'How much do I need per day? Vitamin, mineral and supplement dose calculator',
  description:
    'Daily requirements and safe upper limits for calcium, iron, magnesium, vitamin D, vitamin B12, omega-3 EPA and DHA, iodine, probiotics, creatine, whey protein and caffeine — by age, sex, pregnancy and lactation, using the NIH Office of Dietary Supplements and IOM/NASEM reference intakes.',
  silo: 'Health',
siloHref: '/en/health',
locale: 'en',

  eyebrow: 'Daily intakes and supplement doses',
  h1: 'How much of this vitamin, mineral or supplement do I need per day?',
  lede:
    'Every nutrient has three numbers that matter: what you need, what you are actually getting, and the ceiling you should not cross. Pick the one you are asking about and this gives you all three for your age, sex and life stage — plus the gap you have to close and how many servings or capsules that is.',
  stamps: ['Reviewed 28-07-2026', 'NIH Office of Dietary Supplements · IOM/NASEM DRIs · AHA · ISSN 2017', '16 calculators inside'],

  resultLabel: 'Your daily requirement',

  cases: {
    title: 'Which one are you asking about?',
    intro:
      'Each nutrient has its own reference table, its own upper limit and its own way of being measured. Pick yours — the requirement and the ceiling change completely between them.',
    items: [
      {
        id: 'calcium',
        label: 'Calcium',
        hint: 'Bone density, menopause, teenagers.',
        yes: [
          'Your RDA in mg per day for your exact age, sex and life stage',
          'The tolerable upper intake level, which is a real ceiling and not an aspiration',
          'How many 300 mg dairy servings that requirement works out to',
          'The gap between what you are getting and what you need, if you enter your current intake',
        ],
        warn: [
          DISCLAIMER,
          'The requirement jumps to 1,300 mg for teenagers 9 to 18, and to 1,200 mg for women after 50 and everyone after 70',
          'Calcium supplements above about 1,000 mg a day have been linked to kidney stones and, in some studies, cardiovascular events — food sources have not',
          'Calcium is absorbed best in doses of 500 mg or less, so a single large tablet wastes most of itself',
          'Calcium without adequate vitamin D does very little for bone: check the vitamin D case too',
        ],
        plazo: 'bone density changes are measured over 1 to 2 years, not months.',
        answer:
          'Most adults need 1,000 mg of calcium a day, rising to 1,200 mg for women over 50 and everyone over 70, and 1,300 mg for teenagers.',
      },
      {
        id: 'iron',
        label: 'Iron',
        hint: 'Menstruation, pregnancy, vegetarian diets.',
        yes: [
          'Your RDA: 8 mg for men and post-menopausal women, 18 mg while menstruating, 27 mg in pregnancy',
          'The 45 mg upper limit for adults, and how close your intake sits to it',
          'What percentage of your requirement your current intake covers',
          'Why a vegetarian or vegan diet raises the effective requirement',
        ],
        warn: [
          DISCLAIMER,
          'Never supplement iron without a blood test: iron overload is genuinely dangerous and the symptoms of deficiency and excess overlap',
          'Vegetarians and vegans need roughly 1.8 times the listed RDA, because non-heme iron from plants is absorbed far less efficiently',
          'Vitamin C taken with the meal substantially increases non-heme absorption; tea, coffee and calcium taken with it substantially reduce it',
          'Iron supplements are a leading cause of fatal poisoning in young children — keep them out of reach',
        ],
        plazo: 'ferritin takes about 3 months to respond to a change in intake.',
        answer:
          'Adult men and post-menopausal women need 8 mg of iron a day, menstruating women 18 mg, and pregnancy 27 mg, with an upper limit of 45 mg.',
      },
      {
        id: 'magnesium',
        label: 'Magnesium',
        hint: 'Cramps, sleep, supplement doses.',
        yes: [
          'Your RDA: 400 to 420 mg for men and 310 to 320 mg for women, depending on age',
          'The 350 mg ceiling that applies to supplements only — magnesium from food is not capped',
          'How much of the requirement comes easily from food, and how much you would need to add',
          'Your current intake against the target, if you enter it',
        ],
        warn: [
          DISCLAIMER,
          'The 350 mg upper limit applies to supplemental magnesium alone: magnesium from food carries no limit because the kidneys handle it',
          'Above that supplemental threshold the reliable effect is diarrhoea, which is how magnesium citrate is used as a laxative',
          'Magnesium oxide is the cheapest form and the worst absorbed; citrate, glycinate and malate are absorbed considerably better',
          'Reduced kidney function changes this completely — magnesium accumulates, and supplementing needs medical supervision',
        ],
        plazo: 'if you are supplementing for cramps or sleep, give it 4 weeks before judging it.',
        answer:
          'Men need 400 to 420 mg of magnesium a day and women 310 to 320 mg, but supplemental magnesium should stay under 350 mg a day.',
      },
      {
        id: 'vitaminD',
        label: 'Vitamin D',
        hint: 'Sun exposure, latitude, winter.',
        yes: [
          'The RDA in international units: 600 IU from age 1 to 70, and 800 IU from 71',
          'How many minutes of midday sun your skin type needs, adjusted for latitude, season and age',
          'Roughly how many IU your stated sun exposure produces',
          'The 4,000 IU upper limit for adults, and where a typical supplement sits against it',
        ],
        warn: [
          DISCLAIMER,
          'The sun estimate is a model, not a measurement: cloud, glass, sunscreen, clothing and air quality all cut synthesis, and none of them are inputs here',
          'Above about 37° latitude there is effectively no vitamin D synthesis from November to February whatever you do — that is a supplement season, not a sunshine one',
          'Deliberate unprotected sun exposure raises skin cancer risk; a supplement achieves the same blood level without it',
          'Vitamin D is fat-soluble and genuinely accumulates: chronic intake above 4,000 IU a day without monitoring can cause hypercalcaemia',
        ],
        plazo: 'serum 25(OH)D takes about 8 to 12 weeks to plateau after a dose change.',
        answer:
          'Adults need 600 IU of vitamin D a day up to age 70 and 800 IU after, with a 4,000 IU upper limit — and in winter above mid-latitudes, sunlight cannot supply it.',
      },
      {
        id: 'b12',
        label: 'Vitamin B12',
        hint: 'Vegan and vegetarian diets, over 65.',
        yes: [
          'The official RDA of 2.4 mcg a day, and why vegan supplement doses are a hundred times that',
          'The three workable schedules: 25 to 100 mcg daily, 250 mcg daily, or 2,000 mcg once a week',
          'The higher 500 mcg daily dose used from age 65, when absorption falls',
          'Why a monthly oral dose does not work, whatever the label says',
        ],
        warn: [
          DISCLAIMER,
          'A monthly oral dose cannot cover the requirement: intrinsic-factor mediated absorption saturates at a few micrograms per dose, so frequency matters more than total',
          'The huge vegan doses are not overdosing — they exploit passive diffusion, which absorbs only about 1% of what you swallow',
          'B12 deficiency causes irreversible neurological damage if it goes on long enough, and folic acid can mask the blood signs while the nerve damage continues',
          'Metformin and long-term proton pump inhibitors both reduce B12 absorption independently of diet',
        ],
        plazo: 'check serum B12 and methylmalonic acid every 6 to 12 months on a vegan diet.',
        answer:
          'The RDA is 2.4 mcg, but because oral absorption is poor a vegan needs 250 mcg daily, or 2,000 mcg once a week, and 500 mcg daily from age 65.',
      },
      {
        id: 'omega3',
        label: 'Omega-3 and iodine',
        hint: 'Fish oil capsules, pregnancy.',
        yes: [
          'How much actual EPA and DHA is in your capsule, once you account for the concentration',
          'How many capsules of that specific brand reach the AHA minimum and the upper end of the general range',
          'Your iodine requirement: 150 mcg as an adult, 220 in pregnancy, 290 while lactating',
          'What that iodine target is in grams of iodized salt',
        ],
        warn: [
          DISCLAIMER,
          'The number on the front of a fish oil bottle is total oil, not EPA and DHA — a 1,000 mg capsule at 30% concentration delivers 300 mg, and many are weaker',
          'Above 1 gram a day of EPA plus DHA belongs under medical supervision, and the FDA flags above 3 grams',
          'Vegans need an algae-derived DHA and EPA source: plant ALA converts at only a few percent',
          'Iodine has a narrow window — both deficiency and excess cause thyroid dysfunction, and pregnancy is the period where deficiency does the most harm',
        ],
        plazo: 'the omega-3 index responds over about 3 to 4 months.',
        answer:
          'The AHA puts general EPA plus DHA intake at 250 to 500 mg a day; iodine is 150 mcg for adults, rising to 220 mcg in pregnancy and 290 mcg while breastfeeding.',
      },
      {
        id: 'sports',
        label: 'Creatine, whey and a starter stack',
        hint: 'Training supplements by bodyweight.',
        yes: [
          'Creatine: a loading dose at 0.3 g per kg for 5 to 7 days, or a flat 5 g a day with no loading',
          'Your maintenance creatine dose from bodyweight, with a 3 g floor',
          'Your daily protein target at the ISSN rate for your goal, and the gap your food leaves',
          'How many whey scoops close that gap, given the protein per scoop on your tub',
        ],
        warn: [
          DISCLAIMER,
          'Creatine monohydrate is the only form with the evidence behind it — the expensive variants have never beaten it in a trial',
          'Loading is optional: it saturates muscle in a week instead of 3 to 4, and it is the phase that causes the stomach upset',
          'Whey is food, not medicine: above about 3 scoops a day you are replacing meals rather than topping up, which is rarely what you want',
          'Vegans and vegetarians start with roughly 20% lower muscle creatine, so supplementation does proportionally more for them',
        ],
        plazo: 'creatine reaches full saturation in about a week with loading, or 3 to 4 weeks without.',
        answer:
          'Creatine is 0.3 g per kg a day for 5 to 7 days then 3 to 5 g to maintain; protein runs 1.6 to 2.2 g per kg for muscle gain, and whey only fills whatever food leaves short.',
      },
      {
        id: 'caffeine',
        label: 'Caffeine',
        hint: 'Coffee, tea, energy drinks, pregnancy.',
        yes: [
          'Your safe daily maximum: 400 mg for healthy adults, 200 mg in pregnancy, and a conservative 100 mg for adolescents',
          'The weight-based figure of 6 mg per kg, capped at the 400 mg FDA ceiling',
          'What you are actually drinking, added up across coffee, espresso, tea, energy drinks and cola',
          'How much headroom you have left, in milligrams and in cups',
        ],
        warn: [
          DISCLAIMER,
          'Pregnancy halves the limit to 200 mg — about two 8 oz cups of brewed coffee — and lower is better',
          'The serving figures are averages: a large coffee-shop brew can carry 300 mg on its own, which is most of a day in one cup',
          'Caffeine has a half-life of about 5 hours, so an afternoon coffee is still a quarter present at bedtime',
          'Pre-workout powders and energy drinks stack on top of coffee and are the usual route to accidental overdose',
        ],
        plazo: 'if you are cutting back, taper over 1 to 2 weeks to avoid withdrawal headaches.',
        answer:
          'Healthy adults can have up to 400 mg of caffeine a day, roughly four 8 oz cups of brewed coffee; in pregnancy the limit is 200 mg.',
      },
      {
        id: 'probiotic',
        label: 'Probiotics',
        hint: 'CFU counts by age.',
        yes: [
          'The typical daily dose in billions of CFU for your age group',
          'How the infant, child, adult and older-adult ranges differ',
          'What the CFU count on the label actually means, and what it does not',
          'The range rather than a single number, because dose is strain-specific',
        ],
        warn: [
          DISCLAIMER,
          'CFU count is not a quality measure: the strain and the evidence behind it matter far more than the number of billions on the box',
          'These ranges are general maintenance figures — a specific clinical indication may call for a very different dose of a very specific strain',
          'Probiotics are not benign for everyone: they are contraindicated in severe immunosuppression, central lines and critical illness',
          'CFU counts on labels are at manufacture unless stated otherwise, so an at-expiry count is the honest one to compare',
        ],
        plazo: 'give a probiotic 4 weeks; effects stop when you stop taking it.',
        answer:
          'Adults typically take 5 to 20 billion CFU a day, children 2 to 10 billion and infants under a billion — but the strain matters more than the count.',
      },
    ],
  },

  inputsTitle: 'Your details',
  inputsIntro:
    'Age, sex and life stage set the requirement for every nutrient. The fields under them belong to specific cases — leave any of them at zero and their rows drop out.',
  fields: [
    { id: 'age', label: 'Age', type: 'number', suffix: 'years', min: 0, max: 110, step: 1, value: 35 },
    {
      id: 'sex',
      label: 'Sex',
      type: 'select',
      value: 'f',
      options: [
        { value: 'm', label: 'Male' },
        { value: 'f', label: 'Female' },
      ],
    },
    {
      id: 'lifeStage',
      label: 'Life stage',
      type: 'select',
      value: 'none',
      options: [
        { value: 'none', label: 'Not pregnant or breastfeeding' },
        { value: 'pregnant', label: 'Pregnant' },
        { value: 'lactating', label: 'Breastfeeding' },
      ],
      help: 'Pregnancy and lactation change the calcium, iron, iodine, B12 and caffeine numbers.',
    },
    { id: 'weightLb', label: 'Weight', type: 'number', suffix: 'lb', min: 5, max: 700, step: 0.5, value: 150 },
    {
      id: 'currentIntake',
      label: 'What you currently get per day (optional)',
      type: 'number',
      suffix: 'in that nutrient’s own unit',
      min: 0,
      max: 10000,
      step: 1,
      value: 0,
      help: 'mg for calcium, iron and magnesium; mcg for B12 and iodine; IU for vitamin D; mg for omega-3. Leave at 0 to skip the gap rows.',
    },
    {
      id: 'diet',
      label: 'Diet',
      type: 'select',
      value: 'omnivore',
      options: [
        { value: 'omnivore', label: 'Omnivore' },
        { value: 'vegetarian', label: 'Vegetarian' },
        { value: 'vegan', label: 'Vegan' },
      ],
      help: 'Raises the effective iron requirement by about 1.8× and makes B12 supplementation non-optional.',
    },
    {
      id: 'b12Schedule',
      label: 'B12 schedule',
      type: 'select',
      value: 'daily',
      options: [
        { value: 'daily', label: 'Daily' },
        { value: 'weekly', label: 'Weekly — one large dose' },
        { value: 'monthly', label: 'Monthly — not recommended orally' },
      ],
    },
    {
      id: 'phototype',
      label: 'Skin type (Fitzpatrick, for vitamin D)',
      type: 'select',
      value: '3',
      options: [
        { value: '1', label: 'I — very fair, always burns' },
        { value: '2', label: 'II — fair, usually burns' },
        { value: '3', label: 'III — medium, sometimes burns' },
        { value: '4', label: 'IV — olive, rarely burns' },
        { value: '5', label: 'V — brown, very rarely burns' },
        { value: '6', label: 'VI — very dark, almost never burns' },
      ],
    },
    {
      id: 'latitudeZone',
      label: 'Where you live',
      type: 'select',
      value: 'temperate',
      options: [
        { value: 'tropical', label: 'Tropical — under about 23°' },
        { value: 'subtropical', label: 'Subtropical — roughly 23° to 35°' },
        { value: 'temperate', label: 'Temperate — roughly 35° to 50°' },
        { value: 'high', label: 'High latitude — above about 50°' },
      ],
    },
    {
      id: 'season',
      label: 'Season',
      type: 'select',
      value: 'summer',
      options: [
        { value: 'summer', label: 'Summer' },
        { value: 'spring', label: 'Spring' },
        { value: 'autumn', label: 'Autumn' },
        { value: 'winter', label: 'Winter' },
      ],
    },
    { id: 'sunMinutes', label: 'Minutes of midday sun on arms and legs (optional)', type: 'number', suffix: 'min', min: 0, max: 180, step: 1, value: 0 },
    { id: 'fishOilMg', label: 'Fish oil per capsule (optional)', type: 'number', suffix: 'mg', min: 0, max: 3000, step: 50, value: 0 },
    { id: 'omega3Pct', label: 'EPA + DHA concentration of that oil', type: 'number', suffix: '%', min: 0, max: 100, step: 1, value: 30 },
    { id: 'capsulesPerDay', label: 'Capsules per day', type: 'number', suffix: 'capsules', min: 0, max: 20, step: 1, value: 1 },
    {
      id: 'trainingGoal',
      label: 'Training goal (for protein and creatine)',
      type: 'select',
      value: 'hypertrophy',
      options: [
        { value: 'sedentary', label: 'Sedentary — 0.8 g/kg' },
        { value: 'maintenance', label: 'Active, maintaining — 1.2 g/kg' },
        { value: 'hypertrophy', label: 'Building muscle — 1.8 g/kg' },
        { value: 'bulk', label: 'Lean bulk — 2.0 g/kg' },
        { value: 'cutting', label: 'Cutting in a deficit — 2.3 g/kg' },
      ],
    },
    { id: 'proteinFromFood', label: 'Protein you already get from food (optional)', type: 'number', suffix: 'g', min: 0, max: 400, step: 5, value: 0 },
    { id: 'scoopProtein', label: 'Protein per whey scoop', type: 'number', suffix: 'g', min: 5, max: 40, step: 1, value: 25 },
    { id: 'coffeeCups', label: 'Brewed coffee (8 oz cups a day)', type: 'number', suffix: 'cups', min: 0, max: 20, step: 1, value: 0 },
    { id: 'espressoShots', label: 'Espresso shots a day', type: 'number', suffix: 'shots', min: 0, max: 20, step: 1, value: 0 },
    { id: 'teaCups', label: 'Black tea (8 oz cups a day)', type: 'number', suffix: 'cups', min: 0, max: 20, step: 1, value: 0 },
    { id: 'energyDrinks', label: 'Energy drinks a day', type: 'number', suffix: 'cans', min: 0, max: 10, step: 1, value: 0 },
    { id: 'colaCans', label: 'Cola (12 oz cans a day)', type: 'number', suffix: 'cans', min: 0, max: 15, step: 1, value: 0 },
  ],
  fineprint: DISCLAIMER,

  chart: {
    type: 'progress',
    title: 'How much of your requirement you are covering',
    caption:
      'The bar runs from nothing to your full daily requirement for the nutrient you picked, with the marker showing what your stated intake covers. Past 100% you are over the requirement — check the upper-limit row in the breakdown, because for several of these nutrients more is genuinely worse.',
  },
  breakdownTitle: 'Requirement, upper limit and the gap',
  breakdownIntro:
    'Every row carries its own unit: milligrams, micrograms, international units, billions of CFU or grams. Rows appear only for the fields you filled in.',

  faq: [
    {
      q: 'How much calcium do I need a day?',
      a: 'Adults 19 to 50 need 1,000 mg. It rises to 1,200 mg for women from 51 and everyone from 71, and teenagers aged 9 to 18 need 1,300 mg. The tolerable upper intake level is 2,500 mg up to age 50 and 2,000 mg after, and calcium is absorbed best in doses of 500 mg or less at a time.',
    },
    {
      q: 'How much iron should I get?',
      a: 'Adult men and post-menopausal women need 8 mg a day. Menstruating women need 18 mg, pregnancy needs 27 mg and lactation 9 mg. The upper limit is 45 mg for adults. Vegetarians and vegans need roughly 1.8 times these figures, because non-heme iron from plants absorbs far less efficiently.',
    },
    {
      q: 'What is the daily magnesium requirement?',
      a: 'Men need 400 mg from 19 to 30 and 420 mg after; women need 310 mg then 320 mg. The catch is the upper limit: 350 mg a day applies to supplemental magnesium only. Magnesium from food carries no limit, because the kidneys clear the excess without trouble.',
    },
    {
      q: 'How much vitamin B12 does a vegan need?',
      a: 'The RDA is only 2.4 mcg, but oral absorption is the problem, not the requirement. Intrinsic-factor absorption saturates at a couple of micrograms per dose, and everything above that relies on passive diffusion at about 1% efficiency. So the practical schedules are 25 to 100 mcg spread daily, 250 mcg once a day, or 2,000 mcg once a week — 500 mcg daily from age 65.',
    },
    {
      q: 'Does a monthly B12 tablet work?',
      a: 'No. Because absorption per dose is capped, a single monthly dose leaves most of the month uncovered no matter how large it is. Monthly dosing works by injection, which bypasses absorption entirely, but not orally. Switch to daily or weekly.',
    },
    {
      q: 'How much vitamin D do I need, and can I get it from the sun?',
      a: 'The RDA is 600 IU a day from age 1 to 70 and 800 IU after, with a 4,000 IU upper limit for adults. Sun can supply it, but how much depends on your skin type, latitude, season and age — and above roughly 37° latitude, winter sunlight produces essentially none regardless of how long you stay outside.',
    },
    {
      q: 'How much omega-3 is actually in my fish oil capsule?',
      a: 'Multiply the total oil per capsule by the EPA + DHA concentration. A 1,000 mg capsule at 30% delivers 300 mg of EPA plus DHA; at 18% it delivers 180 mg. Standard fish oil runs 18 to 30%. The AHA general range is 250 to 500 mg a day, so a weak capsule may need two or three to reach the minimum.',
    },
    {
      q: 'How much iodine do I need in pregnancy?',
      a: '220 mcg a day, up from 150 mcg as a non-pregnant adult, and 290 mcg while breastfeeding. That is about 7 g of iodized salt a day at 30 mcg per gram, which is more salt than most sodium guidance allows — which is why a prenatal supplement containing iodine is the usual route.',
    },
    {
      q: 'How much creatine should I take?',
      a: 'Either 0.3 g per kg of bodyweight a day split into four doses for 5 to 7 days, then 3 to 5 g a day to maintain — or skip loading entirely and take a flat 5 g from day one, reaching the same saturation in 3 to 4 weeks. Monohydrate is the only form with the evidence behind it.',
    },
    {
      q: 'How many whey scoops do I need a day?',
      a: 'However many close the gap between your protein target and what your food already provides. At the ISSN rates that target is 1.6 to 2.2 g per kg for building muscle, and if you eat 100 g from food and need 140 g, that is two 25 g scoops. If you need more than three scoops a day, the food side of the equation is the thing to fix.',
    },
    {
      q: 'What is a safe daily caffeine limit?',
      a: '400 mg a day for healthy adults — roughly four 8 oz cups of brewed coffee. In pregnancy it is 200 mg, and for adolescents a conservative 100 mg. By weight the figure is about 6 mg per kg, capped at 400. Bear in mind that a large coffee-shop brew can carry 300 mg by itself.',
    },
    {
      q: 'How many CFU should a probiotic have?',
      a: 'Adults typically take 5 to 20 billion CFU a day, adolescents the same, children 4 to 12 about 5 to 10 billion, toddlers 2 to 5 billion and infants under a billion. But CFU count is the least important thing on the label: the strain, and whether that specific strain has evidence for what you want it to do, matters far more.',
    },
  ],

  sources: [
    {
      name: 'NIH Office of Dietary Supplements — Calcium fact sheet for health professionals',
      url: 'https://ods.od.nih.gov/factsheets/Calcium-HealthProfessional/',
      publisher: 'National Institutes of Health',
    },
    {
      name: 'NIH Office of Dietary Supplements — Iron fact sheet for health professionals',
      url: 'https://ods.od.nih.gov/factsheets/Iron-HealthProfessional/',
      publisher: 'National Institutes of Health',
    },
    {
      name: 'NIH Office of Dietary Supplements — Magnesium fact sheet for health professionals',
      url: 'https://ods.od.nih.gov/factsheets/Magnesium-HealthProfessional/',
      publisher: 'National Institutes of Health',
    },
    {
      name: 'NIH Office of Dietary Supplements — Vitamin B12 fact sheet for health professionals',
      url: 'https://ods.od.nih.gov/factsheets/VitaminB12-HealthProfessional/',
      publisher: 'National Institutes of Health',
    },
    {
      name: 'NIH Office of Dietary Supplements — Vitamin D fact sheet for health professionals',
      url: 'https://ods.od.nih.gov/factsheets/VitaminD-HealthProfessional/',
      publisher: 'National Institutes of Health',
    },
    {
      name: 'NIH Office of Dietary Supplements — Iodine fact sheet for health professionals',
      url: 'https://ods.od.nih.gov/factsheets/Iodine-HealthProfessional/',
      publisher: 'National Institutes of Health',
    },
    {
      name: 'IOM / NASEM — Dietary Reference Intakes for Calcium and Vitamin D',
      url: 'https://www.ncbi.nlm.nih.gov/books/NBK56070/',
      publisher: 'National Academies Press',
      date: '2011',
    },
    {
      name: 'American Heart Association — Fish and omega-3 fatty acids',
      url: 'https://www.heart.org/en/healthy-living/healthy-eating/eat-smart/fats/fish-and-omega-3-fatty-acids',
      publisher: 'American Heart Association',
    },
    {
      name: 'FDA — Spilling the beans: how much caffeine is too much?',
      url: 'https://www.fda.gov/consumers/consumer-updates/spilling-beans-how-much-caffeine-too-much',
      publisher: 'U.S. Food and Drug Administration',
    },
    {
      name: 'Jäger R et al. — ISSN position stand: protein and exercise',
      url: 'https://pubmed.ncbi.nlm.nih.gov/28642676/',
      publisher: 'J Int Soc Sports Nutr / PubMed',
      date: '2017',
    },
    {
      name: 'Kreider RB et al. — ISSN position stand: safety and efficacy of creatine supplementation',
      url: 'https://pubmed.ncbi.nlm.nih.gov/28615996/',
      publisher: 'J Int Soc Sports Nutr / PubMed',
      date: '2017',
    },
    {
      name: 'World Gastroenterology Organisation — Global guidelines on probiotics and prebiotics',
      url: 'https://www.worldgastroenterology.org/guidelines/probiotics-and-prebiotics',
      publisher: 'WGO',
    },
  ],

  replaces: [
    '/en/daily-calcium-intake',
    '/en/calcium-daily-intake-by-age-lactation-menopause',
    '/en/daily-iron-requirements-by-sex-age',
    '/en/magnesium-daily-requirement',
    '/en/magnesio-dosis-deficiencia-sintomas',
    '/en/vitamin-b12-dosage-vegan-monthly',
    '/en/vitamina-b12-vegano',
    '/en/vitamin-d-dosage-daily-sun-exposure-age',
    '/en/omega-3-daily-dha-epa-dose',
    '/en/yodo-diario-embarazo',
    '/en/probiotic-daily-cfu-dosage',
    '/en/creatine-loading-maintenance',
    '/en/whey-protein-daily-scoops',
    '/en/suplementos-deportivos-stack-principiante',
    '/en/daily-caffeine-safe-maximum-cups',
    '/en/cafeina-dosis-segura-diaria-peso',
  ],

lastReviewed: '2026-07-28',
};
