import type { HubData } from '../types';

/**
 * Hub EN — "What is this car worth now, and what does owning it cost me?"
 *
 * Absorbe 4 calculadoras sueltas de valor, seguro y mantenimiento del mercado inglés.
 *
 * Nota de fórmulas: las dos calculadoras de depreciación que este hub reemplaza usaban
 * curvas DISTINTAS entre sí (20%/12% plana vs 18%/12%/7%/4% + castigo por kilometraje).
 * Se unifica en la curva granular, que es la que más se parece a los datos de reventa
 * publicados, y la diferencia queda reportada.
 */

/**
 * Curva de depreciación por año de antigüedad, en fracción de valor CONSERVADO.
 * Espejo de src/lib/formulas/auto-usado-valor-depreciacion-anos-antiguedad.ts:
 *   año 1 → ×0,82   ·   años 2-4 → ×0,88   ·   años 5-10 → ×0,93   ·   11+ → ×0,96
 */
export const DEPRECIATION = { year1: 0.82, years2to4: 0.88, years5to10: 0.93, years11plus: 0.96 };

/**
 * Castigo por kilometraje acumulado. Mismo origen que la curva de arriba, convertido
 * a millas con el factor exacto de NIST (1 km = 0,621371192 mi):
 *   > 100.000 km ≈ 62.000 mi → ×0,92   ·   > 50.000 km ≈ 31.000 mi → ×0,96
 */
export const MILEAGE_PENALTY = { highMiles: 62000, highFactor: 0.92, midMiles: 31000, midFactor: 0.96 };

/**
 * Tasas anuales de prima como porcentaje del valor del vehículo, heredadas de
 * seguro-auto-cuota-mensual-cobertura.ts (rc 1% · intermedia 2,5% · todo riesgo 4%).
 * ATENCIÓN: en EE.UU. la prima se tarifa sobre el perfil del conductor, el estado y el
 * historial, no sobre el valor del auto. Se deja el porcentaje EDITABLE y se avisa.
 */
export const COVERAGE_RATES = { liability: 0.01, standard: 0.025, full: 0.04 };

/**
 * Intervalos de cambio de correa de distribución, en millas.
 * La fórmula original trabajaba en km (80.000 genérico / 90.000 VW / 100.000 Ford) y
 * devolvía NaN para cualquier marca fuera de su lista — acá el default es explícito.
 * Los valores en millas son los rangos que publican los fabricantes en el mercado US.
 */
export const BELT_INTERVALS_MI = { generic: 60000, extended: 90000, long: 105000, chain: 0 };

/** Aviso: la correa se cambia con este margen de anticipación. */
export const BELT_WARN_MI = 3000;

const DISCLAIMER =
  'Informational estimate based on the figures you enter. Resale values, insurance rates and service intervals vary by model, region and condition — confirm against your own quotes and your owner’s manual before spending money.';

export const hub: HubData = {
  slug: 'en/cars/car-value-and-ownership',
  title: 'Car Depreciation, Insurance and Maintenance Cost Calculator',
  description:
    'Estimate what your car is worth after N years and miles, what the insurance premium works out to per month, and when the timing belt is actually due — in one place, in US units.',
  silo: 'Cars',
  siloHref: '/en/cars',
  locale: 'en',

  eyebrow: 'Owning a car',
  h1: 'What is this car worth now, and what does owning it cost me?',
  lede:
    'Depreciation is the biggest line in the cost of owning a car and the one nobody writes down. This works out what the car is worth after the years and miles you have put on it, what the insurance adds every month, and whether the timing belt is a problem you can still ignore.',
  stamps: [
    'US units: miles and dollars',
    'Depreciation curve with a mileage adjustment',
    'Insurance rate left editable — US premiums are rated on the driver, not the car',
    'Replaces 4 single-purpose calculators',
  ],

  resultLabel: 'Your number',

  cases: {
    title: 'What are you trying to work out?',
    intro:
      'Pick the question and the calculator switches what it solves for. The fields the case does not use are ignored.',
    items: [
      {
        id: 'resale',
        label: 'What my car is worth today',
        hint: 'Value after N years and the miles on the odometer, plus what it has already lost.',
        yes: [
          'Age-based depreciation: −18% the first year, then −12%, −7% and −4% as it gets older',
          'A mileage adjustment on top for cars over roughly 31,000 and 62,000 miles',
          'The dollars and the percentage lost since new',
        ],
        warn: [
          DISCLAIMER,
          'This is a generic curve, not your model. Trucks, hybrids and anything in short supply hold value far better; luxury sedans and EVs with superseded battery tech fall much faster.',
          'Check the actual number against a live guide (KBB, Edmunds, NADA) before you accept or make an offer.',
        ],
        plazo: 'Depreciation is worst in the first 12 months — buying a one-to-two-year-old car skips the steepest part of the curve.',
        answer:
          'A typical car keeps about 82% of its value after year one, then loses roughly 12% a year through year four and less after that. High mileage takes another 4–8% off.',
      },
      {
        id: 'forecast',
        label: 'What it will be worth in a few years',
        hint: 'Projected residual value, so you can compare buying against leasing.',
        yes: [
          'Residual value at the end of the period you enter',
          'Total dollars lost to depreciation over that period',
          'Average depreciation cost per year and per month',
        ],
        warn: [
          DISCLAIMER,
          'Depreciation is not a bill you get, which is why people ignore it — but on a $30,000 car it is usually larger than fuel, insurance and servicing combined for the first few years.',
          'A lease quote effectively prices this same residual. If the leasing company’s residual is far above this estimate, the lease is being subsidised; far below, and you are paying for their pessimism.',
        ],
        plazo: 'Reprice a car you intend to sell every 6 months — model changes and fuel prices move used values fast.',
        answer:
          'Depreciation per year = (value today − projected value) ÷ years. Compare that against your annual fuel and insurance to see the real cost of the car.',
      },
      {
        id: 'insurance',
        label: 'What the insurance premium comes to',
        hint: 'Monthly and annual premium from the vehicle value and a rate you can edit.',
        yes: [
          'Monthly and annual premium from the rate you set',
          'Premium as a share of what the car is worth',
          'The difference between liability-only and full coverage at your numbers',
        ],
        warn: [
          DISCLAIMER,
          'In the United States, premiums are rated on the driver — age, ZIP code, driving record, credit-based insurance score in most states, annual mileage — not primarily on the value of the car. A percentage-of-value estimate is a sanity check, not a quote.',
          'Every state sets its own minimum liability limits, and the minimum is frequently far below what a serious injury claim costs. Do not treat the state minimum as adequate cover.',
          'Full coverage stops making sense once the car is worth only a few thousand dollars: the payout is capped at actual cash value minus the deductible.',
        ],
        plazo: 'Re-shop the policy at every renewal — loyalty is not usually rewarded in US auto insurance.',
        answer:
          'Annual premium ≈ vehicle value × your rate. Liability-only lands near 1% of value, full coverage near 4% — but your own quotes will vary far more than the car does.',
      },
      {
        id: 'belt',
        label: 'When the timing belt is due',
        hint: 'Next replacement mileage and how far you have left.',
        yes: [
          'Next service interval for the belt spacing you select',
          'Miles remaining before it is due',
          'A flag when you are inside the warning margin',
        ],
        warn: [
          DISCLAIMER,
          'On an interference engine — most modern four-cylinders — a snapped timing belt lets the valves hit the pistons and the repair usually costs more than the car is worth. This is the one interval not to gamble on.',
          'Belts also age out on time, not just miles: many manufacturers specify replacement at 7–10 years regardless of mileage. Rubber perishes in a car that mostly sits.',
          'If your engine uses a timing chain, there is no scheduled replacement — but a rattle at cold start means the tensioner or guides need attention now.',
        ],
        plazo: 'Do the water pump, tensioner and idlers at the same time — the labour to reach them is already paid for.',
        answer:
          'Take the interval from your owner’s manual (typically 60,000–105,000 miles), round your odometer up to the next multiple, and book it before you are within a few thousand miles.',
      },
    ],
  },

  inputsTitle: 'Your car',
  inputsIntro: 'Fill in what applies to the question you picked — the rest is ignored.',
  fields: [
    { id: 'price', label: 'Price when new', type: 'number', value: 32000, prefix: '$', min: 0, step: 500, thousands: true },
    { id: 'years', label: 'Age of the car', type: 'number', value: 4, suffix: 'years', min: 0, max: 40, step: 1 },
    { id: 'miles', label: 'Miles on the odometer', type: 'number', value: 48000, suffix: 'mi', min: 0, step: 1000, thousands: true },
    { id: 'ahead', label: 'Years ahead you want to project', type: 'number', value: 3, suffix: 'years', min: 1, max: 20, step: 1 },
    {
      id: 'coverage',
      label: 'Coverage level',
      type: 'select',
      value: 'full',
      options: [
        { value: 'liability', label: 'Liability only' },
        { value: 'standard', label: 'Liability + collision (standard)' },
        { value: 'full', label: 'Full coverage / comprehensive' },
      ],
    },
    { id: 'rate', label: 'Annual premium as a share of vehicle value', type: 'number', value: 4, suffix: '%', min: 0, max: 30, step: 0.1, help: 'Leave blank to use the default for the coverage level. Override it with a real quote if you have one.' },
    {
      id: 'belt',
      label: 'Timing belt interval',
      type: 'select',
      value: 'generic',
      options: [
        { value: 'generic', label: '60,000 mi (common belt interval)' },
        { value: 'extended', label: '90,000 mi (extended interval)' },
        { value: 'long', label: '105,000 mi (long-life belt)' },
        { value: 'chain', label: 'Timing chain — no scheduled change' },
      ],
    },
  ],
  fineprint: DISCLAIMER,

  chart: {
    type: 'donut',
    title: 'Value kept versus value gone',
    caption:
      'How much of the original price is still sitting in the car and how much has already gone to depreciation — or, in the insurance case, how the premium compares to what the car is worth.',
  },

  breakdownTitle: 'Line by line',
  breakdownIntro: 'Every figure comes from the inputs above and the curve documented in the source file.',

  faq: [
    {
      q: 'How much value does a new car lose in the first year?',
      a: 'Roughly 18–20% for a mainstream model, and the drop starts the moment the title changes hands. The curve used here takes 18% in year one, then about 12% a year through year four, 7% a year to year ten and 4% a year after that. That front-loading is why a one-year-old car with 12,000 miles is so often the best value on the lot.',
    },
    {
      q: 'Does mileage or age matter more for resale value?',
      a: 'Age matters more early, mileage matters more later. A three-year-old car with 20,000 miles and one with 45,000 miles are priced close together; a ten-year-old car with 60,000 miles and one with 180,000 miles are not remotely comparable. This calculator applies the age curve first and then an extra reduction past roughly 31,000 and 62,000 miles.',
    },
    {
      q: 'Which cars hold their value best?',
      a: 'Historically pickups, body-on-frame SUVs and a handful of reliability-reputation brands hold value well above the generic curve, while luxury sedans, large European saloons and early-generation EVs fall well below it. Supply matters too: anything with a long factory waiting list depreciates slowly until the backlog clears.',
    },
    {
      q: 'Why does my insurance quote look nothing like the estimate here?',
      a: 'Because US auto insurance is rated on the driver, not the car. Age, ZIP code, claims history, annual mileage, marital status and — in most states — a credit-based insurance score move the premium far more than the vehicle value does. A percentage-of-value figure is only useful as a rough sanity check on quotes you already have.',
    },
    {
      q: 'When should I drop full coverage?',
      a: 'The usual rule of thumb is when the annual premium for collision and comprehensive exceeds about 10% of the car’s actual cash value, because that is all the insurer will ever pay out, minus the deductible. On a car worth $3,000 with a $1,000 deductible, the most you can recover is $2,000 — check that against what the extra coverage costs you each year.',
    },
    {
      q: 'Is the state minimum liability limit enough?',
      a: 'Almost never. Several states still set minimums in the 25/50/25 range — $25,000 per person for injury — and a single serious hospital stay clears that in days. Anything above the minimum is cheap relative to the exposure, and an umbrella policy on top is cheaper still.',
    },
    {
      q: 'How do I know if my engine has a belt or a chain?',
      a: 'The owner’s manual maintenance schedule is the definitive answer: if a timing belt replacement appears in it with a mileage, you have a belt. If the schedule says nothing about timing components, it is almost certainly a chain. Do not go by engine family alone — manufacturers have switched between the two within the same model line.',
    },
    {
      q: 'What actually happens if a timing belt breaks?',
      a: 'On an interference engine, the camshaft stops while the crankshaft keeps turning, and the valves collide with the pistons. Bent valves, damaged guides and sometimes cracked pistons follow, and the repair frequently exceeds the value of an older car. On a non-interference engine the car simply stops and you replace the belt, but those designs are increasingly rare.',
    },
    {
      q: 'Should I replace the water pump with the timing belt?',
      a: 'On most belt-driven engines, yes. The pump sits behind the belt, so the labour is already being paid for, and a pump that fails 20,000 miles later means paying the entire job again. The same logic applies to the tensioner and idler pulleys.',
    },
    {
      q: 'Do timing belts expire on time as well as mileage?',
      a: 'Yes. Manufacturers commonly specify replacement at seven to ten years regardless of the odometer, because the rubber and its reinforcing cords degrade with heat cycling and age. A low-mileage car that spent a decade in a hot climate is exactly the case where people get caught out.',
    },
    {
      q: 'How do I compare buying against leasing with these numbers?',
      a: 'Run the projection case to get a residual value at the end of the lease term, then compare it with the residual the leasing company is assuming — it is implied by the monthly payment and the buyout price. If their residual is much higher than this estimate, the lease is being subsidised and may be the cheaper route; if it is much lower, you are paying for their caution.',
    },
  ],

  sources: [
    { name: 'Your Driving Costs — depreciation as a share of ownership cost', url: 'https://newsroom.aaa.com/auto/your-driving-costs/', publisher: 'AAA' },
    { name: 'Auto Insurance Basics — how premiums are rated', url: 'https://content.naic.org/consumer/auto-insurance.htm', publisher: 'NAIC (National Association of Insurance Commissioners)' },
    { name: 'Automobile Insurance — coverage types and state minimums', url: 'https://www.iii.org/article/what-auto-insurance-do-i-need', publisher: 'Insurance Information Institute' },
    { name: 'Vehicle maintenance schedules and service intervals', url: 'https://www.nhtsa.gov/vehicle-safety/vehicle-maintenance', publisher: 'NHTSA' },
    { name: 'NIST Special Publication 811 — unit conversion factors', url: 'https://www.nist.gov/pml/special-publication-811', publisher: 'NIST' },
  ],

  replaces: [
    '/en/car-depreciation-annual-residual-value',
    '/en/used-car-depreciation-calculator',
    '/en/auto-insurance-monthly-premium-coverage',
    '/en/timing-belt-change-interval-km',
  ],

  lastReviewed: '2026-07-28',
};
