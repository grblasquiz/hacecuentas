import type { HubData } from '../types';

/**
 * Hub de decisión EN (US) — "How much food do I need for X guests?"
 *
 * Absorbe 9 calculadoras de porciones por invitado del mercado inglés. Todas las
 * constantes salen de las fórmulas vivas en src/lib/formulas/:
 *   porciones-carne-asado-parrilla-persona · cantidad-hamburguesas-parrilla-cumpleanos
 *   cantidad-pizzas-por-invitados-pizzeria · masa-pizza-casera-gramos-invitados
 *   cantidad-empanadas-por-invitado-evento · porciones-pasta-seca-persona-hambre
 *   porciones-arroz-por-persona-guarnicion · porciones-sushi-por-persona-promedio
 *   hielo-cubos-necesarios-fiesta-invitados
 *
 * Nada se inventó acá: los números que no estaban en las fórmulas (conversiones
 * imperiales) usan factores NIST exactos, declarados abajo.
 */

/** Disclaimer YMYL — src/lib/disclaimers.ts, dominio 'cooking', copy en inglés. */
const DISCLAIMER_COOKING =
  'Quantities and times are estimates; adjust them to the ingredient, equipment, and recipe. Always follow appropriate food-safety practices.';

/** Conversiones exactas (NIST Handbook 44 / NIST SP 811). */
export const CONV = {
  /** 1 pound = 453.59237 g exactamente. */
  gPerLb: 453.59237,
  /** 1 avoirdupois ounce = 28.349523125 g. NO confundir con la onza troy (31.1035 g). */
  gPerOz: 28.349523125,
  /** 1 US fluid ounce = 29.5735295625 mL. La imperial (UK) son 28.4130625 mL. */
  mlPerFlOzUS: 29.5735295625,
  /** 1 US liquid gallon = 3.785411784 L. La imperial son 4.54609 L. */
  lPerGalUS: 3.785411784,
};

/** Carne asada: gramos COCIDOS por adulto (porcion-carne-asado-parrilla-persona). */
export const MEAT = {
  cookedAdultG: { boneIn: 350, boneless: 280, sausage: 180 },
  /** Los chicos comen el 50% de la porción adulta. */
  childShare: 0.5,
  /** Multiplicador de peso CRUDO a comprar: hueso + merma de cocción. */
  rawFactor: { boneIn: 1.45, boneless: 1.28, sausage: 1.12 },
  /** Margen recomendado sobre el peso crudo. */
  buffer: 1.1,
};

/** Hamburguesas por persona según el papel que juegan en la mesa. */
export const BURGERS = {
  rates: { hearty: [1.5, 1.0], moderate: [2.0, 1.5], few: [2.5, 2.0] },
  buffer: 1.15,
  /** Medallón estándar US: 1/4 lb = 113.4 g crudo. */
  pattyG: 113.4,
};

/** Porciones de pizza por persona según cuánta guarnición hay. */
export const PIZZA = {
  slices: { hearty: [2, 1], moderate: [3, 2], few: [4, 2] },
  buffer: 1.1,
  /** Large americana de 14": 8 porciones. */
  slicesPerPie: 8,
  /** Bollo de masa casera para un molde de 12": 250 g (AVPN 250 g / 30 cm). */
  doughBallG: 250,
  /** Baker's percentage de la masa: sal 2%, aceite 3%, levadura seca 1%. */
  saltPct: 0.02,
  oilPct: 0.03,
  yeastPct: 0.01,
  /** Hidratación por defecto de la masa de molde. */
  hydrationPct: 60,
  /** Un molde de 12" alcanza para 3 personas. */
  peoplePerPie: 3,
};

/** Empanadas por persona (adulto, chico) según el rol en la mesa. */
export const EMPANADAS = {
  rates: { hearty: [2.5, 1.5], moderate: [5.5, 3.0], few: [7.0, 4.0] },
  buffer: 1.12,
};

/** Pasta seca en gramos por adulto, según apetito. Chicos: 40 g. */
export const PASTA = {
  adultG: { light: 60, normal: 80, hungry: 120 },
  childG: 40,
  /** La pasta seca pesa 2,3× cocida. */
  cookedFactor: 2.3,
  /** ~350 kcal por 100 g de pasta seca (USDA FoodData Central 168936). */
  kcalPerG: 3.5,
  /** Caja estándar americana: 1 lb = 453.59 g. */
};

/** Arroz de guarnición: gramos crudos por persona. */
export const RICE = {
  gPerPerson: 70,
  /** El arroz largo blanco rinde 3× su peso crudo. */
  cookedFactor: 3,
  /** 2 mL de agua por gramo de arroz crudo (2:1 en volumen). */
  waterMlPerG: 2,
};

/** Piezas de sushi por persona (adulto, chico) según el rol de la comida. */
export const SUSHI = {
  pieces: { light: [6, 4], normal: [11, 7], hungry: [18, 10] },
  buffer: 1.1,
  piecesPerRoll: 8,
};

/** Hielo: kg por invitado y por hora, según el clima. */
export const ICE = {
  perGuestHourKg: { cool: 0.5, mild: 0.75, hot: 1.0 },
  /** USDA: media libra extra por invitado si hay conservadora con comida. */
  foodCoolerKgPerGuest: 0.5,
  /** Merma por derretimiento. */
  meltBuffer: 1.2,
  /** Bolsa estándar de supermercado en EE. UU.: 20 lb. */
  bagLb: 20,
};

export const hub: HubData = {
slug: 'en/cooking/how-much-food-per-guest',
  title: 'How Much Food Per Person? Party Portion Calculator (BBQ, Pizza, Pasta)',
  description:
    'Work out exactly how much meat, pizza, empanadas, pasta, rice, sushi and ice to buy for your guest count. Cooked-vs-raw shrink, kid portions and a catering safety buffer, in pounds and grams.',
  silo: 'Cooking',
siloHref: '/en/cooking',
  locale: 'en',

  eyebrow: 'Party planning · US portions · imperial + metric',
  h1: 'How much food do I need for my guests?',
  lede:
    'Pick what you are serving, tell us who is coming, and get the shopping list: raw weight to buy (not the weight that lands on the plate), how many pies or dozens to order, and the ice to keep it all cold. Every number carries the same catering buffer the pros use.',
  stamps: [
    'Cooked-to-raw shrink included',
    'Pounds and grams side by side',
    '9 calculators inside',
  ],

  resultLabel: 'What to buy',

  cases: {
    title: 'What is the main dish?',
    intro:
      'The per-person rate changes completely with the dish. Start with the grill — it is the most common — or switch to yours. Guest count, appetite and side dishes carry over between cases.',
    items: [
      {
        id: 'bbq',
        label: 'Grilling meat or burgers',
        hint: 'BBQ · steaks · ribs · sausages · burgers',
        answer: 'Buy by RAW weight: meat loses 22–45% between the cooler and the plate.',
        yes: [
          'A finished adult portion is about 350 g of bone-in meat, 280 g boneless, or 180 g of sausage',
          'Kids under 12 eat roughly half an adult portion',
          'Bone-in cuts need 1.45× the raw weight, boneless 1.28×, sausages 1.12×',
          'Burgers run 2 per adult and 1.5 per kid when they are the main event',
          'A 10% buffer covers seconds and the guest who brought a friend',
        ],
        warn: [
          DISCLAIMER_COOKING,
          'Ground beef and poultry are the food-safety limit, not the taste limit: USDA requires 160 °F (71 °C) for ground beef and 165 °F (74 °C) for any poultry, measured with a thermometer',
          'Never leave raw or cooked meat in the danger zone (40–140 °F / 4–60 °C) for more than 2 hours, or 1 hour above 90 °F (32 °C)',
        ],
        plazo: 'buy the meat the day before at most, and keep it under 40 °F (4 °C) until it hits the grate.',
      },
      {
        id: 'pizza',
        label: 'Pizza — ordering or making the dough',
        hint: 'Slices per person · dough by baker’s percentage',
        answer: 'Three slices per adult when pizza is the meal, two when there are real sides.',
        yes: [
          'A 14-inch large is 8 slices; a 12-inch feeds about 3 people',
          'Adults eat 3 slices as a main, 2 alongside appetizers, 4 when pizza is the only food',
          'A 10% margin, then round UP — half a pizza does not exist on a delivery menu',
          'Homemade: 250 g of dough per 12-inch pie at 60% hydration, 2% salt, 3% oil, 1% instant yeast',
          'Order at least one topping variety per two pies so nobody is stuck with one option',
        ],
        warn: [
          DISCLAIMER_COOKING,
          'Dough weight is not flour weight: at 60% hydration a 250 g ball is only about 151 g of flour',
          'Delivery pies arrive at different diameters — check the inches before trusting a slice count',
        ],
        plazo: 'for delivery on a weekend evening, order 60–90 minutes ahead of when you want to eat.',
      },
      {
        id: 'empanadas',
        label: 'Empanadas or handheld savory pastries',
        hint: 'Sold by the dozen · rates by role on the table',
        answer: 'Five to six per adult as a main, two to three as a snack, and always round to whole dozens.',
        yes: [
          'Main course: 5.5 per adult and 3 per child',
          'Snack or side: 2.5 per adult and 1.5 per child',
          'Only food at the party: 7 per adult and 4 per child',
          'A 12% buffer, then round up to the next full dozen — that is how they are sold',
          'Order two or three fillings so vegetarians and picky eaters are covered',
        ],
        warn: [
          DISCLAIMER_COOKING,
          'Frozen empanadas bake from frozen — thawing them first makes the bottoms soggy',
          'Meat fillings must be cooled before assembly or the dough goes gummy and the filling sits in the danger zone',
        ],
        plazo: 'reheat in a 350 °F (177 °C) oven for 10–12 minutes; a microwave ruins the crust.',
      },
      {
        id: 'pasta',
        label: 'Pasta or rice',
        hint: 'Dry weight per person · cooked yield',
        answer: 'Weigh it dry: 80 g (2.8 oz) of pasta per adult, 70 g of raw rice as a side.',
        yes: [
          'Dry pasta: 60 g for a light plate, 80 g standard, 120 g for a hungry table; 40 g per child',
          'Dry pasta gains 2.3× its weight in the pot, so 80 g dry is about 184 g on the plate',
          'Raw rice as a side: 70 g per person, which cooks up to roughly 210 g',
          'Rice needs 2 mL of water per gram of raw rice — that is the familiar 2:1 by volume',
          'A 1 lb (454 g) box of pasta feeds about 5 adults at the standard portion',
        ],
        warn: [
          DISCLAIMER_COOKING,
          'Fresh pasta is not the same portion: it already contains water, so a fresh portion runs about 1.5× the dry weight in grams',
          'Cooked rice left at room temperature can grow Bacillus cereus — refrigerate leftovers within 2 hours',
        ],
        plazo: 'salt the water at about 10 g per liter and cook to the low end of the box time if a sauce will finish it.',
      },
      {
        id: 'sushi',
        label: 'Sushi',
        hint: 'Pieces per person · rolls of 8',
        answer: 'Eleven pieces per adult for a full meal — that is roughly a roll and a half.',
        yes: [
          'Appetizer: 6 pieces per adult, 4 per child',
          'Main meal: 11 pieces per adult, 7 per child',
          'Full tasting spread: 18 pieces per adult, 10 per child',
          'A 10% buffer, then round up: restaurants sell whole rolls of 8',
          'Mix cooked and raw items — not every guest eats raw fish',
        ],
        warn: [
          DISCLAIMER_COOKING,
          'Raw fish is a food-safety item: the FDA Food Code requires sushi-grade fish to be frozen at −4 °F (−20 °C) for 7 days, or −31 °F (−35 °C) for 15 hours, to control parasites',
          'Pregnant people, young children, older adults and anyone immunocompromised should skip raw fish entirely',
          'Sushi held above 41 °F (5 °C) should be discarded after 2 hours',
        ],
        plazo: 'pick up sushi no more than 2 hours before serving and keep it refrigerated until the platter goes out.',
      },
    ],
  },

  inputsTitle: 'Who is coming and what else is on the table',
  inputsIntro:
    'The same six answers drive every dish. Appetite and side dishes are the two levers that move the shopping list the most — a table with hearty sides eats about a third less of the main.',
  fields: [
    {
      id: 'adults',
      label: 'Adults',
      type: 'number',
      value: 20,
      min: 0,
      max: 500,
      step: 1,
      help: 'Anyone 13 and up eats a full adult portion.',
    },
    {
      id: 'kids',
      label: 'Children (12 and under)',
      type: 'number',
      value: 6,
      min: 0,
      max: 300,
      step: 1,
      help: 'Kids eat roughly half an adult portion of everything except pizza slices.',
    },
    {
      id: 'appetite',
      label: 'How hungry is this crowd?',
      type: 'select',
      value: 'normal',
      options: [
        { value: 'light', label: 'Light — grazers, afternoon event' },
        { value: 'normal', label: 'Normal — average appetite' },
        { value: 'hungry', label: 'Hungry — teens, athletes, long evening' },
      ],
      help: 'Multiplies the main dish by 0.80, 1.00 or 1.25.',
    },
    {
      id: 'sides',
      label: 'How much else is on the table?',
      type: 'select',
      value: 'moderate',
      options: [
        { value: 'hearty', label: 'Hearty sides, salads and appetizers' },
        { value: 'moderate', label: 'Moderate — a couple of sides' },
        { value: 'few', label: 'Almost nothing else — this is the meal' },
      ],
      help: 'Multiplies the main dish by 0.80, 1.00 or 1.20, and sets the per-person rate for pizza and empanadas.',
    },
    {
      id: 'hours',
      label: 'How many hours will the party run?',
      type: 'number',
      value: 4,
      min: 1,
      max: 24,
      step: 1,
      help: 'Only affects the ice, which melts whether anyone drinks it or not.',
    },
    {
      id: 'weather',
      label: 'Weather and venue',
      type: 'select',
      value: 'mild',
      options: [
        { value: 'cool', label: 'Cool or indoors — 0.5 kg of ice per guest per hour' },
        { value: 'mild', label: 'Mild or outdoors in the shade — 0.75 kg' },
        { value: 'hot', label: 'Hot summer day in the sun — 1.0 kg' },
      ],
      help: 'Sets the ice rate. The estimate always includes a food cooler and a 20% melt buffer.',
    },
  ],
  fineprint: DISCLAIMER_COOKING,

  chart: {
    type: 'donut',
    title: 'Where the food actually goes',
    caption:
      'Splits the total into what the adults eat, what the kids eat, and the safety buffer you are buying on purpose. If the buffer slice looks large, that is the margin protecting you from running out — not waste.',
  },
  breakdownTitle: 'Your shopping list, line by line',
  breakdownIntro:
    'Raw weight first, because that is what you pay for at the counter, then the cooked yield so you can picture the plate. Imperial and metric on separate lines — no mental math at the store.',

  answer: undefined,

  faq: [
    {
      q: 'How much meat do I need per person for a BBQ?',
      a: 'Plan on about 350 g (12 oz) of finished bone-in meat per adult, 280 g (10 oz) boneless, or 180 g (6 oz) of sausage. But you do not buy finished meat — you buy raw. Bone-in cuts lose roughly 30% to bone and another 25% to cooking, so multiply by 1.45; boneless loses about 22%, so multiply by 1.28; sausages only lose about 12%, so multiply by 1.12. For 20 adults on boneless steak that is 20 × 280 g × 1.28 ≈ 7.2 kg, or just under 16 lb, before the 10% buffer. Children under 12 count as half an adult.',
    },
    {
      q: 'How many burgers should I make per person?',
      a: 'When burgers are the main event, plan 2 per adult and 1.5 per child. If they share the grill with steak, sausage or hot dogs, drop to 1.5 and 1. If burgers are the only food at a long party, go to 2.5 and 2. Then add 15% — that buffer covers late guests, the person who eats three, and the patty that falls through the grate. At a US quarter-pound patty (113 g raw), every 4 burgers is about 1 lb of ground beef.',
    },
    {
      q: 'How many pizzas do I need for a party?',
      a: 'Count slices, not pies. An adult eats 3 slices when pizza is the meal, 2 when there are appetizers and sides, and 4 when pizza is the only thing served; children eat 1–2. Add 10%, divide by the slice count of the size you are ordering (a 14-inch large is 8 slices), and always round up. For 20 adults and 6 kids as a main course that is 60 + 12 = 72 slices, ×1.10 = 79.2, ÷8 = 10 pies.',
    },
    {
      q: 'How much pizza dough do I need per person?',
      a: 'About 250 g of dough per 12-inch pie, and a 12-inch pie feeds roughly three people. Dough weight is not flour weight: at 60% hydration with 2% salt, 3% oil and 1% instant yeast, the divisor is 1.66, so a 250 g ball comes from about 151 g of flour, 90 g of water, 3 g of salt, 4.5 g of oil and 1.5 g of yeast. Neapolitan style skips the oil and drops to a 1.63 divisor.',
    },
    {
      q: 'How many empanadas per person?',
      a: 'Five to six per adult as a main course (use 5.5 for planning) and 3 per child. As a snack or appetizer alongside other food, 2.5 and 1.5. If empanadas are the only food, 7 and 4. Add a 12% buffer and round up to whole dozens, because that is the unit they are sold in. Order at least two or three fillings — a meat-only order strands every vegetarian at the table.',
    },
    {
      q: 'How much dry pasta per person?',
      a: 'The standard adult portion is 80 g (2.8 oz) of dry pasta. Drop to 60 g (2.1 oz) for a first course or a light plate, and go to 120 g (4.2 oz) for a hungry table. Children take about 40 g. Dry pasta absorbs water and comes out at roughly 2.3× its dry weight, so 80 g dry is about 184 g on the plate. A 1 lb (454 g) box therefore covers about five standard adult portions.',
    },
    {
      q: 'How much rice do I need as a side dish?',
      a: 'About 70 g (2.5 oz) of raw long-grain rice per person for a side. Rice roughly triples in weight, so that lands as about 210 g cooked on the plate. Water goes in at 2 mL per gram of raw rice, which is the familiar 2 cups of water to 1 cup of rice. For a main dish rather than a side, plan closer to 100 g raw per person.',
    },
    {
      q: 'How much sushi should I order per person?',
      a: 'Eleven pieces per adult for a full meal, 6 for an appetizer, and 18 for a broad tasting spread; children eat 7, 4 and 10 respectively. Add 10% and round up, because restaurants sell whole rolls of 8 pieces — you cannot order half a roll. Eleven pieces is about a roll and a third, so for four adults you are ordering roughly 6 rolls.',
    },
    {
      q: 'How much ice do I need for a party?',
      a: 'The catering rule is guests × hours × a weather factor: 0.5 kg per guest per hour indoors or in cool weather, 0.75 kg outdoors in mild weather, and 1.0 kg on a hot day in the sun. Add half a kilo per guest if you are also icing a food cooler, then add 20% for melt. For 26 guests over 4 hours in mild weather with a food cooler: (26 × 4 × 0.75 + 13) × 1.20 ≈ 109 kg, which is about 12 standard 20-lb bags.',
    },
    {
      q: 'Why does the calculator make me buy more meat than my guests will eat?',
      a: 'Because you buy raw weight and serve cooked weight, and those are two different numbers. Water loss during cooking runs 20–25% for most cuts, and bone-in cuts carry roughly 30% inedible bone on top of that. A rack that weighs 10 lb at the butcher puts about 5 lb of meat on the plate. The calculator works backwards from the portion you actually want to serve, which is why the shopping number looks generous.',
    },
    {
      q: 'Do children really count as half an adult?',
      a: 'For meat, pasta, rice and sushi, yes — half is the catering standard and it holds up well for kids twelve and under. Pizza and burgers are the exceptions: kids eat pizza by the slice at close to two-thirds of an adult rate, and burgers at about three-quarters, because a slice and a patty are fixed-size units they will finish. Teenagers should be counted as adults, and in some cases as hungry adults.',
    },
    {
      q: 'How far ahead should I buy everything?',
      a: 'Dry goods — pasta, rice, flour — whenever you like. Meat no more than a day or two ahead, held below 40 °F (4 °C). Sushi and anything with raw fish, the same day, no more than two hours before serving. And ice the morning of the event: bags stored in a home freezer fuse into a single unusable block within about a day, which is the single most common party-supply mistake.',
    },
  ],

  sources: [
    {
      name: 'USDA FSIS — Safe Minimum Internal Temperature Chart',
      url: 'https://www.fsis.usda.gov/food-safety/safe-food-handling-and-preparation/food-safety-basics/safe-temperature-chart',
      publisher: 'U.S. Department of Agriculture, Food Safety and Inspection Service',
    },
    {
      name: 'USDA FSIS — "Danger Zone" (40 °F – 140 °F)',
      url: 'https://www.fsis.usda.gov/food-safety/safe-food-handling-and-preparation/food-safety-basics/danger-zone-40f-140f',
      publisher: 'U.S. Department of Agriculture',
    },
    {
      name: 'FDA Food Code — parasite destruction requirements for fish served raw',
      url: 'https://www.fda.gov/food/fda-food-code/food-code-2022',
      publisher: 'U.S. Food and Drug Administration',
    },
    {
      name: 'USDA FoodData Central — pasta, dry, unenriched (nutrient density)',
      url: 'https://fdc.nal.usda.gov/food-details/168936/nutrients',
      publisher: 'USDA Agricultural Research Service',
    },
    {
      name: 'NIST Handbook 44 / SP 811 — exact avoirdupois and US liquid conversions',
      url: 'https://www.nist.gov/pml/special-publication-811',
      publisher: 'National Institute of Standards and Technology',
    },
    {
      name: 'AVPN International Regulation — Neapolitan dough ball weight and hydration',
      url: 'https://www.pizzanapoletana.org/en/ricetta_pizza_napoletana',
      publisher: 'Associazione Verace Pizza Napoletana',
    },
  ],

  replaces: [
    '/en/bbq-meat-portions-per-person',
    '/en/cantidad-hamburguesas-parrilla-cumpleanos',
    '/en/pizzas-by-guests',
    '/en/homemade-pizza-dough-grams-guests',
    '/en/empanadas-per-guest',
    '/en/dry-pasta-portions-per-person',
    '/en/rice-portions-per-person-side-dish',
    '/en/sushi-per-person-calculator',
    '/en/ice-party-calculator',
  ],

lastReviewed: '2026-07-28',
};
