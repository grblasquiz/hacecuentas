import type { HubData } from '../types';

/**
 * Hub EN — "What is this actually costing me, and what would I save by changing it?"
 *
 * Absorbe 5 calculadoras sueltas de consumo y ahorro doméstico.
 *
 * 🐛 BUG HEREDADO, corregido acá: dos de las fórmulas que este hub reemplaza caían
 * al default de tarifa ARGENTINO ($80/kWh) cuando corrían en inglés —
 * `energia-electrodomestico-etiqueta-eficiencia.ts` (`__lang === 'pt' ? 0.85 : 80`) y
 * `consumo-heladera-anual-kwh.ts` (`Number(i.tarifa ?? 80)`). Con el campo de tarifa
 * vacío, el usuario de EE.UU. veía un ahorro ~500× mayor que el real. Acá el default
 * es la tarifa residencial media de EE.UU. y es un campo editable.
 */

/** Tarifa residencial media de EE.UU., USD/kWh (EIA). Editable por el usuario. */
export const US_RATE_PER_KWH = 0.16;

/** Intensidad de carbono de la red de EE.UU., kg CO₂/kWh (EPA eGRID). */
export const GRID_KG_CO2_PER_KWH = 0.386;

/** Referencias de consumo anual de heladera, kWh/año (mismo criterio que la fórmula viva). */
export const FRIDGE_BANDS = { efficient: 320, high: 500 };

/** Hojas de papel por árbol, para el caso de impresión. Espejo de la fórmula viva: 10.000. */
export const SHEETS_PER_TREE = 10000;

const DISCLAIMER =
  'Informational estimate. Your actual bill depends on your utility’s rate structure — tiered rates, time-of-use pricing, demand charges and seasonal adjustments all change the answer. Use your own $/kWh from a recent bill for a realistic figure.';

export const hub: HubData = {
  slug: 'en/life/home-energy-savings',
  title: 'Home Energy Savings Calculator: Fridge, Lighting, Standby and Paper',
  description:
    'Work out what your fridge, your lights, your always-plugged-in chargers and your printing cost per year in kWh, dollars and CO₂ — and what each change would actually save.',
  silo: 'Everyday Life',
  siloHref: '/en/life',
  locale: 'en',

  eyebrow: 'Energy at home',
  h1: 'What is this costing me, and what would I save by changing it?',
  lede:
    'Most household energy advice is unranked, so people unplug chargers and leave the twenty-year-old fridge running. This puts the four common levers on the same scale — kilowatt-hours, dollars and kilograms of CO₂ a year — so you can see which one is worth doing first.',
  stamps: [
    'Default rate: US residential average, editable',
    'Grid intensity 0.386 kg CO₂/kWh — EPA eGRID',
    'Fixes an inherited bug that priced US savings at an Argentine tariff',
    'Replaces 5 single-purpose calculators',
  ],

  resultLabel: 'Annual cost or saving',

  cases: {
    title: 'What are you checking?',
    intro: 'Pick the appliance or habit. Each case reads only the fields it needs.',
    items: [
      {
        id: 'fridge',
        label: 'My refrigerator',
        hint: 'Annual kWh from the compressor rating and duty cycle, and how it compares to a modern unit.',
        yes: [
          'Annual and monthly consumption from wattage and duty cycle',
          'Cost per year at your electricity rate',
          'Where it sits against a modern efficient unit and what replacing it would save',
        ],
        warn: [
          DISCLAIMER,
          'Duty cycle is the share of the time the compressor actually runs, typically 30–50%. The nameplate wattage running 24/7 would massively overstate the figure — a fridge is not on continuously.',
          'The fridge is usually the single largest always-on load in a home, which is why an old inefficient one is worth far more attention than any number of phantom loads.',
        ],
        plazo: 'Clean the condenser coils annually and keep a few inches of clearance behind the unit — a choked condenser raises the duty cycle directly.',
        answer:
          'Annual kWh = watts × 24 × 365 × duty cycle ÷ 1,000. A modern efficient fridge lands near 250–350 kWh a year; over 500 kWh means an old unit that is costing you real money.',
      },
      {
        id: 'appliance',
        label: 'Replacing an appliance with a more efficient one',
        hint: 'The annual saving in kWh, dollars and CO₂, and the years to pay back the purchase.',
        yes: [
          'Difference in annual consumption between old and new',
          'Annual dollar saving at your rate, and CO₂ avoided',
          'Simple payback period on the purchase price',
        ],
        warn: [
          DISCLAIMER,
          'The published annual figure on an efficiency label is measured under a standard test protocol. Your usage — how full it is, how often you open it, the room temperature — moves the real number in both directions.',
          'Replacing a working appliance carries the embodied carbon of manufacturing the new one, which can take years of operational savings to offset. Replacing at end of life is where the maths works cleanly.',
        ],
        plazo: 'If the payback exceeds the appliance’s expected life, the upgrade is not paying for itself in energy terms — decide it on other grounds.',
        answer:
          'Annual saving = (old kWh − new kWh) × your rate. Divide the price difference by that to get the payback in years.',
      },
      {
        id: 'lighting',
        label: 'Lighting and daylight',
        hint: 'What a fixture costs per month, and what using daylight or switching to LED saves.',
        yes: [
          'Monthly and annual cost of running the fixture',
          'What using daylight for those hours saves',
          'What switching the same fixture to LED would save on top',
        ],
        warn: [
          DISCLAIMER,
          'Lighting is a much smaller share of a modern household bill than it used to be, precisely because LEDs already cut it by roughly 80%. If your lights are already LED, this lever is largely spent.',
          'In a cooled building, the heat a lamp gives off is paid for twice — once to make it and once to remove it. That is a real but secondary effect not counted here.',
        ],
        plazo: 'Swap the fixtures you use most hours per day first; a rarely used closet bulb pays back essentially never.',
        answer:
          'Monthly kWh = watts × hours per day × 30 ÷ 1,000. A 60 W incandescent run 5 hours a day costs about 9 kWh a month; the LED equivalent costs under 2.',
      },
      {
        id: 'standby',
        label: 'Chargers and standby power',
        hint: 'What always-plugged-in chargers and standby loads cost per year.',
        yes: [
          'Annual kWh from the number of devices and their idle draw',
          'The cost and the CO₂ that represents',
          'Honest context on how small this is next to the fridge',
        ],
        warn: [
          DISCLAIMER,
          'Modern chargers draw very little when idle — a fraction of a watt, well under the older devices this advice was written for. The saving is real but small, and it is frequently presented as if it were comparable to heating or refrigeration. It is not.',
          'The standby loads worth attacking are the larger ones: set-top boxes, game consoles in instant-on mode, and older AV equipment, which can each draw ten to twenty watts continuously.',
        ],
        plazo: 'A switched power strip for the entertainment centre gets you almost all of the available saving in one action.',
        answer:
          'Annual kWh = devices × idle watts × 24 × 365 ÷ 1,000. Ten chargers at half a watt come to about 44 kWh a year — a few dollars.',
      },
      {
        id: 'paper',
        label: 'Double-sided printing',
        hint: 'Sheets saved per year and what that means in trees.',
        yes: [
          'Sheets saved per year by printing double-sided',
          'The equivalent in trees, at 10,000 sheets per tree',
          'Reams saved, which is the number your office actually buys',
        ],
        warn: [
          DISCLAIMER,
          'The trees figure is a rough communication device, not an accounting fact: yield per tree varies enormously with species, size and mill process, and most office paper contains recycled content already.',
          'Paper’s footprint is dominated by manufacturing energy and water, not by the tree count — which is why recycled-content paper matters at least as much as using less of it.',
        ],
        plazo: 'Set duplex as the printer default rather than relying on people to choose it — defaults beat intentions.',
        answer:
          'Double-sided printing halves sheet use. 100 sheets a week becomes 50, saving about 2,600 sheets — roughly five reams — a year.',
      },
    ],
  },

  inputsTitle: 'Your numbers',
  inputsIntro:
    'The electricity rate is the one field worth getting right — take it from a recent bill rather than trusting the default.',
  fields: [
    { id: 'rate', label: 'Your electricity rate', type: 'number', value: 0.16, prefix: '$', suffix: '/kWh', min: 0, step: 0.01, help: 'US residential average is about $0.16/kWh, but state rates range from roughly $0.11 to over $0.40.' },
    { id: 'watts', label: 'Appliance power draw', type: 'number', value: 150, suffix: 'watts', min: 0, step: 10 },
    { id: 'duty', label: 'Duty cycle — share of time the compressor runs', type: 'number', value: 40, suffix: '%', min: 1, max: 100, step: 5 },
    { id: 'oldkwh', label: 'Old appliance, annual consumption', type: 'number', value: 600, suffix: 'kWh/yr', min: 0, step: 10, thousands: true },
    { id: 'newkwh', label: 'New appliance, annual consumption', type: 'number', value: 300, suffix: 'kWh/yr', min: 0, step: 10, thousands: true },
    { id: 'price', label: 'Price of the new appliance', type: 'number', value: 900, prefix: '$', min: 0, step: 50, thousands: true },
    { id: 'lampwatts', label: 'Light fixture power', type: 'number', value: 60, suffix: 'watts', min: 0, step: 5 },
    { id: 'lamphours', label: 'Hours it is on per day', type: 'number', value: 5, suffix: 'hours', min: 0, max: 24, step: 0.5 },
    { id: 'chargers', label: 'Devices left plugged in', type: 'number', value: 8, min: 0, step: 1 },
    { id: 'idlewatts', label: 'Idle draw of each', type: 'number', value: 0.5, suffix: 'watts', min: 0, step: 0.1 },
    { id: 'sheets', label: 'Sheets you print per week', type: 'number', value: 100, min: 0, step: 10, thousands: true },
  ],
  fineprint: DISCLAIMER,

  chart: {
    type: 'donut',
    title: 'What you keep versus what you save',
    caption:
      'The split between the consumption that remains after the change and the part the change removes — so the size of the lever is visible, not just the direction.',
  },

  breakdownTitle: 'Line by line',
  breakdownIntro:
    'Everything is priced at the rate in the field above, and CO₂ is converted at the US average grid intensity.',

  faq: [
    {
      q: 'How much electricity does a refrigerator use per year?',
      a: 'A modern efficient unit uses roughly 250–350 kWh a year — about $40 to $56 at the US average rate. Anything over 500 kWh points to an old or failing unit, and a twenty-year-old fridge can easily double the modern figure, which is why it is usually the highest-value replacement in a house.',
    },
    {
      q: 'What is a duty cycle and why does it matter so much?',
      a: 'It is the fraction of the time the compressor actually runs, typically 30–50%. Multiplying nameplate watts by 24 hours assumes the compressor never stops, which would overstate consumption two to three times. A rising duty cycle over the years — from failing door seals, dust-clogged coils or a warm kitchen — is often the first sign a fridge is on its way out.',
    },
    {
      q: 'Is it worth replacing a working appliance with a more efficient one?',
      a: 'Only if the payback is comfortably shorter than the remaining life, and even then the new unit carries embodied manufacturing carbon that takes years of operational saving to offset. Replacing at end of life is where the economics and the carbon both work cleanly. The exception is genuinely old always-on equipment, where the running cost gap is large enough to justify early replacement.',
    },
    {
      q: 'How much does leaving chargers plugged in actually cost?',
      a: 'Very little with modern hardware. Ten chargers drawing half a watt each come to about 44 kWh a year — around $7. The advice made much more sense when power supplies were less efficient, and it persists mostly because it is an easy action to recommend. It is not wrong, it is just small.',
    },
    {
      q: 'What standby loads are actually worth unplugging?',
      a: 'The large ones. Set-top boxes and DVRs, game consoles left in instant-on mode, older AV receivers and some smart speakers can each draw ten to twenty watts continuously — one of those outweighs a drawer full of phone chargers. A switched power strip on the entertainment centre captures most of the available saving.',
    },
    {
      q: 'How much does an LED save compared to an incandescent bulb?',
      a: 'Roughly 80–85% for the same light output: a 60 W incandescent is replaced by an 8–10 W LED. Run five hours a day, that is about 90 kWh a year saved per fixture — around $15 — and the LED lasts long enough that the replacement cost largely disappears too.',
    },
    {
      q: 'Does using daylight instead of lamps save a meaningful amount?',
      a: 'A modest amount on lighting, and the effect on cooling load cuts both ways: you avoid the lamp’s waste heat, but a sunlit window admits considerably more heat than the lamp ever produced. In a cooled climate, daylight through unshaded glass can cost more in air conditioning than it saves in lighting.',
    },
    {
      q: 'Where does most household electricity actually go?',
      a: 'In a typical US home, space heating and cooling dominate, followed by water heating, then refrigeration and lighting, with electronics and everything else making up the remainder. Any serious reduction plan starts with the thermal envelope and the HVAC system, not with the plug loads.',
    },
    {
      q: 'How much CO₂ does a kilowatt-hour represent?',
      a: 'About 0.386 kg on the US national average grid, but the spread by region is enormous — a coal-heavy grid can be triple a hydro or nuclear one. That is why the same appliance change saves very different amounts of carbon depending on where you live, even though the dollar saving is similar.',
    },
    {
      q: 'How many sheets of paper come from one tree?',
      a: 'The commonly cited figure is around 10,000 sheets, and it is used here for that reason, but it is a rough communication device rather than a measurement. Yield varies hugely with species, tree size and mill process, and most office paper already contains recycled fibre, which breaks the tree-count framing entirely.',
    },
    {
      q: 'What is the single highest-value change on this list?',
      a: 'Replacing an old refrigerator, if you have one — it is the largest continuously running load in most homes and the efficiency gap between a 2005 unit and a current one is dramatic. Lighting comes next if you still have incandescent or halogen fixtures. Standby loads are last, by a wide margin.',
    },
  ],

  sources: [
    { name: 'Electric Power Monthly — average residential price of electricity', url: 'https://www.eia.gov/electricity/monthly/', publisher: 'US Energy Information Administration' },
    { name: 'eGRID — grid emission factors', url: 'https://www.epa.gov/egrid', publisher: 'US EPA' },
    { name: 'ENERGY STAR — refrigerator efficiency and annual energy use', url: 'https://www.energystar.gov/products/refrigerators', publisher: 'ENERGY STAR / US EPA' },
    { name: 'LED Lighting — energy savings versus incandescent', url: 'https://www.energy.gov/energysaver/led-lighting', publisher: 'US Department of Energy' },
    { name: 'Residential Energy Consumption Survey (RECS) — where household energy goes', url: 'https://www.eia.gov/consumption/residential/', publisher: 'US Energy Information Administration' },
  ],

  replaces: [
    '/en/annual-refrigerator-energy-consumption-kwh',
    '/en/energy-efficient-appliance-savings',
    '/en/natural-light-energy-savings',
    '/en/co2-savings-idle-chargers',
    '/en/paper-saved-double-sided-printing',
  ],

  lastReviewed: '2026-07-28',
};
