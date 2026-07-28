import type { HubData } from '../types';

/**
 * Hub EN — "How do I get this solution / gas / heat problem right?"
 *
 * Absorbe 6 calculadoras sueltas: dilución C1V1 = C2V2, moles desde masa y masa molar,
 * pOH ↔ pH, ley de gases ideales PV = nRT, eficiencia de Carnot y entropía de cambio de fase.
 *
 * Constantes: SI 2019 exactas. Las fórmulas viejas usaban N_A = 6,022e23 redondeado;
 * acá va el valor exacto 6,02214076e23 (definición del mol desde 2019).
 */

/** Constante universal de los gases, J/(mol·K). CODATA 2018, exacta por definición. */
export const R_GAS = 8.314462618;
/** Número de Avogadro, mol⁻¹. Exacto por definición del mol (SI 2019). */
export const N_A = 6.02214076e23;
/** Cero absoluto en grados Celsius. Exacto. */
export const KELVIN_OFFSET = 273.15;
/** 1 atm en Pa (exacto), y 1 psi en Pa (exacto). */
export const PA_PER_ATM = 101325;
export const PA_PER_PSI = 6894.757293168361;
/** Volumen molar de un gas ideal a 0 °C y 1 atm, L/mol. R·273,15/101325 ×1000. */
export const MOLAR_VOLUME_STP = 22.413969545014137;
/** Calores latentes del agua, J/g (CRC Handbook). */
export const LATENT_FUSION_WATER = 333.55;
export const LATENT_VAPORISATION_WATER = 2256.4;

const DISCLAIMER =
  'Textbook conditions: ideal-gas behaviour, complete mixing, aqueous solutions at 25 °C and a reversible process where the formula assumes one. Real gases deviate at high pressure or near condensation, real solutions are not always additive in volume, and no real engine reaches the Carnot limit. Educational use — for laboratory or process work, follow your own validated procedure and safety data sheets.';

export const hub: HubData = {
  slug: 'en/science/chemistry-and-thermodynamics',
  title: 'Dilution, Moles, pH/pOH, Ideal Gas, Carnot and Entropy Calculator',
  description:
    'Six chemistry and thermodynamics problems in one page: C1V1 = C2V2 dilutions, moles from mass and molar mass, pOH to pH, PV = nRT for any unknown, Carnot efficiency between two temperatures and the entropy change of a phase transition — with the exact 2019 SI constants.',
  silo: 'Science',
  siloHref: '/en/science',
  locale: 'en',

  eyebrow: 'Chemistry & thermodynamics',
  h1: 'How do I get this solution, gas or heat problem right?',
  lede:
    'A stock solution to dilute, a mass to turn into moles, a hydroxide concentration to read as pH, a gas in a fixed volume, an engine between two temperatures, a phase change absorbing heat. Six calculations that share the same handful of constants — and here they are the exact defined ones: R = 8.314462618 J/(mol·K) and Avogadro’s number 6.02214076 × 10²³.',
  stamps: [
    'Exact 2019 SI constants: R, Avogadro, the kelvin',
    'Every temperature handled in kelvin, with °C and °F shown',
    'Volumes in litres, millilitres and US fluid ounces',
    'Replaces 6 single-purpose calculators',
  ],

  resultLabel: 'Your answer',

  cases: {
    title: 'Which problem are you solving?',
    intro:
      'Pick your calculation. Only the fields it needs are read — leave the rest alone.',
    items: [
      {
        id: 'dilution',
        label: 'Dilute a stock solution (C₁V₁ = C₂V₂)',
        hint: 'How much stock, how much solvent, what final concentration.',
        yes: [
          'Volume of stock to measure out',
          'Volume of solvent to add on top of it',
          'The final concentration you actually end up with',
        ],
        warn: [
          DISCLAIMER,
          'C₁V₁ = C₂V₂ only works when both concentrations are in the SAME unit and both volumes in the same unit. Molar with molar, mL with mL. The equation cannot warn you when they are not.',
          'The solvent to ADD is the final volume minus the stock volume, not the final volume. Adding a full final volume of solvent to your stock overshoots every time.',
          'Volumes are not always additive: mixing 50 mL of ethanol with 50 mL of water gives about 96 mL, not 100. For accurate work make up to the mark in a volumetric flask instead of measuring the solvent separately.',
          'Always add acid to water, never water to acid. The dilution of concentrated acid is strongly exothermic and can boil and spatter.',
        ],
        plazo: 'Label the working solution with the concentration, the solvent and the date the moment you make it — an unlabelled beaker is a discarded beaker.',
        answer:
          'C₁V₁ = C₂V₂. To make 500 mL of 0.1 M from a 1 M stock: take 50 mL of stock and make it up to 500 mL, which means adding about 450 mL of solvent.',
      },
      {
        id: 'moles',
        label: 'Turn a mass into moles (and molecules)',
        hint: 'n = m / M, plus the number of particles that represents.',
        yes: [
          'Amount of substance in moles and millimoles',
          'The number of molecules, using the exact Avogadro constant',
          'How much mass one mole and one millimole weigh',
        ],
        warn: [
          DISCLAIMER,
          'Molar mass is not molecular mass in the same breath as formula mass: for ionic compounds like NaCl there is no molecule, so what you are counting is formula units, not molecules.',
          'Hydrates count their water. Copper sulfate pentahydrate is 249.68 g/mol, not the 159.61 of the anhydrous salt — using the wrong one is a 56% error.',
          'Since 2019 the mole is defined as exactly 6.02214076 × 10²³ entities, so Avogadro’s number is no longer a measured quantity with an uncertainty. Tables still printing 6.022 × 10²³ are rounding a defined value.',
        ],
        plazo: 'Weigh by difference on an analytical balance for anything under a gram: tare drift is larger than you think at the fourth decimal.',
        answer:
          'n = mass ÷ molar mass. 18.015 g of water is exactly 1 mole, or 6.02214076 × 10²³ molecules.',
      },
      {
        id: 'poh',
        label: 'Convert [OH⁻] into pOH and pH',
        hint: 'pOH = −log₁₀[OH⁻], and pH = 14 − pOH at 25 °C.',
        yes: [
          'pOH from the hydroxide concentration',
          'The matching pH and where the solution sits on the scale',
          'The hydrogen-ion concentration that goes with it',
        ],
        warn: [
          DISCLAIMER,
          'pH + pOH = 14 only at 25 °C. The ion product of water changes with temperature: at 50 °C the sum is about 13.26, and neutral pH is 6.63, not 7.',
          'The scale is logarithmic. A pH of 4 is ten times more acidic than 5 and a hundred times more than 6 — averaging pH values arithmetically is meaningless.',
          'Concentration is not activity. In concentrated or high-ionic-strength solutions the measured pH departs from the value this calculation gives.',
          'Strong bases are as dangerous as strong acids and less obviously so — they saponify skin and cause deep, initially painless burns. Eye protection is not optional.',
        ],
        plazo: 'Calibrate a pH meter with two buffers that bracket your sample, on the day you use it.',
        answer:
          'pOH = −log₁₀[OH⁻]. A 0.001 M hydroxide solution has pOH 3 and therefore pH 11 at 25 °C — firmly alkaline.',
      },
      {
        id: 'idealgas',
        label: 'Ideal gas law — solve PV = nRT for any unknown',
        hint: 'Moles, pressure, volume or temperature, whichever one you are missing.',
        yes: [
          'The unknown you selected, from the other three',
          'The same result at standard conditions, for a sanity check',
          'Pressure in Pa, atm and psi; temperature in K, °C and °F',
        ],
        warn: [
          DISCLAIMER,
          'Temperature has to be absolute. Feeding the equation degrees Celsius rather than kelvin is the single most common mistake in gas calculations, and at room temperature it is a factor-of-twelve error.',
          'Real gases deviate from ideal behaviour at high pressure and near their condensation point. Below about 10 atm and well above the boiling point the ideal law is good to a few percent.',
          '"Standard conditions" is ambiguous. IUPAC STP is 0 °C and 100 kPa, giving 22.711 L/mol; the older 0 °C and 1 atm gives 22.414 L/mol. State which one you mean.',
        ],
        plazo: 'Never heat a sealed vessel: at constant volume the pressure rises in direct proportion to absolute temperature, and it rises without any visible warning.',
        answer:
          'PV = nRT with R = 8.314462618 J/(mol·K). One mole of an ideal gas occupies 22.414 L at 0 °C and 1 atm.',
      },
      {
        id: 'carnot',
        label: 'Maximum efficiency of a heat engine (Carnot)',
        hint: 'η = 1 − T_cold / T_hot, the ceiling nothing can beat.',
        yes: [
          'The theoretical maximum efficiency between your two temperatures',
          'The fraction of the heat that must be dumped, no matter what',
          'What a realistic real machine would achieve instead',
        ],
        warn: [
          DISCLAIMER,
          'Both temperatures must be in kelvin. Using Celsius here does not just shift the answer, it produces nonsense — and for temperatures below 0 °C it produces a sign error too.',
          'This is a hard ceiling set by the second law, not a target. Real engines lose to friction, incomplete combustion, heat leakage and finite-rate heat transfer, and typically reach half of it or less.',
          'A high Carnot efficiency does not mean high power. The Curzon–Ahlborn limit for an engine actually producing power is 1 − √(T_c/T_h), which is substantially lower.',
        ],
        plazo: 'The cold side is usually what you can actually change: dropping the condenser temperature is often cheaper than raising the combustion temperature.',
        answer:
          'η = 1 − T_c/T_h in kelvin. Between 800 K and 300 K the ceiling is 62.5%, and a real engine there might reach 30–35%.',
      },
      {
        id: 'entropy',
        label: 'Entropy change of a phase transition',
        hint: 'ΔS = Q / T at constant temperature — melting, boiling, freezing.',
        yes: [
          'Entropy change in J/K and the sign that tells you the direction',
          'The heat involved in joules and kilojoules',
          'How your transition compares with melting the same heat into ice water',
        ],
        warn: [
          DISCLAIMER,
          'ΔS = Q/T only holds when the temperature is constant and the process reversible. That is exactly true at a phase transition, and not true when you are simply heating something up — for that you need to integrate C/T.',
          'Temperature must be in kelvin. The formula divides by it, so a Celsius value near zero produces an absurdly large answer and a negative one flips the sign.',
          'Heat released is negative Q, giving negative ΔS for the system. The second law is not violated: the surroundings gain more entropy than the system loses.',
        ],
        plazo: 'Latent heat is why a phase change stalls a temperature reading: melting one gram of ice absorbs 334 J while the thermometer does not move at all.',
        answer:
          'ΔS = Q/T. Melting one kilogram of ice at 273.15 K absorbs 333.55 kJ and raises entropy by 1,221 J/K.',
      },
    ],
  },

  inputsTitle: 'The numbers from your problem',
  inputsIntro:
    'SI units unless a field says otherwise. Fill in what your case needs; the other fields are ignored.',
  fields: [
    {
      id: 'dmode',
      label: 'In the dilution, what are you looking for?',
      type: 'select',
      value: 'v1',
      options: [
        { value: 'v1', label: 'V₁ — how much stock to take' },
        { value: 'v2', label: 'V₂ — the final volume to make up to' },
        { value: 'c2', label: 'C₂ — the final concentration I end up with' },
      ],
    },
    { id: 'c1', label: 'C₁ — stock concentration', type: 'number', value: 1, suffix: 'M', min: 0, step: 0.01 },
    { id: 'v1', label: 'V₁ — volume of stock', type: 'number', value: 50, suffix: 'mL', min: 0, step: 1 },
    { id: 'c2', label: 'C₂ — target concentration', type: 'number', value: 0.1, suffix: 'M', min: 0, step: 0.01 },
    { id: 'v2', label: 'V₂ — final volume', type: 'number', value: 500, suffix: 'mL', min: 0, step: 1 },
    { id: 'massg', label: 'Mass of substance', type: 'number', value: 18.015, suffix: 'g', min: 0, step: 0.001 },
    { id: 'molarmass', label: 'Molar mass', type: 'number', value: 18.015, suffix: 'g/mol', min: 0.001, step: 0.001, help: 'Water 18.015 · NaCl 58.44 · glucose 180.16 · CO₂ 44.01.' },
    { id: 'oh', label: '[OH⁻] hydroxide concentration', type: 'number', value: 0.001, suffix: 'mol/L', min: 0, step: 0.0001 },
    {
      id: 'gmode',
      label: 'In the gas law, what are you solving for?',
      type: 'select',
      value: 'n',
      options: [
        { value: 'n', label: 'n — moles of gas' },
        { value: 'p', label: 'P — pressure' },
        { value: 'v', label: 'V — volume' },
        { value: 't', label: 'T — temperature' },
      ],
    },
    { id: 'gp', label: 'Pressure', type: 'number', value: 101325, suffix: 'Pa', min: 0, step: 100, thousands: true, help: '1 atm = 101,325 Pa · 1 psi = 6,894.76 Pa · 1 bar = 100,000 Pa.' },
    { id: 'gv', label: 'Volume', type: 'number', value: 22.414, suffix: 'L', min: 0, step: 0.001 },
    { id: 'gt', label: 'Temperature', type: 'number', value: 0, suffix: '°C', step: 0.1, help: 'Entered in °C and converted to kelvin for you.' },
    { id: 'gn', label: 'Moles of gas', type: 'number', value: 1, suffix: 'mol', min: 0, step: 0.001 },
    { id: 'thot', label: 'Hot reservoir temperature', type: 'number', value: 800, suffix: 'K', min: 0.01, step: 1 },
    { id: 'tcold', label: 'Cold reservoir temperature', type: 'number', value: 300, suffix: 'K', min: 0.01, step: 1 },
    { id: 'heatq', label: 'Heat absorbed in the transition', type: 'number', value: 333550, suffix: 'J', step: 100, thousands: true, help: 'Negative if the system releases heat. Melting 1 kg of ice absorbs 333,550 J.' },
    { id: 'tphase', label: 'Transition temperature', type: 'number', value: 273.15, suffix: 'K', min: 0.01, step: 0.01 },
  ],
  fineprint: DISCLAIMER,

  chart: {
    type: 'donut',
    title: 'How the answer splits',
    caption:
      'The composition behind the number: stock against solvent, pH against pOH, useful work against the heat an engine must throw away.',
  },

  breakdownTitle: 'Line by line',
  breakdownIntro:
    'R, the Avogadro constant and the kelvin offset are the exact SI values, so nothing here carries the rounding error of a printed table.',

  faq: [
    {
      q: 'How do I dilute a stock solution to a target concentration?',
      a: 'Use C₁V₁ = C₂V₂. Rearranged for the stock volume, V₁ = C₂V₂ ÷ C₁. To make 500 mL of 0.1 M from a 1 M stock: V₁ = 0.1 × 500 ÷ 1 = 50 mL of stock, then make it up to 500 mL total — which is roughly 450 mL of solvent added, not 500.',
    },
    {
      q: 'Do I add the solvent volume or make up to the final volume?',
      a: 'Make up to the final volume, in a volumetric flask, whenever accuracy matters. Volumes are not strictly additive — mixing equal volumes of ethanol and water yields about 4% less than the sum — so measuring the solvent separately introduces an error that making up to the mark avoids entirely.',
    },
    {
      q: 'How do I convert grams into moles?',
      a: 'Divide the mass by the molar mass: n = m ÷ M. 58.44 grams of sodium chloride is one mole because its formula mass is 58.44 g/mol. Multiply the moles by 6.02214076 × 10²³ to get the number of formula units, which since 2019 is an exact defined figure rather than a measured one.',
    },
    {
      q: 'Do I use the anhydrous or hydrated molar mass?',
      a: 'Whichever matches the bottle you are weighing from. Copper sulfate pentahydrate weighs 249.68 g/mol against 159.61 for the anhydrous salt, so weighing out the hydrate while calculating with the anhydrous figure gives you 36% less copper than you intended. Check the label, not the formula you remember.',
    },
    {
      q: 'How do I get pH from a hydroxide concentration?',
      a: 'Take pOH = −log₁₀[OH⁻], then pH = 14 − pOH at 25 °C. A 0.001 M hydroxide solution gives pOH 3 and pH 11. The 14 comes from the ion product of water, Kw = 1.0 × 10⁻¹⁴, and it is the part that changes with temperature.',
    },
    {
      q: 'Is neutral pH always 7?',
      a: 'Only at 25 °C. Neutrality means [H⁺] = [OH⁻], and since Kw rises with temperature, so does the dissociation of water: at 50 °C pure water is neutral at pH 6.63, and at 100 °C at about 6.14. It is not acidic — it is neutral at a different number.',
    },
    {
      q: 'Why must temperature be in kelvin for gas calculations?',
      a: 'Because PV = nRT is a proportionality to absolute temperature, and the Celsius scale has an arbitrary zero. At 25 °C, using 25 instead of 298.15 inflates the answer by a factor of nearly twelve. The same applies to the Carnot efficiency and to ΔS = Q/T.',
    },
    {
      q: 'How much volume does one mole of gas occupy?',
      a: '22.414 litres at 0 °C and 1 atm, or 22.711 litres at IUPAC standard conditions of 0 °C and 100 kPa. At a more practical 25 °C and 1 atm it is 24.465 litres. Because it is an ideal-gas result it holds regardless of which gas you have, to within a few percent at ordinary pressures.',
    },
    {
      q: 'What is Carnot efficiency and why can nothing beat it?',
      a: 'It is 1 − T_cold/T_hot, in kelvin, and it is a consequence of the second law of thermodynamics: any engine that exceeded it could be run in reverse to move heat from cold to hot with no work, which is impossible. Between 800 K and 300 K the ceiling is 62.5%, and no arrangement of materials or cleverness gets past it.',
    },
    {
      q: 'Why do real engines fall so far short of the Carnot limit?',
      a: 'The Carnot cycle is reversible, which means infinitely slow — it produces zero power. Any engine that actually delivers work has to transfer heat at a finite rate, which is inherently irreversible. Add friction, incomplete combustion and exhaust losses and a car engine ends up near 30% where its Carnot ceiling is above 60%.',
    },
    {
      q: 'How do I calculate the entropy change of melting or boiling?',
      a: 'ΔS = Q/T, with Q the latent heat absorbed and T the transition temperature in kelvin. Melting a kilogram of ice takes 333.55 kJ at 273.15 K, so ΔS = +1,221 J/K. Boiling the same kilogram takes 2,256 kJ at 373.15 K, giving +6,047 J/K — vaporisation disorders a substance far more than melting does.',
    },
    {
      q: 'Can entropy decrease?',
      a: 'The entropy of a system can, and does every time water freezes. What cannot decrease is the total entropy of the system plus its surroundings. Freezing releases heat into the room, and the entropy the room gains exceeds what the ice loses, so the balance still goes the right way.',
    },
  ],

  sources: [
    { name: 'Molar gas constant R = 8.314462618 J mol⁻¹ K⁻¹', url: 'https://physics.nist.gov/cgi-bin/cuu/Value?r', publisher: 'NIST / CODATA' },
    { name: 'Avogadro constant = 6.02214076 × 10²³ mol⁻¹ (exact)', url: 'https://physics.nist.gov/cgi-bin/cuu/Value?na', publisher: 'NIST / CODATA' },
    { name: 'The International System of Units — 2019 redefinition of the mole and the kelvin', url: 'https://www.bipm.org/en/publications/si-brochure', publisher: 'BIPM' },
    { name: 'Standard conditions and the molar volume of an ideal gas', url: 'https://goldbook.iupac.org/terms/view/S05910', publisher: 'IUPAC Gold Book' },
    { name: 'NIST Chemistry WebBook — thermophysical properties and latent heats', url: 'https://webbook.nist.gov/chemistry/', publisher: 'NIST' },
  ],

  replaces: [
    '/en/dilution-concentration-c1v1-c2v2',
    '/en/moles-masa-formula-molecular',
    '/en/poh-hydroxide-concentration',
    '/en/gas-ideal-pv-nrt',
    '/en/eficiencia-carnot-termodinamica',
    '/en/entropia-cambio-fase',
  ],

  lastReviewed: '2026-07-28',
};
