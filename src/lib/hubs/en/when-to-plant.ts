import type { HubData } from '../types';

/**
 * Hub EN — "What can I plant this month, and when do I prune?"
 *
 * Absorbe 4 calculadoras sueltas: calendario de siembra norte, calendario sur,
 * zona USDA y poda de rosales.
 *
 * 🐛 Bug heredado, corregido acá: los dos calendarios usaban los meses como claves
 * en ESPAÑOL ('enero', 'febrero'…) y los interpolaban crudos en el texto inglés
 * ("In enero in the northern hemisphere…"), y la poda de rosales usaba
 * 'frio'/'templado'/'calido' como valores de zona. Acá todo va en inglés.
 */

/** Zonas USDA por temperatura mínima anual, en °F. El mapa oficial se define en °F. */
export const USDA_ZONES: Array<{ zone: string; minF: number; maxF: number }> = [
  { zone: '1', minF: -60, maxF: -50 },
  { zone: '2', minF: -50, maxF: -40 },
  { zone: '3', minF: -40, maxF: -30 },
  { zone: '4', minF: -30, maxF: -20 },
  { zone: '5', minF: -20, maxF: -10 },
  { zone: '6', minF: -10, maxF: 0 },
  { zone: '7', minF: 0, maxF: 10 },
  { zone: '8', minF: 10, maxF: 20 },
  { zone: '9', minF: 20, maxF: 30 },
  { zone: '10', minF: 30, maxF: 40 },
  { zone: '11', minF: 40, maxF: 50 },
  { zone: '12', minF: 50, maxF: 60 },
  { zone: '13', minF: 60, maxF: 70 },
];

/** Calendario de siembra, hemisferio norte. Espejo de calendario-siembra-hemisferio-norte.ts. */
export const NORTH: Record<string, string> = {
  '1': 'Bare-root fruit trees, garlic',
  '2': 'Broad beans, peas started indoors',
  '3': 'Lettuce, radish',
  '4': 'Tomato, pepper, corn',
  '5': 'Cucumber, watermelon, squash',
  '6': 'Beans, late corn',
  '7': 'Cauliflower, autumn cabbage',
  '8': 'Swiss chard, autumn lettuce',
  '9': 'Garlic, winter spinach',
  '10': 'Garlic, flowering bulbs',
  '11': 'Bare-root fruit trees',
  '12': 'Rest and planning',
};

/** Calendario de siembra, hemisferio sur. Espejo de calendario-siembra-hemisferio-sur.ts. */
export const SOUTH: Record<string, string> = {
  '1': 'Autumn chard, head lettuce',
  '2': 'Fennel, autumn carrot, arugula',
  '3': 'Swiss chard, spinach, lettuce, radish',
  '4': 'Broad beans, peas, carrot',
  '5': 'Garlic, onion, pea',
  '6': 'Artichokes, garlic',
  '7': 'Lettuce, spinach',
  '8': 'Tomato and pepper seedlings',
  '9': 'Corn, zucchini, sweet corn',
  '10': 'Tomato, zucchini, pepper, bell pepper, pumpkin',
  '11': 'Watermelon, melon, cucumber',
  '12': 'Beans, late corn',
};

/**
 * Ventana de poda de rosales según el clima. Espejo de podar-rosal-cuando-fecha.ts,
 * traducida a los meses del hemisferio norte, que es el mercado de este hub.
 */
export const ROSE_PRUNING: Record<string, { window: string; note: string }> = {
  cold: { window: 'March–April, once the hard freezes are done', note: 'Zones 3–5: wait until the forsythia blooms — pruning early invites a late freeze to kill the new growth.' },
  temperate: { window: 'February–March, at the end of dormancy', note: 'Zones 6–8: prune as the buds swell but before they break.' },
  warm: { window: 'January–February', note: 'Zones 9–11: roses barely go dormant, so prune in the coolest part of the year and expect faster regrowth.' },
};

const DISCLAIMER =
  'Informational guide. Planting dates depend on your local last and first frost dates, not on the calendar month alone — check your county extension service, which publishes dates for your exact area.';

export const hub: HubData = {
  slug: 'en/garden/when-to-plant',
  title: 'When to Plant Calculator: USDA Zone, Monthly Sowing Guide and Pruning',
  description:
    'Find your USDA hardiness zone from your coldest winter temperature, see what to sow this month in either hemisphere, and get the right window to prune roses for your climate.',
  silo: 'Garden',
  siloHref: '/en/garden',
  locale: 'en',

  eyebrow: 'Timing',
  h1: 'What can I plant this month, and when do I prune?',
  lede:
    'Everything in a garden is a timing question. Your USDA hardiness zone tells you what will survive the winter, the monthly sowing guide tells you what goes in now, and the pruning window tells you when to cut without losing a season of flowers.',
  stamps: [
    'USDA zones defined in °F, as the official map is',
    'Sowing guides for both hemispheres',
    'Fixes Spanish month names leaking into the English output',
    'Replaces 4 single-purpose calculators',
  ],

  resultLabel: 'Your timing',

  cases: {
    title: 'What are you timing?',
    intro: 'Pick the question. Each case reads only the fields it needs.',
    items: [
      {
        id: 'zone',
        label: 'My USDA hardiness zone',
        hint: 'The zone and sub-zone from your average coldest winter temperature.',
        yes: [
          'Your zone and a or b sub-zone',
          'The temperature range that zone covers, in °F and °C',
          'What that means for which perennials survive',
        ],
        warn: [
          DISCLAIMER,
          'Hardiness zones describe average annual MINIMUM winter temperature and nothing else. They say nothing about summer heat, humidity, rainfall or season length — a zone 8 in coastal Washington and a zone 8 in central Texas grow completely different things.',
          'Microclimates within a property routinely shift things by half a zone or more. A south-facing wall, a sheltered courtyard or a frost pocket at the bottom of a slope can each be a zone off from the map.',
          'The USDA revised the map in 2023 and much of the country moved half a zone warmer. Advice and plant tags older than that may be citing the previous edition.',
        ],
        plazo: 'Buy perennials rated at least one zone colder than yours if you want them to survive an unusual winter rather than an average one.',
        answer:
          'Each zone spans 10 °F of average annual minimum temperature, and each a/b sub-zone spans 5 °F. Zone 7a is 0 to 5 °F; zone 7b is 5 to 10 °F.',
      },
      {
        id: 'sow',
        label: 'What to sow this month',
        hint: 'The month-by-month sowing guide for your hemisphere.',
        yes: [
          'What goes in the ground or the tray this month',
          'The same guide for either hemisphere',
          'What comes next, so you can plan the succession',
        ],
        warn: [
          DISCLAIMER,
          'A monthly guide is a rough frame, not a schedule. What actually governs sowing is your last spring frost and first autumn frost date — everything is counted forwards or backwards from those, and they vary by weeks within a single state.',
          'Sowing indoors and sowing outdoors are different calendars. Tomatoes go into trays six to eight weeks before the last frost and outdoors two weeks after it — a five-week gap that a monthly guide flattens away.',
          'Days to maturity on the packet is the other half of the calculation. For autumn crops, count backwards from the first frost and add a couple of weeks, because growth slows sharply as days shorten.',
        ],
        plazo: 'Find your local frost dates once, write them on the wall of the shed, and plan every season from those two numbers.',
        answer:
          'In the northern hemisphere, April is tomatoes, peppers and corn; September is garlic and winter spinach. Adjust both by your own frost dates, which can move them by a month.',
      },
      {
        id: 'prune',
        label: 'When to prune roses',
        hint: 'The right pruning window for your climate.',
        yes: [
          'The pruning window for cold, temperate or warm climates',
          'The signal to watch for rather than a fixed date',
          'What to cut and what to leave',
        ],
        warn: [
          DISCLAIMER,
          'Pruning too early is the classic mistake in a cold climate: it triggers new growth that a late freeze then kills, taking the cane with it. The traditional signal — prune when the forsythia blooms — tracks soil warmth far better than any date.',
          'Once-blooming old garden roses and ramblers flower on last year’s wood. Prune those in late winter and you cut off the entire year’s flowers; they get pruned just after they finish blooming instead.',
          'Repeat-flowering modern roses bloom on new wood and take hard late-winter pruning happily. Knowing which of the two you own matters more than the exact week.',
        ],
        plazo: 'Always remove dead, damaged and crossing canes at any time of year — that is not pruning, it is hygiene.',
        answer:
          'Late winter to early spring while the plant is dormant and the buds are swelling but not yet open: roughly January–February in zones 9–11, February–March in zones 6–8, and March–April in zones 3–5.',
      },
    ],
  },

  inputsTitle: 'Your climate and your calendar',
  inputsIntro: 'Fill in what the case you picked needs — everything else is ignored.',
  fields: [
    { id: 'mintemp', label: 'Average coldest winter temperature', type: 'number', value: 5, suffix: '°F', min: -60, max: 70, step: 1, help: 'The typical annual low where you live, not the record low.' },
    {
      id: 'hemisphere',
      label: 'Hemisphere',
      type: 'select',
      value: 'north',
      options: [
        { value: 'north', label: 'Northern (US, Canada, Europe)' },
        { value: 'south', label: 'Southern (Argentina, Australia, South Africa)' },
      ],
    },
    {
      id: 'month',
      label: 'Month',
      type: 'select',
      value: '4',
      options: [
        { value: '1', label: 'January' },
        { value: '2', label: 'February' },
        { value: '3', label: 'March' },
        { value: '4', label: 'April' },
        { value: '5', label: 'May' },
        { value: '6', label: 'June' },
        { value: '7', label: 'July' },
        { value: '8', label: 'August' },
        { value: '9', label: 'September' },
        { value: '10', label: 'October' },
        { value: '11', label: 'November' },
        { value: '12', label: 'December' },
      ],
    },
    {
      id: 'climate',
      label: 'Your climate for pruning',
      type: 'select',
      value: 'temperate',
      options: [
        { value: 'cold', label: 'Cold winters (zones 3–5)' },
        { value: 'temperate', label: 'Temperate (zones 6–8)' },
        { value: 'warm', label: 'Warm, barely dormant (zones 9–11)' },
      ],
    },
  ],
  fineprint: DISCLAIMER,

  chart: {
    type: 'donut',
    title: 'Where you sit',
    caption:
      'Your position in the range — how much of the zone band your temperature covers, or where the month falls in the growing year.',
  },

  breakdownTitle: 'Line by line',
  breakdownIntro: 'Zone boundaries are the official USDA °F values, with the °C equivalents alongside.',

  faq: [
    {
      q: 'What is a USDA hardiness zone?',
      a: 'A band of average annual minimum winter temperature, 10 °F wide, split into a and b sub-zones of 5 °F each. It tells you which perennials, shrubs and trees can survive your winter. Zone 7a is 0 to 5 °F, zone 7b is 5 to 10 °F, and so on up and down the scale.',
    },
    {
      q: 'What does the hardiness zone NOT tell me?',
      a: 'Almost everything else: summer heat, humidity, rainfall, soil, season length and the timing of your frosts. Coastal Washington and central Texas can share a zone number and grow entirely different gardens. For heat, the AHS Heat Zone map is the complementary tool.',
    },
    {
      q: 'Did the hardiness zones change recently?',
      a: 'Yes — the USDA published a revised map in 2023 using 1991–2020 climate data, and about half the country shifted half a zone warmer. If a plant tag or an article predates that, it may be quoting the older edition, which matters most for anything marginal in your area.',
    },
    {
      q: 'How much can a microclimate shift my zone?',
      a: 'Often half a zone or more within a single garden. South-facing walls store heat and release it overnight; enclosed courtyards trap it; low-lying spots collect cold air and become frost pockets that are effectively a zone colder than the rest of the property. Marginal plants live or die on exactly this.',
    },
    {
      q: 'Should I plant to my zone or one colder?',
      a: 'One colder, if you want the plant to survive an unusual winter rather than an average one. Zones describe the average annual minimum, which means roughly half of winters are colder than the number. Planting exactly to your zone is planting to a coin flip on the bad years.',
    },
    {
      q: 'When should I start tomato seeds?',
      a: 'Six to eight weeks before your last spring frost date, indoors, and transplant out one to two weeks after that frost date once night temperatures stay above 50 °F. Starting too early gives you leggy root-bound seedlings that a later-sown plant will overtake within a month.',
    },
    {
      q: 'How do I find my frost dates?',
      a: 'Your county extension service publishes them, usually as a probability rather than a single day — a 50% and a 10% chance of frost after a given date. The 10% date is the one to use for anything you cannot afford to lose. Frost dates vary by weeks within a single state and by more than that across elevation.',
    },
    {
      q: 'How do I plan an autumn crop?',
      a: 'Count backwards from your first autumn frost date. Take the days to maturity on the packet, add roughly two weeks for the slower growth that comes with shortening days, and sow that many days before the frost. Miss that window and the crop stalls at half size and sits there.',
    },
    {
      q: 'When is the right time to prune roses?',
      a: 'Late winter to early spring while the plant is dormant and the buds are swelling but have not opened: January–February in zones 9–11, February–March in zones 6–8, and March–April in the coldest zones. In cold areas the reliable signal is the forsythia coming into bloom, which tracks soil warmth rather than the calendar.',
    },
    {
      q: 'Why should I not prune roses too early?',
      a: 'Because pruning stimulates new growth, and soft new growth is destroyed by a late freeze — frequently taking the whole cane with it. Waiting until the danger has largely passed costs you nothing; going early can cost you the plant.',
    },
    {
      q: 'Do all roses get pruned at the same time?',
      a: 'No, and this is the mistake that costs a whole season of flowers. Repeat-flowering modern roses bloom on new wood and take hard late-winter pruning. Once-blooming old garden roses and ramblers bloom on last year’s wood, so pruning them in late winter removes every flower bud — those are pruned immediately after they finish flowering.',
    },
    {
      q: 'Is there anything I can prune at any time of year?',
      a: 'Dead, damaged, diseased and crossing canes, always. That is not really pruning, it is maintenance, and removing it improves airflow through the plant, which is the main defence against black spot and mildew.',
    },
  ],

  sources: [
    { name: 'USDA Plant Hardiness Zone Map', url: 'https://planthardiness.ars.usda.gov/', publisher: 'USDA Agricultural Research Service' },
    { name: 'Freeze/frost occurrence data and probabilities', url: 'https://www.ncei.noaa.gov/products/land-based-station/us-climate-normals', publisher: 'NOAA National Centers for Environmental Information' },
    { name: 'Cooperative Extension System — local planting calendars', url: 'https://www.nifa.usda.gov/about-nifa/how-we-work/extension', publisher: 'USDA NIFA' },
    { name: 'Heat Zone Map', url: 'https://ahsgardening.org/gardening-resources/gardening-maps/heat-zone-map/', publisher: 'American Horticultural Society' },
    { name: 'Pruning roses and ornamental shrubs', url: 'https://www.fs.usda.gov/managing-land/urban-forests', publisher: 'USDA Forest Service' },
  ],

  replaces: [
    '/en/usda-hardiness-zone',
    '/en/planting-calendar-northern-hemisphere',
    '/en/planting-calendar-southern-hemisphere',
    '/en/when-to-prune-roses',
  ],

  lastReviewed: '2026-07-28',
};
