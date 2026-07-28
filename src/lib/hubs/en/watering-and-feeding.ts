import type { HubData } from '../types';

/**
 * Hub EN — "How much water, fertilizer and amendment does this garden need?"
 *
 * Absorbe 5 calculadoras sueltas de riego, fertilización, pH, mulch e hidroponía.
 *
 * Unidades de EE.UU.: galones, pies cuadrados, libras, pulgadas, °F. Las constantes
 * son espejo de las fórmulas vivas, convertidas con los factores exactos de NIST.
 */

/** 1 gal US = 3,785411784 L · 1 ft² = 0,09290304 m² · 1 lb = 0,45359237 kg (exactos). */
export const L_PER_GAL = 3.785411784;
export const M2_PER_FT2 = 0.09290304;
export const KG_PER_LB = 0.45359237;

/**
 * Agua diaria por planta, litros. Espejo de agua-riego-plantas-dia.ts.
 * 🐛 Esa fórmula usa claves en ESPAÑOL ('tomate', 'lechuga', 'arbol'…) y las interpola
 * crudas en el texto, así que el usuario inglés leía "tomate". Acá van traducidas.
 */
export const WATER_L_PER_DAY: Record<string, number> = {
  tomato: 2, lettuce: 0.5, herb: 0.2, cactus: 0.05, tree: 15,
};

/** Multiplicador por etapa del cultivo. Mismo origen. */
export const STAGE_MULT: Record<string, number> = { germination: 0.3, growth: 0.7, fruiting: 1.2 };

/**
 * Dosis de NPK en g/m² según formulación. Espejo de fertilizante-npk-dosis.ts.
 * Se convierten a lb/1.000 ft² en el cálculo, que es como se venden en EE.UU.
 */
export const NPK_G_PER_M2: Record<string, number> = {
  '10-10-10': 30, '12-12-12': 30, '15-15-15': 25, '20-5-5': 20,
  '15-5-20': 25, '5-10-15': 25, '5-20-20': 20, '8-24-24': 20, '13-40-13': 15,
};

/**
 * Corrección de pH: g/m² por cada punto de pH. Espejo de ph-suelo-correccion.ts
 * (cal 200 g/m² por punto, azufre 60 g/m² por punto) con el buffer por textura de suelo.
 */
export const PH_LIME_G_PER_M2_PER_POINT = 200;
export const PH_SULFUR_G_PER_M2_PER_POINT = 60;
export const SOIL_BUFFER: Record<string, number> = { sandy: 0.7, loam: 1.0, clay: 1.4 };

/** Densidad de mulch de paja usada por la fórmula viva: 100 kg/m³. */
export const MULCH_KG_PER_M3 = 100;

/** Factor de conversión EC→ppm de la escala que elijas (hidroponía). */
export const EC_SCALES = { s500: 500, s640: 640, s700: 700 };

const DISCLAIMER =
  'Informational estimate. Soil, climate, container type and cultivar all move these numbers. A soil test is the only way to know your actual pH and nutrient status — amend on the basis of a test, not a guess.';

export const hub: HubData = {
  slug: 'en/garden/watering-and-feeding',
  title: 'Garden Watering, Fertilizer, Soil pH and Mulch Calculator',
  description:
    'Work out daily watering per plant, how much NPK fertilizer a bed needs, how much lime or sulfur to shift soil pH, how much mulch to buy, and what an EC reading means in ppm.',
  silo: 'Garden',
  siloHref: '/en/garden',
  locale: 'en',

  eyebrow: 'Feeding the garden',
  h1: 'How much water, fertilizer and amendment does this garden need?',
  lede:
    'Five of the most over-guessed numbers in gardening — daily water per plant, fertilizer per bed, lime or sulfur to move the pH, mulch depth and volume, and the EC-to-ppm conversion for hydroponics — worked out in gallons, pounds and square feet.',
  stamps: [
    'US units: gallons, sq ft, pounds, inches',
    'pH correction adjusted for soil texture',
    'Fertilizer rates converted to lb per 1,000 sq ft',
    'Replaces 5 single-purpose calculators',
  ],

  resultLabel: 'What you need',

  cases: {
    title: 'What are you working out?',
    intro: 'Pick the task. Each case reads only the fields it needs.',
    items: [
      {
        id: 'water',
        label: 'How much to water',
        hint: 'Daily and weekly water per plant by species and growth stage.',
        yes: [
          'Daily water per plant, scaled to the growth stage',
          'Weekly total for the number of plants you have',
          'The same figure in gallons, which is how hoses and cans are measured',
        ],
        warn: [
          DISCLAIMER,
          'Check the soil before you water: dig a finger down an inch or two and only water if it is dry. Overwatering kills far more container plants than underwatering, because saturated soil suffocates roots.',
          'Water deeply and less often rather than a little every day. Shallow daily watering trains roots to stay at the surface, where they dry out first in a heatwave.',
          'These figures are for open ground in mild conditions. Containers dry out several times faster, and anything in full sun above 90°F may need double.',
        ],
        plazo: 'Water early in the morning — evening watering leaves foliage wet overnight, which is how fungal disease gets started.',
        answer:
          'A tomato in fruit needs roughly 2.4 L (0.6 gal) a day; lettuce about a fifth of that; an established tree far more. Multiply the base rate by 0.3 for seedlings and 1.2 for fruiting plants.',
      },
      {
        id: 'fertilizer',
        label: 'How much fertilizer for this bed',
        hint: 'Pounds of NPK for the area, by formulation.',
        yes: [
          'Application rate for the NPK formulation you have',
          'Total pounds and ounces for your bed area',
          'The rate expressed per 1,000 sq ft, as US bags are labelled',
        ],
        warn: [
          DISCLAIMER,
          'More is not better. Over-fertilizing burns roots, pushes leafy growth at the expense of fruit, and runs off into waterways — nitrogen runoff is a major cause of algal blooms.',
          'High-nitrogen formulations such as 20-5-5 are for lawns and leafy growth. Using them on tomatoes gives you a magnificent plant with very little fruit.',
          'Water thoroughly after applying granular fertilizer so it dissolves into the root zone rather than sitting on the surface or burning foliage.',
        ],
        plazo: 'Split the season’s total into two or three applications rather than one — plants use it as they grow, and a single heavy dose mostly leaches away.',
        answer:
          'A balanced 10-10-10 goes down at about 30 g/m², roughly 6 lb per 1,000 sq ft. Concentrated formulations go down at proportionally lower rates.',
      },
      {
        id: 'ph',
        label: 'Correcting soil pH',
        hint: 'Lime to raise it or sulfur to lower it, adjusted for soil texture.',
        yes: [
          'Whether you need lime or elemental sulfur',
          'Pounds required for the area and the pH shift you want',
          'A texture adjustment: clay resists change far more than sand',
        ],
        warn: [
          DISCLAIMER,
          'Do not amend pH without a soil test. Guessing produces the wrong product in the wrong quantity, and over-liming is considerably harder to undo than under-liming.',
          'Both amendments are slow. Lime takes 2–3 months to act; elemental sulfur depends on soil bacteria and can take 1–3 months in warm soil and much longer in cold. Apply well before planting, not at planting.',
          'Clay soils need roughly twice the amendment of sandy soils for the same pH shift, because their cation exchange capacity buffers the change. That is what the soil-type field adjusts for.',
        ],
        plazo: 'Retest 3–6 months after amending, before adding any more. pH moves slowly and it is easy to overshoot by re-applying too early.',
        answer:
          'Roughly 200 g/m² of agricultural lime per pH point in loam to raise pH, or 60 g/m² of elemental sulfur per point to lower it — multiplied by 0.7 for sand and 1.4 for clay.',
      },
      {
        id: 'mulch',
        label: 'How much mulch to buy',
        hint: 'Cubic feet, cubic yards and bags for the area and depth.',
        yes: [
          'Volume in cubic feet and cubic yards, which is how mulch is sold',
          'Number of standard 2 cu ft bags',
          'Approximate weight, for working out whether it fits in the car',
        ],
        warn: [
          DISCLAIMER,
          'Under 2 inches does very little: it neither suppresses weeds nor holds moisture, and it dries out and blows away. Aim for 2–4 inches on beds.',
          'Never pile mulch against a trunk or stem. The classic "mulch volcano" around a tree traps moisture against the bark, invites rot and rodents, and encourages roots to grow into the mulch instead of the soil.',
          'Fresh wood chips can temporarily tie up nitrogen where they meet the soil. Keep them as a surface layer rather than digging them in.',
        ],
        plazo: 'Top up an inch or so each season as the bottom layer breaks down — that decomposition is a feature, it is feeding the soil.',
        answer:
          'Volume = area × depth. 200 sq ft at 3 inches is 50 cubic feet — 25 standard bags, or just under 2 cubic yards.',
      },
      {
        id: 'hydro',
        label: 'EC to ppm for a nutrient solution',
        hint: 'Convert an EC reading to ppm and see which growth stage it suits.',
        yes: [
          'ppm on the 500, 640 and 700 conversion scales',
          'Which growth stage the concentration matches',
          'A warning band when the solution is strong enough to burn roots',
        ],
        warn: [
          DISCLAIMER,
          'There is no single ppm. The conversion factor depends on which scale your meter uses — 500 (Hanna), 640 (Eutech) or 700 (Truncheon) — so a "1,000 ppm" recipe is meaningless without the scale, and mixing recipes written for different meters is a common way to burn a crop.',
          'EC measures total dissolved salts, not what is in them. A solution can read perfectly while being badly out of balance on an individual nutrient.',
          'Rising EC in the reservoir usually means the plants are drinking water faster than nutrients — top up with plain water, not more concentrate.',
        ],
        plazo: 'Check EC and pH daily in an active system; both drift quickly as plants take up water and ions at different rates.',
        answer:
          'ppm = EC (mS/cm) × the scale factor. EC 1.4 is 700 ppm on the 500 scale — mid-vegetative for most crops. Under 400 ppm is seedling territory; over 2,400 ppm risks root burn.',
      },
    ],
  },

  inputsTitle: 'Your garden',
  inputsIntro: 'Fill in what the case you picked needs — everything else is ignored.',
  fields: [
    {
      id: 'species',
      label: 'Plant',
      type: 'select',
      value: 'tomato',
      options: [
        { value: 'tomato', label: 'Tomato' },
        { value: 'lettuce', label: 'Lettuce' },
        { value: 'herb', label: 'Herbs' },
        { value: 'cactus', label: 'Cactus or succulent' },
        { value: 'tree', label: 'Established tree' },
      ],
    },
    {
      id: 'stage',
      label: 'Growth stage',
      type: 'select',
      value: 'growth',
      options: [
        { value: 'germination', label: 'Germination / seedling' },
        { value: 'growth', label: 'Vegetative growth' },
        { value: 'fruiting', label: 'Flowering / fruiting' },
      ],
    },
    { id: 'plants', label: 'Number of plants', type: 'number', value: 12, min: 1, step: 1, thousands: true },
    { id: 'area', label: 'Bed area', type: 'number', value: 200, suffix: 'sq ft', min: 0, step: 10, thousands: true },
    {
      id: 'npk',
      label: 'NPK formulation',
      type: 'select',
      value: '10-10-10',
      options: [
        { value: '10-10-10', label: '10-10-10 — balanced, general purpose' },
        { value: '12-12-12', label: '12-12-12 — balanced, concentrated' },
        { value: '15-15-15', label: '15-15-15 — high concentration balanced' },
        { value: '20-5-5', label: '20-5-5 — high nitrogen, lawns' },
        { value: '15-5-20', label: '15-5-20 — high potassium, fruit' },
        { value: '5-10-15', label: '5-10-15 — flowering and roots' },
        { value: '5-20-20', label: '5-20-20 — flowering and fruit' },
        { value: '8-24-24', label: '8-24-24 — concentrated bloom' },
        { value: '13-40-13', label: '13-40-13 — soluble starter, high P' },
      ],
    },
    { id: 'phnow', label: 'Current soil pH', type: 'number', value: 5.5, min: 3, max: 10, step: 0.1, help: 'From a soil test, not a guess.' },
    { id: 'phtarget', label: 'Target pH', type: 'number', value: 6.5, min: 3, max: 10, step: 0.1 },
    {
      id: 'soil',
      label: 'Soil texture',
      type: 'select',
      value: 'loam',
      options: [
        { value: 'sandy', label: 'Sandy — changes pH easily' },
        { value: 'loam', label: 'Loam' },
        { value: 'clay', label: 'Clay — resists pH change' },
      ],
    },
    { id: 'depth', label: 'Mulch depth', type: 'number', value: 3, suffix: 'inches', min: 0.5, max: 12, step: 0.5 },
    { id: 'ec', label: 'EC reading', type: 'number', value: 1.4, suffix: 'mS/cm', min: 0, max: 6, step: 0.1 },
    {
      id: 'scale',
      label: 'Your meter’s conversion scale',
      type: 'select',
      value: 's500',
      options: [
        { value: 's500', label: '500 (Hanna, most US meters)' },
        { value: 's640', label: '640 (Eutech)' },
        { value: 's700', label: '700 (Truncheon)' },
      ],
    },
  ],
  fineprint: DISCLAIMER,

  chart: {
    type: 'donut',
    title: 'How it breaks down',
    caption:
      'The composition behind the number — what each plant takes, how the amendment divides over the bed, or where the solution sits against the usable range.',
  },

  breakdownTitle: 'Line by line',
  breakdownIntro: 'Metric source rates are converted with the exact NIST factors, and both units are shown.',

  faq: [
    {
      q: 'How much water does a tomato plant need per day?',
      a: 'Roughly 2 litres — a bit over half a US gallon — during vegetative growth, rising to about 2.4 litres once it is setting fruit and dropping to well under a litre as a seedling. In a container, in full sun and above 90°F, expect to double that, and check the soil rather than trusting any schedule.',
    },
    {
      q: 'Is it better to water a little every day or a lot less often?',
      a: 'Deeply and less often, almost always. Shallow daily watering keeps roots near the surface where they are the first thing to dry out in a heatwave. A deep soak two or three times a week drives roots down and makes the plant far more resilient.',
    },
    {
      q: 'When is the best time of day to water?',
      a: 'Early morning. Evaporation losses are low, the plant is hydrated before the heat of the day, and the foliage dries in the sun. Evening watering leaves leaves wet overnight, which is exactly the condition powdery mildew and blight need.',
    },
    {
      q: 'What do the three numbers on fertilizer mean?',
      a: 'Percentage by weight of nitrogen, phosphorus (as P₂O₅) and potassium (as K₂O). A 10-10-10 bag is 10% of each; a 20-5-5 is nitrogen-heavy and intended for lawns and leafy growth. Using a high-nitrogen product on fruiting vegetables gives you an enormous plant with disappointing fruit.',
    },
    {
      q: 'How much 10-10-10 does a garden bed need?',
      a: 'About 30 grams per square metre, which is roughly 6 pounds per 1,000 square feet, split across two or three applications through the season. More concentrated formulations go down at lower rates — the whole point of the higher analysis is that you apply less of it.',
    },
    {
      q: 'How do I raise my soil pH?',
      a: 'Agricultural lime, at roughly 200 grams per square metre for each pH point you want to gain in loam. Multiply by about 0.7 for sandy soil and 1.4 for clay. Work it into the top 6–8 inches, water it in, and allow 2–3 months before you expect the full effect.',
    },
    {
      q: 'How do I lower my soil pH?',
      a: 'Elemental sulfur, around 60 grams per square metre per pH point in loam, with the same texture adjustment. It works only when soil bacteria convert it, so it needs warm, moist soil and time — applying it in cold soil and expecting a result in weeks does not work. Aluminium sulfate acts faster but risks aluminium toxicity and is best avoided in vegetable beds.',
    },
    {
      q: 'How deep should mulch be?',
      a: 'Two to four inches on beds. Below two, it does not suppress weeds or hold moisture and simply blows away; above four, it can keep water from reaching the soil at all and stay waterlogged underneath. Keep it pulled back a few inches from trunks and stems.',
    },
    {
      q: 'How much mulch do I need for my beds?',
      a: 'Multiply the area by the depth in the same units. 200 square feet at 3 inches deep is 50 cubic feet — that is 25 standard 2-cubic-foot bags, or just under 2 cubic yards if you are buying bulk, which is considerably cheaper past about 10 bags.',
    },
    {
      q: 'Why do EC meters disagree on ppm?',
      a: 'Because ppm is a derived figure, not a measurement. The meter measures electrical conductivity and multiplies by a scale factor — 500, 640 or 700 depending on the manufacturer’s convention. The same solution reads 700, 896 or 980 ppm on those three scales. Always note which scale a recipe was written for.',
    },
    {
      q: 'What EC should my nutrient solution be?',
      a: 'Broadly: 0.4–0.8 mS/cm for seedlings and cuttings, 1.2–1.8 for vegetative growth and 1.8–2.4 for flowering or heavy feeders. Above about 2.4 mS/cm you are into root-burn territory for most crops. Species vary enormously, so treat these as starting points and watch the plants.',
    },
  ],

  sources: [
    { name: 'Soil Testing and pH management', url: 'https://www.usda.gov/topics/organic/soil-health', publisher: 'USDA' },
    { name: 'Fertilizer application rates and nutrient management', url: 'https://www.epa.gov/nutrient-policy-data', publisher: 'US EPA' },
    { name: 'Mulching landscape beds and trees', url: 'https://www.fs.usda.gov/managing-land/urban-forests', publisher: 'USDA Forest Service' },
    { name: 'Irrigation scheduling and water use in gardens', url: 'https://www.nrcs.usda.gov/conservation-basics/natural-resource-concerns/water/irrigation', publisher: 'USDA NRCS' },
    { name: 'NIST Special Publication 811 — exact conversion factors', url: 'https://www.nist.gov/pml/special-publication-811', publisher: 'NIST' },
  ],

  replaces: [
    '/en/agua-riego-plantas-dia',
    '/en/fertilizante-npk-dosis',
    '/en/ph-soil-correction-lime-sulfur',
    '/en/mulching-espesor-cantidad',
    '/en/hydroponic-nutrients-ec-ppm',
  ],

  lastReviewed: '2026-07-28',
};
