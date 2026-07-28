import type { HubData } from '../types';

/**
 * Decision hub EN — "How many calories and macros should I eat?"
 *
 * Absorbs 18 loose calculators: TDEE, BMR by Mifflin-St Jeor and by the revised
 * Harris-Benedict, cutting / bulking macros, the recomp variant, IIFYM, the two
 * 16:8 intermittent fasting calculators, Atkins phases, DASH macros, the DASH
 * daily sodium table, glycemic index and load for a food and for a meal,
 * snack calories, alcohol calories, daily fibre, food digestion time and the
 * Mediterranean adherence score.
 *
 * CONSTANTS — every number below comes from the live formula it replaces:
 *  - Mifflin-St Jeor and activity factors: src/lib/formulas/calorias-tdee.ts
 *  - Harris-Benedict revised (1984): src/lib/formulas/tmb-basal-harris-benedict-metabolismo.ts
 *  - goal multipliers, protein per lb, fat %, 40 g fat floor:
 *    src/lib/formulas/macros-cutting-bulking-calculator.ts
 *  - recomp / lean-bulk / bulk multipliers: src/lib/formulas/macros-recomp-cut-bulk-lean-calorias.ts
 *  - IIFYM 30/30/40 and the 20% discretionary budget: src/lib/formulas/macros-iifym-flexible.ts
 *  - 16:8 meal split: src/lib/formulas/macros-intermitente-16-8-ayuno.ts and
 *    src/lib/formulas/ayuno-intermitente-16-8-calorias.ts
 *  - Atkins carb grams per phase: src/lib/formulas/macros-atkins-fases.ts
 *  - DASH 18/27/55 and sodium caps: src/lib/formulas/macros-dash-hipertension.ts and
 *    src/lib/formulas/dash-hipertension-sodio-diario-tabla.ts
 *  - glycemic load: src/lib/formulas/indice-glucemico-carga-alimento-porcion.ts
 *  - fibre DRIs: src/lib/formulas/fibra-dietetica-recomendada-diaria-edad.ts (IOM 2005)
 *  - snack split: src/lib/formulas/colaciones-intermedias-calorias-saludables.ts
 *  - alcohol: src/lib/formulas/alcohol-calorias-cerveza-vino-fernet.ts
 */

/** YMYL disclaimer — verbatim from src/lib/disclaimers.ts, COPY.en, domain 'health'. */
const DISCLAIMER =
  'For guidance only; this does not replace diagnosis, treatment, or professional follow-up. Consult a licensed healthcare professional.';

export const LB_PER_KG = 2.2046226218;
export const CM_PER_IN = 2.54;

/** Calorie density, kcal per gram. Ethanol is 7. */
export const KCAL_PER_G = { protein: 4, carb: 4, fat: 9, alcohol: 7 };

/** Activity multipliers applied to BMR. Identical in both live TDEE formulas. */
export const ACTIVITY: Record<string, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  extra: 1.9,
};

/** Mifflin-St Jeor (1990) constants, on kg and cm. */
export const MIFFLIN = { weight: 10, height: 6.25, age: 5, male: 5, female: -161 };
/** Harris-Benedict as revised by Roza & Shizgal (1984), on kg and cm. */
export const HARRIS = {
  male: { base: 88.362, weight: 13.397, height: 4.799, age: 5.677 },
  female: { base: 447.593, weight: 9.247, height: 3.098, age: 4.330 },
};

/** Calorie multipliers applied to TDEE, by goal. */
export const GOAL_MULTIPLIER: Record<string, number> = {
  cut: 0.80,
  maintain: 1.00,
  recomp: 1.00,
  bulk: 1.12,
  fasting: 0.85,
  atkins: 0.85,
  dash: 1.00,
};

/** Clinical floor below which the hub refuses to suggest a lower target. */
export const CALORIE_FLOOR = { male: 1500, female: 1200 };
/** Minimum daily fat, in grams, to protect hormonal function. */
export const MIN_FAT_G = 40;

/** Default macro splits, as fractions of total calories. */
export const SPLITS = {
  iifym: { protein: 0.30, fat: 0.30, carb: 0.40, discretionary: 0.20 },
  recomp: { protein: 0.30, fat: 0.25 },
  dash: { protein: 0.18, fat: 0.27, carb: 0.55 },
};

/** Atkins net carbohydrate allowance, in grams per day, by phase. */
export const ATKINS_CARBS: Record<string, number> = { '1': 20, '2': 40, '3': 65, '4': 90 };

/** DASH sodium caps, in mg per day. 400 mg of sodium ≈ 1 g of salt. */
export const SODIUM = { standard: 2300, strict: 1500, typicalWestern: 3400, mgPerGramSalt: 400 };

/** Glycemic load bands (Harvard). Glycemic index bands below/above 55 and 69. */
export const GLYCEMIC = { giLow: 55, giMedium: 69, glLow: 10, glMedium: 19 };

/** 16:8 meal split as a fraction of the day's calories, across three eating occasions. */
export const FASTING_SPLIT = { meal1: 0.35, meal2: 0.40, meal3: 0.25 };

/**
 * IOM/NASEM 2005 dietary fibre Adequate Intake, grams per day.
 * Verbatim from fibra-dietetica-recomendada-diaria-edad.ts.
 */
export const FIBER_AI = {
  pregnancy: 28,
  lactation: 29,
  child1to3: 19,
  child4to8: 25,
  male9to13: 31,
  male14to18: 38,
  male19to50: 38,
  male51plus: 30,
  female9to13: 26,
  female14to18: 26,
  female19to50: 25,
  female51plus: 21,
};

/** Residual carbohydrate per 100 ml of drink, from the alcohol calorie formula. */
export const DRINK_CARBS: Record<string, number> = {
  beer_regular: 3.6,
  beer_light: 1.5,
  beer_craft: 5.5,
  wine_red: 2.5,
  wine_white: 3.0,
  spirit: 0,
};
/** Density of ethanol, g per ml. */
export const ETHANOL_DENSITY = 0.789;
/** Grams of ethanol in one US standard drink. */
export const US_STANDARD_DRINK_G = 14;

export const hub: HubData = {
slug: 'en/health/calories-and-macros',
  title: 'How many calories and macros should I eat? TDEE, BMR and macro calculator',
  description:
    'Work out your BMR by Mifflin-St Jeor or Harris-Benedict, your TDEE at your real activity level, and the calorie target and protein, fat and carb grams for cutting, maintaining, lean bulking or recomping — plus 16:8 fasting meal splits, Atkins carb allowances, DASH macros and sodium, glycemic load, daily fibre and what a drink costs you.',
  silo: 'Health',
siloHref: '/en/health',
locale: 'en',

  eyebrow: 'Energy, macros and daily targets',
  h1: 'How many calories and macros should I eat?',
  lede:
    'It starts with two numbers: what your body burns at rest, and what it burns once you add your life to it. From there the goal decides the rest — a cut, maintenance, a lean bulk or a recomp each move the calorie target and the protein, fat and carb grams that go with it. This works all of it out in one pass, plus the fasting, low-carb and DASH variants.',
  stamps: ['Reviewed 28-07-2026', 'Mifflin-St Jeor 1990 · Harris-Benedict 1984 · IOM 2005 fibre · DASH', '18 calculators inside'],

  resultLabel: 'Your daily calorie target',

  cases: {
    title: 'My situation is different',
    intro:
      'Same body, same burn rate — what changes is the goal, and with it the deficit or surplus and how the macros are carved up. Pick the one you are actually running.',
    items: [
      {
        id: 'cut',
        label: 'Cutting — losing fat',
        hint: 'A 20% deficit off maintenance.',
        yes: [
          'Your BMR and TDEE, then a target 20% below maintenance',
          'Protein set per pound of bodyweight — the number that protects muscle in a deficit',
          'Fat as a percentage of the target, with a 40 g floor so hormones do not take the hit',
          'Carbohydrates as whatever calories are left over',
          'The clinical floor below which the hub will not go: 1,500 kcal for men, 1,200 for women',
        ],
        warn: [
          DISCLAIMER,
          'A 20% deficit is roughly 1 to 1.5 lb of loss per week; deeper deficits mostly buy you muscle loss and a stalled metabolism',
          'Below 1,200 kcal a day you cannot reliably hit micronutrient needs from food — that is dietitian territory, not calculator territory',
          'Protein stays high and fat stays above 40 g even when calories fall; carbohydrate is the variable that absorbs the cut',
          'The equations carry a ±10 to 15% error against measured metabolic rate, so treat the first target as a starting hypothesis and adjust from the scale over 2 to 3 weeks',
        ],
        plazo: 'recalculate every 4 to 6 weeks, or after any 5 lb change in bodyweight.',
        answer:
          'For fat loss, eat about 80% of your TDEE, keep protein near 1 g per pound of bodyweight, hold fat at roughly 25 to 30% of calories, and let carbs take the remainder.',
      },
      {
        id: 'maintain',
        label: 'Maintaining',
        hint: 'Hold the weight where it is.',
        yes: [
          'Your TDEE used directly as the calorie target, with no adjustment',
          'The IIFYM 30/30/40 split — 30% protein, 30% fat, 40% carbohydrate',
          'How many of those calories can be discretionary and still leave the macros intact',
          'A per-snack calorie budget once you decide how much of the day goes to main meals',
        ],
        warn: [
          DISCLAIMER,
          'If your weight is drifting on a "maintenance" number, the number is wrong — your real TDEE is whatever holds the scale flat over three weeks',
          'IIFYM means the macros are flexible, not that food quality is irrelevant: fibre, micronutrients and satiety all still come from what you pick',
          'Activity multipliers are the biggest source of error in the whole calculation — most people overestimate by one whole level',
        ],
        plazo: 'weigh yourself the same way for 3 weeks before deciding the number is wrong.',
        answer:
          'Maintenance is your TDEE with nothing added or taken away; the common flexible split is 30% protein, 30% fat and 40% carbohydrate.',
      },
      {
        id: 'bulk',
        label: 'Lean bulk — gaining',
        hint: 'A modest surplus, not a free-for-all.',
        yes: [
          'A target about 12% above maintenance — enough to build, small enough to stay lean',
          'Protein per pound of bodyweight, unchanged from a cut',
          'Fat as a percentage of the larger target, and carbohydrates absorbing the surplus',
          'What the extra calories work out to per week in expected weight gain',
        ],
        warn: [
          DISCLAIMER,
          'A surplus above roughly 15% mostly adds fat: muscle has a ceiling on how fast it can be built, and calories do not raise it',
          'Beginners gain faster than the surplus predicts; people with years of training gain far slower — the calculator does not know which you are',
          'If the scale is climbing more than about 0.5 to 1% of bodyweight per month, the surplus is too big',
        ],
        plazo: 'reassess after 8 to 12 weeks; a lean bulk is measured in months, not weeks.',
        answer:
          'For a lean bulk, eat about 112% of your TDEE, keep protein at roughly 1 g per pound, and let the extra calories land mostly on carbohydrate.',
      },
      {
        id: 'recomp',
        label: 'Recomp — losing fat while gaining muscle',
        hint: 'Maintenance calories, high protein.',
        yes: [
          'Calories at maintenance, so the scale moves very little on purpose',
          'A 30% protein and 25% fat split, with carbohydrate taking the remainder',
          'The protein target in grams that makes a recomp possible at all',
          'Why the mirror and the tape are the measurements that matter here, not the scale',
        ],
        warn: [
          DISCLAIMER,
          'Recomping works best for beginners, people returning after a break, and people carrying a lot of fat — it is slow to impossible for a lean, trained lifter',
          'Without progressive resistance training a recomp is not a recomp: it is just maintenance',
          'Because the scale barely moves, this is the goal where people quit early; use waist measurements and photos on a monthly cadence instead',
        ],
        plazo: 'give it 12 to 16 weeks before judging it; changes are real but small month to month.',
        answer:
          'A recomp runs at maintenance calories with protein around 30% of intake and fat around 25%, and it is judged by measurements, not by the scale.',
      },
      {
        id: 'fasting',
        label: '16:8 intermittent fasting',
        hint: 'All the calories in an 8-hour window.',
        yes: [
          'Your calorie target, with the mild deficit the 16:8 calculators default to',
          'How to split it across the window: about 35% breaking the fast, 40% at the main meal, 25% as a lighter third',
          'Daily protein, fat and carb grams — unchanged by the timing',
          'The two-meal alternative, weighted 40/60',
        ],
        warn: [
          DISCLAIMER,
          'Fasting is a schedule, not a mechanism: in controlled trials matched for calories and protein, 16:8 and normal eating produce the same results',
          'The 8-hour window makes hitting a high protein target harder, not easier — that is the main practical failure mode',
          'Not appropriate during pregnancy or lactation, with a history of disordered eating, or on insulin or sulfonylureas without medical supervision',
        ],
        plazo: 'give the schedule 2 weeks before judging it; the first few days of hunger are adaptation, not signal.',
        answer:
          '16:8 means eating all your calories in an 8-hour window; the total and the macros are what drive the result, and the window only changes when you eat them.',
      },
      {
        id: 'atkins',
        label: 'Low carb or Atkins',
        hint: 'A fixed carbohydrate allowance by phase.',
        yes: [
          'The net carbohydrate allowance for your phase: 20 g in induction, then 40, 65 and 90 g',
          'Protein at 30% of calories, with fat taking everything the carb cap leaves behind',
          'What that means in grams of fat per day, which is usually the surprise',
          'How the phase allowance compares with the fibre you still need to hit',
        ],
        warn: [
          DISCLAIMER,
          'Induction at 20 g of carbohydrate a day makes the fibre target very hard to reach — plan low-carb fibre sources deliberately',
          'The first two weeks commonly bring headache, fatigue and constipation as glycogen and its bound water leave; that is not fat loss',
          'Not appropriate on SGLT2 inhibitors (ketoacidosis risk), in pregnancy, or with existing kidney disease without medical supervision',
          'Move up a phase before you feel you have to, not after — the induction allowance is not meant to be permanent',
        ],
        plazo: 'induction is designed for 2 weeks, not indefinitely.',
        answer:
          'Atkins caps net carbohydrate at 20 g a day in induction, then 40 g, 65 g and 90 g through the later phases, with fat filling whatever calories protein and carbs do not.',
      },
      {
        id: 'dash',
        label: 'DASH — for blood pressure',
        hint: 'Macros plus a hard sodium ceiling.',
        yes: [
          'The DASH split: 55% carbohydrate, 18% protein, 27% fat',
          'Your sodium ceiling — 2,300 mg on the standard plan, 1,500 mg on the strict one',
          'That ceiling converted into grams of salt, which is what a label actually helps you with',
          'How far it sits below the roughly 3,400 mg a typical Western diet delivers',
        ],
        warn: [
          DISCLAIMER,
          'Sodium is the lever here, not the macro split: the strict 1,500 mg arm produced the largest blood-pressure reductions in the DASH-Sodium trial',
          'Most dietary sodium is not the salt shaker — it is bread, cold cuts, cheese, sauces and restaurant food',
          '1,500 mg of sodium is about 3.75 g of salt, which is under a teaspoon for the entire day',
          'If you are on diuretics, ACE inhibitors or ARBs, do not change sodium intake sharply without telling your prescriber',
        ],
        plazo: 'blood pressure responds to a sodium change within about 2 to 4 weeks.',
        answer:
          'DASH runs roughly 55% carbohydrate, 18% protein and 27% fat, with sodium capped at 2,300 mg a day or 1,500 mg on the stricter version.',
      },
    ],
  },

  inputsTitle: 'Your details',
  inputsIntro:
    'Weight, height, age, sex and activity give you the calorie target. The fields below that only feed their own rows — leave any of them at zero and those rows drop out.',
  fields: [
    { id: 'weightLb', label: 'Weight', type: 'number', suffix: 'lb', min: 50, max: 700, step: 0.5, value: 170 },
    { id: 'heightFt', label: 'Height — feet', type: 'number', suffix: 'ft', min: 1, max: 8, step: 1, value: 5 },
    { id: 'heightIn', label: 'Height — inches', type: 'number', suffix: 'in', min: 0, max: 11.5, step: 0.5, value: 9 },
    { id: 'age', label: 'Age', type: 'number', suffix: 'years', min: 1, max: 110, step: 1, value: 35 },
    {
      id: 'sex',
      label: 'Sex',
      type: 'select',
      value: 'm',
      options: [
        { value: 'm', label: 'Male' },
        { value: 'f', label: 'Female' },
      ],
    },
    {
      id: 'activity',
      label: 'Activity level',
      type: 'select',
      value: 'moderate',
      options: [
        { value: 'sedentary', label: 'Sedentary — desk job, little or no exercise (×1.2)' },
        { value: 'light', label: 'Light — exercise 1 to 3 days a week (×1.375)' },
        { value: 'moderate', label: 'Moderate — exercise 3 to 5 days a week (×1.55)' },
        { value: 'active', label: 'Active — exercise 6 to 7 days a week (×1.725)' },
        { value: 'extra', label: 'Very active — twice a day, or physical work (×1.9)' },
      ],
      help: 'This is the single biggest source of error. Most people are one level lower than they think.',
    },
    {
      id: 'equation',
      label: 'Which BMR equation',
      type: 'select',
      value: 'mifflin',
      options: [
        { value: 'mifflin', label: 'Mifflin-St Jeor (1990) — the modern default' },
        { value: 'harris', label: 'Harris-Benedict, revised 1984' },
      ],
      help: 'Both are shown in the breakdown; this picks which one drives the target.',
    },
    {
      id: 'proteinPerLb',
      label: 'Protein target',
      type: 'number',
      suffix: 'g per lb of bodyweight',
      min: 0,
      max: 2,
      step: 0.05,
      value: 1,
      help: '0.7 to 1.0 g per pound covers almost everyone. Higher end when cutting, lower when calories are plentiful.',
    },
    {
      id: 'fatPct',
      label: 'Fat as a share of calories',
      type: 'number',
      suffix: '%',
      min: 15,
      max: 60,
      step: 1,
      value: 27,
      help: 'Ignored in the Atkins and DASH cases, which set their own splits.',
    },
    {
      id: 'atkinsPhase',
      label: 'Atkins phase',
      type: 'select',
      value: '1',
      options: [
        { value: '1', label: 'Phase 1 — Induction, 20 g net carbs' },
        { value: '2', label: 'Phase 2 — Active weight loss, 40 g' },
        { value: '3', label: 'Phase 3 — Pre-maintenance, 65 g' },
        { value: '4', label: 'Phase 4 — Maintenance, 90 g' },
      ],
    },
    {
      id: 'sodiumPlan',
      label: 'DASH sodium plan',
      type: 'select',
      value: 'standard',
      options: [
        { value: 'standard', label: 'Standard — 2,300 mg a day' },
        { value: 'strict', label: 'Strict — 1,500 mg a day' },
      ],
    },
    {
      id: 'mealsPct',
      label: 'Share of calories going to main meals',
      type: 'number',
      suffix: '%',
      min: 50,
      max: 100,
      step: 5,
      value: 80,
      help: 'Whatever is left is split across your snacks.',
    },
    { id: 'snacks', label: 'Number of snacks a day', type: 'number', suffix: 'snacks', min: 0, max: 6, step: 1, value: 2 },
    {
      id: 'foodGi',
      label: 'Glycemic index of a food (optional)',
      type: 'number',
      suffix: 'GI',
      min: 0,
      max: 110,
      step: 1,
      value: 0,
      help: 'Leave at 0 to skip the glycemic rows. White bread is about 75, oats about 55, lentils about 30.',
    },
    {
      id: 'foodCarbs',
      label: 'Available carbs in that serving (optional)',
      type: 'number',
      suffix: 'g',
      min: 0,
      max: 300,
      step: 1,
      value: 0,
    },
    {
      id: 'drinkMl',
      label: 'Drink volume (optional)',
      type: 'number',
      suffix: 'ml',
      min: 0,
      max: 2000,
      step: 5,
      value: 0,
      help: 'A 12 oz beer is 355 ml, a 5 oz glass of wine is 148 ml, a 1.5 oz shot is 44 ml.',
    },
    {
      id: 'drinkAbv',
      label: 'Alcohol by volume (optional)',
      type: 'number',
      suffix: '% ABV',
      min: 0,
      max: 70,
      step: 0.1,
      value: 5,
    },
    {
      id: 'drinkType',
      label: 'Drink type',
      type: 'select',
      value: 'beer_regular',
      options: [
        { value: 'beer_regular', label: 'Regular beer' },
        { value: 'beer_light', label: 'Light beer' },
        { value: 'beer_craft', label: 'Craft beer or IPA' },
        { value: 'wine_red', label: 'Dry red wine' },
        { value: 'wine_white', label: 'Dry white wine' },
        { value: 'spirit', label: 'Spirits, neat — no residual carbs' },
      ],
    },
  ],
  fineprint: DISCLAIMER,

  chart: {
    type: 'donut',
    title: 'Where your calories come from',
    caption:
      'The slices are calories, not grams — protein and carbohydrate carry 4 kcal per gram and fat carries 9, so a fat slice always looks larger than its gram count suggests. The grams themselves are in the breakdown below.',
  },
  breakdownTitle: 'Calories, macros and the numbers behind them',
  breakdownIntro:
    'Each row carries its own unit: calories, grams, milligrams or a percentage. Optional rows appear only when you fill in the field that feeds them.',

  faq: [
    {
      q: 'How many calories should I eat a day?',
      a: 'Start from your TDEE — your BMR multiplied by an activity factor between 1.2 and 1.9. To lose fat, take about 20% off it. To maintain, eat it. To gain lean mass, add about 12%. For most adults that lands somewhere between 1,600 and 3,000 kcal, but the honest answer is the number that moves your weight the way you want over three weeks.',
    },
    {
      q: 'What is the difference between BMR and TDEE?',
      a: 'BMR is what you would burn lying still all day — usually 60 to 70% of the total. TDEE is BMR multiplied by an activity factor and is what you actually burn. Diet targets are set from TDEE, never from BMR: eating at your BMR is a severe deficit, not maintenance.',
    },
    {
      q: 'Mifflin-St Jeor or Harris-Benedict — which one is right?',
      a: 'Mifflin-St Jeor (1990) is the better one for most people; Frankenfield’s 2005 review found it the most accurate of the common equations in non-obese and obese adults alike. The revised Harris-Benedict (1984) tends to read a little higher. This hub shows both and lets you pick which drives the target, because the gap between them is usually under 100 kcal.',
    },
    {
      q: 'How much protein do I actually need?',
      a: 'For anyone training, roughly 0.7 to 1.0 g per pound of bodyweight per day — about 1.6 to 2.2 g per kilogram. Go towards the top of that range when you are in a deficit, because protein is what stops the weight you lose from being muscle. Above about 1 g per pound the extra buys you very little.',
    },
    {
      q: 'How do I split my macros?',
      a: 'Set protein by bodyweight first, then fat as a percentage of calories with a floor around 40 g a day, and let carbohydrate take whatever is left. The common flexible starting split is 30% protein, 30% fat and 40% carbohydrate. Endurance training pushes carbs up; DASH sets 55% carbs and 18% protein deliberately.',
    },
    {
      q: 'How big should a deficit be?',
      a: 'About 20% below maintenance, which for most people is 400 to 600 kcal and produces 1 to 1.5 lb of loss a week. Bigger deficits do not speed fat loss proportionally — they increase the share of the loss that comes from muscle, and they are harder to sustain long enough to matter.',
    },
    {
      q: 'Does intermittent fasting burn more fat?',
      a: 'Not on its own. Trials that match 16:8 against normal eating at the same calories and protein find the same fat loss. What fasting does is make a deficit easier to hold for some people by removing decisions. The practical downside is that an 8-hour window makes a high protein target harder to hit.',
    },
    {
      q: 'How many carbs are allowed on Atkins?',
      a: 'By phase: 20 g of net carbohydrate a day during induction, then 40 g in active weight loss, 65 g in pre-maintenance and 90 g in maintenance. Induction is designed for about two weeks. At 20 g a day, hitting the fibre recommendation takes deliberate planning.',
    },
    {
      q: 'How much sodium should I eat on DASH?',
      a: 'The standard DASH plan caps sodium at 2,300 mg a day — about 5.75 g of salt. The strict arm caps it at 1,500 mg, about 3.75 g of salt, and that arm produced the biggest blood-pressure reductions in the DASH-Sodium trial. A typical Western diet runs near 3,400 mg, and most of it comes from processed food rather than the salt shaker.',
    },
    {
      q: 'What is glycemic load, and how is it different from glycemic index?',
      a: 'Glycemic index rates how fast a food raises blood glucose relative to pure glucose, regardless of how much you eat. Glycemic load adjusts for the portion: GL = GI × available carbs ÷ 100. Watermelon has a high GI of about 72 but a GL under 5 per serving, because a slice barely contains any carbohydrate. Under 10 is low, 10 to 19 medium, 20 and over high.',
    },
    {
      q: 'How much fibre do I need a day?',
      a: 'The IOM adequate intakes are 38 g a day for men aged 19 to 50 and 30 g from 51, and 25 g for women aged 19 to 50 and 21 g from 51. Pregnancy is 28 g and lactation 29 g. Most adults get about half of that, and the gap is the single easiest nutrition fix available.',
    },
    {
      q: 'How many calories are in a drink?',
      a: 'Ethanol carries 7 kcal per gram, which is closer to fat than to sugar, and it comes with residual carbohydrate depending on the drink. A 12 oz regular beer runs about 150 kcal, a 5 oz glass of dry wine about 120, and a 1.5 oz shot of a 40% spirit about 97. Alcohol calories sit on top of your target, not inside it, unless you plan for them.',
    },
  ],

  sources: [
    {
      name: 'Mifflin MD et al. — A new predictive equation for resting energy expenditure in healthy individuals',
      url: 'https://pubmed.ncbi.nlm.nih.gov/2305711/',
      publisher: 'Am J Clin Nutr / PubMed',
      date: '1990',
    },
    {
      name: 'Frankenfield D et al. — Comparison of predictive equations for resting metabolic rate',
      url: 'https://pubmed.ncbi.nlm.nih.gov/15883556/',
      publisher: 'J Am Diet Assoc / PubMed',
      date: '2005',
    },
    {
      name: 'Roza AM, Shizgal HM — The Harris Benedict equation reevaluated',
      url: 'https://pubmed.ncbi.nlm.nih.gov/6741850/',
      publisher: 'Am J Clin Nutr / PubMed',
      date: '1984',
    },
    {
      name: 'IOM / NASEM — Dietary Reference Intakes for Energy, Carbohydrate, Fiber, Fat, Fatty Acids, Protein and Amino Acids',
      url: 'https://www.ncbi.nlm.nih.gov/books/NBK56068/',
      publisher: 'National Academies Press',
      date: '2005',
    },
    {
      name: 'Sacks FM et al. — Effects on blood pressure of reduced dietary sodium and the DASH diet (DASH-Sodium)',
      url: 'https://pubmed.ncbi.nlm.nih.gov/10639539/',
      publisher: 'NEJM / PubMed',
      date: '2001',
    },
    {
      name: 'NHLBI — DASH Eating Plan',
      url: 'https://www.nhlbi.nih.gov/education/dash-eating-plan',
      publisher: 'National Heart, Lung, and Blood Institute',
    },
    {
      name: 'USDA / HHS — Dietary Guidelines for Americans',
      url: 'https://www.dietaryguidelines.gov/',
      publisher: 'U.S. Departments of Agriculture and Health and Human Services',
    },
    {
      name: 'Atkinson FS et al. — International tables of glycemic index and glycemic load values',
      url: 'https://pubmed.ncbi.nlm.nih.gov/34934213/',
      publisher: 'Am J Clin Nutr / PubMed',
      date: '2021',
    },
    {
      name: 'Morton RW et al. — Systematic review of protein supplementation and resistance training',
      url: 'https://pubmed.ncbi.nlm.nih.gov/28698222/',
      publisher: 'Br J Sports Med / PubMed',
      date: '2018',
    },
    {
      name: 'NIAAA — What is a standard drink?',
      url: 'https://www.niaaa.nih.gov/alcohols-effects-health/what-standard-drink',
      publisher: 'National Institute on Alcohol Abuse and Alcoholism',
    },
  ],

  replaces: [
    '/en/tdee-calorie-calculator',
    '/en/basal-metabolic-rate-calculator',
    '/en/bmr-basal-harris-benedict-metabolism',
    '/en/macros-cutting-bulking-calculator',
    '/en/macros-recomp-cut-bulk-lean-calorias',
    '/en/macros-iifym-flexible',
    '/en/macros-16-8-intermittent-fasting',
    '/en/intermittent-fasting-16-8-calories',
    '/en/macros-atkins-fases',
    '/en/macros-dash-hypertension',
    '/en/dash-diet-daily-sodium',
    '/en/glycemic-index-load-food-portion',
    '/en/glycemic-load-meal',
    '/en/healthy-snacks-150-300-calories',
    '/en/alcohol-calories-beer-wine-fernet',
    '/en/daily-dietary-fiber-intake-calculator',
    '/en/food-digestion-time-calculator',
    '/en/dieta-mediterranea-adherencia-score-test',
  ],

lastReviewed: '2026-07-28',
};
