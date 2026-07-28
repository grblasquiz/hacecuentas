import type { HubData } from '../types';

/**
 * Hub de decisión EN (mercado US) — "What size water heater, tank, pipe, pump
 * and drain do I need?".
 *
 * Ramas y fórmulas vivas portadas:
 *   calefon-termotanque-litros-personas.ts → water heater (tank y tankless)
 *   tanque-agua-litros-personas.ts         → storage tank
 *   cano-agua-diametro-caudal.ts           → supply pipe diameter
 *   bombeo-cisterna-tanque-watts.ts        → pump power
 *   rejilla-trampa-desague.ts              → drain and trap size
 *
 * Diferencia grande y deliberada, documentada abajo: la fórmula argentina
 * dimensiona el termotanque por litros de agua a 60 °C pura, mientras que la
 * práctica americana lo hace por First Hour Rating, que es agua MEZCLADA a
 * 120 °F en la ducha. Son dos cosas distintas y difieren casi al doble. El
 * titular usa la tabla del DOE y la demanda portada viaja en el desglose.
 */

/** Disclaimer YMYL — src/lib/disclaimers.ts, dominio 'construction-materials', idioma en. */
const DISCLAIMER_MATERIALS =
  'Material and quantity estimate. Check coverage, waste, and application against the manufacturer’s specifications or the professional in charge.';

/**
 * Consumo de agua caliente pura a 60 °C por persona y día, de la fórmula
 * original: bajo 22 L, normal 30 L, alto 42 L. Convertido a galones US
 * (1 gal = 3.78541 L).
 */
export const HOT_WATER_GPD = [
  { id: 'low', label: 'Low — short showers, no tub', liters: 22, gal: 5.81 },
  { id: 'normal', label: 'Average — one 10-minute shower each', liters: 30, gal: 7.93 },
  { id: 'high', label: 'High — long showers, tub or hot-water laundry', liters: 42, gal: 11.1 },
];

/** Factor de simultaneidad de la fórmula original, por cantidad de personas. */
export function simultaneity(people: number): number {
  if (people <= 2) return 1.0;
  if (people <= 4) return 0.85;
  if (people <= 6) return 0.75;
  return 0.65;
}

/**
 * Guía del DOE Energy Saver por First Hour Rating (agua mezclada a 120 °F).
 * Es el número que un fabricante americano imprime en la EnergyGuide.
 */
export const DOE_FHR = [
  { maxPeople: 2, fhr: 30, tank: 30 },
  { maxPeople: 3, fhr: 42, tank: 40 },
  { maxPeople: 4, fhr: 54, tank: 50 },
  { maxPeople: 5, fhr: 62, tank: 66 },
  { maxPeople: 99, fhr: 72, tank: 80 },
];

/** Tamaños comerciales de termotanque en Estados Unidos, en galones. */
export const TANK_SIZES_GAL = [30, 40, 50, 66, 75, 80, 100];

/**
 * Calefón instantáneo: la fórmula original recomienda 14 L/min hasta dos
 * personas y 22 L/min de ahí en adelante. En GPM: 3.7 y 5.8.
 */
export const TANKLESS_GPM = [
  { maxPeople: 2, gpm: 3.7 },
  { maxPeople: 4, gpm: 5.8 },
  { maxPeople: 99, gpm: 7.5 },
];

/**
 * Reserva de agua fría: la fórmula original usa 200 L por persona y día,
 * que son 52.8 galones. El promedio de uso doméstico en Estados Unidos que
 * publica la EPA es más alto (unos 82 galones por persona y día contando
 * riego), así que el número portado queda del lado corto y se declara.
 */
export const RESERVE_GPD_METRIC = 52.83;
export const EPA_HOME_GPD = 82;
/** Tamaños de tanque de reserva disponibles en el mercado US, en galones. */
export const RESERVE_SIZES_GAL = [100, 200, 300, 500, 750, 1000, 1500, 2000, 2500, 3000, 5000];

/**
 * Velocidad de diseño en la cañería. La fórmula original usa 1.5 m/s, que
 * son 4.92 ft/s. El default acá es 5 ft/s: prácticamente el mismo valor y
 * además el límite habitual del UPC para agua caliente.
 * d(in) = sqrt(0.4085 × gpm / v_fps) es la forma imperial de la misma
 * ecuación de continuidad que usa la fórmula métrica.
 */
export const PIPE_VELOCITY_DEFAULT = 5;
export const PIPE_SIZES_IN = [0.5, 0.75, 1, 1.25, 1.5, 2, 2.5, 3, 4];

/**
 * Bomba: la fórmula original es P(W) = Q(m³/s) × 1000 × 9.81 × H(m) / η.
 * La forma imperial equivalente es HP = gpm × head_ft / (3960 × η); el 3960
 * sale exactamente de la misma física con densidad de agua estándar.
 */
export const PUMP_HP_CONSTANT = 3960;
export const PUMP_SIZES_HP = [0.33, 0.5, 0.75, 1, 1.5, 2, 3, 5, 7.5];

/**
 * Diámetros mínimos de trampa y desagüe. La fórmula original da valores
 * argentinos en milímetros (lavatorio 50 mm, cocina 75-100, ducha 75-100,
 * patio 100-150). Acá manda el IPC, que es lo que un inspector americano
 * exige, y la conversión del valor original se declara en el desglose.
 */
export const DRAINS = [
  { id: 'lavatory', label: 'Lavatory / bathroom sink', trap: 1.25, drain: 1.5, dfu: 1, metricMm: 50 },
  { id: 'kitchen', label: 'Kitchen sink', trap: 1.5, drain: 1.5, dfu: 2, metricMm: 87.5 },
  { id: 'shower', label: 'Shower', trap: 2, drain: 2, dfu: 2, metricMm: 87.5 },
  { id: 'tub', label: 'Bathtub', trap: 1.5, drain: 1.5, dfu: 2, metricMm: 50 },
  { id: 'laundry', label: 'Laundry standpipe', trap: 2, drain: 2, dfu: 2, metricMm: 50 },
  { id: 'floor', label: 'Floor drain / yard drain', trap: 2, drain: 3, dfu: 2, metricMm: 125 },
  { id: 'toilet', label: 'Water closet', trap: 3, drain: 3, dfu: 4, metricMm: 100 },
];

export const hub: HubData = {
slug: 'en/home/water-and-plumbing',
  title: 'Water heater, tank, pipe, pump and drain sizing calculator',
  description:
    'Size a water heater in gallons or GPM, a storage tank, the supply pipe diameter in inches, the pump in horsepower and the drain and trap size — using DOE first-hour ratings and IPC minimums.',
  silo: 'Home & Building',
siloHref: '/en/home',
  locale: 'en',

  eyebrow: 'US · plumbing · sizing',
  h1: 'What size water heater, tank, pipe and pump do I need?',
  lede:
    'Every plumbing decision is the same shape: work out the demand, then buy the next size up that actually exists. This runs the demand for five of them — hot water, stored water, supply pipe, pump and drain — and lands each one on the commercial size the supply house stocks, with the code minimum shown alongside it.',
  stamps: [
    'Gallons · GPM · inches · horsepower',
    'DOE first-hour rating · IPC trap and drain minimums',
    '5 calculators inside',
  ],

  resultLabel: 'Size to buy',

  cases: {
    title: 'What are you sizing?',
    intro:
      'The household details carry across all five branches, so you can size a whole rough-in without retyping.',
    items: [
      {
        id: 'heater',
        label: 'Water heater',
        hint: 'Gallons · first hour rating · GPM for tankless',
        answer: 'A tank is sized by first hour rating, not by capacity alone.',
        yes: [
          'First hour rating is how many gallons of hot water the heater can deliver in one busy hour starting full — the number that matters, and the one on the EnergyGuide label',
          'DOE guidance runs roughly 30 gallons of first hour rating for one or two people, 42 for three, 54 for four and 62 or more above that',
          'The tank capacity that produces a given first hour rating is usually a little smaller, because the burner or element keeps recovering while you draw',
          'A tankless heater is sized in gallons per minute at a given temperature rise, not in gallons of storage',
          'Two simultaneous showers need roughly 4 to 5 GPM, which is a large tankless unit or a well-fed tank',
        ],
        warn: [
          DISCLAIMER_MATERIALS,
          'Storing water below 120 °F encourages Legionella; delivering it above 120 °F scalds. The usual answer is to store hot and mix down at the fixture with a thermostatic valve',
          'A tankless unit sized on GPM alone will disappoint in winter: capacity falls as the incoming water gets colder, and northern groundwater can be 40 °F',
          'Gas water heaters need combustion air, venting and clearances; electric ones can need a service upgrade. Both are permitted work almost everywhere',
        ],
        plazo: 'flush the tank and check the anode rod yearly — that is what decides whether it lasts 8 years or 15.',
      },
      {
        id: 'reserve',
        label: 'Cold water storage tank',
        hint: 'Gallons · days of reserve',
        answer: 'Storage is daily use per person, times people, times days of reserve.',
        yes: [
          'Sizing is straightforward: gallons per person per day, times the number of people, times how many days you want to ride out',
          'The metric rule this ports uses 200 liters per person per day, which is 52.8 gallons',
          'The EPA puts average US household use closer to 82 gallons per person per day including outdoor use, so the ported figure is on the low side for a US home with a yard',
          'A day of reserve is enough for a municipal supply hiccup; a well or a cistern usually wants two or three',
          'The result rounds up to a stocked tank size, which for poly tanks steps 100, 200, 300, 500, 750, 1,000 gallons and up',
        ],
        warn: [
          DISCLAIMER_MATERIALS,
          'A full tank is heavy: water weighs 8.34 lb per gallon, so a 500 gallon tank is over two tons and the platform under it has to be designed for that',
          'Stored potable water needs a sealed, opaque, food-grade tank and turnover — an open or translucent tank grows algae and is not potable storage',
          'Cross-connection between stored and municipal water requires a backflow preventer in essentially every jurisdiction',
        ],
        plazo: 'inspect and sanitize potable storage at least annually, and after any time the tank has been opened.',
      },
      {
        id: 'pipe',
        label: 'Supply pipe diameter',
        hint: 'Inches · velocity · nominal size',
        answer: 'Diameter comes from the flow you need and the velocity you are willing to run.',
        yes: [
          'The equation is continuity: area equals flow divided by velocity, and diameter follows from area',
          'In imperial units it collapses to diameter in inches equals the square root of 0.4085 times GPM divided by velocity in feet per second',
          'Five feet per second is the working design velocity, and it is also the usual code limit for hot water',
          'Cold water can go to 8 feet per second, but above that the pipe gets noisy and erosion-corrosion becomes a real concern in copper',
          'Round up to the next nominal size: that lowers the velocity, the noise and the pressure loss all at once',
        ],
        warn: [
          DISCLAIMER_MATERIALS,
          'Nominal pipe size is not the inside diameter: 3/4 inch copper type L has an inside diameter closer to 0.785 inches, and PEX is smaller still for the same nominal size',
          'PEX fittings that insert into the tube choke the bore significantly — sizing PEX like copper undersizes it',
          'Real fixture sizing uses water supply fixture units and the available pressure, not just a single flow figure',
        ],
        plazo: 'pressure-test the rough-in before closing the walls, and leave it under test while you work.',
      },
      {
        id: 'pump',
        label: 'Pump power',
        hint: 'Horsepower · watts · head',
        answer: 'Horsepower is flow times head, divided by 3,960 and the efficiency.',
        yes: [
          'Water horsepower is gallons per minute times total head in feet, divided by 3,960',
          'Divide by the pump efficiency to get shaft horsepower, which is what the nameplate has to be',
          'Total head is not just the lift: friction in the pipe, elbows, valves and the pressure you want at the outlet all add to it',
          'Sixty percent is a realistic efficiency for a small residential pump; larger and better-matched pumps do better',
          'Motors only come in stocked sizes, so the answer always rounds up to the next one',
        ],
        warn: [
          DISCLAIMER_MATERIALS,
          'Static lift alone will badly undersize a pump: on a long run, friction head can exceed the vertical lift',
          'A pump running far from its best efficiency point cavitates, vibrates and fails early — match the pump curve to the duty point, do not just buy horsepower',
          'Running a pump dry destroys the seal in minutes: a suction-side cutoff or a low-level switch is not optional',
        ],
        plazo: 'check the suction lift limit before ordering — above about 25 feet a surface pump will not prime.',
      },
      {
        id: 'drain',
        label: 'Drain and trap size',
        hint: 'Inches · fixture units · IPC minimums',
        answer: 'Each fixture has a code minimum trap size — start there and go up, never down.',
        yes: [
          'The IPC assigns each fixture a minimum trap size and a drainage fixture unit value',
          'A lavatory takes a 1-1/4 inch trap, a kitchen sink and a bathtub 1-1/2 inch, a shower and a laundry standpipe 2 inch, and a water closet 3 inch',
          'The branch drain serving several fixtures is sized on the sum of their fixture units, not on the largest one',
          'Going one size up on a horizontal drain is usually harmless; going up on a vertical stack can actually hurt, since the water needs to cling to the wall of the pipe',
          'Every trap needs a vent within the code distance, or it siphons dry and lets sewer gas in',
        ],
        warn: [
          DISCLAIMER_MATERIALS,
          'Slope matters as much as diameter: 1/4 inch per foot for pipes up to 2-1/2 inches, 1/8 inch per foot for 3 inches and larger. Too steep and the liquid outruns the solids',
          'Never install a double trap on one fixture — it locks air between the traps and stops the drain completely',
          'Local codes differ: much of the West Coast is on the UPC, not the IPC, and the trap and vent rules are not identical',
        ],
        plazo: 'the drain, waste and vent rough-in gets inspected before it is covered — schedule it before you close anything.',
      },
    ],
  },

  inputsTitle: 'The household and the run',
  inputsIntro: 'People, gallons per minute, feet of head. Only the fields your branch uses affect the result.',
  fields: [
    { id: 'people', label: 'People in the household', type: 'number', value: 4, min: 1, max: 20, step: 1, help: 'Drives the hot water and storage branches.' },
    {
      id: 'usage',
      label: 'Hot water usage level',
      type: 'select',
      value: 'normal',
      options: [
        { value: 'low', label: 'Low — short showers, no tub' },
        { value: 'normal', label: 'Average — one 10-minute shower each' },
        { value: 'high', label: 'High — long showers, tub or hot-water laundry' },
      ],
      help: '5.8, 7.9 or 11.1 gallons of 140 °F water per person per day.',
    },
    {
      id: 'heater_type',
      label: 'Water heater type',
      type: 'select',
      value: 'tank',
      options: [
        { value: 'tank', label: 'Storage tank' },
        { value: 'tankless', label: 'Tankless / on-demand' },
      ],
      help: 'A tank answers in gallons; a tankless one answers in gallons per minute.',
    },
    { id: 'reserve_days', label: 'Days of cold water reserve', type: 'number', value: 1, min: 0.5, max: 10, step: 0.5, help: 'One day for a municipal supply, two or three for a well or a cistern.' },
    { id: 'flow_gpm', label: 'Design flow (GPM)', type: 'number', value: 12, min: 0, step: 0.5, help: 'Pipe and pump branches. A shower is about 2 GPM, a hose bib 5, a whole small house at peak 10 to 15.' },
    { id: 'velocity_fps', label: 'Design velocity (ft/s)', type: 'number', value: 5, min: 1, max: 12, step: 0.5, help: '5 ft/s is the working default and the usual hot-water limit. Cold water can go to 8.' },
    { id: 'head_ft', label: 'Total head the pump must overcome (ft)', type: 'number', value: 60, min: 0, step: 5, help: 'Vertical lift plus friction plus the pressure you want at the outlet. 1 psi is 2.31 ft of head.' },
    { id: 'pump_eff', label: 'Pump efficiency (%)', type: 'number', value: 60, min: 20, max: 90, step: 5, help: '60% is realistic for a small residential pump.' },
    {
      id: 'fixture',
      label: 'Fixture for the drain branch',
      type: 'select',
      value: 'shower',
      options: [
        { value: 'lavatory', label: 'Lavatory / bathroom sink' },
        { value: 'kitchen', label: 'Kitchen sink' },
        { value: 'shower', label: 'Shower' },
        { value: 'tub', label: 'Bathtub' },
        { value: 'laundry', label: 'Laundry standpipe' },
        { value: 'floor', label: 'Floor or yard drain' },
        { value: 'toilet', label: 'Water closet' },
      ],
      help: 'Sets the IPC minimum trap and drain size.',
    },
  ],
  fineprint: DISCLAIMER_MATERIALS,

  chart: {
    type: 'scale',
    title: 'Where your number lands on the commercial size ladder',
    caption:
      'Plumbing sizes do not come in a continuum: you calculate a number and then buy the next step that exists. The bar is the ladder of stocked sizes and the marker is your calculated requirement, so you can see whether you barely cleared a step or are sitting comfortably inside one.',
  },
  breakdownTitle: 'From demand to the size on the shelf',
  breakdownIntro:
    'The demand calculation, the code minimum where there is one, and the commercial size the two of them land on.',

  faq: [
    {
      q: 'What size water heater do I need for a family of four?',
      a: 'By DOE guidance, about 54 gallons of first hour rating, which is typically a 50 gallon gas tank or a 66 gallon electric one, since electric elements recover more slowly. The reason a 50 gallon tank can deliver 54 gallons in the first hour is that the burner is heating the whole time you are drawing. Always compare first hour ratings between models rather than nominal capacity — two 50 gallon heaters can differ by 20 gallons of first hour rating.',
    },
    {
      q: 'What is a first hour rating and why does it matter more than capacity?',
      a: 'It is the number of gallons of hot water the heater can supply in one hour starting from a fully heated tank, and it appears on the yellow EnergyGuide label. It combines storage volume with recovery rate, which is what your morning actually looks like: everyone showering inside a 60 minute window. A small tank with a powerful burner can beat a bigger tank with a weak element, and buying on capacity alone hides that entirely.',
    },
    {
      q: 'How many GPM does a tankless water heater need?',
      a: 'Add up the fixtures you expect to run at once. A modern showerhead is 2.0 to 2.5 GPM, a kitchen faucet about 1.5, a bathroom faucet 1.0. Two showers at once is 4 to 5 GPM. The catch is temperature rise: a unit rated 5 GPM is rated at some specific rise, often 35 to 45 °F. If your groundwater arrives at 45 °F in February and you want 120 °F at the tap, that is a 75 °F rise and the same unit may only manage 3 GPM. Always check the manufacturer curve for your winter inlet temperature.',
    },
    {
      q: 'What temperature should I set my water heater to?',
      a: 'The common recommendation is 120 °F at the tap, which limits scald risk and slows mineral scaling. Legionella, however, grows in tanks held below about 122 °F. The standard resolution is to store at 140 °F and install a thermostatic mixing valve at the heater outlet so 120 °F is what actually reaches the fixtures. That is required in many jurisdictions on new installations, and it also increases the effective capacity of the tank, since you are diluting hotter water.',
    },
    {
      q: 'How much water storage does a household need?',
      a: 'The metric rule this calculator ports uses 200 liters per person per day, or 52.8 gallons, times the days of reserve you want. The EPA puts actual average US household use closer to 82 gallons per person per day including irrigation, so for a US home with a yard the ported figure is conservative and you should either raise the per-person number or count only indoor use. One day of reserve covers a municipal outage; a well or cistern system usually wants two or three.',
    },
    {
      q: 'How do I size a water supply pipe?',
      a: 'Diameter in inches equals the square root of 0.4085 times the flow in GPM divided by the velocity in feet per second. At 12 GPM and 5 ft/s that is about 0.99 inches, so a 1 inch line. Then round up to the next nominal size, which lowers velocity and pressure loss. Remember that nominal size is not bore: 3/4 inch copper type L is about 0.785 inches inside, and 3/4 inch PEX with insert fittings is meaningfully smaller than that at every joint.',
    },
    {
      q: 'What water velocity is too high in a pipe?',
      a: 'Above about 8 feet per second in cold water and 5 in hot, you start getting audible flow noise, water hammer that is harder to arrest, and in copper the beginning of erosion-corrosion, where the moving water strips the protective oxide layer off the inside of the tube. Hot water accelerates that, which is why the hot limit is lower. Designing at 5 ft/s leaves headroom for the flow surges that a real system sees.',
    },
    {
      q: 'How do I calculate pump horsepower?',
      a: 'Water horsepower is GPM times total head in feet divided by 3,960. Divide by the pump efficiency for the shaft horsepower the motor has to deliver. At 12 GPM and 60 feet of head with 60% efficiency, that is 12 × 60 ÷ 3,960 ÷ 0.6, about 0.30 HP, so a 1/3 HP motor. The 3,960 constant is not arbitrary: it comes straight from the weight of a gallon of water and the definition of horsepower, and it is the exact imperial equivalent of the metric ρgQH formula.',
    },
    {
      q: 'What counts as total head for a pump?',
      a: 'Three things added together: the static lift from the water surface to the discharge point, the friction loss through the pipe, fittings and valves along the way, and any pressure you need at the outlet, converted at 2.31 feet of head per psi. On a long horizontal run, friction can easily exceed the vertical lift. Sizing on lift alone is the most common reason a new pump does not deliver its rated flow.',
    },
    {
      q: 'What size drain does each fixture need?',
      a: 'IPC minimums are: lavatory 1-1/4 inch trap, kitchen sink and bathtub 1-1/2 inch, shower and laundry standpipe 2 inch, floor drain 2 inch with a 3 inch drain line, and a water closet 3 inch. Branch drains serving several fixtures are sized on the total drainage fixture units, not on the biggest fixture. Note that some jurisdictions on the west coast follow the UPC instead, which sets a 2 inch minimum for kitchen sinks in some configurations.',
    },
    {
      q: 'What slope should a drain line have?',
      a: 'A quarter inch per foot for lines up to 2-1/2 inches, and an eighth of an inch per foot for 3 inch and larger. Too little slope and the solids settle out; too much and the liquid runs away and leaves the solids behind, which fouls the line just as effectively. This is the piece of drainage design people most often get wrong by assuming steeper is always better.',
    },
    {
      q: 'How do the metric figures in these formulas convert?',
      a: 'The ones used here: 1 US gallon is 3.78541 liters, 1 liter per minute is 0.2642 GPM, 1 meter of head is 3.281 feet, 1.5 meters per second is 4.92 feet per second, and 50 mm of pipe is 1.97 inches. Note that a US gallon is not an imperial gallon — the imperial one is 4.546 liters, about 20% larger — so a British sizing table read as US gallons will oversize everything by a fifth.',
    },
  ],

  sources: [
    {
      name: 'US Department of Energy — sizing a new water heater (first hour rating)',
      url: 'https://www.energy.gov/energysaver/sizing-new-water-heater',
      publisher: 'US Department of Energy',
    },
    {
      name: 'International Plumbing Code, Chapter 7 — sanitary drainage, trap and drain sizes',
      url: 'https://codes.iccsafe.org/content/IPC2021P1/chapter-7-sanitary-drainage',
      publisher: 'International Code Council',
    },
    {
      name: 'EPA WaterSense — indoor water use in the United States',
      url: 'https://www.epa.gov/watersense/how-we-use-water',
      publisher: 'US Environmental Protection Agency',
    },
    {
      name: 'Hydraulic Institute — pump sizing and efficiency standards',
      url: 'https://www.pumps.org/standards/',
      publisher: 'Hydraulic Institute',
    },
    {
      name: 'CDC — Legionella control in building water systems (temperature guidance)',
      url: 'https://www.cdc.gov/legionella/php/toolkit/wmp-toolkit.html',
      publisher: 'US Centers for Disease Control and Prevention',
    },
    {
      name: 'Copper Development Association — copper tube handbook, flow velocity limits',
      url: 'https://www.copper.org/publications/pub_list/pdf/copper_tube_handbook.pdf',
      publisher: 'Copper Development Association',
    },
  ],

  replaces: [
    '/en/water-heater-capacity-calculator',
    '/en/water-tank-capacity-by-people',
    '/en/water-pipe-diameter-by-flow-rate',
    '/en/water-pump-power-watts',
    '/en/drain-grate-size-calculator',
  ],

lastReviewed: '2026-07-28',
};
