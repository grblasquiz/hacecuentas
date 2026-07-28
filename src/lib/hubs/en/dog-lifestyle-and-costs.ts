import type { HubData } from '../types';

/**
 * Hub EN — "Does this dog fit my life, and what will it cost?"
 *
 * Absorbe 5 calculadoras: minutos de paseo, aptitud para departamento,
 * frecuencia de cepillado por manto y temporada, costo del primer año, y
 * litros de pecera (esta última entra SÓLO por URL — ver reporte).
 *
 * 🐛 Bugs heredados de las fórmulas originales, corregidos acá:
 *  - `costo-criar-cachorro-primer-ano.ts` NO tiene `__lang` y está íntegramente
 *    en PESOS ARGENTINOS (setup $90.000, alimento $17.000/kg) con
 *    `Intl.NumberFormat('es-AR')`: servía cifras argentinas en /en/ como si
 *    fueran del mercado estadounidense. Acá los costos son USD de fuentes US.
 *  - `perro-departamento-apto.ts` interpola el nombre ESPAÑOL de la raza
 *    ("Bulldog Francés", "Pastor Alemán", "Caniche / Poodle") dentro del texto
 *    inglés del insight.
 *  - `paseos-perro-minutos-raza-energia.ts` deja "evitar calor >25°C" en la
 *    rama inglesa: grados Celsius en un mercado que mide en Fahrenheit.
 */

/** Perros del catálogo original, con nombre en inglés y los datos que usan las ramas. */
export const DOG_BREEDS: Record<string, {
  label: string; size: string; aptOk: boolean; exercise: number;
  foodMin: number; foodMax: number; energy: string; brachy: boolean;
}> = {
  'labrador-retriever': { label: 'Labrador Retriever', size: 'large', aptOk: false, exercise: 90, foodMin: 300, foodMax: 450, energy: 'high', brachy: false },
  'golden-retriever': { label: 'Golden Retriever', size: 'large', aptOk: false, exercise: 90, foodMin: 280, foodMax: 420, energy: 'medium', brachy: false },
  'french-bulldog': { label: 'French Bulldog', size: 'small', aptOk: true, exercise: 30, foodMin: 130, foodMax: 200, energy: 'low', brachy: true },
  'english-bulldog': { label: 'English Bulldog', size: 'medium', aptOk: true, exercise: 30, foodMin: 220, foodMax: 320, energy: 'low', brachy: true },
  'german-shepherd': { label: 'German Shepherd', size: 'large', aptOk: false, exercise: 120, foodMin: 320, foodMax: 480, energy: 'high', brachy: false },
  beagle: { label: 'Beagle', size: 'medium', aptOk: true, exercise: 60, foodMin: 170, foodMax: 250, energy: 'medium', brachy: false },
  poodle: { label: 'Poodle', size: 'medium', aptOk: true, exercise: 60, foodMin: 200, foodMax: 350, energy: 'medium', brachy: false },
  chihuahua: { label: 'Chihuahua', size: 'toy', aptOk: true, exercise: 30, foodMin: 30, foodMax: 70, energy: 'low', brachy: false },
  rottweiler: { label: 'Rottweiler', size: 'large', aptOk: false, exercise: 90, foodMin: 400, foodMax: 600, energy: 'medium', brachy: false },
  'yorkshire-terrier': { label: 'Yorkshire Terrier', size: 'toy', aptOk: true, exercise: 30, foodMin: 40, foodMax: 80, energy: 'medium', brachy: false },
  boxer: { label: 'Boxer', size: 'large', aptOk: false, exercise: 90, foodMin: 280, foodMax: 420, energy: 'high', brachy: true },
  dachshund: { label: 'Dachshund', size: 'small', aptOk: true, exercise: 45, foodMin: 100, foodMax: 180, energy: 'medium', brachy: false },
  'siberian-husky': { label: 'Siberian Husky', size: 'large', aptOk: false, exercise: 120, foodMin: 250, foodMax: 400, energy: 'high', brachy: false },
  'shih-tzu': { label: 'Shih Tzu', size: 'small', aptOk: true, exercise: 30, foodMin: 80, foodMax: 140, energy: 'low', brachy: true },
  'pit-bull': { label: 'American Pit Bull Terrier', size: 'medium', aptOk: false, exercise: 90, foodMin: 250, foodMax: 400, energy: 'high', brachy: false },
};

/** Minutos/día de paseo para un adulto sano, por energía y tamaño (AKC / Kennel Club). */
export const WALK_BASE: Record<string, Record<string, number>> = {
  low: { toy: 25, small: 25, medium: 30, large: 35, giant: 40 },
  medium: { toy: 40, small: 40, medium: 55, large: 70, giant: 75 },
  high: { toy: 60, small: 60, medium: 80, large: 100, giant: 110 },
};

/** Multiplicador por edad sobre la base adulta. */
export const WALK_AGE_FACTOR: Record<string, number> = { puppy: 0.6, adult: 1.0, senior: 0.7 };

/** Cepillado: veces por semana en temporada normal, por tipo de manto. */
export const COATS: Record<string, { min: number; max: number; label: string; tool: string }> = {
  short: { min: 1, max: 2, label: 'Short smooth coat', tool: 'a rubber grooming glove or bristle brush' },
  medium: { min: 2, max: 3, label: 'Medium coat', tool: 'a slicker brush and a pin comb' },
  long: { min: 4, max: 7, label: 'Long coat', tool: 'a slicker brush, a wide comb and detangler' },
  double: { min: 3, max: 4, label: 'Double coat with undercoat', tool: 'an undercoat rake plus a slicker brush' },
  curly: { min: 3, max: 5, label: 'Curly or wavy coat', tool: 'a metal pin slicker brush' },
  wire: { min: 1, max: 1, label: 'Wire coat — schnauzer, terrier', tool: 'a slicker brush or a stripping comb' },
};

/**
 * Costo del primer año en DÓLARES, por franja de tamaño adulto.
 * Rangos de mercado estadounidense (ASPCA pet care costs, AKC puppy costs).
 */
export const FIRST_YEAR_USD: Record<string, { setup: number; vaccines: number; spay: number; microchip: number; vetExtras: number }> = {
  toy: { setup: 250, vaccines: 250, spay: 300, microchip: 50, vetExtras: 450 },
  small: { setup: 275, vaccines: 250, spay: 325, microchip: 50, vetExtras: 480 },
  medium: { setup: 325, vaccines: 275, spay: 400, microchip: 50, vetExtras: 520 },
  large: { setup: 425, vaccines: 300, spay: 550, microchip: 50, vetExtras: 650 },
};

/** Precio del alimento seco por libra, mercado US. */
export const FOOD_PRICE_PER_LB: Record<string, number> = {
  economy: 1.60,
  premium: 2.80,
  super_premium: 4.50,
};

/** Exacto por definición (NIST SP 811). */
export const G_PER_LB = 453.59237;

const DISCLAIMER =
  'Informational estimate, not veterinary or financial advice. Exercise needs, grooming and costs vary enormously with the individual animal, its health and where you live; a brachycephalic dog, an arthritic senior or a dog with a heart condition needs a plan from a veterinarian rather than a table.';

export const hub: HubData = {
  slug: 'en/pets/dog-lifestyle-and-costs',
  title: 'Dog Ownership Calculator — Walking Minutes, Apartment Fit, Shedding and First-Year Cost',
  description:
    'How many minutes a day a breed actually needs walked, whether it works in an apartment with your schedule, how often it needs brushing in and out of shedding season, and what the first year costs in dollars.',
  silo: 'Pets',
  siloHref: '/en/pets',
  locale: 'en',

  eyebrow: 'Fit & budget',
  h1: 'Does this dog fit my life, and what will it cost?',
  lede:
    'Two questions decide whether a dog works out, and both get answered after the adoption rather than before: how much of your day it needs, and how much of your money. Walking minutes, apartment fit, grooming load and a first-year budget in dollars — for fifteen of the most common breeds.',
  stamps: [
    'Walking targets from AKC and Kennel Club breed guidance',
    'First-year costs in US dollars, from ASPCA and AKC ownership figures',
    'Fixes an Argentine-peso cost model that was being served to US readers',
    'Replaces 5 single-purpose calculators',
  ],

  resultLabel: 'What it takes',

  cases: {
    title: 'What are you weighing up?',
    intro: 'Pick the question. Each case reads only the fields it needs.',
    items: [
      {
        id: 'walking',
        label: 'How long this dog needs walking',
        hint: 'Minutes a day, and how to split them across outings.',
        yes: [
          'Daily walking minutes for the breed, size and life stage',
          'How many outings and how long each one should be',
          'What kind of intensity actually counts',
        ],
        warn: [
          DISCLAIMER,
          'The AKC rule for puppies is five minutes of structured exercise per month of age, twice a day. Over-exercising a growing dog on hard surfaces before the growth plates close causes joint damage that shows up years later.',
          'Flat-faced breeds — bulldogs, pugs, boxers — cannot cool themselves efficiently and overheat at temperatures other dogs handle easily. Above about 77 °F, keep walks short, shaded and early, and treat panting that does not settle as an emergency.',
          'Sniffing is exercise. Twenty minutes of a dog reading the ground tires it more thoroughly than the same time spent marching, and for a high-energy breed the mental load is the part that prevents destructive behaviour.',
          'A senior with arthritis wants more walks, not longer ones. Short and frequent keeps joints moving without the day-after stiffness.',
        ],
        plazo: 'If the dog is restless, destructive or vocal in the evening, add fifteen minutes of sniffing-led walking rather than fifteen minutes of running — the deficit is usually mental.',
        answer:
          'A high-energy large breed needs about 100 minutes a day, a medium-energy medium dog around 55, and a low-energy small one about 25. Puppies get roughly 60% of the adult figure and seniors 70%, both split into more, shorter outings.',
      },
      {
        id: 'apartment',
        label: 'Whether this breed works in my apartment',
        hint: 'A fit score from breed, apartment size and hours left alone.',
        yes: [
          'A fit score out of ten with the reasons behind each deduction',
          'How much the hours you are out actually cost that score',
          'What would have to change to make it work',
        ],
        warn: [
          DISCLAIMER,
          'Apartment suitability is far more about exercise and time alone than about square footage. A greyhound is famously fine in a flat; a Jack Russell in the same flat with an absent owner is not.',
          'Ten hours alone is too long for any dog, in any home. That is a dog walker or daycare question, not a breed question, and separation-related behaviour problems are the usual result of ignoring it.',
          'Barking is what ends tenancies. High-alert breeds react to every corridor footstep, and in a building that is a neighbour problem within weeks.',
          'Check your lease and your local rules before the dog, not after. Breed restrictions and weight caps are common and are enforced.',
        ],
        plazo: 'Trial a full working day before committing: leave the dog alone for the length of your actual workday with a camera running, and watch what happens in the first thirty minutes.',
        answer:
          'Small and low-energy breeds score well in apartments almost regardless of size. Large or high-energy breeds lose points fast in a small flat, and any breed loses points beyond about eight hours alone a day.',
      },
      {
        id: 'shedding',
        label: 'How often this coat needs brushing',
        hint: 'Times a week, in and out of shedding season.',
        yes: [
          'Brushing frequency for the coat type in normal season',
          'What that becomes during the spring and autumn blow-out',
          'The tool that actually works on that coat',
        ],
        warn: [
          DISCLAIMER,
          'Never shave a double coat. The undercoat is the thermoregulating layer and it insulates against heat as well as cold; shaving it can permanently ruin the regrowth and leaves the skin exposed to sunburn.',
          'Matting is not cosmetic. A mat tightens against the skin, cuts off airflow and traps moisture, and severe matting causes sores and requires clipping under sedation.',
          'Wire coats are maintained by hand stripping, not clipping. Clipping a wire coat softens it permanently and changes its colour.',
          'Brushing is also a skin exam. Lumps, ticks, hot spots and fleas all turn up during a brush long before they turn up any other way.',
        ],
        plazo: 'During the spring and autumn blow-out, brush a double coat daily for two to three weeks. Skipping it does not reduce the hair, it just relocates it to your floor.',
        answer:
          'Short smooth coats need brushing once or twice a week, medium coats two or three times, double coats three or four, and long coats four to seven. In shedding season the frequency rises by roughly half, capped at daily.',
      },
      {
        id: 'cost',
        label: 'What the first year costs',
        hint: 'Setup, vaccines, spay, food and routine vet care, in dollars.',
        yes: [
          'Every line of the first-year budget, in US dollars',
          'The one-off spend that will not repeat next year',
          'The monthly figure that actually matters for a budget',
        ],
        warn: [
          DISCLAIMER,
          'This excludes the purchase or adoption fee, which ranges from a shelter fee of around $50 to several thousand dollars from a breeder, and it excludes emergencies. An unexpected surgery of $2,000 to $5,000 is a routine event over a dog\'s life, and roughly a third of pets need unexpected veterinary care in any given year.',
          'Costs vary by a factor of two or three across the US. Urban veterinary practices, grooming and boarding are substantially more expensive than rural ones, and prices for the same procedure vary widely within one city.',
          'Pet insurance is a separate line not counted here, typically $30 to $70 a month for a dog, and premiums rise with age and breed.',
          'The first year is the most expensive by a wide margin, but years two onwards are not free — food, preventives and annual exams continue indefinitely, and the last years of a dog\'s life are usually the second most expensive.',
        ],
        plazo: 'Open a separate account and move the monthly figure into it from month one. The emergency that arrives in year three is the reason the account exists.',
        answer:
          'Budget roughly $1,500 to $2,500 for the first year of a medium-sized dog on premium food, of which about half is the one-off setup: supplies, the puppy vaccine series, spay or neuter, and microchipping.',
      },
    ],
  },

  inputsTitle: 'Your dog and your situation',
  inputsIntro: 'Fill in what the case you picked needs — the other fields are ignored.',
  fields: [
    {
      id: 'breed',
      label: 'Breed',
      type: 'select',
      value: 'beagle',
      options: [
        { value: 'labrador-retriever', label: 'Labrador Retriever' },
        { value: 'golden-retriever', label: 'Golden Retriever' },
        { value: 'french-bulldog', label: 'French Bulldog' },
        { value: 'english-bulldog', label: 'English Bulldog' },
        { value: 'german-shepherd', label: 'German Shepherd' },
        { value: 'beagle', label: 'Beagle' },
        { value: 'poodle', label: 'Poodle' },
        { value: 'chihuahua', label: 'Chihuahua' },
        { value: 'rottweiler', label: 'Rottweiler' },
        { value: 'yorkshire-terrier', label: 'Yorkshire Terrier' },
        { value: 'boxer', label: 'Boxer' },
        { value: 'dachshund', label: 'Dachshund' },
        { value: 'siberian-husky', label: 'Siberian Husky' },
        { value: 'shih-tzu', label: 'Shih Tzu' },
        { value: 'pit-bull', label: 'American Pit Bull Terrier' },
      ],
    },
    {
      id: 'lifestage',
      label: 'Life stage',
      type: 'select',
      value: 'adult',
      options: [
        { value: 'puppy', label: 'Puppy, under 1 year' },
        { value: 'adult', label: 'Adult' },
        { value: 'senior', label: 'Senior, 8 years and older' },
      ],
    },
    {
      id: 'energy',
      label: 'Energy level of your individual dog',
      type: 'select',
      value: 'breed',
      options: [
        { value: 'breed', label: 'Use the breed default' },
        { value: 'low', label: 'Low — settles easily, short bursts' },
        { value: 'medium', label: 'Medium — wants a proper walk daily' },
        { value: 'high', label: 'High — restless without real exercise' },
      ],
    },
    {
      id: 'homesize',
      label: 'Apartment size',
      type: 'select',
      value: 'medium',
      options: [
        { value: 'small', label: 'Small — studio or one bedroom, no outdoor space' },
        { value: 'medium', label: 'Medium — two bedrooms, or a balcony' },
        { value: 'large', label: 'Large — three or more bedrooms, or a yard' },
      ],
    },
    { id: 'hoursalone', label: 'Hours the dog is left alone', type: 'number', value: 8, suffix: 'hours/day', min: 0, max: 24, step: 1 },
    {
      id: 'coat',
      label: 'Coat type',
      type: 'select',
      value: 'double',
      options: [
        { value: 'short', label: 'Short and smooth — beagle, boxer' },
        { value: 'medium', label: 'Medium — border collie, spaniel' },
        { value: 'long', label: 'Long — Afghan, Shih Tzu, Yorkshire' },
        { value: 'double', label: 'Double coat with undercoat — husky, German shepherd' },
        { value: 'curly', label: 'Curly or wavy — poodle, bichon' },
        { value: 'wire', label: 'Wire — schnauzer, wire terrier' },
      ],
    },
    {
      id: 'season',
      label: 'Season',
      type: 'select',
      value: 'normal',
      options: [
        { value: 'normal', label: 'Normal season, no heavy shedding' },
        { value: 'shedding', label: 'Shedding season, spring or fall' },
      ],
    },
    {
      id: 'foodquality',
      label: 'Food you plan to buy',
      type: 'select',
      value: 'premium',
      options: [
        { value: 'economy', label: 'Grocery-store brand, about $1.60/lb' },
        { value: 'premium', label: 'Premium, about $2.80/lb' },
        { value: 'super_premium', label: 'Super-premium or veterinary, about $4.50/lb' },
      ],
    },
    {
      id: 'includespay',
      label: 'Include spay or neuter in the budget?',
      type: 'select',
      value: 'yes',
      options: [
        { value: 'yes', label: 'Yes' },
        { value: 'no', label: 'No — already done, or not planned this year' },
      ],
    },
  ],
  fineprint: DISCLAIMER,

  chart: {
    type: 'bars',
    title: 'What the number is made of',
    caption:
      'The pieces behind the answer — the dollars in each category of the first-year budget, the walking split, or the deductions from the apartment score.',
  },

  breakdownTitle: 'Line by line',
  breakdownIntro: 'Money is in US dollars. Food weights come from breed-typical intake and are priced per pound at US retail.',

  faq: [
    {
      q: 'How long should I walk my dog each day?',
      a: 'A high-energy large breed such as a husky or German shepherd needs around 100 to 120 minutes, a medium-energy medium dog such as a beagle around 55, and a low-energy small dog such as a Shih Tzu about 25. Split it into at least two outings. Puppies get roughly 60% of the adult figure and seniors 70%, both across more, shorter walks.',
    },
    {
      q: 'How much exercise does a puppy need?',
      a: 'The AKC guideline is five minutes of structured exercise per month of age, up to twice a day — so fifteen minutes twice daily for a three-month-old. Free play in a garden does not count against that limit; forced running, long hikes and hard surfaces do, because the growth plates have not closed and joint damage from over-exercise appears years later.',
    },
    {
      q: 'Can a large dog live in an apartment?',
      a: 'Often yes, and better than many small ones. Greyhounds, great Danes and mastiffs are famously low-activity indoors and settle for most of the day. The breeds that struggle are the high-drive working ones — border collies, huskies, Belgian malinois — regardless of size. Time alone and exercise matter far more than square footage.',
    },
    {
      q: 'How many hours can a dog be left alone?',
      a: 'Four to six hours is comfortable for a healthy adult. Eight is the practical ceiling for most, and ten is too long for any dog. Puppies cannot hold a bladder anywhere near that and need a break roughly every hour per month of age. Past six hours the honest answer is a midday walker or daycare, not a different breed.',
    },
    {
      q: 'How often should I brush my dog?',
      a: 'Once or twice a week for a short smooth coat, two or three times for a medium one, three or four for a double coat, four to seven for a long coat, and about weekly for wire. During the spring and autumn blow-out, increase by about half — for a double coat that means daily for two to three weeks.',
    },
    {
      q: 'Should I shave my double-coated dog in summer?',
      a: 'No. The undercoat insulates against heat as well as cold, and shaving removes the dog\'s own cooling system while exposing skin to sunburn. Regrowth after a shave is frequently patchy and permanently altered in texture. What helps in heat is thorough de-shedding with an undercoat rake, shade and water.',
    },
    {
      q: 'Why does my dog shed so much in spring and fall?',
      a: 'Shedding is driven by daylight hours rather than temperature, which is why indoor dogs under artificial light often shed lightly year-round instead of in two bursts. Double-coated breeds blow the entire undercoat over two to three weeks twice a year, and no amount of brushing reduces the total — it only decides whether it lands in the brush or on the sofa.',
    },
    {
      q: 'How much does a puppy cost in the first year?',
      a: 'Roughly $1,500 to $2,500 for a medium dog on premium food, excluding the purchase or adoption fee. About half is one-off: supplies and a crate, the vaccine series, spay or neuter, and a microchip. The rest is food and routine veterinary care. A large breed on super-premium food comfortably passes $3,000.',
    },
    {
      q: 'What is the most expensive part of the first year?',
      a: 'The one-off setup, taken together — crate, bed, bowls, leads, carrier, the puppy vaccine series, spay or neuter and microchipping typically add up to more than a year of food for a small or medium dog. For a large dog food catches up, because a big dog eats two to three times what a small one does every single day.',
    },
    {
      q: 'Does dog food quality really change the budget that much?',
      a: 'Substantially, and it scales with the dog. A large dog eating roughly 400 grams a day gets through about 320 lb a year; at $1.60 a pound that is around $510 and at $4.50 a pound around $1,440. For a chihuahua eating 50 grams a day the same price gap is worth under $130 a year, which is why food quality is a bigger financial decision for big dogs.',
    },
    {
      q: 'What costs am I forgetting?',
      a: 'Emergencies, primarily. Around one in three pets needs unexpected veterinary care in a given year, and a single emergency surgery runs $2,000 to $5,000. Then boarding or pet-sitting during travel, professional grooming for long and curly coats at $60 to $100 a session, training classes, a deposit or pet rent on a lease, and dental cleaning under anaesthesia every few years.',
    },
    {
      q: 'Is pet insurance worth it?',
      a: 'It is a budgeting decision rather than a value one. Premiums typically run $30 to $70 a month for a dog and rise with age, and most policies exclude pre-existing conditions — so it is worth most when bought young and healthy. The alternative is a dedicated savings account, which works only if you genuinely fund it monthly and never touch it.',
    },
  ],

  sources: [
    { name: 'Cutting pet care costs — typical annual and first-year expenses', url: 'https://www.aspca.org/pet-care/general-pet-care/cutting-pet-care-costs', publisher: 'ASPCA' },
    { name: 'How much does it cost to own a dog', url: 'https://www.akc.org/expert-advice/dog-owner-guide/how-much-does-it-cost-to-own-a-dog/', publisher: 'American Kennel Club' },
    { name: 'How much exercise does a dog need', url: 'https://www.akc.org/expert-advice/health/how-much-exercise-does-dog-need/', publisher: 'American Kennel Club' },
    { name: 'Dog grooming and coat care', url: 'https://www.akc.org/expert-advice/health/dog-grooming-tips/', publisher: 'American Kennel Club' },
    { name: 'Brachycephalic obstructive airway syndrome and heat risk', url: 'https://www.avma.org/resources-tools/pet-owners/petcare/brachycephalic-dogs', publisher: 'American Veterinary Medical Association' },
    { name: 'Separation anxiety and time alone', url: 'https://www.aspca.org/pet-care/dog-care/common-dog-behavior-issues/separation-anxiety', publisher: 'ASPCA' },
    { name: 'Aquarium stocking and water volume guidance', url: 'https://www.avma.org/resources-tools/pet-owners/petcare/selecting-pet-fish', publisher: 'American Veterinary Medical Association' },
    { name: 'NIST Special Publication 811 — exact conversion factors', url: 'https://www.nist.gov/pml/special-publication-811', publisher: 'NIST' },
  ],

  replaces: [
    '/en/dog-walking-minutes-by-breed',
    '/en/dog-apartment-compatibility',
    '/en/dog-shedding-by-season-calculator',
    '/en/puppy-cost-first-year',
    '/en/fish-tank-water-calculator',
  ],

  lastReviewed: '2026-07-28',
};
