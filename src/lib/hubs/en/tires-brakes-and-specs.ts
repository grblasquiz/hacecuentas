import type { HubData } from '../types';

/**
 * Hub EN — "What do the numbers on my car's stickers and specs actually mean?"
 *
 * Absorbe 6 calculadoras sueltas: medida de neumático, presión, distancia de frenado,
 * carga útil (GVWR − curb weight), CCA de batería y conversión de torque.
 *
 * Constantes: todas exactas por definición (NIST SP 811 / BIPM), no redondeadas.
 * La fórmula vieja de presión usaba 14,504 psi/bar y la de frenado g = 9,81; acá se usan
 * los valores exactos (14,503773773... y g_n = 9,80665). La diferencia es < 0,03%.
 */

/** 1 lbf·ft en N·m. Exacto: 0,45359237 × 9,80665 × 0,3048. */
export const NM_PER_LBFT = 1.3558179483314004;
/** 1 kgf·m en N·m. Exacto (g_n = 9,80665 m/s²). */
export const NM_PER_KGFM = 9.80665;
/** 1 bar en psi. Exacto: 100000 / (0,45359237 × 9,80665 / 0,00064516). */
export const PSI_PER_BAR = 14.503773773020923;
/** Aceleración de la gravedad estándar, m/s² (CGPM 1901). */
export const G_N = 9.80665;
/** Exactos por definición. */
export const M_PER_INCH = 0.0254;
export const M_PER_FT = 0.3048;
export const MPS_PER_MPH = 0.44704;
export const KG_PER_LB = 0.45359237;

/**
 * CCA mínimos por litro de cilindrada. Espejo de cca-bateria-auto-temperatura-motor.ts:
 * 300 CCA por cada 1.000 cc, ×2 en diésel; el recomendado es un 20% por encima.
 */
export const CCA_PER_LITER = 300;
export const CCA_DIESEL_FACTOR = 2;
export const CCA_HEADROOM = 1.2;

/** Coeficientes de adherencia neumático-asfalto típicos, para el caso de frenado. */
export const FRICTION = { dry: 0.8, wet: 0.5, snow: 0.25, ice: 0.12 };

const DISCLAIMER =
  'Informational estimate based on the figures you enter. Always follow the values printed on your vehicle’s door-jamb placard and in the owner’s manual — they override any generic calculation, including this one.';

export const hub: HubData = {
  slug: 'en/cars/tires-brakes-and-specs',
  title: 'Tire Size, PSI, Payload, Battery CCA and Stopping Distance Calculator',
  description:
    'Decode the numbers on your tires, door-jamb placard and owner’s manual: overall tire diameter, correct PSI, GVWR payload in pounds, battery cold-cranking amps, torque conversions and real stopping distance.',
  silo: 'Cars',
  siloHref: '/en/cars',
  locale: 'en',

  eyebrow: 'Specs & safety',
  h1: 'What do the numbers on my car’s stickers actually mean?',
  lede:
    'Tire sidewall, door-jamb placard, battery label, torque table, brake test — six sets of numbers that decide whether your speedometer reads true, whether the truck is legal loaded, whether it starts in January and how much room you need to stop. All of them, converted properly, in one place.',
  stamps: [
    'Exact conversion factors (NIST SP 811), not rounded ones',
    'US units first: inches, psi, pounds, feet, mph',
    'Standard gravity g = 9.80665 m/s²',
    'Replaces 6 single-purpose calculators',
  ],

  resultLabel: 'Your number',

  cases: {
    title: 'Which number are you decoding?',
    intro:
      'Pick the spec you are checking. Only the fields that case needs are read — the rest are ignored.',
    items: [
      {
        id: 'tiresize',
        label: 'Tire size (225/45 R17 and friends)',
        hint: 'Overall diameter, circumference, revolutions per mile, and the speedometer error if you change size.',
        yes: [
          'Sidewall height from the width and the aspect ratio',
          'Overall diameter in inches and millimetres',
          'Rolling circumference and revolutions per mile',
          'Speedometer error against your current size',
        ],
        warn: [
          DISCLAIMER,
          'Change the overall diameter and both the speedometer and the odometer go wrong by the same percentage — a larger tire makes you read slow and undercount miles, which quietly inflates any mpg you calculate.',
          'Most manufacturers accept about ±3% overall diameter. Beyond that you risk rubbing, ABS and traction-control calibration errors, and in some states an inspection failure.',
        ],
        plazo: 'Replace tires at 4/32" of tread for wet driving, not the legal 2/32" — wet stopping distance falls off a cliff below 4/32".',
        answer:
          'Overall diameter = (section width × aspect ÷ 100 × 2) + rim diameter. A 225/45 R17 comes out at 25.0 inches, or 635 mm.',
      },
      {
        id: 'pressure',
        label: 'Tire pressure (psi, bar or kPa)',
        hint: 'Convert between units and check the value against the normal range for a passenger car.',
        yes: [
          'The same pressure expressed in psi, bar and kPa',
          'Where it sits against the usual passenger-car range',
          'The fuel-economy and wear penalty of being under-inflated',
        ],
        warn: [
          DISCLAIMER,
          'Use the pressure on the door-jamb placard, never the number moulded into the tire sidewall — that one is the tire’s maximum, not your car’s specification.',
          'Set pressures cold, before driving. Tires gain roughly 1 psi for every 10°F of heat, so a "correct" reading after an hour on the interstate is actually under-inflated.',
          'Pressure also drops about 1 psi for every 10°F of ambient temperature fall — which is why the TPMS light appears on the first cold morning of autumn.',
        ],
        plazo: 'Check pressures monthly and before any long trip, with the tires cold.',
        answer:
          '1 bar = 14.5038 psi = 100 kPa. Most passenger cars want 30–35 psi cold; loaded SUVs and pickups run higher, per the placard.',
      },
      {
        id: 'stopping',
        label: 'Stopping distance at this speed',
        hint: 'Reaction distance plus braking distance, in feet, on dry, wet, snow or ice.',
        yes: [
          'Reaction distance from your reaction time and speed',
          'Braking distance from speed and the grip of the surface',
          'Total stopping distance in feet and in car lengths',
        ],
        warn: [
          DISCLAIMER,
          'Braking distance grows with the SQUARE of speed. Doubling from 30 to 60 mph does not double it — it quadruples it. That is the single most under-appreciated number in driving.',
          'This is an idealised physics model: it assumes full ABS braking, an even surface and healthy tires. Worn tires, a loaded vehicle, downhill grade or cold brakes all make it worse.',
          'Reaction time of 1 second is alert and expecting it. Distracted or surprised, 1.5 to 2.5 seconds is more realistic — and every extra second at 60 mph is another 88 feet.',
        ],
        plazo: 'The two-second following rule is a reaction-time rule only — it does not include braking distance. Make it four seconds in the wet.',
        answer:
          'Total stopping distance = (speed × reaction time) + speed² ÷ (2 × friction × g). At 60 mph on dry asphalt with a 1-second reaction, that is about 240 feet.',
      },
      {
        id: 'payload',
        label: 'How much this truck can legally carry',
        hint: 'Payload from GVWR minus curb weight, and what passengers eat into it.',
        yes: [
          'Payload capacity = GVWR − curb weight',
          'What remains after passengers are seated',
          'Payload as a share of the vehicle’s gross rating',
        ],
        warn: [
          DISCLAIMER,
          'Payload includes everything: passengers, fuel beyond the base fill, tools, tongue weight from a trailer, and the bed liner. It is not just what is in the bed.',
          'Exceeding GVWR overloads the brakes, tires and suspension, can void insurance in a claim, and is a citable offence at a weigh station.',
          'GVWR is not GCWR. If you are towing, the trailer’s tongue weight lands on your payload, and the combined rating is the one that limits the whole rig.',
        ],
        plazo: 'The exact payload for your specific truck is on the yellow sticker in the driver’s door jamb — trim, cab, drivetrain and options all change it.',
        answer:
          'Payload = GVWR − curb weight. A half-ton pickup at 7,000 lb GVWR and 5,200 lb curb weight carries 1,800 lb, including everyone in the cab.',
      },
      {
        id: 'battery',
        label: 'What battery (CCA) this engine needs',
        hint: 'Minimum and recommended cold-cranking amps for the displacement and fuel type.',
        yes: [
          'Minimum CCA for the displacement, doubled for diesel',
          'A recommended figure with 20% headroom for cold mornings',
          'What the extra headroom buys you in a hard winter',
        ],
        warn: [
          DISCLAIMER,
          'CCA is rated at 0°F (−18°C). A battery delivers roughly half its rated cranking power at that temperature while the engine needs about twice the torque to turn over — which is exactly why batteries die in January and not in July.',
          'Never fit a battery with fewer CCA than the manufacturer specifies. More CCA than specified is harmless; the starter draws what it needs.',
          'Group size and terminal layout matter as much as CCA — the battery has to physically fit and clamp down, or it will not survive the vibration.',
        ],
        plazo: 'Have the battery load-tested every autumn once it is over three years old; most fail in their fourth or fifth winter.',
        answer:
          'A rough floor is 300 CCA per litre of displacement for gasoline and double that for diesel, plus 20% headroom. Always check it against the owner’s manual.',
      },
      {
        id: 'torque',
        label: 'Torque spec conversion (lb-ft ↔ N·m ↔ kg·m)',
        hint: 'Convert a torque figure between the three units, with exact factors.',
        yes: [
          'The same torque in lb-ft, N·m and kg·m',
          'Exact conversion factors, so the round trip closes',
          'Reference values for lug nuts and common fasteners',
        ],
        warn: [
          DISCLAIMER,
          'Factors here are exact by definition (1 lbf·ft = 1.3558179483314 N·m), not the rounded 1.356 and 0.738 pairs found in older tables — with rounded reciprocals a conversion and its inverse do not return the same number.',
          'Over-torquing a wheel stud stretches it and warps the brake rotor; under-torquing lets the wheel work loose. Use a calibrated torque wrench, not an impact gun, for the final tightening.',
          'Torque specs assume clean, dry threads unless the manual says otherwise. Oiled threads reach a much higher clamp load at the same reading, and that is how bolts snap.',
        ],
        plazo: 'Re-torque wheel nuts after 50 to 100 miles on newly fitted wheels.',
        answer:
          '1 lb-ft = 1.35582 N·m and 1 kg·m = 9.80665 N·m. A typical passenger-car lug nut spec of 100 lb-ft is 135.6 N·m.',
      },
    ],
  },

  inputsTitle: 'The numbers you are reading off',
  inputsIntro: 'Fill in the fields for the case you picked — everything else is ignored.',
  fields: [
    { id: 'width', label: 'Tire section width', type: 'number', value: 225, suffix: 'mm', min: 100, max: 400, step: 5 },
    { id: 'aspect', label: 'Aspect ratio', type: 'number', value: 45, suffix: '%', min: 20, max: 90, step: 5 },
    { id: 'rim', label: 'Rim diameter', type: 'number', value: 17, suffix: 'in', min: 10, max: 26, step: 1 },
    { id: 'refdiam', label: 'Diameter of the size you are replacing', type: 'number', value: 0, suffix: 'in', min: 0, step: 0.1, help: 'Leave at 0 to skip the speedometer-error check.' },
    { id: 'pressure', label: 'Pressure reading', type: 'number', value: 35, min: 0, step: 0.5 },
    {
      id: 'punit',
      label: 'Pressure is given in',
      type: 'select',
      value: 'psi',
      options: [
        { value: 'psi', label: 'psi' },
        { value: 'bar', label: 'bar' },
        { value: 'kpa', label: 'kPa' },
      ],
    },
    { id: 'speed', label: 'Speed', type: 'number', value: 60, suffix: 'mph', min: 1, max: 160, step: 5 },
    {
      id: 'surface',
      label: 'Road surface',
      type: 'select',
      value: 'dry',
      options: [
        { value: 'dry', label: 'Dry asphalt (μ ≈ 0.80)' },
        { value: 'wet', label: 'Wet asphalt (μ ≈ 0.50)' },
        { value: 'snow', label: 'Packed snow (μ ≈ 0.25)' },
        { value: 'ice', label: 'Ice (μ ≈ 0.12)' },
      ],
    },
    { id: 'reaction', label: 'Your reaction time', type: 'number', value: 1, suffix: 'seconds', min: 0.2, max: 4, step: 0.1 },
    { id: 'gvwr', label: 'GVWR from the door-jamb placard', type: 'number', value: 7000, suffix: 'lb', min: 0, step: 100, thousands: true },
    { id: 'curb', label: 'Curb weight', type: 'number', value: 5200, suffix: 'lb', min: 0, step: 100, thousands: true },
    { id: 'people', label: 'People riding along', type: 'number', value: 2, min: 0, max: 9, step: 1 },
    { id: 'displacement', label: 'Engine displacement', type: 'number', value: 2, suffix: 'liters', min: 0.5, max: 8, step: 0.1 },
    {
      id: 'fuel',
      label: 'Fuel type',
      type: 'select',
      value: 'gas',
      options: [
        { value: 'gas', label: 'Gasoline' },
        { value: 'diesel', label: 'Diesel' },
      ],
    },
    { id: 'torque', label: 'Torque value', type: 'number', value: 100, min: 0, step: 1 },
    {
      id: 'tunit',
      label: 'Torque is given in',
      type: 'select',
      value: 'lbft',
      options: [
        { value: 'lbft', label: 'lb-ft' },
        { value: 'nm', label: 'N·m' },
        { value: 'kgm', label: 'kg·m' },
      ],
    },
  ],
  fineprint: DISCLAIMER,

  chart: {
    type: 'donut',
    title: 'How the number splits',
    caption:
      'The composition behind the result — reaction versus braking distance, tare versus payload, sidewall versus rim, depending on the case you chose.',
  },

  breakdownTitle: 'Line by line',
  breakdownIntro: 'Conversion factors are the exact defined values, so every round trip closes on itself.',

  faq: [
    {
      q: 'How do I read a tire size like 225/45 R17?',
      a: '225 is the section width in millimetres, 45 is the aspect ratio — the sidewall height as a percentage of that width — and 17 is the rim diameter in inches. So the sidewall is 225 × 0.45 = 101 mm tall, and the overall diameter is that twice plus the rim: 202 + 432 = 634 mm, about 25 inches.',
    },
    {
      q: 'What happens to my speedometer if I fit bigger tires?',
      a: 'It reads low by the same percentage the diameter grew, and the odometer undercounts by the same amount. A 3% larger tire means you are actually doing 62 mph when the needle says 60, and 100 recorded miles are really 103. That also inflates any mpg figure you calculate from the odometer.',
    },
    {
      q: 'Should I use the pressure on the tire or on the door sticker?',
      a: 'The door sticker, always. The number moulded into the sidewall is the maximum pressure the tire can safely hold, not the pressure your car was engineered around. Inflating to the sidewall maximum gives a harsh ride, centre-band wear and less grip.',
    },
    {
      q: 'Why does the TPMS light come on when the weather turns cold?',
      a: 'Air pressure falls roughly 1 psi for every 10°F drop in temperature. A tire set to 33 psi on a 75°F afternoon reads about 29 psi on a 35°F morning, which is enough to trip a system that warns at 25% below placard. Top up cold, in the morning, rather than after driving.',
    },
    {
      q: 'How long does it take to stop from 60 mph?',
      a: 'On dry asphalt with a one-second reaction time, roughly 240 feet in total: about 88 feet while you react and around 150 feet of actual braking. In the wet the braking part alone stretches past 240 feet, which is why the classic two-second following rule becomes four in the rain.',
    },
    {
      q: 'Why does speed matter so much more than it seems?',
      a: 'Because braking distance is proportional to speed squared while reaction distance is only proportional to speed. Going from 30 to 60 mph doubles reaction distance but quadruples braking distance. The same reason explains why a small speed reduction produces a disproportionately large safety gain.',
    },
    {
      q: 'What is included in a truck’s payload?',
      a: 'Everything that is not the truck: driver, passengers, cargo, aftermarket accessories, and the tongue weight of any trailer. That last one catches people out — a 700-pound tongue weight consumes most of a half-ton pickup’s payload before you have loaded the bed at all.',
    },
    {
      q: 'What is the difference between GVWR and GCWR?',
      a: 'GVWR is the maximum the truck itself may weigh, fully loaded. GCWR is the maximum for the truck and trailer combined. You can be under GVWR and still over GCWR, or the reverse — both limits have to be respected, and the axle ratings underneath them as well.',
    },
    {
      q: 'How many cold-cranking amps do I need?',
      a: 'Start with what the owner’s manual specifies; that number already accounts for the starter, the compression ratio and the climate the vehicle was designed for. As a sanity check, roughly 300 CCA per litre of displacement for gasoline and double that for diesel gets you in the right neighbourhood, and 20% more is cheap insurance in a cold climate.',
    },
    {
      q: 'Why do batteries always fail on the coldest morning?',
      a: 'Two things happen at once. Cold thickens the engine oil so the starter needs roughly twice the torque, and cold slows the battery’s chemistry so it delivers around half its rated output. A battery that was marginal in October simply cannot bridge that gap in January.',
    },
    {
      q: 'Is 1 lb-ft exactly 1.356 N·m?',
      a: 'Not exactly — it is 1.3558179483314 N·m, derived from three exact definitions: the avoirdupois pound (0.45359237 kg), standard gravity (9.80665 m/s²) and the international foot (0.3048 m). The difference from 1.356 is tiny, but tables that pair a rounded 1.356 with a rounded 0.738 for the reverse do not round-trip, and the error compounds on repeated conversions.',
    },
    {
      q: 'What torque do wheel lug nuts take?',
      a: 'Passenger cars are typically 80–100 lb-ft, light trucks 100–140 lb-ft, but the manual is the authority and the spread is wide. Tighten in a star pattern with a calibrated torque wrench — an impact gun cannot be trusted for the final pass — and re-torque after 50 to 100 miles on newly mounted wheels.',
    },
  ],

  sources: [
    { name: 'Tires — maintenance, pressure and tread', url: 'https://www.nhtsa.gov/equipment/tires', publisher: 'NHTSA' },
    { name: 'Tire and Loading Information placard / GVWR', url: 'https://www.nhtsa.gov/document/tire-safety-everything-rides-it', publisher: 'NHTSA' },
    { name: 'SAE J537 — storage batteries and cold cranking amps', url: 'https://www.sae.org/standards/content/j537_201607/', publisher: 'SAE International' },
    { name: 'NIST Special Publication 811 — exact conversion factors', url: 'https://www.nist.gov/pml/special-publication-811', publisher: 'NIST' },
    { name: 'Standard acceleration of gravity (g = 9.80665 m/s²)', url: 'https://physics.nist.gov/cgi-bin/cuu/Value?gn', publisher: 'NIST / CODATA' },
  ],

  replaces: [
    '/en/tire-diameter-calculator',
    '/en/tire-pressure-psi-bar-conversion',
    '/en/stopping-distance-speed-friction',
    '/en/truck-payload-capacity-calculator',
    '/en/car-battery-cca-calculator',
    '/en/conversion-torque-nm-lb-ft-kgm',
  ],

  lastReviewed: '2026-07-28',
};
