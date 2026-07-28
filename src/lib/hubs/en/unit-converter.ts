import type { HubData } from '../types';

/**
 * Hub de decisión EN — "How do I convert this unit?"
 *
 * Absorbe los 8 conversores ingleses: metros↔pies, kg↔lb, oz↔g de cocina,
 * pulgadas↔cm de pantalla, ft²↔m², quintal↔tonelada, BTU↔kcal de aire
 * acondicionado y ppm↔mg/L.
 *
 * Bug conocido de la migración AR: los 35 conversores concatenaban la unidad de
 * IDA al resultado, así que en dirección inversa mostraban la unidad equivocada.
 * Acá no puede pasar: cada valor se convierte a la unidad base de su dimensión y
 * cada fila del desglose lleva SU propia unidad, no la de entrada. Las dos
 * direcciones salen de la misma tabla de factores, así que son exactas inversas.
 *
 * Los factores son los valores DEFINIDOS (exactos), no los redondeados que
 * usaban las fórmulas viejas: 1 ft = 0,3048 m exacto (NIST SP 811 B.8),
 * 1 lb = 0,45359237 kg exacto, 1 in = 2,54 cm exacto, 1 oz = 28,349523125 g.
 */

/** Disclaimer YMYL/técnico — src/lib/disclaimers.ts, dominio 'math', versión en inglés. */
const DISCLAIMER_MATH =
  'Mathematical result based on the inputs. Verify units, assumptions, and rounding before technical use.';

export interface UnitDef {
  id: string;
  /** Symbol printed next to the number. */
  sym: string;
  /** Long name for the select. */
  name: string;
  /** Dimension key. */
  dim: string;
  /** How many base units one of these is worth. Absent for temperature. */
  factor?: number;
  /** The unit most people are converting to/from when they pick this one. */
  pair?: string;
}

/**
 * Base units: length = metre, mass = kilogram, area = square metre,
 * volume = litre, power = watt, concentration = mg/L, temperature = kelvin.
 * Exact defined values from NIST SP 811 Appendix B.
 */
export const UNITS: UnitDef[] = [
  // ── Length (base: metre) ──────────────────────────────────────────────────
  { id: 'm', sym: 'm', name: 'Length — meters (m)', dim: 'length', factor: 1, pair: 'ft' },
  { id: 'cm', sym: 'cm', name: 'Length — centimeters (cm)', dim: 'length', factor: 0.01, pair: 'in' },
  { id: 'mm', sym: 'mm', name: 'Length — millimeters (mm)', dim: 'length', factor: 0.001, pair: 'in' },
  { id: 'km', sym: 'km', name: 'Length — kilometers (km)', dim: 'length', factor: 1000, pair: 'mi' },
  { id: 'in', sym: 'in', name: 'Length — inches (in)', dim: 'length', factor: 0.0254, pair: 'cm' },
  { id: 'ft', sym: 'ft', name: 'Length — feet (ft)', dim: 'length', factor: 0.3048, pair: 'm' },
  { id: 'yd', sym: 'yd', name: 'Length — yards (yd)', dim: 'length', factor: 0.9144, pair: 'm' },
  { id: 'mi', sym: 'mi', name: 'Length — miles (mi)', dim: 'length', factor: 1609.344, pair: 'km' },

  // ── Mass (base: kilogram) ─────────────────────────────────────────────────
  { id: 'kg', sym: 'kg', name: 'Weight — kilograms (kg)', dim: 'mass', factor: 1, pair: 'lb' },
  { id: 'g', sym: 'g', name: 'Weight — grams (g)', dim: 'mass', factor: 0.001, pair: 'oz' },
  { id: 'lb', sym: 'lb', name: 'Weight — pounds (lb)', dim: 'mass', factor: 0.45359237, pair: 'kg' },
  { id: 'oz', sym: 'oz', name: 'Weight — ounces, avoirdupois (oz)', dim: 'mass', factor: 0.028349523125, pair: 'g' },
  { id: 'ozt', sym: 'oz t', name: 'Weight — troy ounces, precious metals (oz t)', dim: 'mass', factor: 0.0311034768, pair: 'g' },
  { id: 'st', sym: 'st', name: 'Weight — stone, UK body weight (st)', dim: 'mass', factor: 6.35029318, pair: 'kg' },
  { id: 't', sym: 't', name: 'Weight — metric tons (t)', dim: 'mass', factor: 1000, pair: 'qq' },
  { id: 'qq', sym: 'qq', name: 'Weight — metric quintals, farm yields (qq)', dim: 'mass', factor: 100, pair: 't' },
  { id: 'ton', sym: 'short tn', name: 'Weight — US short tons (2,000 lb)', dim: 'mass', factor: 907.18474, pair: 't' },

  // ── Area (base: square metre) ─────────────────────────────────────────────
  { id: 'm2', sym: 'm²', name: 'Area — square meters (m²)', dim: 'area', factor: 1, pair: 'ft2' },
  { id: 'ft2', sym: 'ft²', name: 'Area — square feet (ft²)', dim: 'area', factor: 0.09290304, pair: 'm2' },
  { id: 'in2', sym: 'in²', name: 'Area — square inches (in²)', dim: 'area', factor: 0.00064516, pair: 'cm2' },
  { id: 'cm2', sym: 'cm²', name: 'Area — square centimeters (cm²)', dim: 'area', factor: 0.0001, pair: 'in2' },
  { id: 'ha', sym: 'ha', name: 'Area — hectares (ha)', dim: 'area', factor: 10000, pair: 'ac' },
  { id: 'ac', sym: 'ac', name: 'Area — acres (ac)', dim: 'area', factor: 4046.8564224, pair: 'ha' },

  // ── Volume (base: litre) ──────────────────────────────────────────────────
  { id: 'L', sym: 'L', name: 'Volume — liters (L)', dim: 'volume', factor: 1, pair: 'galUS' },
  { id: 'mL', sym: 'mL', name: 'Volume — milliliters (mL)', dim: 'volume', factor: 0.001, pair: 'flozUS' },
  { id: 'galUS', sym: 'gal (US)', name: 'Volume — US gallons', dim: 'volume', factor: 3.785411784, pair: 'L' },
  { id: 'galUK', sym: 'gal (imp)', name: 'Volume — imperial gallons (UK)', dim: 'volume', factor: 4.54609, pair: 'L' },
  { id: 'qtUS', sym: 'qt (US)', name: 'Volume — US quarts', dim: 'volume', factor: 0.946352946, pair: 'L' },
  { id: 'ptUS', sym: 'pt (US)', name: 'Volume — US pints', dim: 'volume', factor: 0.473176473, pair: 'mL' },
  { id: 'ptUK', sym: 'pt (imp)', name: 'Volume — imperial pints (UK)', dim: 'volume', factor: 0.56826125, pair: 'mL' },
  { id: 'cupUS', sym: 'cup (US)', name: 'Volume — US cups, cooking', dim: 'volume', factor: 0.2365882365, pair: 'mL' },
  { id: 'flozUS', sym: 'fl oz (US)', name: 'Volume — US fluid ounces', dim: 'volume', factor: 0.0295735295625, pair: 'mL' },
  { id: 'flozUK', sym: 'fl oz (imp)', name: 'Volume — imperial fluid ounces (UK)', dim: 'volume', factor: 0.0284130625, pair: 'mL' },
  { id: 'tbspUS', sym: 'tbsp', name: 'Volume — US tablespoons, cooking', dim: 'volume', factor: 0.01478676478125, pair: 'mL' },
  { id: 'tspUS', sym: 'tsp', name: 'Volume — US teaspoons, cooking', dim: 'volume', factor: 0.00492892159375, pair: 'mL' },

  // ── Power / cooling capacity (base: watt) ─────────────────────────────────
  { id: 'btuh', sym: 'BTU/h', name: 'Cooling — BTU per hour (BTU/h)', dim: 'power', factor: 0.29307107017, pair: 'kcalh' },
  { id: 'kcalh', sym: 'kcal/h', name: 'Cooling — kcal per hour, "frigorías" (kcal/h)', dim: 'power', factor: 1.163, pair: 'btuh' },
  { id: 'W', sym: 'W', name: 'Power — watts (W)', dim: 'power', factor: 1, pair: 'btuh' },
  { id: 'kW', sym: 'kW', name: 'Power — kilowatts (kW)', dim: 'power', factor: 1000, pair: 'btuh' },
  { id: 'hp', sym: 'hp', name: 'Power — mechanical horsepower (hp)', dim: 'power', factor: 745.6998715822702, pair: 'kW' },
  { id: 'rton', sym: 'RT', name: 'Cooling — tons of refrigeration (12,000 BTU/h)', dim: 'power', factor: 3516.8528420667, pair: 'btuh' },

  // ── Concentration in water (base: mg/L) ───────────────────────────────────
  { id: 'ppm', sym: 'ppm', name: 'Concentration — parts per million (ppm)', dim: 'conc', factor: 1, pair: 'mgl' },
  { id: 'mgl', sym: 'mg/L', name: 'Concentration — milligrams per liter (mg/L)', dim: 'conc', factor: 1, pair: 'ppm' },
  { id: 'ugl', sym: 'µg/L', name: 'Concentration — micrograms per liter (µg/L, = ppb)', dim: 'conc', factor: 0.001, pair: 'mgl' },
  { id: 'gl', sym: 'g/L', name: 'Concentration — grams per liter (g/L)', dim: 'conc', factor: 1000, pair: 'mgl' },
  { id: 'pctw', sym: '% w/v', name: 'Concentration — percent by weight in water (%)', dim: 'conc', factor: 10000, pair: 'mgl' },

  // ── Temperature (base: kelvin, affine — handled separately) ───────────────
  { id: 'C', sym: '°C', name: 'Temperature — degrees Celsius (°C)', dim: 'temp', pair: 'F' },
  { id: 'F', sym: '°F', name: 'Temperature — degrees Fahrenheit (°F)', dim: 'temp', pair: 'C' },
  { id: 'K', sym: 'K', name: 'Temperature — kelvin (K)', dim: 'temp', pair: 'C' },
];

/**
 * Un punto de referencia familiar por dimensión, en unidad base. Sirve para que
 * el gráfico responda "¿esto es grande o chico?" y no sólo repita el número.
 */
export const BENCHMARKS: Record<string, { label: string; value: number }> = {
  length: { label: 'A standard US doorway, 6 ft 8 in (2.03 m)', value: 2.0320 },
  mass: { label: 'A checked-bag allowance, 50 lb (22.68 kg)', value: 22.6796185 },
  area: { label: 'A one-car garage, 200 ft² (18.58 m²)', value: 18.580608 },
  volume: { label: 'One US gallon of milk (3.785 L)', value: 3.785411784 },
  power: { label: 'A one-ton AC unit, 12,000 BTU/h (3,517 W)', value: 3516.8528420667 },
  conc: { label: 'EPA secondary standard for total dissolved solids, 500 mg/L', value: 500 },
  temp: { label: 'Room temperature, 68 °F (293.15 K)', value: 293.15 },
};

export const hub: HubData = {
  slug: 'en/math/unit-converter',
  title: 'Unit Converter: feet, pounds, ounces, square feet, BTU and ppm — exact factors',
  description:
    'Convert length, weight, area, volume, cooling capacity, water concentration and temperature between US customary, imperial and metric units, using the exact defined factors instead of rounded shortcuts.',
  silo: 'Math',
  siloHref: '/en/math',
  locale: 'en',

  eyebrow: 'Math · units and conversion',
  h1: 'How do I convert this unit?',
  lede:
    'Pick your unit, type the number, and every equivalent in that family comes out at once — feet and inches, pounds and ounces, square feet and square meters, BTU/h and kcal/h, ppm and mg/L. Both directions come from the same exact factor, so nothing drifts when you convert back.',
  stamps: [
    'Exact defined factors: 1 ft = 0.3048 m, 1 lb = 0.45359237 kg',
    'US customary, imperial and metric side by side',
    '8 converters inside',
  ],

  resultLabel: 'Converted value',

  cases: {
    title: 'What are you converting?',
    intro:
      'The unit you choose in the dropdown does the actual work — every equivalent in its family comes out together. These branches add the context and the traps that matter for each kind of measurement.',
    items: [
      {
        id: 'distance',
        label: 'A length or a distance',
        hint: 'Meters, feet, inches, yards, miles',
        answer: 'One foot is exactly 0.3048 meters and one inch is exactly 2.54 centimeters — both are defined, not measured.',
        yes: [
          'Meters, centimeters, millimeters, kilometers, inches, feet, yards and miles',
          'The international foot and inch have been exact by definition since the 1959 international yard and pound agreement',
          'A screen size is measured on the DIAGONAL, so a 55-inch TV is 139.7 cm corner to corner, not across',
          'The breakdown gives every unit in the family at once, so you never have to chain two conversions',
        ],
        warn: [
          DISCLAIMER_MATH,
          'One meter is about 3.28 feet, not 3. Rounding to 3 undercounts by 9%, which is a whole story on a building elevation',
          'The US survey foot (1200/3937 m) differed from the international foot by 2 parts per million and was officially retired for new work at the end of 2022 — it still shows up in older land records',
          'Nautical miles are 1,852 m and are not in this family of statute miles',
        ],
        plazo: 'for a height, convert to inches first and then split: 70 in is 5 ft 10 in.',
      },
      {
        id: 'weight',
        label: 'A weight',
        hint: 'Kilograms, pounds, ounces, stone, troy ounces',
        answer: 'One pound is exactly 0.45359237 kilograms; one kilogram is about 2.2046 pounds.',
        yes: [
          'Kilograms, grams, pounds, avoirdupois ounces, troy ounces, stone, metric tons and US short tons',
          'The everyday ounce is the avoirdupois ounce, exactly 28.349523125 g',
          'Stone is a UK body-weight unit worth 14 lb; it is not used in the US',
          'A US short ton is 2,000 lb, a metric ton is 1,000 kg, and a UK long ton is 2,240 lb — three different tons',
        ],
        warn: [
          DISCLAIMER_MATH,
          'A troy ounce, used for gold and silver, is 31.1035 g — about 10% heavier than the 28.35 g ounce on your kitchen scale. Quoting the wrong one misprices bullion by a tenth',
          'A fluid ounce measures volume, not weight. 8 fl oz of honey does not weigh 8 oz',
          'Weight and mass are different quantities; these conversions are mass conversions, which is what scales actually report',
        ],
        plazo: 'to read a UK weight, remember 12 st 6 lb is 174 lb, which is 78.9 kg.',
      },
      {
        id: 'area',
        label: 'A floor area or a plot of land',
        hint: 'Square feet, square meters, acres, hectares',
        answer: 'One square meter is 10.7639 square feet — the length factor squared, never the length factor itself.',
        yes: [
          'Square meters, square feet, square inches, square centimeters, hectares and acres',
          'Because 1 ft = 0.3048 m exactly, 1 ft² = 0.09290304 m² exactly',
          'US listings quote square feet, most of the rest of the world quotes square meters, and land goes in acres or hectares',
          'One acre is 43,560 ft²; one hectare is 10,000 m², which is about 2.471 acres',
        ],
        warn: [
          DISCLAIMER_MATH,
          'Do not reuse the length factor: dividing square feet by 3.28 instead of 10.76 inflates the area by more than three times',
          'Listed area is not a physical constant. Gross, net, carpet and "livable" area follow different measurement standards, so two honest listings for the same apartment can differ by 15%',
          'Ceiling height is not in the number: 800 ft² with 8 ft ceilings and 800 ft² with 12 ft ceilings are very different rooms',
        ],
        plazo: 'rough field check: square meters × 10.76 = square feet; square feet ÷ 10.76 = square meters.',
      },
      {
        id: 'kitchen',
        label: 'A recipe: cups, ounces, spoons or oven temperature',
        hint: 'Cups, fl oz, mL, grams, °F and °C',
        answer: 'A dry ounce is 28.35 g of weight; a fluid ounce is 29.57 mL of volume. They are not interchangeable.',
        yes: [
          'US cups, tablespoons, teaspoons, fluid ounces, milliliters and liters for volume',
          'Grams, ounces and pounds for weight',
          'Degrees Fahrenheit, Celsius and kelvin for oven temperature',
          'A US cup is 236.588 mL; a US tablespoon is 14.787 mL and a teaspoon is 4.929 mL',
        ],
        warn: [
          DISCLAIMER_MATH,
          'The oz/fl oz confusion is the number one recipe error: 8 oz of flour is a weight (227 g), while 8 fl oz of flour is a volume (a US cup, roughly 120 g of flour). Same number, half the flour',
          'A UK "cup" in older British books is 284 mL, and the Australian metric cup is 250 mL — none of them match the 236.6 mL US cup',
          'A cup of one ingredient does not weigh the same as a cup of another: 1 cup of water is about 237 g, 1 cup of all-purpose flour about 120 g',
          'Fahrenheit and Celsius do not share a zero, so an oven conversion is °C = (°F − 32) × 5/9, not a plain multiplication',
        ],
        plazo: 'baking by weight instead of volume removes the whole problem — that is why professional recipes use grams.',
      },
      {
        id: 'cooling',
        label: 'Air conditioning or heating capacity',
        hint: 'BTU/h, kcal/h (frigorías), watts, tons',
        answer: 'One BTU per hour is 0.252 kcal/h and 0.293 W; a "one-ton" AC unit is 12,000 BTU/h.',
        yes: [
          'BTU per hour, kcal per hour, watts, kilowatts, mechanical horsepower and tons of refrigeration',
          'The "frigorías" on Spanish and Latin American AC labels are kilocalories per hour',
          'A ton of refrigeration is defined as 12,000 BTU/h, the rate that would melt one short ton of ice in 24 hours',
          'A 12,000 BTU/h unit is 3,024 kcal/h and about 3.52 kW of cooling capacity',
        ],
        warn: [
          DISCLAIMER_MATH,
          'Cooling capacity is NOT the same as electrical consumption. A 3.5 kW cooling unit with a SEER around 16 draws roughly 1 kW from the wall — never size your electrical circuit from the capacity figure',
          'Sizing an AC by floor area alone ignores insulation, glazing, orientation, ceiling height and occupancy. ACCA Manual J exists because area-only rules of thumb routinely oversize units by 30–50%',
          'An oversized unit short-cycles: it cools fast, never runs long enough to dehumidify, and leaves the room cold and clammy',
        ],
        plazo: 'to compare two labels, put both in watts first — that is the neutral unit.',
      },
      {
        id: 'water',
        label: 'A water or solution concentration',
        hint: 'ppm, mg/L, µg/L, g/L, percent',
        answer: 'In dilute water solutions 1 ppm equals 1 mg/L exactly, because a liter of water weighs a kilogram.',
        yes: [
          'Parts per million, milligrams per liter, micrograms per liter (ppb), grams per liter and percent by weight',
          '1 ppm = 1 mg/L, 1 ppb = 1 µg/L, 1% = 10,000 ppm',
          'US drinking-water reports quote mg/L and ppm interchangeably for exactly this reason',
          'The breakdown converts your figure into every one of those at once so you can compare it with any published limit',
        ],
        warn: [
          DISCLAIMER_MATH,
          'The ppm = mg/L identity only holds when the solution has the density of water. In brine, syrup or any concentrated solution the density shifts and the two numbers separate',
          'For gases in air, ppm is a volume ratio, not a mass-per-volume ratio — do not carry this identity over to air-quality figures',
          'Regulatory limits are set on specific substances and specific methods; a raw concentration on its own does not tell you whether water is safe to drink',
        ],
        plazo: 'EPA lists a secondary standard of 500 mg/L for total dissolved solids in drinking water.',
      },
      {
        id: 'farm',
        label: 'A farm yield or a bulk shipment',
        hint: 'Quintals, metric tons, kilograms, short tons',
        answer: 'The metric quintal is 100 kg, so 10 quintals make one metric ton.',
        yes: [
          'Metric quintals, metric tons, kilograms, pounds and US short tons',
          'Yields are usually quoted per hectare in quintals, or per acre in bushels or short tons',
          'One metric ton is 2,204.62 lb, which is 10% heavier than a US short ton',
          'Multiply your quintal-per-hectare yield by the planted hectares to get total tonnage',
        ],
        warn: [
          DISCLAIMER_MATH,
          'A bushel is a volume, and its weight depends on the crop and its moisture — 60 lb for soybeans and wheat, 56 lb for corn at 15.5% moisture. There is no single bushel-to-kilogram factor, which is why bushels are not in this converter',
          'The Spanish "quintal" in some countries is the old 46 kg quintal, not the metric 100 kg one. Check the contract before signing',
          'Moisture content changes the settled weight at the elevator: a wet load is discounted to a dry-matter equivalent',
        ],
        plazo: 'to price a harvest, convert everything to metric tons first, then apply the per-ton price.',
      },
    ],
  },

  inputsTitle: 'Your measurement',
  inputsIntro:
    'Type the number and choose what unit it is in. The converter finds the family automatically and gives you every equivalent inside it, both directions from the same exact factor.',
  fields: [
    {
      id: 'value',
      label: 'Value to convert',
      type: 'number',
      value: 10,
      step: 0.0001,
      help: 'Decimals are fine. Negative values only make sense for temperature.',
    },
    {
      id: 'unit',
      label: 'Unit of that value',
      type: 'select',
      value: 'm',
      options: UNITS.map((u) => ({ value: u.id, label: u.name })),
      help: 'Pick the unit you HAVE. Everything in the same family comes out in the breakdown, so there is no "convert to" box to get backwards.',
    },
  ],
  fineprint: DISCLAIMER_MATH,

  chart: {
    type: 'donut',
    title: 'Is that a big number or a small one?',
    caption:
      'The ring puts your quantity next to a familiar benchmark of the same kind — a doorway, a checked bag, a one-car garage, a gallon of milk, a one-ton AC unit — so you can feel the size instead of just reading the digits.',
  },
  breakdownTitle: 'Every equivalent in the family',
  breakdownIntro:
    'The same physical quantity written in each unit of its family, converted through the base unit so the forward and reverse directions are exact inverses of each other.',

  faq: [
    {
      q: 'How many feet are in a meter?',
      a: 'One meter is 3.280839895 feet, because the foot is defined as exactly 0.3048 meters. The familiar shortcut "a meter is about 3.28 feet" is fine for a room; rounding it to 3 is not, since that undercounts by more than 9%. Going the other way, one foot is 30.48 cm exactly. Both of these are definitions agreed in the 1959 international yard and pound agreement, not measurements, so they carry no uncertainty at all.',
    },
    {
      q: 'How do I convert kilograms to pounds?',
      a: 'Multiply kilograms by 2.20462262 to get pounds, or divide pounds by that same number to go back. The exact definition runs the other way: one pound is exactly 0.45359237 kilograms. For mental math, doubling and adding 10% gets you within half a percent — 70 kg → 140 + 14 = 154 lb, against a true 154.32 lb. In the UK you may also need stone: 14 pounds to the stone, so 154 lb is 11 st 0 lb.',
    },
    {
      q: 'What is the difference between an ounce and a fluid ounce?',
      a: 'An ounce is a unit of weight, exactly 28.349523125 grams. A US fluid ounce is a unit of volume, 29.5735 milliliters. They only coincide for water, and even then only by rough accident, which is exactly why recipes go wrong. If a recipe asks for 8 oz of flour it wants 227 grams on a scale; if it asks for 8 fl oz it wants one US cup, which is closer to 120 grams of flour. Weighing removes the ambiguity entirely.',
    },
    {
      q: 'Why is a troy ounce different from a normal ounce?',
      a: 'The troy ounce is the surviving unit of a separate medieval weight system kept alive for precious metals. It is 31.1034768 grams against the avoirdupois ounce\'s 28.349523125 grams, about 10% heavier. Gold, silver, platinum and palladium are all quoted per troy ounce, so using the kitchen ounce to value bullion underprices it by roughly a tenth. A troy pound, confusingly, is only 12 troy ounces and is lighter than a normal pound.',
    },
    {
      q: 'How do I convert square feet to square meters?',
      a: 'Multiply square feet by 0.09290304, or divide by 10.763910417. The factor is the length factor squared: 0.3048² = 0.09290304 exactly. The most common mistake in real estate listings is dividing by 3.28 instead, which inflates the metric area by more than three times. As a sanity check, a 1,000 ft² apartment is about 93 m², and a 100 m² apartment is about 1,076 ft².',
    },
    {
      q: 'Is a US gallon the same as a UK gallon?',
      a: 'No, and the gap is large enough to matter. The US gallon is 3.785411784 liters; the imperial gallon used in the UK and Canada is 4.54609 liters — about 20% bigger. That difference propagates through every subdivision: a US pint is 473 mL while an imperial pint is 568 mL, and a US fluid ounce is 29.57 mL against the imperial 28.41 mL. Fuel-economy figures in miles per gallon are therefore not comparable across the Atlantic without conversion.',
    },
    {
      q: 'What does BTU mean on an air conditioner?',
      a: 'It is shorthand for BTU per hour, a rate of heat removal. One BTU per hour is 0.293 watts and 0.252 kilocalories per hour, which is what Spanish-language labels call a frigoría. A "one-ton" unit is defined as 12,000 BTU/h, roughly 3.52 kW, from the rate that would melt a short ton of ice in a day. Crucially this is cooling capacity, not electricity drawn: an efficient 12,000 BTU/h unit consumes around 1 kW from the wall.',
    },
    {
      q: 'Are ppm and mg/L the same thing?',
      a: 'In dilute water solutions, yes, exactly — because one liter of water has a mass of one kilogram, one milligram per liter is one milligram per million milligrams, which is one part per million. That is why US water quality reports switch between the two labels without comment. The equivalence breaks as soon as the solution density stops matching water, and it does not apply at all to gases in air, where ppm is a volume ratio.',
    },
    {
      q: 'How do I convert Fahrenheit to Celsius?',
      a: 'Subtract 32, then multiply by 5/9. Going the other way, multiply by 9/5 and add 32. Temperature is the one conversion in this hub that is not a simple multiplication, because the two scales have different zero points as well as different step sizes. Handy anchors: water freezes at 32 °F / 0 °C, room temperature is 68 °F / 20 °C, body temperature is 98.6 °F / 37 °C, and the two scales cross at −40°.',
    },
    {
      q: 'How many kilograms is a quintal?',
      a: 'The metric quintal is 100 kilograms, so ten quintals make one metric ton and a yield of 45 qq/ha is 4.5 t/ha. Be careful with the word outside that metric context: the old Spanish and Portuguese quintal was around 46 kg, and several countries kept local versions. Contracts should always state the kilogram equivalent, and this converter uses the metric 100 kg definition throughout.',
    },
    {
      q: 'Why does converting back and forth sometimes not return the original number?',
      a: 'Because the factor was rounded somewhere along the way. If you multiply by 3.28 to get feet and divide by 3.28 to get back, you land on your starting number — but neither figure was ever right, because the true factor is 3.280839895. This converter stores the exact defined factor for every unit and always routes through the family\'s base unit, so a round trip is an exact inverse and only display rounding is visible.',
    },
    {
      q: 'What is a hectare compared with an acre?',
      a: 'A hectare is 10,000 square meters, which is a square 100 m on a side. An acre is 43,560 square feet, or 4,046.856 square meters — historically the area one ox team could plow in a day, which is why it is not a round number. One hectare is 2.4711 acres, and one acre is 0.4047 hectares. For a fast field estimate, a hectare is about two and a half acres, and an acre is a bit smaller than an American football field without the end zones.',
    },
  ],

  sources: [
    {
      name: 'NIST Special Publication 811 — Guide for the Use of the International System of Units, Appendix B: conversion factors',
      url: 'https://www.nist.gov/pml/special-publication-811',
      publisher: 'NIST',
    },
    {
      name: 'NIST Handbook 44 — Specifications, Tolerances and Other Technical Requirements for Weighing and Measuring Devices, Appendix C',
      url: 'https://www.nist.gov/pml/owm/nist-handbook-44',
      publisher: 'NIST Office of Weights and Measures',
    },
    {
      name: 'BIPM — The International System of Units (SI Brochure, 9th edition)',
      url: 'https://www.bipm.org/en/publications/si-brochure',
      publisher: 'Bureau International des Poids et Mesures',
    },
    {
      name: 'NIST — U.S. Survey Foot: deprecation for new work as of 31 December 2022',
      url: 'https://www.nist.gov/pml/us-surveyfoot',
      publisher: 'NIST',
    },
    {
      name: 'U.S. EPA — Secondary Drinking Water Standards (total dissolved solids, 500 mg/L)',
      url: 'https://www.epa.gov/sdwa/secondary-drinking-water-standards-guidance-nuisance-chemicals',
      publisher: 'U.S. Environmental Protection Agency',
    },
    {
      name: 'ASHRAE Terminology — ton of refrigeration and cooling capacity units',
      url: 'https://www.ashrae.org/technical-resources/free-resources/ashrae-terminology',
      publisher: 'ASHRAE',
    },
    {
      name: 'USDA — Grain weights per bushel and moisture discounts',
      url: 'https://www.ams.usda.gov/grades-standards/grain-standards',
      publisher: 'U.S. Department of Agriculture, AMS',
    },
  ],

  replaces: [
    '/en/conversion-meters-to-feet',
    '/en/kilos-to-pounds-converter',
    '/en/conversion-ounce-gram-cooking',
    '/en/inches-to-cm-screen-converter',
    '/en/square-feet-to-square-meters-real-estate',
    '/en/quintal-to-metric-ton-converter',
    '/en/conversion-btu-kcal-air-conditioning',
    '/en/conversion-ppm-mg-l-quimica-agua',
  ],

  lastReviewed: '2026-07-28',
};
