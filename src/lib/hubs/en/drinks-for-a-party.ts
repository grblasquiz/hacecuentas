import type { HubData } from '../types';

/**
 * Hub de decisión EN (US) — "How much booze/soda do I buy?"
 *
 * Absorbe 3 calculadoras de bebidas para evento del mercado inglés.
 * Constantes tomadas de las fórmulas vivas en src/lib/formulas/:
 *   alcohol-per-guest-event-calculator (modelo US, con multiplicador por tipo de evento)
 *   bebidas-evento-cerveza-vino-refresco-calculadora (modelo DPPH, se muestra como contraste)
 *   pelicula-duracion-snacks (caso sin alcohol)
 */

/** Disclaimer YMYL — src/lib/disclaimers.ts, dominio 'cooking', copy en inglés. */
const DISCLAIMER_DRINKS =
  'Quantities and times are estimates; adjust them to the ingredient, equipment, and recipe. Always follow appropriate food-safety practices. Serving alcohol carries legal and safety responsibilities: never serve anyone under 21, and never let a guest drive impaired.';

/**
 * Modelo de consumo del catering en EE. UU.: 1 trago por invitado y por hora las
 * primeras 2 horas, 0,5 por hora después, y un multiplicador por formato.
 */
export const RATE = {
  first: 1.0,
  after: 0.5,
  firstBlockHours: 2,
  multiplier: { wedding: 1.0, cocktail: 1.15, casual: 0.85 },
};

/**
 * Modelo alternativo "drinks per person per hour": 2 tragos la primera hora,
 * 1 por hora después, +15% de margen. Da más alto que el de arriba en eventos
 * cortos y se muestra como cota superior.
 */
export const DPPH = { firstHour: 2, perHour: 1, buffer: 1.15 };

/** Reparto por tipo de bebida en un evento mixto estadounidense. */
export const MIX = {
  alcohol: { wine: 0.5, beer: 0.3, spirits: 0.2 },
  /** Reparto cuando la barra es de cerveza y gaseosa nada más. */
  casual: { beer: 0.5, wine: 0.3, soda: 0.2 },
};

/** Unidades de compra en EE. UU. */
export const UNITS = {
  /** Botella de 750 mL a 5 fl oz por copa (trago estándar de vino, NIAAA). */
  glassesPerWineBottle: 5,
  /** Trago de destilado: 1,5 fl oz = 44,36 mL. */
  lPerSpiritDrink: 0.04436,
  mlPerSpiritBottle: 750,
  beersPerSixPack: 6,
  beersPerCase: 24,
  cansPerSodaPack: 12,
  /** Lata de gaseosa de 12 fl oz. */
  sodaCanFlOz: 12,
  /** Trago estándar NIAAA: 14 g de alcohol puro = 12 fl oz de cerveza al 5%. */
  gAlcoholPerStandardDrink: 14,
};

/** Presupuesto: cota alta con 10% extra por derrames, invitados extra y quien toma más. */
export const HIGH_BUFFER = 1.1;

/** Noche de película sin alcohol: litros por persona cada 2 horas. */
export const MOVIE = {
  popcornLPer2h: 2,
  drinkLPer2h: 0.5,
  intensity: { light: 0.7, normal: 1.0, heavy: 1.5 },
  /** Una bolsa de 12 packs de gaseosa de 12 fl oz son 4,26 L. */
  lPerSodaCan: 0.3549,
};

export const hub: HubData = {
slug: 'en/cooking/drinks-for-a-party',
  title: 'How Much Alcohol Per Guest? Party Drinks Calculator (Beer, Wine, Spirits)',
  description:
    'How many drinks to buy for a wedding, cocktail party or casual BBQ: bottles of wine, cases of beer, liters of spirits and soda, with a cost range in dollars. Standard catering consumption rates, not guesswork.',
  silo: 'Cooking',
siloHref: '/en/cooking',
  locale: 'en',

  eyebrow: 'Event planning · US units · cost in dollars',
  h1: 'How much do I need to buy for the bar?',
  lede:
    'Guests do not drink at a constant rate: the first two hours are the heavy ones, then consumption drops by half. Set the head count, the run time and the format, and get the shopping list in the units the store actually sells — bottles, cases, six-packs — plus a dollar range.',
  stamps: [
    'Catering consumption rates',
    'Bottles, cases and six-packs',
    '3 calculators inside',
  ],

  resultLabel: 'Total drinks to buy',

  cases: {
    title: 'What kind of event is it?',
    intro:
      'The format changes how much people drink more than the guest count does. A cocktail party with no seated meal runs about 35% ahead of a casual BBQ with the same guests and the same hours.',
    items: [
      {
        id: 'wedding',
        label: 'Wedding or formal reception',
        hint: 'Seated meal · wine-led · the baseline',
        answer: 'One drink per guest per hour for the first two hours, then half a drink per hour.',
        yes: [
          'Wine takes about 50% of the drinks, beer 30% and spirits 20%',
          'A 750 mL bottle of wine pours 5 standard 5 fl oz glasses',
          'A liter of spirits covers about 22 drinks at 1.5 fl oz each',
          'Toasts are extra: budget one additional glass of sparkling per adult guest',
          'Non-drinkers, designated drivers and anyone under 21 still need something to hold',
        ],
        warn: [
          DISCLAIMER_DRINKS,
          'Social-host liability is real in most US states: a host who serves a visibly intoxicated guest, or anyone under 21, can be held liable for what happens afterward',
          'This estimate covers alcohol only — mixers, ice, garnishes and non-alcoholic options are separate purchases',
        ],
        plazo: 'most retailers will take back sealed, unopened bottles — ask before you buy, and buy on the generous side.',
      },
      {
        id: 'cocktail',
        label: 'Cocktail party',
        hint: 'Standing, no full meal · consumption runs 15% higher',
        answer: 'No seated meal means faster drinking: add 15% over the wedding baseline.',
        yes: [
          'Standing formats with passed appetizers push consumption up about 15%',
          'Spirits take a larger share, so buy mixers at roughly 3 parts mixer to 1 part spirit',
          'A liter bottle of mixer covers about 6 drinks',
          'Ice runs about 1 lb per guest for drinks alone, more if you are also chilling bottles',
          'Have real food out — an empty stomach changes how fast alcohol hits',
        ],
        warn: [
          DISCLAIMER_DRINKS,
          'Cocktails hide their strength: a strong pour can be two or three standard drinks in a single glass, so a guest can be well past their own estimate without noticing',
          'Free-pouring is what blows both the budget and the guests — use a jigger',
        ],
        plazo: 'stop the bar an hour before the end and put out coffee, water and food.',
      },
      {
        id: 'casual',
        label: 'Casual party or BBQ',
        hint: 'Food-led, mixed crowd · beer and soda',
        answer: 'Food competes with the bar: consumption drops about 15% below the formal baseline.',
        yes: [
          'Beer leads at roughly 50% of drinks, wine 30%, soda and water 20%',
          'A case of beer is 24 cans; a six-pack is the smallest useful unit',
          'A 12-pack of 12 fl oz cans covers 12 soda servings',
          'Count kids and non-drinkers in the soda and water line, not the alcohol line',
          'Daytime and outdoor events need far more water than anyone plans for',
        ],
        warn: [
          DISCLAIMER_DRINKS,
          'In hot weather people drink much more, and alcohol is a diuretic — put out at least as much water as beer',
          'Never leave alcohol unattended where minors can reach it',
        ],
        plazo: 'chill beer at least 4 hours ahead, or 30 minutes in a bucket of ice, water and salt.',
      },
      {
        id: 'movie',
        label: 'Movie night — no alcohol',
        hint: 'Popcorn and soda by runtime',
        answer: 'Two liters of popcorn and half a liter of drink per person, per two hours of runtime.',
        yes: [
          'Popcorn: about 2 L of popped volume per person per two hours of film',
          'Drinks: about 0.5 L per person per two hours',
          'One bag of chips or nachos per two people',
          'Anything over 150 minutes wants a second snack round at the midpoint',
          'One chocolate bar or individual sweet per person covers the sugar craving',
        ],
        warn: [
          DISCLAIMER_DRINKS,
          'Whole popcorn kernels and hard candy are a choking hazard for children under four',
          'A 12 fl oz can of regular soda carries about 39 g of added sugar, which is more than the entire daily limit the American Heart Association recommends for children',
        ],
        plazo: 'pop the corn no more than 30 minutes ahead — it goes chewy fast once it cools.',
      },
    ],
  },

  inputsTitle: 'Your event',
  inputsIntro:
    'Prices are what you pay at your store, in dollars — the calculator uses them to turn the shopping list into a budget range. Leave them as they are for a rough national estimate.',
  fields: [
    {
      id: 'guests',
      label: 'Drinking-age guests',
      type: 'number',
      value: 60,
      min: 0,
      max: 2000,
      step: 1,
      help: 'Count only guests aged 21 and over. Everyone else goes in the line below.',
    },
    {
      id: 'nonDrinkers',
      label: 'Kids, drivers and non-drinkers',
      type: 'number',
      value: 15,
      min: 0,
      max: 2000,
      step: 1,
      help: 'They still drink — soda, water and juice. This line sizes that separately.',
    },
    {
      id: 'hours',
      label: 'How many hours will the bar be open?',
      type: 'number',
      value: 5,
      min: 1,
      max: 24,
      step: 1,
      help: 'The first two hours run at full rate, everything after at half.',
    },
    {
      id: 'winePrice',
      label: 'Price of a 750 mL bottle of wine ($)',
      type: 'number',
      value: 15,
      min: 0,
      max: 1000,
      step: 1,
      help: 'What you actually pay per bottle, in US dollars.',
    },
    {
      id: 'beerPrice',
      label: 'Price of a six-pack of beer ($)',
      type: 'number',
      value: 10,
      min: 0,
      max: 500,
      step: 1,
      help: 'Per six-pack, not per can.',
    },
    {
      id: 'spiritsPrice',
      label: 'Price of a 750 mL bottle of spirits ($)',
      type: 'number',
      value: 25,
      min: 0,
      max: 2000,
      step: 1,
      help: 'Per standard fifth. Handles of 1.75 L usually work out cheaper per drink.',
    },
    {
      id: 'sodaPrice',
      label: 'Price of a 12-pack of soda ($)',
      type: 'number',
      value: 8,
      min: 0,
      max: 200,
      step: 1,
      help: 'Twelve 12 fl oz cans. Also used for mixers.',
    },
    {
      id: 'runtimeMin',
      label: 'Movie runtime (minutes)',
      type: 'number',
      value: 120,
      min: 20,
      max: 600,
      step: 5,
      help: 'Only used by the movie-night case.',
    },
  ],
  fineprint: DISCLAIMER_DRINKS,

  chart: {
    type: 'donut',
    title: 'Where the money goes',
    caption:
      'The cost split across wine, beer, spirits and soft drinks at your prices. Spirits almost always look small here and are not: one bottle covers about 17 drinks, which is why they are the cheapest way to serve a crowd and the easiest way to over-pour.',
  },
  breakdownTitle: 'Your shopping list and what it costs',
  breakdownIntro:
    'Drinks first, then the same number converted into bottles, cases and packs, then the dollar range. Every quantity is rounded up — you cannot buy four-fifths of a bottle.',

  faq: [
    {
      q: 'How much alcohol do I need per guest?',
      a: 'The catering standard is one drink per guest per hour for the first two hours, then half a drink per guest per hour after that. For 60 guests over 5 hours: (60 × 1 × 2) + (60 × 0.5 × 3) = 210 drinks, or 3.5 drinks per guest across the event. Adjust for format: a cocktail party with no seated meal runs about 15% higher, a food-led casual party about 15% lower. That rate is an average across the room — some guests will have none and some will have six.',
    },
    {
      q: 'How many bottles of wine do I need for a party?',
      a: 'A 750 mL bottle pours five standard 5 fl oz glasses. If wine takes half your drink total, 210 drinks means 105 glasses, which is 21 bottles. Round up, always. For a wedding, add one extra glass of sparkling per adult for the toast — a bottle of sparkling gives about six smaller toast pours. Most retailers will take back sealed, unopened bottles, so buying a case beyond the estimate is usually a free option worth asking about.',
    },
    {
      q: 'How much beer do I need for 50 people?',
      a: 'At a 4-hour casual party, 50 guests come to about (50 × 1 × 2) + (50 × 0.5 × 2) = 150 drinks, adjusted down 15% for the food-led format gives about 128. If beer takes half of that, you need 64 cans, which is three cases of 24 or eleven six-packs. Buy in cases — the per-can price is almost always lower and unopened cases store fine.',
    },
    {
      q: 'How much liquor do I need for 100 guests?',
      a: 'A standard drink of spirits is 1.5 fl oz, which is about 44 mL, so a 750 mL bottle yields roughly 17 drinks and a 1.75 L handle about 39. For 100 guests over 4 hours the total is around 300 drinks; if spirits take 20% of that, you need 60 drinks, or 4 bottles. Then buy mixers at roughly three parts mixer to one part spirit — a liter of mixer covers about six drinks, so 60 spirit drinks want about 10 liters of soda, tonic and juice.',
    },
    {
      q: 'What counts as one standard drink?',
      a: 'In the United States a standard drink contains 14 grams of pure alcohol. That is 12 fl oz of regular beer at about 5% ABV, 5 fl oz of wine at about 12%, or 1.5 fl oz of 80-proof spirits at 40%. All three are the same amount of alcohol, which is the whole point of the definition. It also means a 16 oz craft IPA at 7% is closer to two standard drinks than one, and a generously poured cocktail can easily be three.',
    },
    {
      q: 'Why do the first two hours count double?',
      a: 'Because arrival drinking is a real and consistent pattern: guests arrive, get handed a drink, and finish it quickly while the room fills and there is nothing else to do. After the first two hours people are eating, talking and dancing, and consumption settles to roughly half the arrival rate. Planning at a flat rate for the whole event either leaves you short in the first hour or leaves you with a lot of leftovers.',
    },
    {
      q: 'How much soda and water do I need?',
      a: 'Count everyone, not just non-drinkers: plan roughly one non-alcoholic serving per person per hour on top of the alcohol, and more in hot weather. A 12-pack covers twelve 12 fl oz servings. Water in particular is always underestimated — alcohol is a diuretic, and a daytime outdoor event can go through more water than beer. Set out water where people can help themselves rather than making them ask.',
    },
    {
      q: 'How much ice do I need for the bar?',
      a: 'About 1 lb (0.45 kg) per guest for drinks alone, and double that if you are also chilling bottles and cans in tubs. Buy it the morning of the event: bags stored in a home freezer fuse into a single unusable block within a day or so. If you are chilling drinks fast, a bucket of ice, water and a handful of salt cools cans in about 20–30 minutes, far faster than ice alone.',
    },
    {
      q: 'What if my guests do not drink evenly?',
      a: 'They will not, and the model already accounts for it — these are averages across a room, validated across a lot of events. Where it breaks down is at small parties: with twelve guests, three heavy drinkers can double the real consumption and the average stops being useful. Under about twenty guests, plan for the people you actually know rather than the rate. Above that, the averages hold up well.',
    },
    {
      q: 'Am I legally responsible for what my guests drink?',
      a: 'In most US states, potentially yes. Social-host liability laws generally hold a host responsible for serving alcohol to anyone under 21, and many states extend that to serving a visibly intoxicated guest who then causes harm. The specifics vary a lot by state. Practically: check IDs if you are unsure, stop serving anyone who is obviously impaired, close the bar an hour before the end, and have coffee, food and a way home available.',
    },
    {
      q: 'How much popcorn do I need for a movie night?',
      a: 'About 2 liters of popped popcorn per person per two hours of runtime, and half a liter of drink over the same window. For four people watching a 150-minute film that is 10 liters of popped corn — which sounds enormous until you remember popcorn is mostly air, and 10 L of popped volume comes from only about 100 g of kernels. Add a bag of chips per two people, and a second snack round at the midpoint for anything over two and a half hours.',
    },
    {
      q: 'Should I buy more than the calculator says?',
      a: 'For wine and beer, yes — sealed bottles and unopened cases keep indefinitely, and many retailers accept returns on unopened stock, so the downside of over-buying is close to zero while running dry ends the party. For anything perishable or opened, buy to the estimate. And build the buffer into the categories people actually drink first: at most events that is beer early and wine late.',
    },
  ],

  sources: [
    {
      name: 'NIAAA — What is a standard drink?',
      url: 'https://www.niaaa.nih.gov/alcohols-effects-health/overview-alcohol-consumption/what-standard-drink',
      publisher: 'National Institute on Alcohol Abuse and Alcoholism',
    },
    {
      name: 'Dietary Guidelines for Americans — alcohol and standard pour sizes',
      url: 'https://www.dietaryguidelines.gov/',
      publisher: 'USDA / HHS',
    },
    {
      name: 'CDC — Alcohol and public health, excessive drinking and community strategies',
      url: 'https://www.cdc.gov/alcohol/index.html',
      publisher: 'Centers for Disease Control and Prevention',
    },
    {
      name: 'NIAAA — Alcohol Policy Information System, social host liability by state',
      url: 'https://alcoholpolicy.niaaa.nih.gov/',
      publisher: 'National Institute on Alcohol Abuse and Alcoholism',
    },
    {
      name: 'American Heart Association — added sugars in beverages, recommended limits',
      url: 'https://www.heart.org/en/healthy-living/healthy-eating/eat-smart/sugar/added-sugars',
      publisher: 'American Heart Association',
    },
    {
      name: 'NIST SP 811 — exact US fluid ounce and liquid measure definitions',
      url: 'https://www.nist.gov/pml/special-publication-811',
      publisher: 'National Institute of Standards and Technology',
    },
  ],

  replaces: [
    '/en/alcohol-per-guest-event-calculator',
    '/en/party-drinks-beer-wine-soda',
    '/en/movie-duration-snacks',
  ],

lastReviewed: '2026-07-28',
};
