import type { HubData } from '../types';

/**
 * Hub de decisión EN (mercado US) — "What size AC, heater, vent fan and
 * insulation does this room need?".
 *
 * Ramas y fórmulas vivas portadas:
 *   aire-acondicionado-frigorias-btu-habitacion.ts → cooling
 *   caldera-potencia-kw-ambiente-metros.ts         → heating
 *   ventilacion-cfm-ambiente.ts                    → ventilation
 *   aislacion-termica-k-minimo-zona.ts             → insulation
 *
 * DOS correcciones deliberadas para el mercado US, documentadas acá:
 *
 * 1. La fórmula de frío es argentina (hemisferio sur): su factor solar más
 *    alto está en el NORTE. En Estados Unidos el sol de mediodía viene del
 *    SUR, así que portar la tabla tal cual invertiría el resultado. Acá los
 *    factores están rotados al hemisferio norte. La de calefacción, en
 *    cambio, viene del CTE español (hemisferio norte) y no se toca.
 *
 * 2. El método volumétrico argentino da alrededor del doble de BTU que la
 *    tabla de dimensionamiento de ENERGY STAR / AHAM para la misma
 *    superficie. El titular usa la regla americana y el método volumétrico
 *    viaja en el desglose como comparación, no como recomendación.
 */

/** Disclaimer YMYL — src/lib/disclaimers.ts, dominio 'construction-materials', idioma en. */
const DISCLAIMER_MATERIALS =
  'Material and quantity estimate. Check coverage, waste, and application against the manufacturer’s specifications or the professional in charge.';

/** ENERGY STAR / AHAM room air conditioner sizing: ~20 BTU/h por sq ft de piso. */
export const BTU_PER_SQFT = 20;
/** AHAM: +600 BTU/h por cada ocupante por encima de dos. */
export const BTU_PER_EXTRA_PERSON = 600;
/** AHAM: +4.000 BTU/h si la unidad sirve una cocina. */
export const BTU_KITCHEN = 4000;

/**
 * Método volumétrico argentino, convertido:
 *   50 kcal/h por m³  →  5.6167 BTU/h por cu ft
 *   150 frigorías por persona  →  595.2 BTU/h  (la cifra US estándar es 600)
 *   watts × 0.86 kcal/h  →  watts × 3.4127 BTU/h  (la conversión exacta W→BTU/h)
 */
export const VOL_BTU_PER_CUFT = 5.6167;
export const PERSON_BTU_METRIC = 595.2;
export const WATT_TO_BTU = 3.4127;

/**
 * Factores de exposición solar ROTADOS al hemisferio norte.
 * Original AR (hemisferio sur): oeste 1.20 · norte 1.15 · este 1.10 · sur 1.00.
 */
export const EXPOSURE = [
  { id: 'west', label: 'West-facing — full afternoon sun', factor: 1.2 },
  { id: 'south', label: 'South-facing — high solar gain all day', factor: 1.15 },
  { id: 'east', label: 'East-facing — morning sun', factor: 1.1 },
  { id: 'north', label: 'North-facing or heavily shaded', factor: 1.0 },
];

/** Aislación: mala 1.20 · media 1.00 · buena 0.90 (sin cambios respecto del original). */
export const INSULATION = [
  { id: 'poor', label: 'Poor — older house, little or no insulation', cool: 1.2, heat: 1.1 },
  { id: 'average', label: 'Average — standard construction', cool: 1.0, heat: 1.0 },
  { id: 'good', label: 'Good — modern, well insulated and air-sealed', cool: 0.9, heat: 0.93 },
];

/** Penalización por techo expuesto: +18%. */
export const TOP_FLOOR_FACTOR = 1.18;

/** Tamaños comerciales de aire acondicionado en BTU/h (12.000 BTU/h = 1 ton). */
export const AC_SIZES = [5000, 6000, 8000, 9000, 10000, 12000, 14000, 18000, 21000, 24000, 30000, 36000, 42000, 48000, 60000];

/**
 * Calefacción: 85 W/m² de la fórmula original = 7.897 W/sq ft = 26.95 BTU/h
 * por pie cuadrado, válido hasta 8.2 ft (2.5 m) de altura.
 */
export const HEAT_BTU_PER_SQFT = 26.95;
export const HEAT_BASE_HEIGHT_FT = 8.2;

/**
 * Zonas del CTE español mapeadas a las climate zones del IECC. Los factores
 * son los originales (0.88 a 1.19). El tope de 1.19 se queda corto para las
 * zonas 7 y 8 del IECC: ahí la regla de dedo subdimensiona y hace falta un
 * Manual J. Va como advertencia en la rama.
 */
export const CLIMATE = [
  { id: 'z1', label: 'IECC 1–2 — hot, mild winters (Miami, Houston)', factor: 0.88, wallR: 13, ceilR: 30 },
  { id: 'z3', label: 'IECC 3 — mixed (Atlanta, Los Angeles)', factor: 0.95, wallR: 20, ceilR: 49 },
  { id: 'z4', label: 'IECC 4 — mixed to cold (New York, Seattle)', factor: 1.04, wallR: 30, ceilR: 60 },
  { id: 'z5', label: 'IECC 5 — cold (Chicago, Denver)', factor: 1.12, wallR: 30, ceilR: 60 },
  { id: 'z6', label: 'IECC 6–8 — very cold (Minneapolis, Anchorage)', factor: 1.19, wallR: 30, ceilR: 60 },
];

/** Orientación de la fórmula de calefacción (CTE, hemisferio norte — no se rota). */
export const HEAT_ORIENTATION: Record<string, number> = { north: 1.12, east: 1.0, west: 1.0, south: 0.92 };

/** ASHRAE 62.2: extracción intermitente mínima. */
export const ASHRAE_BATH_CFM = 50;
export const ASHRAE_KITCHEN_CFM = 100;

/**
 * IRAM 11605 (Argentina) en K máximo, convertido a R-value americano:
 * R = 1 / (K × 0.17611). Sirve para mostrar cuánto más exigente es el IECC.
 */
export const IRAM_K_TO_R = 0.17611;

export const hub: HubData = {
slug: 'en/home/hvac-sizing',
  title: 'AC, heating, vent fan and insulation sizing calculator by room',
  description:
    'Size the air conditioner in BTU/h and tons, the heater in BTU/h and kW, the exhaust fan in CFM and the wall insulation in R-value, from one set of room dimensions — using ENERGY STAR, ASHRAE 62.2 and IECC figures.',
  silo: 'Home & Building',
siloHref: '/en/home',
  locale: 'en',

  eyebrow: 'US · HVAC · room-by-room sizing',
  h1: 'What size AC, heater and vent fan does this room need?',
  lede:
    'Undersize the equipment and it runs flat out and never catches up. Oversize it and it short-cycles, never pulls the humidity out, and costs more to buy and to run. Give the room once and get the cooling capacity in BTU/h and tons, the heating output in BTU/h and kW, the exhaust airflow in CFM, and the insulation R-value your climate zone actually requires.',
  stamps: [
    'BTU/h and tons · CFM · R-value',
    'ENERGY STAR sizing · ASHRAE 62.2 · IECC 2021',
    '4 calculators inside',
  ],

  resultLabel: 'Equipment size',

  cases: {
    title: 'What are you sizing?',
    intro:
      'The same room drives all four numbers. Switch between them without retyping anything.',
    items: [
      {
        id: 'cooling',
        label: 'Air conditioner or mini-split',
        hint: 'BTU/h · tons · nearest commercial size',
        answer: 'Start at about 20 BTU/h per square foot, then adjust for sun, occupants and appliances.',
        yes: [
          'The ENERGY STAR and AHAM baseline is roughly 20 BTU per hour for each square foot of floor area',
          'Add 600 BTU/h for every occupant beyond the first two who are in the room regularly',
          'Add the heat that appliances and electronics dump into the room: every watt is 3.41 BTU/h',
          'Increase about 10% for a very sunny, west or south-facing room; decrease about 10% for a heavily shaded one',
          'Add roughly 18% if the room is directly under an exposed roof',
          'Twelve thousand BTU/h is one ton of cooling, which is how central systems are specified',
        ],
        warn: [
          DISCLAIMER_MATERIALS,
          'Bigger is not safer with air conditioning: an oversized unit cools the air fast, shuts off before it can dehumidify, and leaves the room cold and clammy',
          'A whole-house or ducted system needs an ACCA Manual J load calculation, not a rule of thumb — duct losses and infiltration alone can move the answer 30%',
          'This is a sensible-load estimate. Humid climates carry a large latent load that a per-square-foot rule does not see',
        ],
        plazo: 'size and buy before the first heat wave — supply and installer availability both collapse in July.',
      },
      {
        id: 'heating',
        label: 'Boiler, furnace or heater',
        hint: 'BTU/h · kW · climate zone',
        answer: 'Around 27 BTU/h per square foot at the baseline, scaled by climate zone and insulation.',
        yes: [
          'The base figure is about 27 BTU per hour per square foot at an 8 ft ceiling in a mixed climate',
          'The climate zone factor moves that from 0.88 in the warm south to 1.19 in the far north',
          'A north-facing room needs about 12% more; a south-facing one about 8% less',
          'Poor insulation adds 10%; good insulation and air sealing take 7% off',
          'Ceilings above 8 ft scale the output proportionally, because you are heating volume, not floor',
          'Add a safety margin of about 20% when picking the nameplate output',
        ],
        warn: [
          DISCLAIMER_MATERIALS,
          'This rule of thumb tops out around 32 BTU/h per square foot, which under-sizes for IECC zones 7 and 8 — in the far north a Manual J is not optional',
          'Combustion appliances need combustion air, venting and clearances that this calculation does not touch: gas work is licensed work in every state',
          'Nameplate input is not output: a furnace at 80% AFUE delivers only 80% of its rated input as heat into the house',
        ],
        plazo: 'have combustion appliances inspected before the heating season, not during the first cold snap.',
      },
      {
        id: 'ventilation',
        label: 'Exhaust or ventilation fan',
        hint: 'CFM · air changes per hour',
        answer: 'CFM is the room volume in cubic feet times air changes per hour, divided by 60.',
        yes: [
          'Airflow in CFM is room volume in cubic feet times the air changes per hour, divided by 60',
          'ASHRAE 62.2 sets 50 CFM as the intermittent minimum for a bathroom and 100 CFM for a kitchen range hood',
          'Continuous operation lowers those to 20 CFM for a bathroom and five air changes per hour for a kitchen',
          'Eight air changes per hour is a reasonable working default for a bathroom or utility room',
          'Buy above the calculated number: ducts, elbows and grilles all cut the real delivered airflow',
          'The fan needs make-up air to come from somewhere — a sealed room with a big exhaust fan just starves it',
        ],
        warn: [
          DISCLAIMER_MATERIALS,
          'A fan rated at 100 CFM on the box may deliver half that through a long flexible duct with two elbows: the rating is at zero static pressure',
          'Exhaust fans must vent outdoors, never into an attic or a soffit — dumping moist air into an attic is how you grow mold in the sheathing',
          'A large kitchen exhaust in a tight house can back-draft a combustion appliance: that is a carbon monoxide risk and needs a make-up air path',
        ],
        plazo: 'run the bathroom fan for at least 20 minutes after a shower, or the moisture never actually leaves.',
      },
      {
        id: 'insulation',
        label: 'Wall and ceiling insulation',
        hint: 'R-value required by climate zone',
        answer: 'IECC 2021 sets the minimum R-value by climate zone: R-13 to R-30 in walls.',
        yes: [
          'R-value measures resistance to heat flow: higher is better, and it adds up in series through the assembly',
          'IECC 2021 minimums for wood-frame walls run from R-13 in the hot south to R-30 in cold zones',
          'Ceiling minimums run from R-30 in zone 1 to R-60 in zones 4 through 8',
          'Continuous exterior insulation counts differently from cavity insulation, because it also breaks the thermal bridge at the studs',
          'Air sealing comes first: insulation slows conduction but does nothing about air leaking straight through the assembly',
        ],
        warn: [
          DISCLAIMER_MATERIALS,
          'Nominal batt R-value is not assembly R-value: wood studs bridge the cavity and can knock 20 to 30% off the effective performance of a wall',
          'Adding insulation without a vapor strategy can move the dew point inside the assembly and rot the sheathing — climate zone determines which side the vapor retarder goes on',
          'Compressed batts lose R-value proportionally: stuffing R-19 into a 2×4 cavity does not give you R-19',
        ],
        plazo: 'insulate before drywall goes up — retrofitting a finished wall costs several times as much for less performance.',
      },
    ],
  },

  inputsTitle: 'The room',
  inputsIntro:
    'Feet and watts. Every branch reads the dimensions; the selectors below fine-tune whichever one you are on.',
  fields: [
    { id: 'len_ft', label: 'Room length (ft)', type: 'number', value: 16, min: 0, step: 0.5, help: 'Interior dimension, wall to wall.' },
    { id: 'wid_ft', label: 'Room width (ft)', type: 'number', value: 12, min: 0, step: 0.5, help: 'Length times width is the floor area the cooling and heating rules use.' },
    { id: 'hgt_ft', label: 'Ceiling height (ft)', type: 'number', value: 8, min: 0, step: 0.25, help: 'Above 8.2 ft the heating output scales up proportionally, because you are heating volume.' },
    { id: 'occupants', label: 'People normally in the room', type: 'number', value: 2, min: 0, max: 20, step: 1, help: 'Each person past the first two adds 600 BTU/h of cooling load.' },
    { id: 'appliance_w', label: 'Appliances and electronics (W)', type: 'number', value: 400, min: 0, step: 50, help: 'TV, computers, lighting, a fridge in the room. Every watt becomes 3.41 BTU/h of heat.' },
    {
      id: 'exposure',
      label: 'Sun exposure',
      type: 'select',
      value: 'south',
      options: [
        { value: 'west', label: 'West-facing — full afternoon sun' },
        { value: 'south', label: 'South-facing — high solar gain' },
        { value: 'east', label: 'East-facing — morning sun' },
        { value: 'north', label: 'North-facing or heavily shaded' },
      ],
      help: 'Northern-hemisphere orientation: south and west take the heat.',
    },
    {
      id: 'insulation',
      label: 'Insulation and air sealing',
      type: 'select',
      value: 'average',
      options: [
        { value: 'poor', label: 'Poor — older house, little insulation' },
        { value: 'average', label: 'Average — standard construction' },
        { value: 'good', label: 'Good — modern, insulated and sealed' },
      ],
      help: 'Poor adds 20% to the cooling load; good takes 10% off.',
    },
    {
      id: 'top_floor',
      label: 'Top floor under an exposed roof',
      type: 'select',
      value: 'no',
      options: [
        { value: 'no', label: 'No — there is conditioned space above' },
        { value: 'yes', label: 'Yes — roof directly overhead' },
      ],
      help: 'An exposed roof adds about 18% to the cooling load.',
    },
    {
      id: 'climate',
      label: 'Climate zone',
      type: 'select',
      value: 'z4',
      options: [
        { value: 'z1', label: 'IECC 1–2 — hot (Miami, Houston)' },
        { value: 'z3', label: 'IECC 3 — mixed (Atlanta, Los Angeles)' },
        { value: 'z4', label: 'IECC 4 — mixed to cold (New York, Seattle)' },
        { value: 'z5', label: 'IECC 5 — cold (Chicago, Denver)' },
        { value: 'z6', label: 'IECC 6–8 — very cold (Minneapolis, Anchorage)' },
      ],
      help: 'Drives the heating factor and the required R-values.',
    },
    { id: 'ach', label: 'Air changes per hour', type: 'number', value: 8, min: 1, max: 30, step: 1, help: 'Ventilation branch: 8 for a bathroom or utility room, 15 for a kitchen, 6 for a living space.' },
  ],
  fineprint: DISCLAIMER_MATERIALS,

  chart: {
    type: 'bars',
    title: 'Where the load comes from',
    caption:
      'Splits the answer into the pieces you can act on. The envelope is the one that shrinks with insulation and shading; the occupant and appliance loads are fixed by how the room is used, and are the reason a home office needs more cooling than a bedroom of the same size.',
  },
  breakdownTitle: 'From the room to the nameplate',
  breakdownIntro:
    'The rule-of-thumb figure, every adjustment applied to it, and the commercial size it lands on.',

  faq: [
    {
      q: 'How many BTUs of air conditioning do I need per square foot?',
      a: 'The ENERGY STAR and AHAM sizing guidance works out to about 20 BTU per hour per square foot of floor area for a room air conditioner. A 200 square foot bedroom lands near 5,000 to 6,000 BTU/h; a 500 square foot open living area near 12,000. Then you adjust: add 600 BTU/h per person beyond two, add 4,000 if the unit is serving a kitchen, add about 10% for a very sunny room and subtract about 10% for a heavily shaded one.',
    },
    {
      q: 'How many tons is my air conditioner?',
      a: 'One ton of cooling is 12,000 BTU per hour. The name is historical: it is the rate of cooling you get from a ton of ice melting over 24 hours. Room units are labeled in BTU/h and central systems in tons, so a 24,000 BTU/h unit is 2 tons and a 36,000 BTU/h unit is 3 tons. Central residential systems in the US typically run 1.5 to 5 tons.',
    },
    {
      q: 'Why is an oversized air conditioner a problem?',
      a: 'Because cooling and dehumidifying are two different jobs and only one of them is fast. An oversized unit drops the air temperature to the thermostat setpoint in a few minutes and shuts off, long before enough air has passed over the cold coil to condense the moisture out of it. You end up with a room that is cold and damp, a compressor that short-cycles and wears out early, and a higher bill than a correctly sized unit running longer at steady state. In humid climates this is the single most common HVAC mistake.',
    },
    {
      q: 'What is a Manual J load calculation and do I need one?',
      a: 'Manual J is the ACCA standard method for residential load calculation. It works room by room through the actual construction: wall and window U-factors, orientation, shading, infiltration rate, duct location and leakage, internal gains and the local design temperatures. For a whole-house or ducted system it is the right tool, it is required by code in many jurisdictions, and any contractor who sizes a system by square footage alone is guessing. A rule of thumb like this one is for a single room unit and for sanity-checking a quote.',
    },
    {
      q: 'How many BTUs of heating does a room need?',
      a: 'The baseline here works out to about 27 BTU per hour per square foot at an 8 ft ceiling in a mixed climate, scaled by climate zone from 0.88 in the warm south to 1.19 in the far north — so roughly 24 to 32 BTU/h per square foot. Published rules of thumb for cold US climates go higher, to 40 or even 50 BTU/h per square foot in zones 6 through 8, so treat the top of this range as a floor rather than an answer if you are heating in Minnesota or Maine.',
    },
    {
      q: 'How do I convert between BTU/h, kW and tons?',
      a: 'One kilowatt is 3,412 BTU per hour, one BTU per hour is 0.293 watts, and one ton of refrigeration is 12,000 BTU per hour or 3.517 kW. A 9,000 BTU/h mini-split is 2.64 kW of cooling, or 0.75 tons. Note that for electric equipment you have to be careful which kW is being quoted: the cooling output in kW and the electrical input in kW are different numbers, and the ratio between them is the efficiency.',
    },
    {
      q: 'How many CFM does a bathroom fan need?',
      a: 'ASHRAE 62.2 sets the intermittent local exhaust minimum at 50 CFM for a bathroom and 100 CFM for a kitchen, or 20 CFM and five air changes per hour respectively if the fan runs continuously. The volumetric method gives a similar answer for a typical bathroom: a 5 by 8 ft room with an 8 ft ceiling is 320 cubic feet, and at eight air changes per hour that is 43 CFM. Take the larger of the two and add margin for duct losses.',
    },
    {
      q: 'Why does my fan not move the CFM on the box?',
      a: 'Because the rating is measured at or near zero static pressure, and your duct is not. Every foot of duct, every elbow, every foot of flexible duct instead of rigid, and the exterior grille all add resistance, and the fan moves less air against it. A 100 CFM fan on 20 feet of flex with two elbows and a cheap louvered cap can easily deliver 50. Look for the HVI-certified rating at 0.25 inches of water column, use rigid duct, keep the run short, and use a hood with a proper damper.',
    },
    {
      q: 'What R-value do I need in my walls?',
      a: 'IECC 2021 wood-frame wall minimums are R-13 in climate zones 1 and 2, R-20 or R-13 cavity plus R-5 continuous in zone 3, and R-30 or equivalent in zones 4 through 8. Ceilings run R-30 in zone 1, R-49 in zones 2 and 3, and R-60 in zones 4 through 8. Local amendments are common, so check what your jurisdiction has adopted — many are still on an earlier code cycle with lower numbers.',
    },
    {
      q: 'Is nominal R-value the same as the real performance of a wall?',
      a: 'No. A wall with R-20 batts between 2×6 studs at 16 inches on center performs closer to R-15 or R-16 as a whole assembly, because the studs themselves are only about R-1.25 per inch and they bridge the insulation across roughly 23% of the wall area. That is why the code offers continuous exterior insulation as an alternative path: an inch of continuous foam outside the studs adds its full R-value everywhere, including over the framing.',
    },
    {
      q: 'How do European and Latin American insulation numbers convert to R-value?',
      a: 'They are usually quoted as U-value or as a maximum K in W/m²K, which is the inverse of resistance. To convert: R in US units equals 1 divided by (K × 0.17611). So a maximum K of 1.2 W/m²K is only R-4.7, and 0.74 W/m²K is R-7.7. Those are the limits set by the Argentine IRAM 11605 standard, and they are far below what the US IECC requires — R-13 in the mildest US zone is nearly twice the strictest IRAM limit.',
    },
    {
      q: 'Should I size for the room or for the whole house?',
      a: 'It depends on the system. Room air conditioners, window units, single-head mini-splits and individual radiators are sized per room, which is what this calculator does. A central ducted system, a multi-zone heat pump or a boiler serving several radiators is sized for the whole house, and the sum of the individual room loads will overstate it — not every room peaks at the same moment. That diversity factor is one of the reasons Manual J exists.',
    },
  ],

  sources: [
    {
      name: 'ENERGY STAR — properly sized room air conditioners',
      url: 'https://www.energystar.gov/products/room_air_conditioners',
      publisher: 'US EPA / ENERGY STAR',
    },
    {
      name: 'ACCA Manual J — Residential Load Calculation',
      url: 'https://www.acca.org/standards/technical-manuals',
      publisher: 'Air Conditioning Contractors of America',
    },
    {
      name: 'ASHRAE 62.2 — Ventilation and Acceptable Indoor Air Quality in Residential Buildings',
      url: 'https://www.ashrae.org/technical-resources/bookstore/standards-62-1-62-2',
      publisher: 'ASHRAE',
    },
    {
      name: 'IECC 2021, Table R402.1.3 — insulation and fenestration requirements by component',
      url: 'https://codes.iccsafe.org/content/IECC2021P1/chapter-4-re-residential-energy-efficiency',
      publisher: 'International Code Council',
    },
    {
      name: 'US Department of Energy — home heating systems and sizing',
      url: 'https://www.energy.gov/energysaver/home-heating-systems',
      publisher: 'US Department of Energy',
    },
    {
      name: 'Home Ventilating Institute — certified airflow ratings',
      url: 'https://www.hvi.org/hvi-certified-products-directory/',
      publisher: 'HVI',
    },
  ],

  replaces: [
    '/en/air-conditioning-btu-room-calculator',
    '/en/caldera-potencia-kw-ambiente-metros',
    '/en/ventilation-cfm-room',
    '/en/thermal-k-minimum-zone',
  ],

lastReviewed: '2026-07-28',
};
