import type { HubData } from '../types';

/**
 * Hub de decisión EN (US) — "How strong will it come out and how long does it take?"
 *
 * Absorbe 6 calculadoras de café, cerveza casera y destilados del mercado inglés.
 * Constantes tomadas de las fórmulas vivas en src/lib/formulas/:
 *   coffee-water-ratio-brewing-calculator · cafe-molido-taza-metodo-preparacion
 *   priming-sugar-carbonatacion-cerveza · srm-color-cerveza-morey
 *   barrel-aging-tiempo-whiskey · vodka-infusion-frutas-tiempo
 */

/** Disclaimer YMYL — src/lib/disclaimers.ts, dominio 'cooking', copy en inglés. */
const DISCLAIMER_COOKING =
  'Quantities and times are estimates; adjust them to the ingredient, equipment, and recipe. Always follow appropriate food-safety practices.';

/** Conversiones exactas. El galón US NO es el imperial. */
export const CONV = {
  /** 1 US liquid gallon = 3.785411784 L. El imperial (UK) son 4.54609 L. */
  lPerGalUS: 3.785411784,
  /** 1 US fluid ounce = 29.5735295625 mL. La imperial son 28.4130625 mL. */
  mlPerFlOzUS: 29.5735295625,
  /** 1 avoirdupois ounce = 28.349523125 g. La onza troy son 31.1034768 g. */
  gPerOz: 28.349523125,
  lbPerKg: 2.2046226218,
};

/** Ratios café:agua por masa (SCA Gold Cup y práctica establecida por método). */
export const BREW: Record<string, { ratio: number; label: string; grind: string; defaultOz: number }> = {
  drip: { ratio: 16, label: 'Drip / pour-over', grind: 'Medium, 600–800 µm — like coarse sand', defaultOz: 8 },
  french_press: { ratio: 15, label: 'French press', grind: 'Coarse, 800–1000 µm — like raw sugar', defaultOz: 8 },
  aeropress: { ratio: 14, label: 'AeroPress', grind: 'Medium-fine, 400–600 µm — like table salt', defaultOz: 7 },
  espresso: { ratio: 2, label: 'Espresso', grind: 'Fine, 200–400 µm — like powdered sugar', defaultOz: 1 },
  cold_brew: { ratio: 8, label: 'Cold brew concentrate', grind: 'Coarse, 800–1000 µm — dilute 1:1 before drinking', defaultOz: 8 },
};

/** 1 cucharada rasa de café molido medio ≈ 5,3 g (referencia SCAA). */
export const GRAMS_PER_TBSP_COFFEE = 5.3;

/**
 * Azúcar de cebado. CO2 residual disuelto según la temperatura más alta que
 * alcanzó la cerveza al final de la fermentación (°C):
 *   residual = 3.0378 − 0.050062·T + 0.00026555·T²
 * Y los gramos por litro y por volumen de CO2, según el azúcar.
 */
export const PRIMING = {
  residualA: 3.0378,
  residualB: 0.050062,
  residualC: 0.00026555,
  sugarFactor: { dextrose: 3.86, table_sugar: 3.51, dme: 4.5, honey: 4.26 },
  /** Por encima de este valor el riesgo de botella reventada es real. */
  dangerVolumes: 3.5,
};

/** Color SRM por la ecuación de Morey (1993): SRM = 1.4922 × MCU^0.6859. */
export const SRM = {
  moreyA: 1.4922,
  moreyB: 0.6859,
  /** EBC ≈ SRM × 1.97. */
  ebcFactor: 1.97,
};

/**
 * Añejado en barrica. La superficie de madera por litro crece al achicar el
 * barril, así que el tiempo escala con la raíz cúbica de la relación de volumen
 * contra una barrica estándar de 200 L.
 */
export const BARREL = {
  referenceL: 200,
  /** Meses en una barrica de 200 L, por intensidad buscada. */
  monthsWhiskey: { light: 24, medium: 48, bold: 96 },
  monthsRum: { light: 18, medium: 36, bold: 72 },
  /** La ventana práctica es ±20% alrededor de la estimación. */
  windowLow: 0.8,
  windowHigh: 1.2,
};

/** Infusiones en alcohol neutro: días de reposo y dosis por mL. */
export const INFUSIONS: Array<{
  id: string;
  label: string;
  days: [number, number];
  dose: string;
  tip: string;
}> = [
  { id: 'citrus', label: 'Citrus zest', days: [3, 5], dose: 'zest of 1 fruit per 100 mL', tip: 'Zest only — the white pith turns it bitter.' },
  { id: 'soft_fruit', label: 'Soft fruit (berries, peach)', days: [2, 4], dose: '0.5 g of fruit per mL', tip: 'Cut it up and shake daily; it infuses fast.' },
  { id: 'hard_fruit', label: 'Hard fruit (apple, pear)', days: [7, 10], dose: '0.5 g of fruit per mL', tip: 'Cube it and taste-test at day 7.' },
  { id: 'vanilla', label: 'Vanilla beans', days: [14, 28], dose: '1 bean per 200 mL', tip: 'Split lengthwise to expose the seeds.' },
  { id: 'coffee', label: 'Roasted coffee beans', days: [5, 7], dose: '0.15 g of beans per mL', tip: 'Whole beans give a smoother, less muddy infusion.' },
  { id: 'spices', label: 'Whole spices', days: [7, 14], dose: '3–4 cinnamon sticks, 10–15 cloves, 20–30 peppercorns', tip: 'Whole spices only; shake twice a week.' },
  { id: 'herbs', label: 'Fresh herbs', days: [3, 7], dose: '0.05 g of leaves per mL', tip: 'Rinse well — they turn bitter quickly.' },
  { id: 'chili', label: 'Chili peppers', days: [2, 4], dose: '1 pepper per 250 mL', tip: 'Taste daily; heat builds much faster than you expect.' },
  { id: 'tea', label: 'Tea', days: [1, 3], dose: '1 tea bag per 150 mL', tip: 'Do not over-infuse or it goes tannic and astringent.' },
  { id: 'ginger', label: 'Fresh ginger', days: [7, 14], dose: '0.07 g grated per mL', tip: 'Fresh grated only — dried ginger tastes flat.' },
];

export const hub: HubData = {
slug: 'en/cooking/brewing-and-infusions',
  title: 'Coffee Ratio, Priming Sugar & Infusion Time',
  description:
    'How strong it comes out and how long it takes: SCA coffee-to-water ratios, priming sugar for a target carbonation, beer color by the Morey SRM equation, barrel aging time by cask size, and infusion times by ingredient.',
  silo: 'Cooking',
siloHref: '/en/cooking',
  locale: 'en',

  eyebrow: 'Coffee · homebrew · spirits · US units',
  h1: 'How strong will it come out, and how long does it take?',
  lede:
    'Every drink you make at home is the same two questions: what ratio gets the strength you want, and how long does the extraction, the carbonation or the oak need. Pick your case, set the batch size, and get the dose in grams and ounces plus the timeline.',
  stamps: [
    'SCA Gold Cup ratios',
    'Morey SRM · Q10 residual CO₂',
    '6 calculators inside',
  ],

  resultLabel: 'What to weigh out',

  cases: {
    title: 'What are you making?',
    intro:
      'Coffee is the everyday case; the other three run on the same idea at a longer timescale. Batch size and target strength carry over between them.',
    items: [
      {
        id: 'coffee',
        label: 'Brewing coffee',
        hint: 'SCA ratios by method · dose in grams',
        answer: 'The ratio is by mass, not by scoop: 1 gram of coffee to 16 grams of water for drip.',
        yes: [
          'Drip and pour-over sit at 1:16, the SCA Gold Cup center point',
          'French press goes slightly richer at 1:15, AeroPress at 1:14',
          'Espresso is 1:2 — an 18 g dose yielding 36 g in the cup',
          'Cold brew concentrate is 1:8 and gets diluted 1:1 before drinking',
          'One US fluid ounce of water weighs about 29.6 g, so an 8 oz cup is 237 g of water',
        ],
        warn: [
          DISCLAIMER_COOKING,
          'Tablespoons are a fallback, not a measurement: a level tablespoon of medium grind is about 5.3 g, but a coarse grind in the same spoon can be 20% lighter',
          'Grind size changes extraction more than dose does — a bitter cup is usually ground too fine, not dosed too high',
          'Brew water should be 195–205 °F (91–96 °C); boiling water scorches the grounds',
        ],
        plazo: 'ground coffee loses most of its aromatics within 30 minutes — grind right before you brew.',
      },
      {
        id: 'beer',
        label: 'Bottling homebrew — priming sugar and color',
        hint: 'Residual CO₂ + Morey SRM equation',
        answer: 'You only prime the difference: fermentation already left CO₂ dissolved in the beer.',
        yes: [
          'Residual CO₂ depends on the highest temperature the beer reached at the end of fermentation',
          'Priming sugar in grams = (target volumes − residual volumes) × liters × a factor per sugar type',
          'Corn sugar (dextrose) uses 3.86, table sugar 3.51, dry malt extract 4.5, honey 4.26',
          'Most ales land at 2.0–2.6 volumes; wheat beers go to 3.0–3.5',
          'Beer color follows Morey: SRM = 1.4922 × MCU^0.6859, with MCU in pounds of malt × °Lovibond per US gallon',
        ],
        warn: [
          DISCLAIMER_COOKING,
          'Above 3.5 volumes of CO₂ standard bottles can and do explode — use thick-walled Belgian bottles and store them in a closed box',
          'Use the WARMEST temperature the beer hit near the end of fermentation, not the current fridge temperature: cold beer holds more residual CO₂ and priming for the fridge number over-carbonates the batch',
          'Bottle conditioning needs 2–3 weeks at room temperature before the carbonation is where the math says it is',
        ],
        plazo: 'if a bottle gushes when opened, chill the rest immediately and open them over a sink.',
      },
      {
        id: 'barrel',
        label: 'Aging spirits in a barrel',
        hint: 'Small casks age faster — cube-root scaling',
        answer: 'A 5-liter cask hits in months what a 200-liter cask needs years to do.',
        yes: [
          'What matters is wood surface per liter, which scales with the cube root of the volume ratio',
          'A light whiskey character is about 24 months in a 200 L barrel, medium 48, bold 96',
          'Rum runs faster: 18, 36 and 72 months for the same three levels',
          'The practical window is ±20% around the estimate — taste, do not trust the date',
          'Micro-barrels lose 10–15% to evaporation over six months',
        ],
        warn: [
          DISCLAIMER_COOKING,
          'Small barrels over-oak quickly: a week too long in a 2 L cask tastes like a plank, and there is no undoing it',
          'New barrels need a 48-hour water soak to swell the staves before any spirit goes in',
          'Distilling spirits at home is illegal in the United States without a federal permit — this covers aging spirits you legally bought, not making them',
        ],
        plazo: 'in a cask under 5 L, taste every one to two weeks; over 20 L, every one to two months.',
      },
      {
        id: 'infusion',
        label: 'Infusing vodka or a neutral spirit',
        hint: 'Days by ingredient, not by recipe',
        answer: 'Days, not weeks — chili and soft fruit are done in two to four days.',
        yes: [
          'Citrus zest: 3–5 days, using the zest of one fruit per 100 mL',
          'Soft fruit and chili: 2–4 days, tasting daily',
          'Hard fruit and coffee beans: 5–10 days',
          'Vanilla and whole spices: 1–4 weeks, the slowest of the set',
          'Dark glass jar at room temperature, shaken daily for the first two or three days',
        ],
        warn: [
          DISCLAIMER_COOKING,
          'Herbs, tea and chili cross from pleasant to acrid within a day — taste every 24 hours from the start',
          'Only the colored zest goes in: the white pith underneath is purely bitter',
          'Strain, then bottle in dark glass and keep it cool; fresh fruit solids left in the bottle will eventually spoil the batch',
          'This is about flavor, not strength: infusing does not lower the alcohol content. Drink responsibly and never serve to anyone under 21.',
        ],
        plazo: 'once strained and bottled in dark glass, a fruit infusion keeps a few months refrigerated.',
      },
    ],
  },

  inputsTitle: 'Your batch',
  inputsIntro:
    'Each case reads the fields it needs and ignores the rest. Gallons are US liquid gallons of 3.785 L — an imperial gallon is 4.546 L and would throw the priming sugar off by 20%.',
  fields: [
    {
      id: 'method',
      label: 'Brew method',
      type: 'select',
      value: 'drip',
      options: [
        { value: 'drip', label: 'Drip / pour-over — 1:16' },
        { value: 'french_press', label: 'French press — 1:15' },
        { value: 'aeropress', label: 'AeroPress — 1:14' },
        { value: 'espresso', label: 'Espresso — 1:2' },
        { value: 'cold_brew', label: 'Cold brew concentrate — 1:8' },
      ],
      help: 'Sets the coffee-to-water ratio and the grind size.',
    },
    {
      id: 'cups',
      label: 'Cups or shots to make',
      type: 'number',
      value: 2,
      min: 1,
      max: 200,
      step: 1,
      help: 'How many servings you are brewing at once.',
    },
    {
      id: 'cupOz',
      label: 'Size of one cup (US fl oz)',
      type: 'number',
      value: 8,
      min: 1,
      max: 64,
      step: 1,
      help: 'A US mug is 8 fl oz; an auto-drip machine "cup" is only 6. Espresso is about 1 fl oz per shot.',
    },
    {
      id: 'batchGal',
      label: 'Beer batch or barrel size (US gallons)',
      type: 'number',
      value: 5,
      min: 0.1,
      max: 100,
      step: 0.1,
      help: 'US liquid gallons of 3.785 L. A standard homebrew batch is 5 gal; a small cask is 1.3 gal (5 L).',
    },
    {
      id: 'targetCo2',
      label: 'Target carbonation (volumes of CO₂)',
      type: 'number',
      value: 2.4,
      min: 0.5,
      max: 5,
      step: 0.1,
      help: 'English ales 1.5–2.0 · American ales 2.2–2.7 · wheat beers 3.0–3.5.',
    },
    {
      id: 'bottlingTempF',
      label: 'Warmest temperature at the end of fermentation (°F)',
      type: 'number',
      value: 68,
      min: 32,
      max: 100,
      step: 1,
      help: 'NOT the current fridge temperature. This is what sets the CO₂ already dissolved in the beer.',
    },
    {
      id: 'grainLb',
      label: 'Total malt in the grain bill (lb)',
      type: 'number',
      value: 10,
      min: 0,
      max: 200,
      step: 0.5,
      help: 'Used for the color estimate only.',
    },
    {
      id: 'grainColorL',
      label: 'Weighted average malt color (°Lovibond)',
      type: 'number',
      value: 6,
      min: 1,
      max: 600,
      step: 1,
      help: 'Pale malt is 2 °L, Munich 10, crystal 60, roasted barley 500. Average it by weight across the bill.',
    },
    {
      id: 'strength',
      label: 'How much oak character do you want?',
      type: 'select',
      value: 'medium',
      options: [
        { value: 'light', label: 'Light — still spirit-forward' },
        { value: 'medium', label: 'Medium — balanced, the usual target' },
        { value: 'bold', label: 'Bold — heavily oaked' },
      ],
      help: 'Sets the barrel aging target. Medium is the equivalent of a 4-year 200 L cask.',
    },
    {
      id: 'infusionMl',
      label: 'Spirit to infuse (mL)',
      type: 'number',
      value: 750,
      min: 50,
      max: 20000,
      step: 50,
      help: 'A standard bottle is 750 mL, which is 25.4 US fl oz.',
    },
    {
      id: 'ingredient',
      label: 'What are you infusing it with?',
      type: 'select',
      value: 'citrus',
      options: [
        { value: 'citrus', label: 'Citrus zest' },
        { value: 'soft_fruit', label: 'Soft fruit — berries, peach' },
        { value: 'hard_fruit', label: 'Hard fruit — apple, pear' },
        { value: 'vanilla', label: 'Vanilla beans' },
        { value: 'coffee', label: 'Roasted coffee beans' },
        { value: 'spices', label: 'Whole spices' },
        { value: 'herbs', label: 'Fresh herbs' },
        { value: 'chili', label: 'Chili peppers' },
        { value: 'tea', label: 'Tea' },
        { value: 'ginger', label: 'Fresh ginger' },
      ],
      help: 'Sets both the resting time and the dose per millilitre.',
    },
  ],
  fineprint: DISCLAIMER_COOKING,

  chart: {
    type: 'scale',
    title: 'How strong this lands',
    caption:
      'Where your settings fall on the intensity scale for the case you picked — extraction strength for coffee, volumes of CO₂ for beer, oak character for a barrel, and how fast the infusion runs away from you. The marker is you; the bands are the working ranges.',
    bands: [
      { label: 'Delicate', from: 0, to: 25, tone: 'neutral' },
      { label: 'Balanced', from: 25, to: 55, tone: 'good' },
      { label: 'Bold', from: 55, to: 80, tone: 'warn' },
      { label: 'Intense', from: 80, to: 100, tone: 'bad' },
    ],
  },
  breakdownTitle: 'Doses, times and what each number came from',
  breakdownIntro:
    'Grams first, because that is what a scale reads, then the ounce equivalent and the timeline. Every line names the ratio or equation it came from.',

  faq: [
    {
      q: 'What is the correct coffee-to-water ratio?',
      a: 'By mass, 1:16 is the SCA Gold Cup center point for drip and pour-over — 1 gram of coffee for every 16 grams of water. French press goes a little richer at 1:15 and AeroPress at 1:14 because of the shorter contact time. Espresso is a different animal entirely at 1:2, meaning an 18 g dose yields 36 g of liquid in the cup. Cold brew is brewed as a 1:8 concentrate and then diluted roughly 1:1 before drinking. For an 8 fl oz mug, which is 237 g of water, drip works out to about 14.8 g of coffee.',
    },
    {
      q: 'How many tablespoons of coffee per cup?',
      a: 'About 2.8 level tablespoons for an 8 fl oz drip cup, but this is the least reliable number in coffee. A level tablespoon of medium-ground coffee weighs roughly 5.3 g, and that figure swings by 20% or more with grind size, roast level and how you scoop. Every serious guide says the same thing: a $15 kitchen scale eliminates the single largest source of inconsistency in home brewing. Use tablespoons only when you have no other option.',
    },
    {
      q: 'How much priming sugar do I need for bottling?',
      a: 'Grams of corn sugar = (target volumes of CO₂ − residual volumes) × liters of beer × 3.86. The residual figure is the CO₂ already dissolved in the beer from fermentation, and it depends on the warmest temperature the beer reached at the end: residual = 3.0378 − 0.050062·T + 0.00026555·T² with T in °C. For a 5 gallon (18.9 L) batch at 68 °F (20 °C), residual is about 0.85 volumes, so priming to 2.4 volumes needs (2.4 − 0.85) × 18.9 × 3.86 ≈ 113 g of corn sugar.',
    },
    {
      q: 'Why does the bottling temperature matter so much?',
      a: 'Because cold beer holds more dissolved CO₂. Going from 68 °F to 40 °F roughly doubles the residual, from about 0.85 to about 1.7 volumes. If you prime using the fridge temperature when the beer actually finished fermenting warm, you subtract a residual that is not there and end up under-carbonated. Do it the other way around and you over-carbonate — which is the dangerous direction. The rule is always to use the warmest temperature the beer reached at the end of fermentation.',
    },
    {
      q: 'Can I use table sugar instead of corn sugar for priming?',
      a: 'Yes, and you need slightly less of it: the factor is 3.51 for table sugar (sucrose) against 3.86 for corn sugar (dextrose), because sucrose carries less water and yields more CO₂ per gram. Dry malt extract is the opposite at 4.5, and honey sits at 4.26 and brings its own flavor. The old "3/4 cup of corn sugar per 5 gallons" rule of thumb is a volume measurement that ignores your beer temperature entirely — it lands near 2.5 volumes only by coincidence.',
    },
    {
      q: 'How do I calculate the color of my beer?',
      a: 'First compute Malt Color Units: MCU = (pounds of each malt × its °Lovibond, summed) ÷ US gallons of finished beer. Then apply the Morey equation, SRM = 1.4922 × MCU^0.6859, which corrects for the fact that color stops increasing linearly as malts get darker. Ten pounds of 6 °L malt in 5 gallons gives MCU 12 and SRM about 8.2 — a dark golden, pale-ale color. Multiply SRM by 1.97 for the European EBC scale.',
    },
    {
      q: 'Why does a small barrel age spirits faster?',
      a: 'Because what extracts flavor is wood surface in contact with liquid, and surface area does not shrink as fast as volume does. Halve a barrel’s volume and you keep considerably more than half its interior surface per liter. The practical model scales aging time by the cube root of the volume ratio against a standard 200 L cask: a 5 L barrel ages roughly 3.4 times faster, so a character that takes four years in a full cask arrives in about fourteen months. Small barrels also lose 10–15% of their contents to evaporation over six months.',
    },
    {
      q: 'How long should I age whiskey in a small barrel?',
      a: 'For a 5 L cask, roughly 14 months for a medium character, 7 months for a light one, and 28 months for a heavily oaked result — with a working window of plus or minus 20% around each. But taste is the only real gauge. Small barrels over-oak fast and the direction is one-way: once a spirit tastes like a plank, no amount of resting brings it back. Sample every one to two weeks in anything under 5 L, and bottle the moment it tastes right rather than when the calendar says so.',
    },
    {
      q: 'How long does it take to infuse vodka with fruit?',
      a: 'Faster than most recipes claim. Soft fruit like berries and peaches is done in 2–4 days, citrus zest in 3–5, hard fruit like apple and pear in 7–10. Chili is 2–4 days but should be tasted daily because the heat builds far quicker than expected, and tea is 1–3 days before it turns tannic. Vanilla and whole spices are the slow ones at 1–4 weeks. Keep it in a dark glass jar at room temperature and shake it daily for the first two or three days.',
    },
    {
      q: 'How much fruit do I need per bottle of vodka?',
      a: 'About half a gram of fruit per millilitre for both soft and hard fruit, so a 750 mL bottle takes roughly 375 g — around three cups of chopped fruit. Citrus is measured differently: the zest of one fruit per 100 mL, so seven or eight lemons for a bottle, and only the colored outer layer. Vanilla is one split bean per 200 mL, coffee beans go in at 0.15 g per mL, herbs at 0.05 g per mL, and chili at one pepper per 250 mL.',
    },
    {
      q: 'Does infusing lower the alcohol content?',
      a: 'Barely, and not in a way you should count on. Adding fruit introduces a small amount of water, which dilutes the spirit by a couple of percentage points at most, and a sweetened infusion can taste far softer than it is. That last part is the risk: an infusion that goes down like juice is still roughly 35–40% alcohol by volume. Measure it as you would the original spirit, never serve it to anyone under 21, and do not drive after it.',
    },
    {
      q: 'Is a US gallon the same as an imperial gallon?',
      a: 'No, and this one wrecks homebrew calculations regularly. A US liquid gallon is 3.785 liters; an imperial (UK) gallon is 4.546 liters, about 20% larger. A "5 gallon" batch is therefore 18.9 L in the US and 22.7 L in Britain, which changes the priming sugar by the same 20%. The same trap exists at the small end: a US fluid ounce is 29.57 mL while an imperial one is 28.41 mL. Every number on this page uses US units.',
    },
  ],

  sources: [
    {
      name: 'SCA — Protocols and best practices, brewing control chart and Gold Cup ratio',
      url: 'https://sca.coffee/research/protocols-best-practices',
      publisher: 'Specialty Coffee Association',
    },
    {
      name: 'Morey, D. (1993) — Approximating SRM beer color',
      url: 'https://www.homebrewersassociation.org/how-to-brew/malt-color-units-and-beer-color/',
      publisher: 'American Homebrewers Association',
    },
    {
      name: 'How to Brew (Palmer) — bottle conditioning, residual CO₂ and priming sugar',
      url: 'https://howtobrew.com/book/section-1/bottling',
      publisher: 'John Palmer',
    },
    {
      name: 'TTB — Home distilling is not permitted without federal qualification',
      url: 'https://www.ttb.gov/spirits/home-distilling',
      publisher: 'US Alcohol and Tobacco Tax and Trade Bureau',
    },
    {
      name: 'NIST SP 811 — exact US liquid gallon, fluid ounce and avoirdupois ounce definitions',
      url: 'https://www.nist.gov/pml/special-publication-811',
      publisher: 'National Institute of Standards and Technology',
    },
    {
      name: 'CDC — Dietary guidelines on alcohol and standard drink definitions',
      url: 'https://www.cdc.gov/alcohol/facts-stats/index.html',
      publisher: 'Centers for Disease Control and Prevention',
    },
  ],

  replaces: [
    '/en/coffee-water-ratio-brewing-calculator',
    '/en/ground-coffee-per-cup-brewing-method',
    '/en/priming-sugar-carbonation',
    '/en/srm-color-cerveza-morey',
    '/en/barrel-aging-whiskey-calculator',
    '/en/vodka-fruit-infusion-time',
  ],

lastReviewed: '2026-07-28',
};
