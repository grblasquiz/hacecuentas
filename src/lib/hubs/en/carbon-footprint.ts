import type { HubData } from '../types';

/**
 * Hub EN — "How big is this thing's carbon footprint, and what would offset it?"
 *
 * Absorbe 5 calculadoras sueltas de huella: vuelo, streaming, mascota, boda y
 * tiempo de biodegradación de un residuo.
 *
 * Todas las constantes son espejo de las fórmulas vivas del repo; ninguna sale de memoria.
 */

/**
 * Factores de emisión de vuelo, en kg CO₂ por kilómetro-pasajero.
 * Espejo de src/lib/formulas/compensacion-co2-arboles-vuelo.ts (0,15 economy / 0,45 business).
 * Convertidos a milla: × 1,609344.
 */
export const FLIGHT_KG_PER_MI = { economy: 0.15 * 1.609344, business: 0.45 * 1.609344 };

/**
 * Streaming: gramos de CO₂ por hora según calidad.
 * Espejo de huella-carbono-streaming-video-horas.ts (SD 10 · HD 36 · 4K 75).
 */
export const STREAM_G_PER_HOUR = { sd: 10, hd: 36, uhd: 75 };

/**
 * Mascota: kg CO₂ por año y por kilo de peso del animal.
 * Espejo de huella-carbono-mascota-anual.ts (perro 120 · gato 90).
 */
export const PET_KG_PER_KG_YEAR = { dog: 120, cat: 90 };

/**
 * Evento: kg CO₂ por invitado. Espejo de huella-carbono-boda-evento.ts (150 kg/invitado).
 */
export const EVENT_KG_PER_GUEST = 150;

/**
 * Absorción de un árbol: 22 kg CO₂ al año. Es la constante que usan las tres
 * calculadoras de huella que este hub reemplaza, y el valor que suelen citar los
 * programas de reforestación para un árbol joven en crecimiento.
 */
export const TREE_KG_PER_YEAR = 22;

/** 1 lb = 0,45359237 kg (exacto). 1 mile = 1,609344 km (exacto). */
export const KG_PER_LB = 0.45359237;

/**
 * Tiempos de biodegradación. Espejo de biodegradacion-residuo-tiempo.ts, con los
 * mismos rangos y la misma clasificación rápido/medio/lento.
 */
export const DECAY: Record<string, { label: string; time: string; band: 'fast' | 'mid' | 'slow'; years: number }> = {
  fruit: { label: 'Fruit and vegetable scraps', time: '2–4 weeks', band: 'fast', years: 0.06 },
  paper: { label: 'Paper', time: '2–5 months', band: 'fast', years: 0.3 },
  cotton: { label: 'Cotton fabric', time: '1–5 months', band: 'fast', years: 0.25 },
  carton: { label: 'Carton / drink box', time: '30–40 years', band: 'mid', years: 35 },
  can: { label: 'Aluminum or steel can', time: '10–500 years', band: 'slow', years: 200 },
  plastic: { label: 'Plastic bottle', time: '450+ years', band: 'slow', years: 450 },
  diaper: { label: 'Disposable diaper', time: '500+ years', band: 'slow', years: 500 },
  glass: { label: 'Glass', time: '~4,000 years', band: 'slow', years: 4000 },
  tire: { label: 'Tire', time: '1,000+ years', band: 'slow', years: 1000 },
};

const DISCLAIMER =
  'Informational estimate. Carbon accounting depends heavily on methodology, grid mix and assumptions — different calculators legitimately produce different numbers for the same activity. Use this to compare choices against each other, not as a certified inventory figure.';

export const hub: HubData = {
  slug: 'en/life/carbon-footprint',
  title: 'Carbon Footprint Calculator: Flights, Streaming, Pets and Events',
  description:
    'Estimate the CO₂ behind a flight, your streaming habit, your pet and your wedding — and how many trees it would take to offset each one, plus how long common waste takes to break down.',
  silo: 'Everyday Life',
  siloHref: '/en/life',
  locale: 'en',

  eyebrow: 'Environment',
  h1: 'How big is this carbon footprint, and what would offset it?',
  lede:
    'Carbon numbers only mean something next to each other. This puts a flight, a year of streaming, a dog, a 120-guest wedding and a plastic bottle on the same scale, in kilograms of CO₂ and in trees — so you can see which choices actually move the needle and which are rounding errors.',
  stamps: [
    'One tree absorbs about 22 kg of CO₂ a year',
    'Results in kg, US tons and trees',
    'Emission factors documented in the source file',
    'Replaces 5 single-purpose calculators',
  ],

  resultLabel: 'Estimated footprint',

  cases: {
    title: 'What are you measuring?',
    intro:
      'Pick the activity. Each case uses a different emission factor, all of them documented and all of them approximations — the point is the comparison, not the decimal place.',
    items: [
      {
        id: 'flight',
        label: 'A flight I am taking',
        hint: 'CO₂ per passenger for the distance and cabin, and the trees to offset it.',
        yes: [
          'Emissions for the distance flown, per passenger',
          'A cabin multiplier: a business seat takes roughly three times the floor space of economy',
          'Trees needed to absorb it over a year, and the round-trip figure',
        ],
        warn: [
          DISCLAIMER,
          'Short flights are worse per mile than long ones: takeoff and climb burn a disproportionate share of the fuel, so a 300-mile hop is far less efficient per passenger-mile than a transatlantic leg.',
          'This counts CO₂ only. Contrails and high-altitude nitrogen oxides add a warming effect that many methodologies capture with a radiative-forcing multiplier of roughly 1.7 to 3 — meaning the climate impact is larger than the CO₂ figure alone.',
          'Buying offsets does not undo the emission. Additionality and permanence in offset projects are genuinely contested; flying less remains the only reliable reduction.',
        ],
        plazo: 'Direct flights beat connections for the same trip, because you pay the takeoff penalty once instead of twice.',
        answer:
          'A flight emits roughly 0.24 kg of CO₂ per passenger-mile in economy and about three times that in business. A 2,500-mile economy flight is around 600 kg — about 28 trees for a year.',
      },
      {
        id: 'streaming',
        label: 'My streaming habit',
        hint: 'CO₂ per day, month and year from video streaming at your usual quality.',
        yes: [
          'Emissions per hour at SD, HD and 4K',
          'Your monthly and annual totals',
          'What dropping from 4K to HD would save you',
        ],
        warn: [
          DISCLAIMER,
          'Streaming emissions estimates vary wildly between studies — early figures were later revised down by more than an order of magnitude. The relative comparison between 4K and HD is far more reliable than the absolute number.',
          'The device matters more than the stream: a large TV draws vastly more power than a phone for the same video, and that end-device consumption is usually the largest single component.',
          'Everything here scales with your local electricity mix. The same hour of video costs several times more CO₂ on a coal-heavy grid than on a hydro or nuclear one.',
        ],
        plazo: 'If you only want one change: stop autoplay on background viewing, where nobody is watching at all.',
        answer:
          'Roughly 10 g of CO₂ an hour in SD, 36 g in HD and 75 g in 4K. Two hours a day of 4K is about 55 kg a year — noticeable, but a fraction of a single flight.',
      },
      {
        id: 'pet',
        label: 'My pet',
        hint: 'Annual CO₂ from a dog or a cat, driven almost entirely by the diet.',
        yes: [
          'Annual emissions scaled by the animal’s body weight',
          'A dog factor higher than a cat’s, reflecting food volume',
          'Trees to offset a year of ownership',
        ],
        warn: [
          DISCLAIMER,
          'Almost all of this is the food, and specifically the meat in it. A large dog on premium meat-heavy food can exceed the figure here substantially; one fed largely on by-products and rendered protein — the parts of the animal humans do not eat — comes in far below it.',
          'By-product-based pet food arguably carries little marginal footprint at all, because it uses material that would otherwise be waste. Methodologies disagree sharply here, which is why pet-footprint estimates span a very wide range.',
        ],
        plazo: 'Portion control does double duty: most measurable reductions come from not overfeeding, which is also better for the animal.',
        answer:
          'Around 120 kg of CO₂ a year per kilogram of body weight for a dog and 90 for a cat. A 20 kg dog lands near 2.4 tonnes a year on that basis — dominated by diet assumptions.',
      },
      {
        id: 'event',
        label: 'A wedding or big event',
        hint: 'CO₂ per guest and the total for the guest list.',
        yes: [
          'Per-guest emissions covering travel, catering and venue energy',
          'The total for your guest count',
          'What trimming the guest list would save',
        ],
        warn: [
          DISCLAIMER,
          'Guest travel usually dominates everything else combined. One guest flying in from another continent can outweigh the entire catering footprint of the reception.',
          'The per-guest factor is a broad average. A local afternoon event with vegetarian catering sits far below it; a destination wedding with a hundred flights sits far above.',
        ],
        plazo: 'The single largest lever is venue choice: somewhere most guests can reach without flying beats every other change put together.',
        answer:
          'Around 150 kg of CO₂ per guest as a planning average. A 120-guest wedding comes to roughly 18 tonnes — about 820 trees for a year.',
      },
      {
        id: 'waste',
        label: 'How long this rubbish lasts',
        hint: 'Time for a common material to break down, from weeks to millennia.',
        yes: [
          'Typical decomposition time for the material',
          'Whether it belongs in compost, recycling or landfill',
          'How it compares to a human lifetime',
        ],
        warn: [
          DISCLAIMER,
          'These are open-environment estimates. In a modern sealed landfill, with no oxygen and little moisture, even paper and food waste can survive for decades — landfills mummify rubbish rather than digesting it.',
          'Plastic does not really biodegrade at all: it fragments into microplastics, which is a different and arguably worse outcome than decomposition.',
        ],
        plazo: 'Glass and aluminum are infinitely recyclable and the recycling saves enormous energy — those two are always worth separating.',
        answer:
          'Fruit scraps take weeks, paper months, a carton decades, a plastic bottle over 450 years and glass roughly 4,000.',
      },
    ],
  },

  inputsTitle: 'Your numbers',
  inputsIntro: 'Fill in the fields for the case you picked — the others are ignored.',
  fields: [
    { id: 'miles', label: 'Flight distance, one way', type: 'number', value: 2500, suffix: 'miles', min: 0, step: 100, thousands: true },
    {
      id: 'cabin',
      label: 'Cabin',
      type: 'select',
      value: 'economy',
      options: [
        { value: 'economy', label: 'Economy' },
        { value: 'business', label: 'Business or first' },
      ],
    },
    { id: 'hours', label: 'Streaming', type: 'number', value: 2, suffix: 'hours/day', min: 0, max: 24, step: 0.5 },
    {
      id: 'quality',
      label: 'Usual quality',
      type: 'select',
      value: 'hd',
      options: [
        { value: 'sd', label: 'SD (480p)' },
        { value: 'hd', label: 'HD (1080p)' },
        { value: 'uhd', label: '4K / UHD' },
      ],
    },
    {
      id: 'pet',
      label: 'Pet',
      type: 'select',
      value: 'dog',
      options: [
        { value: 'dog', label: 'Dog' },
        { value: 'cat', label: 'Cat' },
      ],
    },
    { id: 'petweight', label: 'Pet weight', type: 'number', value: 45, suffix: 'lb', min: 1, max: 250, step: 1 },
    { id: 'guests', label: 'Guests at the event', type: 'number', value: 120, min: 0, step: 10, thousands: true },
    {
      id: 'material',
      label: 'Material',
      type: 'select',
      value: 'plastic',
      options: [
        { value: 'fruit', label: 'Fruit and vegetable scraps' },
        { value: 'paper', label: 'Paper' },
        { value: 'cotton', label: 'Cotton fabric' },
        { value: 'carton', label: 'Carton / drink box' },
        { value: 'can', label: 'Aluminum or steel can' },
        { value: 'plastic', label: 'Plastic bottle' },
        { value: 'diaper', label: 'Disposable diaper' },
        { value: 'glass', label: 'Glass' },
        { value: 'tire', label: 'Tire' },
      ],
    },
  ],
  fineprint: DISCLAIMER,

  chart: {
    type: 'donut',
    title: 'How this compares',
    caption:
      'Your result set against a reference point — a round trip, a year of the same habit, or the share of a typical footprint it represents.',
  },

  breakdownTitle: 'Line by line',
  breakdownIntro:
    'Emission factors are the ones documented in the source file; each row names the factor it used so you can substitute your own.',

  faq: [
    {
      q: 'How much CO₂ does one tree absorb in a year?',
      a: 'The working figure used throughout this calculator is 22 kg a year, which is a common planning assumption for a young tree in active growth. Mature trees absorb more, seedlings much less, and a tree only counts as an offset if it survives for decades — which is exactly why offset quality is so contested.',
    },
    {
      q: 'Why do different flight calculators give completely different answers?',
      a: 'They make different choices: whether to count only CO₂ or all greenhouse gases, whether to apply a radiative-forcing multiplier for contrails, what load factor and aircraft type to assume, and how to split emissions between cabin classes and between passengers and freight. Each of those is defensible, and together they can move the result by a factor of three.',
    },
    {
      q: 'Why does business class count for so much more?',
      a: 'Because the emissions are divided by the number of passengers the aircraft carries, and a business seat occupies roughly three times the floor area of an economy seat. Fly first class and you are responsible for a proportionally larger slice of the same fuel burn. Nothing about the seat itself emits more.',
    },
    {
      q: 'Is streaming video actually bad for the climate?',
      a: 'Much less than headlines once suggested. Early estimates were revised down dramatically once researchers separated network transmission — which is remarkably efficient per gigabyte — from the power drawn by the screen you are watching on. The device is usually the dominant term, so watching on a phone rather than a 65-inch TV changes far more than the resolution setting does.',
    },
    {
      q: 'Does dropping from 4K to HD make a real difference?',
      a: 'It roughly halves the data-related portion, and the relative comparison is the reliable part of any streaming estimate. Whether that matters depends on your context: for someone streaming several hours a day on a large screen it is a measurable annual saving, and for occasional viewing it is noise next to a single car trip.',
    },
    {
      q: 'Do pets really have a meaningful carbon footprint?',
      a: 'Their diet does, because meat production is carbon-intensive. But the estimates published for pets vary by an order of magnitude, largely over one question: whether pet food made from slaughter by-products should carry a footprint at all, given that the material would otherwise be waste. Treat any pet figure, including this one, as an upper-bound style estimate.',
    },
    {
      q: 'What is the biggest carbon lever at a wedding?',
      a: 'Where you hold it. Guest travel typically dwarfs catering, flowers, venue power and everything else combined, so a venue most guests can drive to beats every other sustainability decision on the list. After that, the catering menu — specifically how much beef and lamb is on it — is the next largest term.',
    },
    {
      q: 'Should I buy carbon offsets?',
      a: 'Offsets are a supplement, never a substitute, and their quality varies enormously. The hard questions are additionality — would the reduction have happened anyway — and permanence, since a forest that burns in fifteen years releases everything it stored. If you buy them, prefer verified removal projects over avoided-emissions credits, and treat the purchase as additional to reducing, not as permission.',
    },
    {
      q: 'How long does plastic actually take to break down?',
      a: 'Commonly quoted as 450 years and upward, but the framing is misleading: most plastics do not biodegrade, they photodegrade into ever-smaller fragments. The bottle stops being a bottle long before the polymer stops existing, and the microplastics that result are their own environmental problem.',
    },
    {
      q: 'Do things biodegrade in a landfill the way these times suggest?',
      a: 'No. Modern sanitary landfills are engineered to exclude air and water, which is what decomposition needs. Newspapers have been excavated still legible after decades. These figures describe an open environment — compost heap, roadside, ocean — not a sealed landfill cell.',
    },
    {
      q: 'What is the single biggest thing an individual can change?',
      a: 'For most people in high-income countries it is, in rough order: flying less, driving less or switching to an electric vehicle on a clean grid, home heating, and diet — particularly beef and lamb. Recycling and unplugging chargers matter, but they are one to two orders of magnitude smaller, and treating them as equivalent is how people end up feeling busy without moving the number.',
    },
  ],

  sources: [
    { name: 'Greenhouse gas reporting: conversion factors', url: 'https://www.gov.uk/government/collections/government-conversion-factors-for-company-reporting', publisher: 'UK DESNZ / DEFRA' },
    { name: 'Carbon Footprint Factsheet', url: 'https://css.umich.edu/publications/factsheets/sustainability-indicators/carbon-footprint-factsheet', publisher: 'University of Michigan Center for Sustainable Systems' },
    { name: 'The carbon footprint of streaming video: fact-checking the headlines', url: 'https://www.iea.org/commentaries/the-carbon-footprint-of-streaming-video-fact-checking-the-headlines', publisher: 'International Energy Agency' },
    { name: 'Aviation and the global atmosphere / contrail forcing', url: 'https://www.ipcc.ch/report/aviation-and-the-global-atmosphere-2/', publisher: 'IPCC' },
    { name: 'Sustainable Materials Management: waste decomposition and landfills', url: 'https://www.epa.gov/smm', publisher: 'US EPA' },
  ],

  replaces: [
    '/en/carbon-offset-trees-flight',
    '/en/streaming-carbon-emissions-calculator',
    '/en/annual-pet-carbon-footprint',
    '/en/wedding-carbon-footprint',
    '/en/material-biodegradation-time',
  ],

  lastReviewed: '2026-07-28',
};
