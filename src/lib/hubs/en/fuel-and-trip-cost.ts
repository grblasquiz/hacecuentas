import type { HubData } from '../types';

/**
 * Hub EN — "How far does a tank get me, and what will this drive cost?"
 *
 * Absorbe 5 calculadoras sueltas de combustible y viaje en auto del mercado inglés.
 *
 * Unidades: el catálogo original es métrico (km/L, litros, km/h). Acá se trabaja en
 * unidades de EE.UU. (miles, gallons, mpg) con los factores exactos de NIST:
 *   1 gal US = 3,785411784 L   ·   1 mile = 1,609344 km
 * Un mpg = (km/L) × 2,352145836. Las constantes de comportamiento (penalidad del A/C,
 * umbral de manejo somnoliento) salen de las fórmulas vivas, no de memoria.
 */

/**
 * Penalidad del aire acondicionado: +12% sobre el consumo base.
 * Espejo de src/lib/formulas/consumo-aire-acondicionado-auto-extra.ts (AC_PENALTY = 0.12),
 * mediana del rango 5–25% que publica el DOE/ORNL para manejo mixto.
 */
export const AC_PENALTY = 0.12;

/**
 * Velocidad representativa de ciudad usada por la fórmula original: 30 km/h.
 * En millas: 30 / 1,609344 = 18,64 mph. Se conserva el valor métrico convertido
 * para que el resultado coincida con la calculadora que este hub reemplaza.
 */
export const CITY_SPEED_MPH = 30 / 1.609344;

/**
 * Umbral de viaje de un día: más de 10 h totales y conviene partirlo.
 * Espejo de road-trip-time-distance-calculator.ts (OVERNIGHT_THRESHOLD_HRS),
 * basado en la investigación de la AAA Foundation sobre drowsy driving.
 */
export const OVERNIGHT_THRESHOLD_HRS = 10;

/** Factores exactos NIST Handbook 44 / SP 811. */
export const MI_PER_KM = 0.621371192;
export const L_PER_GAL = 3.785411784;

const DISCLAIMER =
  'Informational estimate based on the figures you enter. Real-world fuel economy varies with load, terrain, tire pressure, weather and driving style — treat the result as a planning number, not a guarantee.';

export const hub: HubData = {
  slug: 'en/cars/fuel-and-trip-cost',
  title: 'Road Trip Fuel Cost & Range Calculator',
  description:
    'Work out your tank range in miles, the real fuel cost of a road trip with rest stops, what running the A/C adds every month, and whether CNG beats gasoline for your annual mileage.',
  silo: 'Cars',
  siloHref: '/en/cars',
  locale: 'en',

  eyebrow: 'Fuel & driving costs',
  h1: 'How far will a tank get me, and what will this drive cost?',
  lede:
    'One place for the four questions that come up before every drive: how many miles are left in the tank, how long the trip really takes once you add rest stops, what the fuel bill comes to, and whether the A/C or a CNG conversion is worth what it costs you.',
  stamps: [
    'US units: miles, gallons, mpg',
    'A/C penalty from DOE/ORNL fuel-economy data',
    '10-hour drowsy-driving threshold (AAA Foundation)',
    'Replaces 5 single-purpose calculators',
  ],

  resultLabel: 'Your number for this trip',

  cases: {
    title: 'Which drive are you costing out?',
    intro:
      'Pick the situation and the calculator switches what it solves for — range and trip cost, the monthly A/C penalty, or the CNG-versus-gasoline comparison.',
    items: [
      {
        id: 'roadtrip',
        label: 'A road trip I am planning',
        hint: 'Long drive: total time with rest stops, fuel needed, cost and refuel count.',
        yes: [
          'Pure driving time from distance and average speed',
          'Rest stops added at your chosen interval and length',
          'Gallons burned and total fuel cost at your price per gallon',
          'How many fill-ups the trip needs, given your tank size',
        ],
        warn: [
          DISCLAIMER,
          'Average speed is not the speed limit: traffic, tolls and city segments pull it down. Use 5–10 mph below the posted limit for a realistic figure.',
          'Over 10 hours of total trip time, the AAA Foundation research puts drowsy-driving risk in a different league — split the drive.',
        ],
        plazo: 'Check fuel prices along the route the day before you leave — they swing a lot between states.',
        answer:
          'Enter distance, average speed and your mpg: you get total trip time with rest stops, gallons burned, fuel cost and how many stops to refuel.',
      },
      {
        id: 'range',
        label: 'How far is left in this tank',
        hint: 'Range from tank size and mpg, plus where the reserve light leaves you.',
        yes: [
          'Full-tank range in miles at your real mpg',
          'Miles you still have at the current fuel level',
          'A 10% safety reserve so you are not hunting for a station on fumes',
        ],
        warn: [
          DISCLAIMER,
          'Manufacturer mpg is a lab figure. Use the number from your own trip computer or from gallons-per-fill divided into miles-driven.',
          'City driving, a roof box, low tires or a headwind can cut real range by 15–25%.',
        ],
        plazo: 'Refuel with at least a quarter tank left: running the tank dry can starve an in-tank fuel pump.',
        answer:
          'Full-tank range = tank capacity (gallons) × fuel economy (mpg). Plan your stops on 90% of that, not 100%.',
      },
      {
        id: 'ac',
        label: 'What the air conditioning is costing me',
        hint: 'Extra gallons and dollars per month from running the A/C.',
        yes: [
          'Extra fuel burned per hour of A/C, at +12% over base consumption',
          'Monthly gallons and dollars for your daily A/C hours',
          'Share of your fuel bill that the compressor is responsible for',
        ],
        warn: [
          DISCLAIMER,
          'The +12% is the median of the 5–25% range the DOE reports. Old systems, stop-and-go traffic and hot climates sit at the top of that range.',
          'Above about 40 mph, running the A/C beats open windows — the aerodynamic drag of open windows costs more than the compressor.',
        ],
        plazo: 'Have the cabin filter and refrigerant charge checked once a year; a starved system runs the compressor harder for less cooling.',
        answer:
          'A/C adds roughly 12% to fuel consumption. At 30 mpg and one hour a day, that is about 0.07 gallons a day — a few dollars a month.',
      },
      {
        id: 'cng',
        label: 'CNG versus gasoline for my mileage',
        hint: 'Annual fuel cost on each, the yearly saving and the payback on a conversion.',
        yes: [
          'Annual fuel cost on gasoline at your mpg and price',
          'Annual fuel cost on CNG at your miles-per-GGE and price',
          'The yearly gap between the two, and years to pay back the conversion',
        ],
        warn: [
          DISCLAIMER,
          'CNG is sold per gasoline gallon equivalent (GGE = 5.66 lb of natural gas, DOE definition). Comparing per-kg or per-therm prices without converting produces a nonsense saving.',
          'CNG tanks have a legal service life (typically 15–20 years, stamped on the tank) and cost real money to recertify. Factor that in before the payback looks good.',
          'A CNG tank eats trunk space and adds 200–300 lb, which itself costs you a little fuel economy.',
        ],
        plazo: 'Payback only happens if you actually drive the mileage you entered — recheck after a year.',
        answer:
          'Annual saving = miles ÷ mpg × gas price − miles ÷ miles-per-GGE × CNG price. Divide the conversion cost by that saving to get the payback in years.',
      },
    ],
  },

  inputsTitle: 'Your car and your drive',
  inputsIntro:
    'Fill in what you know — the fields the selected case does not use are simply ignored. Use your real observed mpg, not the window sticker.',
  fields: [
    { id: 'distance', label: 'Trip distance', type: 'number', value: 300, suffix: 'miles', min: 0, step: 10, thousands: true, help: 'For the CNG case, enter your miles per year instead.' },
    { id: 'mpg', label: 'Fuel economy', type: 'number', value: 28, suffix: 'mpg', min: 1, step: 0.5, help: 'Miles driven ÷ gallons at the last fill-up.' },
    { id: 'tank', label: 'Tank capacity', type: 'number', value: 14, suffix: 'gallons', min: 1, step: 0.5 },
    { id: 'level', label: 'Fuel currently in the tank', type: 'number', value: 100, suffix: '% full', min: 0, max: 100, step: 5 },
    { id: 'price', label: 'Gasoline price', type: 'number', value: 3.2, prefix: '$', suffix: '/gal', min: 0, step: 0.05 },
    { id: 'speed', label: 'Average speed you expect', type: 'number', value: 62, suffix: 'mph', min: 1, step: 1, help: 'Door to door, including slow sections — not the speed limit.' },
    { id: 'breakevery', label: 'Rest stop every', type: 'number', value: 2, suffix: 'hours', min: 0.5, step: 0.5 },
    { id: 'breakmin', label: 'Each stop lasts', type: 'number', value: 15, suffix: 'minutes', min: 0, step: 5 },
    { id: 'achours', label: 'A/C running', type: 'number', value: 1.5, suffix: 'hours/day', min: 0, step: 0.5 },
    { id: 'cngmpg', label: 'CNG economy', type: 'number', value: 25, suffix: 'miles/GGE', min: 1, step: 0.5 },
    { id: 'cngprice', label: 'CNG price', type: 'number', value: 2.4, prefix: '$', suffix: '/GGE', min: 0, step: 0.05 },
    { id: 'cngcost', label: 'CNG conversion cost', type: 'number', value: 4500, prefix: '$', min: 0, step: 100, thousands: true },
  ],
  fineprint: DISCLAIMER,

  chart: {
    type: 'donut',
    title: 'Where the trip goes',
    caption:
      'The split of what you are paying or spending time on. In the road-trip case it is driving time versus rest stops; in the cost cases it is the share each fuel or the A/C accounts for.',
  },

  breakdownTitle: 'Line by line',
  breakdownIntro: 'Every figure below comes from the inputs above — no hidden multipliers.',

  faq: [
    {
      q: 'How do I work out my real mpg instead of using the sticker number?',
      a: 'Fill the tank, reset the trip odometer, drive normally until you refuel, then divide the miles on the trip odometer by the gallons it took to fill up again. Do it over two or three tanks and average them. That number is usually 10–20% below the EPA combined figure for real mixed driving, and it is the one worth planning around.',
    },
    {
      q: 'How much range does the low-fuel light actually leave me?',
      a: 'Most manufacturers trigger it with roughly 1.5 to 2.5 gallons left, which at 28 mpg is 40 to 70 miles. It is a warning, not a plan: the exact reserve varies by model and the gauge gets less accurate at the bottom. Treat a quarter tank as your refuel point on unfamiliar roads.',
    },
    {
      q: 'Does running the air conditioning really cost 12%?',
      a: 'The US Department of Energy puts the A/C penalty between 5% and 25% depending on outside temperature, humidity, traffic and how healthy the system is. The 12% used here is the median for mixed driving. On a hot day in stop-and-go traffic you will be at the top of that range; cruising on a mild highway you will be near the bottom.',
    },
    {
      q: 'Is it cheaper to open the windows instead of running the A/C?',
      a: 'Only at low speed. Below roughly 40 mph the drag penalty of open windows is small and the compressor is the bigger cost. Above that, open windows cost more in aerodynamic drag than the A/C costs in compressor load, so the windows-up, A/C-on option wins.',
    },
    {
      q: 'What is a GGE and why does CNG use it?',
      a: 'A gasoline gallon equivalent is the amount of compressed natural gas holding the same energy as one gallon of gasoline — 5.66 pounds under the DOE definition. Stations post CNG in GGE precisely so you can compare it against gasoline dollar for dollar. If a price is quoted per kilogram or per therm, convert it to GGE before comparing or the saving will be badly wrong.',
    },
    {
      q: 'How long does a CNG conversion take to pay for itself?',
      a: 'Divide the installed cost by your annual fuel saving. At 15,000 miles a year, 28 mpg, $3.20 gasoline and $2.40 per GGE at 25 miles/GGE, the saving is around $275 a year — a $4,500 conversion takes well over a decade, which is longer than most tanks are certified for. High-mileage drivers are the only ones for whom the maths works.',
    },
    {
      q: 'How often should I stop on a long drive?',
      a: 'The common guidance is a break every two hours or every 100 miles, and no more than about eight hours of driving in a day. The AAA Foundation research is what sits behind the 10-hour total-trip flag in this calculator: past that point, crash risk from fatigue climbs steeply regardless of how alert you feel.',
    },
    {
      q: 'Why is my trip time always longer than the calculation?',
      a: 'Because average speed is not cruising speed. Every stoplight, toll booth, construction zone, on-ramp and fuel stop pulls the door-to-door average down. On a mixed interstate route a 70 mph limit typically produces a 58–63 mph door-to-door average once you include everything.',
    },
    {
      q: 'How many fill-ups will a trip need?',
      a: 'Divide the trip distance by your full-tank range, then round up — and plan on refuelling at about 80–90% of range rather than 100%, so you are choosing the station rather than taking whatever appears. Rural interstate stretches in the western US can run over 100 miles between stations.',
    },
    {
      q: 'Does a roof box or a loaded car change any of this much?',
      a: 'Yes, more than most people expect. A roof box can cost 10–25% of your fuel economy at highway speed, and every 100 pounds of extra load costs roughly 1%. If you are packing heavy for the trip, drop your mpg input by 10% before planning your fuel stops.',
    },
    {
      q: 'Do tire pressure and tire size matter for these numbers?',
      a: 'Tire pressure does: under-inflation of 8 psi can cost around 3% of fuel economy and wears the shoulders out early. Tire size matters for a different reason — a larger overall diameter than stock makes the odometer and speedometer read low, which quietly inflates the mpg you calculate from them.',
    },
  ],

  sources: [
    { name: 'Fuel Economy in Hot Weather — air conditioning penalty', url: 'https://www.fueleconomy.gov/feg/hotweather.shtml', publisher: 'US Department of Energy / EPA' },
    { name: 'Alternative Fuel Price Report — gasoline gallon equivalent (GGE)', url: 'https://afdc.energy.gov/fuels/properties', publisher: 'DOE Alternative Fuels Data Center' },
    { name: 'Prevalence of Drowsy Driving Crashes', url: 'https://aaafoundation.org/prevalence-motor-vehicle-crashes-involving-drowsy-drivers-united-states-2009-2013/', publisher: 'AAA Foundation for Traffic Safety' },
    { name: 'NIST Special Publication 811 — unit conversion factors', url: 'https://www.nist.gov/pml/special-publication-811', publisher: 'NIST' },
    { name: 'Tires and fuel economy — inflation pressure', url: 'https://www.nhtsa.gov/equipment/tires', publisher: 'NHTSA' },
  ],

  replaces: [
    '/en/fuel-tank-range-calculator',
    '/en/extra-ac-fuel-consumption',
    '/en/gnc-vs-gasoline-annual-savings',
    '/en/drive-time-calculator-stops',
    '/en/road-trip-time-distance-calculator',
  ],

  lastReviewed: '2026-07-28',
};
