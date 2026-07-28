import type { HubData } from '../types';

/**
 * Hub de decisión EN (US) — "How do I scale / measure this recipe?"
 *
 * Absorbe 8 calculadoras de panadería y conversión del mercado inglés.
 * Constantes tomadas de las fórmulas vivas en src/lib/formulas/:
 *   bakers-percentage-calculator · sourdough-hydration-bakers-percentage-calculator
 *   leudado-pan-levadura-tiempo-temperatura · recipe-scaling-calculator
 *   equivalencia-huevos-tamano-gramos-claras · oven-temperature-conversion-calculator
 *   conversion-cucharaditas-gramos-especias-sal · tiempos-coccion-verduras-al-vapor-hervido
 */

/** Disclaimer YMYL — src/lib/disclaimers.ts, dominio 'cooking', copy en inglés. */
const DISCLAIMER_COOKING =
  'Quantities and times are estimates; adjust them to the ingredient, equipment, and recipe. Always follow appropriate food-safety practices.';

/** Conversiones de volumen de cocina en EE. UU. (NIST Handbook 44). */
export const KITCHEN = {
  tspPerTbsp: 3,
  tbspPerCup: 16,
  /** 1 US cup = 236.588 mL. La cup métrica (AU/NZ) son 250 mL. */
  mlPerCup: 236.5882365,
  /** 1 US fluid ounce = 29.5735 mL; la imperial (UK) son 28.4131 mL. */
  mlPerFlOzUS: 29.5735295625,
  /** 1 avoirdupois ounce = 28.3495 g. */
  gPerOz: 28.349523125,
  gPerLb: 453.59237,
};

/** Umbrales de hidratación de la masa (baker's classification). */
export const HYDRATION_CLASSES = [
  { max: 60, label: 'Lean / stiff — easy to knead, tight crumb' },
  { max: 70, label: 'Standard — reliable, all-purpose' },
  { max: 80, label: 'Moderate / artisan — open crumb, needs handling' },
  { max: 90, label: 'Wet / high-hydration — sticky, use a scraper' },
  { max: 999, label: 'Slack / extreme — no-knead territory' },
];

/**
 * Leudado por el método del coeficiente Q10: la actividad de la levadura se
 * duplica cada 10 °C. T_rise = T_base × 2^((25 − T)/10) × (L_ref / L_real).
 */
export const RISE = {
  /** Minutos de referencia a 25 °C con 2% de levadura fresca. */
  baseMin: 60,
  refTempC: 25,
  refDosePct: 2,
  q10: 10,
  /** Equivalencia a levadura fresca: 1% instantánea = 3% fresca. */
  freshEquiv: { fresh: 1, active_dry: 2.25, instant: 3 },
};

/**
 * Gas Mark, relación lineal del estándar británico: °C = Gas Mark × 14 + 121.
 * Y el ajuste de horno con convección: −25 °F (−14 °C).
 */
export const OVEN = {
  gasMarkSlope: 14,
  gasMarkIntercept: 121,
  convectionF: 25,
  convectionC: 14,
};

/**
 * Al escalar hacia arriba, el leudante NO se multiplica en línea recta: se
 * limita a ~78% del aumento lineal por encima de 1,5× (King Arthur Baking).
 */
export const LEAVENING_CAP = 0.78;

/**
 * Peso del huevo entero con cáscara por talle USDA, y su composición
 * (USDA FoodData Central SR Legacy 01123): cáscara 9%, clara 58%, yema 31%.
 */
export const EGG = {
  weights: { S: 43, M: 50, L: 57, XL: 64, J: 71 },
  shellRatio: 0.09,
  whiteRatio: 0.58,
  yolkRatio: 0.31,
};

/** Gramos por cucharadita rasa de los secos más habituales. */
export const TSP_GRAMS: Array<{ id: string; label: string; g: number }> = [
  { id: 'salt_fine', label: 'Fine table salt', g: 6.0 },
  { id: 'salt_coarse', label: 'Coarse or sea salt', g: 4.5 },
  { id: 'salt_flake', label: 'Flake salt (Maldon)', g: 2.8 },
  { id: 'sugar_white', label: 'White granulated sugar', g: 4.0 },
  { id: 'sugar_brown', label: 'Brown sugar', g: 4.5 },
  { id: 'sugar_powdered', label: 'Powdered / icing sugar', g: 3.0 },
  { id: 'flour', label: 'All-purpose flour', g: 3.0 },
  { id: 'baking_soda', label: 'Baking soda', g: 4.8 },
  { id: 'baking_powder', label: 'Baking powder', g: 4.0 },
  { id: 'yeast_dry', label: 'Active dry yeast', g: 3.0 },
  { id: 'cocoa', label: 'Cocoa powder', g: 2.6 },
  { id: 'cornstarch', label: 'Cornstarch', g: 2.5 },
  { id: 'cinnamon', label: 'Ground cinnamon', g: 2.6 },
  { id: 'pepper', label: 'Ground black pepper', g: 2.0 },
  { id: 'paprika', label: 'Paprika', g: 2.5 },
  { id: 'oregano', label: 'Dried oregano', g: 1.0 },
];

/** Tiempos de cocción de verdura, en minutos: [vapor min, vapor máx, hervido min, hervido máx]. */
export const VEGGIES: Array<{ id: string; label: string; t: [number, number, number, number] }> = [
  { id: 'asparagus', label: 'Asparagus', t: [3, 8, 4, 8] },
  { id: 'broccoli', label: 'Broccoli', t: [4, 6, 5, 8] },
  { id: 'brussels', label: 'Brussels sprouts', t: [10, 12, 8, 12] },
  { id: 'carrot', label: 'Carrot, sliced', t: [5, 8, 5, 10] },
  { id: 'cauliflower', label: 'Cauliflower', t: [4, 6, 5, 10] },
  { id: 'green_beans', label: 'Green beans', t: [5, 8, 5, 8] },
  { id: 'kale', label: 'Kale', t: [3, 5, 3, 5] },
  { id: 'peas', label: 'Peas, fresh', t: [2, 4, 2, 4] },
  { id: 'potato_cubed', label: 'Potato, 1-inch cubes', t: [15, 20, 12, 18] },
  { id: 'potato_whole', label: 'Potato, whole medium', t: [25, 35, 20, 30] },
  { id: 'spinach', label: 'Spinach', t: [2, 3, 2, 3] },
  { id: 'sweet_potato', label: 'Sweet potato', t: [20, 30, 20, 28] },
  { id: 'corn', label: 'Sweet corn on the cob', t: [8, 12, 4, 6] },
  { id: 'zucchini', label: 'Zucchini, sliced', t: [3, 5, 3, 5] },
  { id: 'beetroot', label: 'Beetroot', t: [30, 40, 30, 45] },
];

export const hub: HubData = {
slug: 'en/cooking/baking-ratios-and-conversions',
  title: 'Baker’s Percentage, Recipe Scaling & Kitchen Conversions Calculator',
  description:
    'Scale any recipe, work out hydration and baker’s percentage, convert oven temperatures to °C and Gas Mark, turn teaspoons into grams and estimate rise time from dough temperature — one calculator, real formulas.',
  silo: 'Cooking',
siloHref: '/en/cooking',
  locale: 'en',

  eyebrow: 'Baking math · baker’s percentage · US and metric',
  h1: 'How do I scale, measure and convert this recipe?',
  lede:
    'Bread math is one system: flour is 100%, everything else is a percentage of it, and every conversion in the kitchen hangs off weight rather than volume. Set your flour, hydration and salt once and the same numbers answer the dough, the sourdough, the scale-up and the oven dial.',
  stamps: [
    'Baker’s percentage, not cups',
    'Q10 rise-time model',
    '8 calculators inside',
  ],

  resultLabel: 'Your formula',

  cases: {
    title: 'What are you working out?',
    intro:
      'All four cases share the same flour, hydration and salt inputs, so you can switch between them without re-entering anything. Start with a straight yeasted dough.',
    items: [
      {
        id: 'yeast',
        label: 'A yeasted dough — bread or pizza',
        hint: 'Baker’s percentage + rise time from temperature',
        answer: 'Flour is 100%. Everything else is a percentage of the flour weight, never of the total.',
        yes: [
          'Water in grams equals flour × hydration percentage',
          'Salt at 1.8–2.2% of flour is the working range for almost every bread',
          'Instant yeast at 0.5–1% of flour for a same-day loaf',
          'Rise time roughly doubles for every 10 °C (18 °F) the dough gets colder',
          'Halving the yeast roughly doubles the rise time, and vice versa',
        ],
        warn: [
          DISCLAIMER_COOKING,
          'Rise time is a model, not a timer: judge the dough by volume and the poke test, because flour strength, salt and starter activity all shift the real number',
          'Salt above about 2.5% of flour actively slows the yeast; below 1.5% the dough tastes flat and slackens',
        ],
        plazo: 'above 40 °C (104 °F) yeast goes into heat stress, and it dies around 50 °C (122 °F).',
      },
      {
        id: 'sourdough',
        label: 'A sourdough with starter',
        hint: 'The starter carries flour AND water',
        answer: 'Your starter is not an ingredient on the side — split it into its flour and its water first.',
        yes: [
          'A 100% hydration starter is half flour and half water by weight',
          'Total flour = the flour you add + the flour hiding in the starter',
          'Target water = total flour × target hydration, and you only add the difference',
          'Salt is a percentage of TOTAL flour, starter included',
          'Starter at 15–25% of total flour is the usual same-day range',
        ],
        warn: [
          DISCLAIMER_COOKING,
          'If the starter alone already carries more water than your target hydration allows, the calculator returns a negative water figure — raise the target, add flour, or use less starter',
          'A stiff starter is not 100% hydration: check what you actually feed it before trusting the split',
          'Sourdough bulk fermentation does not follow the yeast Q10 model — it depends on starter maturity, so watch the dough, not the clock',
        ],
        plazo: 'a cold retard at 4 °C (39 °F) buys you 12–18 hours of schedule flexibility and more flavor.',
      },
      {
        id: 'scale',
        label: 'Scaling a recipe up or down',
        hint: 'Leavening and bake time do not scale linearly',
        answer: 'Everything multiplies by the same factor — except the leavening and the clock.',
        yes: [
          'Scale factor is simply the servings you want divided by the servings the recipe makes',
          'Flour, water, sugar, fat and salt all scale straight up',
          'Above 1.5×, leavening only grows by about 78% of the linear amount',
          'Eggs round to whole units — beat one and measure by volume for a fraction',
          'Larger batches need 10–25% more time in the oven',
        ],
        warn: [
          DISCLAIMER_COOKING,
          'Too much baking powder or soda gives a bitter, soapy taste and a cake that rises and then collapses',
          'Scaling down below about a quarter teaspoon of anything loses accuracy fast — switch to a gram scale',
          'Pan size does not scale with the recipe: the same batter in a deeper pan bakes much slower in the middle',
        ],
        plazo: 'check large batches by internal temperature or a skewer, never by the original recipe time.',
      },
      {
        id: 'convert',
        label: 'Converting temperatures, spoons and eggs',
        hint: '°F ↔ °C ↔ Gas Mark · tsp → grams · egg sizes',
        answer: 'Volume measures lie about weight — the same teaspoon holds 6 g of fine salt or 1 g of oregano.',
        yes: [
          '°C = (°F − 32) × 5/9, and Gas Mark follows °C = Gas Mark × 14 + 121',
          'A convection or fan oven runs 25 °F (14 °C) hotter than the dial suggests',
          '1 tablespoon = 3 teaspoons; 1 US cup = 16 tablespoons = 236.6 mL',
          'A US Large egg weighs 57 g in the shell: about 33 g white and 18 g yolk',
          'Steaming keeps water-soluble vitamins that boiling leaches into the water',
        ],
        warn: [
          DISCLAIMER_COOKING,
          'A US cup is 236.6 mL but an Australian metric cup is 250 mL and a UK fluid ounce is 28.41 mL, not 29.57 — recipes travel, the units do not',
          'These gram-per-teaspoon values assume a level spoon; a heaped one carries 50–100% more',
          'Baking soda is about three times stronger than baking powder — never swap them one for one',
        ],
        plazo: 'oven thermostats routinely run 25 °F off; a $10 oven thermometer settles it in one bake.',
      },
    ],
  },

  inputsTitle: 'Your numbers',
  inputsIntro:
    'The flour, hydration and salt fields drive the dough cases. The temperature, oven and serving fields are what the rise-time, conversion and scaling cases read. Nothing here needs to be exact — change one and everything recalculates.',
  fields: [
    {
      id: 'flour',
      label: 'Flour you are adding (g)',
      type: 'number',
      value: 1000,
      min: 0,
      max: 100000,
      step: 10,
      help: 'Weight of flour, not of the finished dough. For sourdough, this excludes whatever is in the starter.',
    },
    {
      id: 'hydration',
      label: 'Target hydration (%)',
      type: 'number',
      value: 70,
      min: 40,
      max: 120,
      step: 1,
      help: 'Water as a percentage of total flour weight. 60% is pizza, 70% is a standard loaf, 80%+ is ciabatta territory.',
    },
    {
      id: 'saltPct',
      label: 'Salt (% of flour)',
      type: 'number',
      value: 2,
      min: 0,
      max: 5,
      step: 0.1,
      help: 'The working range is 1.8–2.2%. Higher slows fermentation, lower tastes flat.',
    },
    {
      id: 'yeastPct',
      label: 'Instant yeast (% of flour)',
      type: 'number',
      value: 0.7,
      min: 0,
      max: 5,
      step: 0.1,
      help: '0.5–1% for a same-day loaf. One percent of instant yeast equals about 3% of fresh yeast.',
    },
    {
      id: 'starter',
      label: 'Sourdough starter at 100% hydration (g)',
      type: 'number',
      value: 200,
      min: 0,
      max: 5000,
      step: 10,
      help: 'Only used in the sourdough case. Half of this weight is flour and half is water.',
    },
    {
      id: 'doughTempF',
      label: 'Dough or room temperature (°F)',
      type: 'number',
      value: 75,
      min: 32,
      max: 120,
      step: 1,
      help: 'Drives the rise-time estimate. 75 °F is a normal kitchen; 39 °F is a fridge retard.',
    },
    {
      id: 'ovenF',
      label: 'Oven temperature to convert (°F)',
      type: 'number',
      value: 425,
      min: 100,
      max: 700,
      step: 5,
      help: 'Converted to °C and Gas Mark, with the fan-oven adjustment shown separately.',
    },
    {
      id: 'servingsFrom',
      label: 'Servings the recipe makes',
      type: 'number',
      value: 8,
      min: 1,
      max: 1000,
      step: 1,
      help: 'The number printed on the original recipe.',
    },
    {
      id: 'servingsTo',
      label: 'Servings you actually want',
      type: 'number',
      value: 20,
      min: 1,
      max: 5000,
      step: 1,
      help: 'The scale factor is simply this divided by the line above.',
    },
  ],
  fineprint: DISCLAIMER_COOKING,

  chart: {
    type: 'donut',
    title: 'What your dough is made of, by weight',
    caption:
      'Every dough is mostly flour and water — the ratio between those two slices IS the hydration. Salt and yeast barely register on the chart, which is exactly why they have to be weighed rather than eyeballed.',
  },
  breakdownTitle: 'Your formula and its conversions',
  breakdownIntro:
    'Ingredient weights first, then the percentages they came from, then the timing and temperature conversions that go with them.',

  faq: [
    {
      q: 'What is baker’s percentage?',
      a: 'It is a way of writing a recipe where flour is always 100% and every other ingredient is expressed as a percentage of the flour weight — not of the total. A formula written as 100% flour, 70% water, 2% salt and 0.7% instant yeast scales to any batch size without arithmetic: 1000 g of flour means 700 g of water, 20 g of salt and 7 g of yeast. Because the percentages add up to more than 100%, a dough at those numbers weighs 1727 g in total, which is where the confusion usually starts.',
    },
    {
      q: 'How do I work out flour weight from a target dough weight?',
      a: 'Divide, do not subtract. The divisor is 1 plus the sum of every percentage other than flour, written as a decimal. At 70% hydration, 2% salt and 0.7% yeast the divisor is 1.727, so a target of 900 g of dough needs 900 ÷ 1.727 ≈ 521 g of flour. Then apply the percentages to that flour figure. This is how you size dough balls: for a 250 g pizza ball at 60% hydration with 2% salt, 3% oil and 1% yeast, the divisor is 1.66 and the flour is about 151 g.',
    },
    {
      q: 'What hydration should my bread be?',
      a: 'Below 60% you get a stiff, easy-to-knead dough with a tight crumb — bagels, pretzels and most pizza. From 60 to 70% is the standard, forgiving all-purpose range for sandwich loaves and pan breads. From 70 to 80% is artisan territory with an open crumb that needs stretch-and-folds instead of kneading. Above 80% the dough is slack and sticky, worked with wet hands and a scraper, and above 90% it stops being shapeable at all — that is no-knead and ciabatta.',
    },
    {
      q: 'How does the starter change the hydration in a sourdough?',
      a: 'A starter is not a seasoning, it is flour and water that already went into the mix. At 100% hydration it is exactly half flour and half water by weight, so 200 g of starter contributes 100 g of flour and 100 g of water. Your total flour is the flour you add plus that hidden 100 g, target water is total flour × target hydration, and the water you actually pour in is that target minus the 100 g the starter brought. Salt is a percentage of total flour too, starter included — this is the single most common sourdough math mistake.',
    },
    {
      q: 'How long will my dough take to rise?',
      a: 'Fermentation follows a Q10 of about 2: yeast activity roughly doubles for every 10 °C (18 °F) increase, and halves for every 10 °C drop. Starting from a reference of one hour at 25 °C (77 °F) with 2% fresh yeast, the estimate is base × 2^((25 − T)/10) × (2 ÷ your dose in fresh-yeast terms). One percent of instant yeast counts as 3% fresh, and 1% of active dry counts as 2.25%. A dough at 68 °F with half the reference yeast will take roughly three times as long as the same dough at 77 °F with the full dose.',
    },
    {
      q: 'Can I swap instant, active dry and fresh yeast one for one?',
      a: 'No. By weight, 1 g of instant yeast is worth about 3 g of fresh yeast, and 1 g of active dry is worth about 2.25 g of fresh. So a recipe calling for 30 g of fresh yeast needs about 10 g of instant or 13 g of active dry. Active dry also wants to be rehydrated in warm liquid first, while instant can go straight into the flour. Getting this conversion wrong is the usual reason a loaf either does nothing for four hours or over-proofs and collapses.',
    },
    {
      q: 'How do I convert oven temperature between °F, °C and Gas Mark?',
      a: '°C = (°F − 32) × 5/9 is the exact conversion. Gas Mark follows a linear British standard where °C = Gas Mark × 14 + 121, so Gas Mark 4 is 177 °C or 350 °F, and Gas Mark 7 is 219 °C or 425 °F. Round the Gas Mark to the nearest quarter — the dial has no more resolution than that. Below Gas Mark 1 (135 °C / 275 °F) the scale runs in quarters: ¼, ½ and ¾ cover the very low range used for slow roasting and meringues.',
    },
    {
      q: 'Do I need to change the temperature for a convection or fan oven?',
      a: 'Yes — drop it by 25 °F (about 14 °C) and expect to shorten the time by roughly 25% as well. A moving-air oven transfers heat far more efficiently, so a recipe written for 400 °F conventional should be set to 375 °F on fan. Cakes and custards care the most; roasted vegetables and bread care the least and often benefit from the extra convection. Separately, most home ovens run 25 °F away from their dial in one direction or the other, which an oven thermometer will tell you in a single bake.',
    },
    {
      q: 'How many grams is a teaspoon of salt, sugar or flour?',
      a: 'It depends entirely on density, which is why weight beats volume. One level teaspoon holds about 6 g of fine table salt, 4.5 g of coarse or sea salt, but only 2.8 g of flake salt — swapping salts by volume can change the seasoning by more than half. Sugar is about 4 g, all-purpose flour about 3 g, baking soda 4.8 g, baking powder 4 g, cocoa 2.6 g, cinnamon 2.6 g and dried oregano only 1 g. All of those assume a level spoon; a heaped one carries 50–100% more.',
    },
    {
      q: 'How much does an egg weigh without the shell?',
      a: 'A US Large egg weighs 57 g in the shell. The shell is about 9% of that, the white about 58% and the yolk about 31%, so a Large egg gives roughly 33 g of white and 18 g of yolk, or 52 g of edible egg. Scale from there: Medium is 50 g, Extra Large 64 g and Jumbo 71 g in the shell. When a recipe needs half an egg — which happens constantly when scaling — beat a whole one and measure out half by weight or volume, since a beaten Large egg is about 3 tablespoons.',
    },
    {
      q: 'Why does the calculator not just multiply my baking powder when I double a recipe?',
      a: 'Because leavening does not scale linearly. A doubled batter is deeper and wider, so it holds gas better, and doubling the baking powder gives a bitter, soapy taste followed by a rise-then-collapse. Professional guidance caps the increase at roughly 78% of the linear amount once you go past 1.5×. The calculator applies that cap automatically and leaves everything else at the straight scale factor. When scaling down instead, the risk flips: below a quarter teaspoon, volume measuring loses so much accuracy that a gram scale becomes the only reliable option.',
    },
    {
      q: 'Should I steam or boil my vegetables?',
      a: 'Steam, in almost every case. Boiling leaches water-soluble vitamins — C, B1 and folate especially — into water most people pour down the sink, while steaming keeps them in the food. Times are broadly similar: broccoli 4–6 minutes steamed against 5–8 boiled, green beans 5–8 either way, cubed potato 15–20 steamed against 12–18 boiled. Corn on the cob is the notable exception, going faster in boiling water. If you do boil, keep the liquid for a soup or sauce and you recover most of what was lost.',
    },
  ],

  sources: [
    {
      name: 'NIST Handbook 44 / SP 811 — exact US customary volume and weight conversions',
      url: 'https://www.nist.gov/pml/special-publication-811',
      publisher: 'National Institute of Standards and Technology',
    },
    {
      name: 'USDA FoodData Central — egg, whole, raw, fresh (SR Legacy 01123)',
      url: 'https://fdc.nal.usda.gov/food-details/171287/nutrients',
      publisher: 'USDA Agricultural Research Service',
    },
    {
      name: 'USDA AMS — Egg Grading Manual, weight classes for consumer-grade shell eggs',
      url: 'https://www.ams.usda.gov/grades-standards/egg-grading-manual',
      publisher: 'USDA Agricultural Marketing Service',
    },
    {
      name: 'King Arthur Baking — high-altitude and batch-scaling adjustments to leavening',
      url: 'https://www.kingarthurbaking.com/learn/resources/high-altitude-baking',
      publisher: 'King Arthur Baking Company',
    },
    {
      name: 'AVPN International Regulation — dough ball weight, hydration and salt for Neapolitan pizza',
      url: 'https://www.pizzanapoletana.org/en/ricetta_pizza_napoletana',
      publisher: 'Associazione Verace Pizza Napoletana',
    },
    {
      name: 'USDA / FDA — retention of water-soluble vitamins in steamed versus boiled vegetables',
      url: 'https://www.ars.usda.gov/northeast-area/beltsville-md-bhnrc/beltsville-human-nutrition-research-center/methods-and-application-of-food-composition-laboratory/mafcl-site-pages/retention-factors/',
      publisher: 'USDA Agricultural Research Service',
    },
  ],

  replaces: [
    '/en/bakers-percentage-calculator',
    '/en/sourdough-hydration-bakers-percentage-calculator',
    '/en/bread-rising-time-yeast-calculator',
    '/en/recipe-scaling-calculator',
    '/en/egg-size-gram-equivalents',
    '/en/oven-temperature-conversion-calculator',
    '/en/teaspoon-to-grams-converter',
    '/en/vegetable-cooking-times-steamed-boiled',
  ],

lastReviewed: '2026-07-28',
};
