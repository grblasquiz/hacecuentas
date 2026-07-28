import type { HubData } from '../types';

/**
 * Hub EN — "How many plants fit, how far apart, and how long until they sprout?"
 *
 * Absorbe 5 calculadoras sueltas de siembra, espaciado, germinación y macetas.
 *
 * 🐛 Bugs heredados de las fórmulas originales, corregidos acá: las claves de especie
 * eran literales en ESPAÑOL ('tomate', 'lechuga', 'zanahoria'…) y se interpolaban crudas
 * en el texto inglés, y el insight de `distancia-entre-plantas-huerto.ts` está escrito
 * SÓLO en español. Acá está todo traducido.
 */

/** Exactos por definición (NIST SP 811). */
export const CM_PER_IN = 2.54;
export const M2_PER_FT2 = 0.09290304;
export const L_PER_GAL = 3.785411784;

/** Separación recomendada entre plantas, en cm. Espejo de distancia-entre-plantas-huerto.ts. */
export const SPACING_CM: Record<string, { min: number; max: number; label: string }> = {
  tomato: { min: 60, max: 80, label: 'Tomato' },
  lettuce: { min: 25, max: 30, label: 'Lettuce' },
  carrot: { min: 5, max: 10, label: 'Carrot' },
  potato: { min: 30, max: 40, label: 'Potato' },
  squash: { min: 100, max: 150, label: 'Squash / pumpkin' },
};

/** Densidad de siembra, semillas por m². Espejo de semillas-por-m2-huerta.ts. */
export const SEEDS_PER_M2: Record<string, number> = {
  lettuce: 60, tomato: 10, carrot: 200, radish: 110, spinach: 100,
};

/**
 * Días de germinación por especie y banda de temperatura del sustrato.
 * Espejo de germinacion-tiempo-temperatura.ts: bandas de 15 °C (59 °F),
 * 20 °C (68 °F) y 25 °C (77 °F).
 */
export const GERMINATION: Record<string, Record<string, string>> = {
  lettuce: { cool: '7–10', mid: '5–7', warm: '3–5' },
  tomato: { cool: '14–21', mid: '7–10', warm: '5–7' },
  carrot: { cool: '14–21', mid: '10–14', warm: '7–10' },
  pepper: { cool: '21–30', mid: '14–21', warm: '10–14' },
  cucumber: { cool: '10–14', mid: '7–10', warm: '4–6' },
};

/** Multiplicador de diámetro de maceta sobre el cepellón. Espejo de macetas-tamano-planta.ts. */
export const POT_MULT: Record<string, number> = { leafy: 1.5, fruiting: 2, cactus: 1.2 };

/** Capa de drenaje: 5–15% del volumen de la maceta. Espejo de drenaje-grava-maceta.ts. */
export const DRAINAGE_SHARE = { min: 0.05, max: 0.15 };

const DISCLAIMER =
  'Informational estimate. Spacing, sowing density and germination times vary by cultivar, soil, sowing depth and season — the seed packet for the variety in your hand beats any generic table, including this one.';

export const hub: HubData = {
  slug: 'en/garden/planting-and-spacing',
  title: 'Plant Spacing, Seeds Per Square Foot, Germination and Pot Size Calculator',
  description:
    'How far apart to space vegetables, how many seeds a bed takes, how many days to germination at your soil temperature, and what size pot and drainage layer a root ball needs.',
  silo: 'Garden',
  siloHref: '/en/garden',
  locale: 'en',

  eyebrow: 'Sowing & spacing',
  h1: 'How many plants fit, how far apart, and how long until they sprout?',
  lede:
    'The decisions you make in the first week set the whole season: how close together the plants go, how many seeds to buy, how long to wait before you assume the tray has failed, and whether that pot is actually big enough. All five, in inches, square feet and Fahrenheit.',
  stamps: [
    'US units: inches, sq ft, gallons, °F',
    'Germination bands at 59 °F, 68 °F and 77 °F soil temperature',
    'Fixes Spanish species labels leaking into the English output',
    'Replaces 5 single-purpose calculators',
  ],

  resultLabel: 'What you need',

  cases: {
    title: 'What are you planning?',
    intro: 'Pick the step you are on. Each case reads only the fields it needs.',
    items: [
      {
        id: 'spacing',
        label: 'How far apart to space these plants',
        hint: 'In-row spacing and how many plants fit in your bed.',
        yes: [
          'Recommended spacing range in inches and centimetres',
          'Plants per linear foot of row at each end of the range',
          'Total plants your bed area supports',
        ],
        warn: [
          DISCLAIMER,
          'Crowding is the most common beginner mistake and it costs yield rather than saving space: plants compete for light, water and nutrients, and the still air between them is what powdery mildew and blight need.',
          'Determinate and indeterminate varieties of the same crop want very different spacing. A bush tomato at 24 inches is fine; a vining one at the same spacing will be a jungle by August.',
          'Row spacing is a separate number from in-row spacing, and it is usually wider — leave room to actually walk and harvest.',
        ],
        plazo: 'Thin seedlings ruthlessly at the true-leaf stage. It feels wasteful and it is the single highest-return five minutes of the season.',
        answer:
          'Tomatoes want 24–32 inches apart, lettuce 10–12, carrots 2–4, potatoes 12–16 and squash 40–60. Divide your row length by the spacing to get the plant count.',
      },
      {
        id: 'seeds',
        label: 'How many seeds to buy',
        hint: 'Seeds for the bed area, plus a margin for germination failure.',
        yes: [
          'Sowing density for the crop, per square foot and per square metre',
          'Total seeds for your bed area',
          'A 10–15% margin for seeds that never come up',
        ],
        warn: [
          DISCLAIMER,
          'Germination rate falls with seed age. Fresh seed of most vegetables germinates at 80–95%; three-year-old onion or parsnip seed can be under 50%, which is why the margin matters more than the base number.',
          'Sowing density is not final plant spacing. You sow thickly and thin down — the seed count is deliberately higher than the plant count you want.',
        ],
        plazo: 'Do a paper-towel germination test on old seed a fortnight before sowing rather than discovering the failure in the bed.',
        answer:
          'Lettuce goes in at about 60 seeds per square metre, carrots at 200, tomatoes at 10. Add 10–15% for failures, and more for seed over two years old.',
      },
      {
        id: 'germination',
        label: 'How long until it germinates',
        hint: 'Days to emergence at your soil temperature.',
        yes: [
          'Days to germination in the cool, mid and warm soil bands',
          'How much warming the soil would speed it up',
          'When to give up and re-sow',
        ],
        warn: [
          DISCLAIMER,
          'Soil temperature is what matters, not air temperature — and soil lags air by days or weeks in spring. A $10 soil thermometer settles more arguments than any calendar.',
          'Peppers are the classic trap: below about 65 °F they can take a month or simply rot in the tray. A heat mat is not a luxury for peppers and eggplant, it is the difference between a crop and no crop.',
          'Do not let the surface dry out during germination. A seed that has imbibed water and then dries is dead, not dormant.',
        ],
        plazo: 'Wait at least twice the upper end of the range before re-sowing — impatience is responsible for a lot of doubled-up trays.',
        answer:
          'At 68 °F, lettuce takes 5–7 days, tomatoes 7–10, carrots 10–14 and peppers 14–21. Warming the soil to 77 °F roughly halves each of those.',
      },
      {
        id: 'pot',
        label: 'What size pot this plant needs',
        hint: 'Pot diameter and volume from the root-ball size.',
        yes: [
          'Recommended pot diameter for the root ball',
          'Approximate soil volume in gallons and litres',
          'How much growing room that leaves around the root ball',
        ],
        warn: [
          DISCLAIMER,
          'Over-potting is a real problem, not a kindness: soil with no roots in it stays wet, and permanently wet soil is how root rot starts. Step up one or two sizes at a time rather than going straight to the biggest pot.',
          'A fruiting plant needs roughly twice the root-ball diameter; a cactus or succulent barely more than the root ball at all. Using the same rule for both is how succulents die.',
          'Nursery pot sizes are nominal and inconsistent — a "1 gallon" nursery pot typically holds around 0.7 US gallons of soil.',
        ],
        plazo: 'Repot when roots circle the drainage holes or water runs straight through, usually every one to two years for an actively growing plant.',
        answer:
          'Take the root-ball diameter and multiply by 1.5 for leafy plants, 2 for fruiting ones and 1.2 for cacti. A 4-inch root ball on a tomato wants an 8-inch pot, roughly 2 gallons of soil.',
      },
      {
        id: 'drainage',
        label: 'How much gravel for drainage',
        hint: 'Volume of the drainage layer for a pot of a given size.',
        yes: [
          'Gravel volume at 5–15% of the pot',
          'The equivalent depth in the bottom of the pot',
          'When a drainage layer is the wrong answer entirely',
        ],
        warn: [
          DISCLAIMER,
          'A gravel layer does not do what most people think. Because of the perched water table effect, a coarse layer under fine potting mix actually raises the saturated zone in the soil above it — it can make drainage worse, not better.',
          'What genuinely helps is a pot with real drainage holes and a mix that is open enough. If the pot has no hole, no amount of gravel will save the plant.',
          'Where a bottom layer does help is stopping mix washing out of very large holes, and adding ballast to a top-heavy pot — both practical, neither of them drainage.',
        ],
        plazo: 'If a plant is sulking in a decorative pot with no hole, take it out and use the decorative pot as a cachepot with a plastic liner inside.',
        answer:
          'Five to fifteen percent of the pot volume, which is roughly a half to one and a half inches in the bottom of a 12-inch pot — but a drainage hole and an open mix matter far more.',
      },
    ],
  },

  inputsTitle: 'Your bed and your plants',
  inputsIntro: 'Fill in what the case you picked needs — everything else is ignored.',
  fields: [
    {
      id: 'crop',
      label: 'Crop',
      type: 'select',
      value: 'tomato',
      options: [
        { value: 'tomato', label: 'Tomato' },
        { value: 'lettuce', label: 'Lettuce' },
        { value: 'carrot', label: 'Carrot' },
        { value: 'potato', label: 'Potato' },
        { value: 'squash', label: 'Squash / pumpkin' },
      ],
    },
    {
      id: 'seedcrop',
      label: 'Crop to sow',
      type: 'select',
      value: 'lettuce',
      options: [
        { value: 'lettuce', label: 'Lettuce' },
        { value: 'tomato', label: 'Tomato' },
        { value: 'carrot', label: 'Carrot' },
        { value: 'radish', label: 'Radish' },
        { value: 'spinach', label: 'Spinach' },
      ],
    },
    {
      id: 'germcrop',
      label: 'Crop to germinate',
      type: 'select',
      value: 'tomato',
      options: [
        { value: 'lettuce', label: 'Lettuce' },
        { value: 'tomato', label: 'Tomato' },
        { value: 'carrot', label: 'Carrot' },
        { value: 'pepper', label: 'Pepper' },
        { value: 'cucumber', label: 'Cucumber' },
      ],
    },
    { id: 'soiltemp', label: 'Soil temperature', type: 'number', value: 68, suffix: '°F', min: 32, max: 110, step: 1, help: 'Soil, not air — they differ by a lot in spring.' },
    { id: 'area', label: 'Bed area', type: 'number', value: 100, suffix: 'sq ft', min: 0, step: 10, thousands: true },
    { id: 'rowlength', label: 'Row length', type: 'number', value: 20, suffix: 'ft', min: 0, step: 1 },
    { id: 'rootball', label: 'Root-ball diameter', type: 'number', value: 4, suffix: 'inches', min: 1, max: 48, step: 0.5 },
    {
      id: 'planttype',
      label: 'Plant type',
      type: 'select',
      value: 'fruiting',
      options: [
        { value: 'leafy', label: 'Leafy plant (×1.5)' },
        { value: 'fruiting', label: 'Fruiting / vegetable (×2)' },
        { value: 'cactus', label: 'Cactus or succulent (×1.2)' },
      ],
    },
    { id: 'potvolume', label: 'Pot volume', type: 'number', value: 5, suffix: 'gallons', min: 0.1, max: 200, step: 0.5 },
  ],
  fineprint: DISCLAIMER,

  chart: {
    type: 'donut',
    title: 'How it divides',
    caption:
      'The split behind the number — plants against the space between them, seeds you sow against the margin for failures, or soil against drainage layer.',
  },

  breakdownTitle: 'Line by line',
  breakdownIntro: 'Metric source values are converted with the exact NIST factors, and both units are shown.',

  faq: [
    {
      q: 'How far apart should I plant tomatoes?',
      a: 'Twenty-four to thirty-two inches in the row for most varieties, with rows three to four feet apart. Determinate bush types can go at the tighter end; indeterminate vining types want the wider one and a sturdy support. Crowding tomatoes is the fastest route to early blight, because the foliage never dries.',
    },
    {
      q: 'Does spacing really change the yield?',
      a: 'Substantially. Up to a point, more plants means more total yield, but past it the plants shade each other, compete for water and nutrients, and each produces far less. Total yield per bed peaks and then declines, and disease pressure rises the whole way. Correct spacing usually beats extra plants.',
    },
    {
      q: 'How many seeds should I buy for my garden?',
      a: 'Take the sowing density for the crop — about 60 seeds per square metre for lettuce, 200 for carrots, 10 for tomatoes — multiply by your area, and add 10 to 15%. If the seed is more than two years old, add considerably more, or test its viability first.',
    },
    {
      q: 'How long do vegetable seeds stay viable?',
      a: 'It varies enormously by species. Onion, parsnip and leek are effectively one-season seeds and drop off sharply after that. Tomato, cucumber and lettuce hold up for four or five years in cool, dry storage. A paper-towel test with ten seeds tells you the real rate in a week.',
    },
    {
      q: 'What soil temperature do seeds need to germinate?',
      a: 'Most vegetables germinate fastest between 68 and 77 °F at the seed, and stall badly below 59 °F. Cool-season crops such as lettuce and spinach are the exception and germinate happily in the fifties, while peppers and eggplant effectively refuse to move below 65 °F.',
    },
    {
      q: 'Why are my peppers taking so long to come up?',
      a: 'Almost always soil temperature. Peppers can take three to four weeks at 59 °F and under a fortnight at 77 °F, and in cold, wet compost they frequently rot before they sprout. A heat mat under the tray is the standard fix and it is the difference between a crop and an empty tray.',
    },
    {
      q: 'Is soil temperature the same as air temperature?',
      a: 'No, and the gap is what catches people out in spring. Soil warms slowly and lags air temperature by days to weeks, more so in heavy clay and in shade. A cheap soil thermometer pushed into the bed to seed depth is the only reliable way to know.',
    },
    {
      q: 'How do I choose the right pot size?',
      a: 'Multiply the root-ball diameter by about 1.5 for a leafy plant, 2 for something that will fruit, and only 1.2 for a cactus or succulent. Step up gradually — jumping straight to a very large pot leaves a mass of wet, rootless soil that stays saturated and rots the roots you have.',
    },
    {
      q: 'Does a "1 gallon" nursery pot hold a gallon of soil?',
      a: 'No. Nursery pot sizes are trade names rather than measurements, and a nominal 1-gallon pot typically holds around 0.7 US gallons. If you are calculating potting mix for a batch of pots, measure one rather than trusting the label.',
    },
    {
      q: 'Should I put gravel in the bottom of a pot for drainage?',
      a: 'Generally no, and this is one of the most persistent pieces of bad gardening advice. A coarse layer beneath fine potting mix creates a perched water table: water will not cross the texture boundary until the mix above is saturated, so the soggy zone ends up higher in the pot, not lower. Drainage holes and an open mix are what actually work.',
    },
    {
      q: 'Then when is a bottom layer useful?',
      a: 'When drainage holes are large enough that mix washes out, or when a tall pot needs ballast so it does not blow over. Both are real reasons — neither of them is drainage. And nothing at all helps a pot with no drainage hole; use it as a cachepot with a liner inside instead.',
    },
  ],

  sources: [
    { name: 'Vegetable planting and spacing guides', url: 'https://www.nrcs.usda.gov/conservation-basics/conservation-by-state', publisher: 'USDA NRCS' },
    { name: 'Soil temperature conditions for vegetable seed germination', url: 'https://ucanr.edu/sites/Vegetables/', publisher: 'University of California Agriculture and Natural Resources' },
    { name: 'Seed viability and storage', url: 'https://www.ars.usda.gov/plains-area/fort-collins-co/center-for-agricultural-resources-research/', publisher: 'USDA Agricultural Research Service' },
    { name: 'Container gardening and potting media', url: 'https://www.usda.gov/topics/urban-agriculture', publisher: 'USDA' },
    { name: 'NIST Special Publication 811 — exact conversion factors', url: 'https://www.nist.gov/pml/special-publication-811', publisher: 'NIST' },
  ],

  replaces: [
    '/en/plant-spacing-vegetable-garden',
    '/en/semillas-por-m2-huerta',
    '/en/seed-germination-days-temperature',
    '/en/pot-size-calculator',
    '/en/pot-drainage-gravel',
  ],

  lastReviewed: '2026-07-28',
};
