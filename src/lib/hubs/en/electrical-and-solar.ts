import type { HubData } from '../types';

/**
 * Hub de decisión EN (mercado US) — "What wire gauge, what breaker, and how
 * many solar panels?".
 *
 * Ramas y fórmulas vivas portadas:
 *   electricidad-cable-amperaje.ts            → long run / voltage drop
 *   cable-awg-amperaje-seccion.ts             → branch circuit wire gauge
 *   panel-solar-kw-consumo-hogar-autoconsumo.ts → solar array sizing
 *   factor-potencia-corregir.ts               → power factor correction
 *
 * Dos hallazgos de la auditoría contra las fórmulas originales, aplicados acá
 * y explicados en el desglose:
 *
 * 1. La tabla de amperajes de cable-awg-amperaje-seccion.ts (14→15 A, 12→20,
 *    10→30, 8→40, 6→55, 4→70, 2→95) coincide EXACTAMENTE con la columna de
 *    60 °C de la NEC Table 310.16. No hubo que inventar nada: se completó la
 *    tabla con las columnas de 75 y 90 °C y con los calibres que faltaban.
 *    Las filas 18 y 16 AWG del original NO son conductores de circuito
 *    ramal en la NEC: son cables flexibles de la Table 400.5, y por eso acá
 *    la escalera arranca en 14 AWG.
 *
 * 2. electricidad-cable-amperaje.ts calcula la caída de tensión con
 *    ρ = 0.0178 Ω·mm²/m, que equivale a K = 10.7 Ω·cmil/ft. La práctica
 *    americana usa K = 12.9 para cobre trenzado a 75 °C. Portar el 0.0178
 *    tal cual subestima la caída de tensión un 20% y puede dejar un cable
 *    un calibre por debajo del que corresponde.
 */

/** Disclaimer YMYL — src/lib/disclaimers.ts, dominio 'construction-materials', idioma en. */
const DISCLAIMER_MATERIALS =
  'Material and quantity estimate. Check coverage, waste, and application against the manufacturer’s specifications or the professional in charge.';

/**
 * NEC Table 310.16 — ampacidad de conductores de cobre aislados, 0-2000 V,
 * en las columnas de 60 °C, 75 °C y 90 °C. `cmil` son mils circulares, que es
 * lo que necesita la fórmula de caída de tensión americana.
 * `maxOcpd` aplica la restricción de la NEC 240.4(D) para 14, 12 y 10 AWG.
 */
export const AWG = [
  { awg: '14', cmil: 4110, mm2: 2.08, a60: 15, a75: 20, a90: 25, maxOcpd: 15 },
  { awg: '12', cmil: 6530, mm2: 3.31, a60: 20, a75: 25, a90: 30, maxOcpd: 20 },
  { awg: '10', cmil: 10380, mm2: 5.26, a60: 30, a75: 35, a90: 40, maxOcpd: 30 },
  { awg: '8', cmil: 16510, mm2: 8.37, a60: 40, a75: 50, a90: 55, maxOcpd: 0 },
  { awg: '6', cmil: 26240, mm2: 13.3, a60: 55, a75: 65, a90: 75, maxOcpd: 0 },
  { awg: '4', cmil: 41740, mm2: 21.2, a60: 70, a75: 85, a90: 95, maxOcpd: 0 },
  { awg: '3', cmil: 52620, mm2: 26.7, a60: 85, a75: 100, a90: 115, maxOcpd: 0 },
  { awg: '2', cmil: 66360, mm2: 33.6, a60: 95, a75: 115, a90: 130, maxOcpd: 0 },
  { awg: '1', cmil: 83690, mm2: 42.4, a60: 110, a75: 130, a90: 145, maxOcpd: 0 },
  { awg: '1/0', cmil: 105600, mm2: 53.5, a60: 125, a75: 150, a90: 170, maxOcpd: 0 },
  { awg: '2/0', cmil: 133100, mm2: 67.4, a60: 145, a75: 175, a90: 195, maxOcpd: 0 },
  { awg: '3/0', cmil: 167800, mm2: 85.0, a60: 165, a75: 200, a90: 225, maxOcpd: 0 },
  { awg: '4/0', cmil: 211600, mm2: 107.2, a60: 195, a75: 230, a90: 260, maxOcpd: 0 },
];

/** Constante de resistividad para caída de tensión, cobre trenzado a 75 °C. */
export const K_COPPER = 12.9;
/** La misma constante que sale de ρ = 0.0178 Ω·mm²/m de la fórmula original. */
export const K_FROM_METRIC = 10.7;

/** Calibres estándar de interruptores termomagnéticos, NEC 240.6(A). */
export const BREAKERS = [15, 20, 25, 30, 35, 40, 45, 50, 60, 70, 80, 90, 100, 110, 125, 150, 175, 200];

/** NEC 210.19(A) y 210.20(A): las cargas continuas se dimensionan al 125%. */
export const CONTINUOUS_FACTOR = 1.25;

/** Área de un panel fotovoltaico residencial típico, en pies cuadrados. */
export const PANEL_SQFT = 23.7;
/** Peso de un panel: unos 50 lb (22 kg). */
export const PANEL_LB = 50;
/** Eficiencia global del sistema (derating de PVWatts): 80%. */
export const SYSTEM_EFF = 0.8;
/** Crédito fiscal federal por energía limpia residencial, IRC §25D. */
export const FEDERAL_CREDIT = 0.3;

export const hub: HubData = {
slug: 'en/home/electrical-and-solar',
  title: 'Wire gauge, breaker size and solar panel calculator (NEC)',
  description:
    'Size branch circuit wire and breakers from NEC Table 310.16 ampacity and voltage drop, work out how many solar panels your bill needs, and calculate the capacitor for power factor correction.',
  silo: 'Home & Building',
siloHref: '/en/home',
  locale: 'en',

  eyebrow: 'US · NEC · wire, breakers and solar',
  h1: 'What wire gauge, what breaker, and how many solar panels?',
  lede:
    'Two rules decide a conductor and they do not always agree: the ampacity table says the wire will not overheat, and the voltage drop calculation says the load will actually see the voltage it needs. On a short run the table wins; on a long one the voltage drop always does. Run both here, along with the panel count for your electricity bill and the capacitor for a poor power factor.',
  stamps: [
    'NEC Table 310.16 · 240.4(D) · 240.6(A)',
    'Voltage drop at K = 12.9 for stranded copper',
    '4 calculators inside',
  ],

  resultLabel: 'Conductor and protection',

  cases: {
    title: 'What are you sizing?',
    intro:
      'Wire and breaker first, then the two calculations that hang off them: how much of your bill solar can cover, and what a bad power factor is costing you.',
    items: [
      {
        id: 'wire',
        label: 'Branch circuit wire and breaker',
        hint: 'AWG · ampacity · breaker size',
        answer: 'The conductor has to carry the load and the breaker has to protect the conductor.',
        yes: [
          'NEC Table 310.16 gives the ampacity of copper conductors in three temperature columns: 60, 75 and 90 °C',
          'Which column applies depends on the terminations, not the wire: NEC 110.14(C) generally forces the 60 °C column at or below 100 A and the 75 °C column above it',
          'A continuous load — one running three hours or more — is sized at 125% of its actual current',
          'NEC 240.4(D) caps overcurrent protection regardless of the table: 15 A on 14 AWG, 20 A on 12 AWG, 30 A on 10 AWG',
          'The breaker protects the wire, so it can never exceed the conductor ampacity, whatever the load happens to be',
        ],
        warn: [
          DISCLAIMER_MATERIALS,
          'Ampacity has to be derated for ambient temperature above 30 °C and for more than three current-carrying conductors in a raceway — both are common and both make the wire smaller than the table suggests',
          'Aluminum conductors have completely different ampacities and need listed terminations and antioxidant compound: none of this applies to them',
          'Electrical work is permitted and inspected work in essentially every US jurisdiction. A calculation is not a substitute for a licensed electrician',
        ],
        plazo: 'get the rough-in inspected before the walls close — an inspector will not sign off on what he cannot see.',
      },
      {
        id: 'longrun',
        label: 'Long run — voltage drop',
        hint: 'Detached garage, well pump, shop',
        answer: 'On a long run the voltage drop, not the ampacity table, decides the wire size.',
        yes: [
          'Voltage drop equals 2 × K × current × one-way length, divided by the circular mils of the conductor',
          'K is 12.9 ohm-circular-mils per foot for stranded copper at 75 °C',
          'The NEC recommends keeping the branch circuit drop to 3% and the whole feeder-plus-branch drop to 5%',
          'That recommendation is informational, not enforceable — but a motor starting at 8% low volts is a motor that overheats',
          'The fix is always the same: go up in wire size until the drop fits, which frequently means two or three gauges above what ampacity alone would allow',
        ],
        warn: [
          DISCLAIMER_MATERIALS,
          'Length in the formula is one way; the factor of 2 accounts for the return path, so do not double the distance yourself',
          'Voltage drop hurts motors far more than resistive loads: low voltage means high current means overheating windings, which is how well pumps die',
          'On a three-phase run the factor is the square root of 3, not 2 — this branch is single-phase',
        ],
        plazo: 'decide the wire size before you trench: pulling a bigger conductor later means opening the trench again.',
      },
      {
        id: 'solar',
        label: 'Solar panels for the house',
        hint: 'Panel count · kW system · roof area',
        answer: 'Panel count is your monthly bill divided by what one panel generates in a month.',
        yes: [
          'Monthly generation per panel is its rated power in kW times the peak sun hours per day times 30 days times the system efficiency',
          'Peak sun hours run from about 3.5 in the Pacific Northwest and New England to 6 in the desert Southwest',
          'System efficiency around 80% accounts for inverter losses, wiring, soiling, temperature and mismatch',
          'In the northern hemisphere the array wants to face south — the opposite of what a southern-hemisphere sizing tool will tell you',
          'A typical residential panel is 400 W and takes about 24 square feet of unshaded roof',
          'The federal Residential Clean Energy Credit is worth 30% of the installed cost against your tax liability',
        ],
        warn: [
          DISCLAIMER_MATERIALS,
          'Covering 100% of your annual kWh is not the same as never paying a bill: net metering rules, time-of-use rates and non-bypassable charges all decide what you actually save',
          'Shading is brutally non-linear — one shaded panel in a string can knock down the whole string unless you have optimizers or microinverters',
          'Roof structure, age and interconnection limits all constrain the array before the arithmetic does. Do not put a 25-year array on a 5-year roof',
        ],
        plazo: 'the federal credit applies in the tax year the system is placed in service, not the year you sign the contract.',
      },
      {
        id: 'pf',
        label: 'Power factor correction',
        hint: 'kVAR · capacitor · freed capacity',
        answer: 'The capacitor supplies the reactive power so the utility does not have to.',
        yes: [
          'Reactive power to add is real power times the difference between the tangents of the two phase angles',
          'Capacitance follows from that: kVAR divided by two pi times frequency times voltage squared',
          'US distribution runs at 60 Hz, not 50 — a capacitor sized on a 50 Hz table will be about 20% off',
          'Correcting the power factor lowers the apparent power, freeing transformer, conductor and breaker capacity you already paid for',
          'Most utility power factor penalties start below 0.90 or 0.95, which is why those are the usual targets',
        ],
        warn: [
          DISCLAIMER_MATERIALS,
          'Residential accounts in the US are billed on kWh and almost never on power factor: this branch is for commercial and industrial services',
          'Overcorrecting into a leading power factor causes voltage rise and can be penalized as heavily as lagging — do not aim for unity',
          'Capacitors and variable frequency drives interact badly: harmonic resonance can destroy the capacitors and the drives together. Harmonic-rich installations need a detuned filter, not a plain capacitor bank',
        ],
        plazo: 'switch capacitor banks with the load rather than leaving them fixed, or the plant goes leading at night.',
      },
    ],
  },

  inputsTitle: 'The circuit and the bill',
  inputsIntro: 'Amps, feet, volts and kilowatt-hours. Only the fields your branch reads affect the result.',
  fields: [
    { id: 'load_a', label: 'Load current (A)', type: 'number', value: 24, min: 0, step: 1, help: 'The actual current the equipment draws, before any continuous-load adjustment.' },
    {
      id: 'volts',
      label: 'System voltage',
      type: 'select',
      value: '240',
      options: [
        { value: '120', label: '120 V — general lighting and receptacles' },
        { value: '240', label: '240 V — dryers, ranges, subpanels, well pumps' },
        { value: '208', label: '208 V — three-phase commercial' },
      ],
      help: 'Voltage drop is a percentage of this, so 240 V circuits tolerate twice the length of 120 V ones.',
    },
    {
      id: 'continuous',
      label: 'Continuous load',
      type: 'select',
      value: 'no',
      options: [
        { value: 'no', label: 'No — intermittent duty' },
        { value: 'yes', label: 'Yes — runs three hours or more' },
      ],
      help: 'NEC 210.19(A) and 210.20(A): continuous loads are sized at 125%.',
    },
    { id: 'distance_ft', label: 'One-way run length (ft)', type: 'number', value: 100, min: 0, step: 5, help: 'Panel to load, measured one way. The formula already accounts for the return conductor.' },
    { id: 'vd_max', label: 'Maximum voltage drop (%)', type: 'number', value: 3, min: 1, max: 10, step: 0.5, help: 'NEC informational recommendation: 3% on a branch circuit, 5% for feeder plus branch.' },
    { id: 'monthly_kwh', label: 'Monthly electricity use (kWh)', type: 'number', value: 900, min: 0, step: 50, help: 'From your utility bill. US household average is about 900 kWh a month.' },
    { id: 'psh', label: 'Peak sun hours per day', type: 'number', value: 4.5, min: 1, max: 8, step: 0.1, help: '3.5 in the Pacific Northwest, 4.5 in the Midwest and Northeast, 5.5 to 6 in the Southwest.' },
    { id: 'panel_w', label: 'Panel rated power (W)', type: 'number', value: 400, min: 50, step: 5, help: '400 W is the typical residential panel today; 450 to 500 W panels are becoming common.' },
    { id: 'pf_kw', label: 'Real power of the installation (kW)', type: 'number', value: 50, min: 0, step: 5, help: 'Power factor branch: the kW the plant actually consumes.' },
    { id: 'pf_now', label: 'Current power factor', type: 'number', value: 0.75, min: 0.3, max: 0.99, step: 0.01, help: 'From the utility bill, or measured. Motor-heavy plants often sit at 0.7 to 0.8.' },
    { id: 'pf_target', label: 'Target power factor', type: 'number', value: 0.95, min: 0.5, max: 1, step: 0.01, help: 'Aim just above the utility threshold. Do not aim for 1.0 — overcorrection has its own penalty.' },
  ],
  fineprint: DISCLAIMER_MATERIALS,

  chart: {
    type: 'bars',
    title: 'What the calculation is actually comparing',
    caption:
      'Every branch here is a comparison, not a single figure: the current against the conductor capacity, the voltage drop against the limit, the generation against the bill, the apparent power before against after. The bars put both sides next to each other so the margin is visible.',
  },
  breakdownTitle: 'From the load to the conductor on the reel',
  breakdownIntro:
    'The ampacity check, the voltage drop check, and whichever of the two ends up governing the wire you buy.',

  faq: [
    {
      q: 'What wire gauge do I need for 20 amps?',
      a: 'Twelve AWG copper, protected by a 20 A breaker. NEC Table 310.16 gives 12 AWG a 60 °C ampacity of 20 A, and NEC 240.4(D) caps its overcurrent protection at 20 A no matter what the table says in the warmer columns. Fourteen AWG is 15 A and is not permitted on a 20 A circuit. On runs longer than about 100 feet at 120 V, voltage drop can push you to 10 AWG even though the ampacity is fine.',
    },
    {
      q: 'Which ampacity column of Table 310.16 applies to my circuit?',
      a: 'The one the terminations are rated for, not the one the wire insulation is rated for. NEC 110.14(C) says that for equipment rated 100 A or less — which is most residential work — you use the 60 °C column, and above 100 A the 75 °C column, unless the equipment is specifically listed for a higher temperature. This surprises people: THHN insulation is rated 90 °C, but you almost never get to use the 90 °C column. That column is mostly there as the starting point for derating calculations.',
    },
    {
      q: 'What is a continuous load and why 125%?',
      a: 'A load that runs for three hours or more at a stretch: lighting circuits in a commercial space, EV chargers, some HVAC equipment. NEC 210.19(A) requires the conductor and 210.20(A) the breaker to be sized at 125% of that load. The reason is thermal: breakers and terminations are tested for a short duration, and a circuit sitting at its rating for hours reaches a higher steady-state temperature than the test assumed. A 40 A EV charger is therefore a 50 A circuit.',
    },
    {
      q: 'How do I calculate voltage drop?',
      a: 'Voltage drop equals 2 × K × I × L ÷ CM, where K is 12.9 for stranded copper at 75 °C, I is the current in amps, L is the one-way length in feet, and CM is the conductor area in circular mils. Twenty-four amps over 100 feet on 10 AWG (10,380 cmil) is 2 × 12.9 × 24 × 100 ÷ 10,380, or 5.96 volts — 2.5% on a 240 V circuit and a rather unpleasant 5% on a 120 V one. That asymmetry is why long runs are worth doing at 240 V wherever the load allows.',
    },
    {
      q: 'Is the 3% voltage drop limit actually in the code?',
      a: 'It is in the NEC as an informational note to 210.19(A) and 215.2(A), which means it is a recommendation rather than an enforceable requirement — a note is not a rule. In practice, treat it as one. Below the recommended voltage, incandescent lighting dims noticeably, electronics run their supplies harder, and motors draw more current to deliver the same shaft power, which heats the windings. Well pumps and compressors on undersized long runs are one of the most common causes of premature motor failure.',
    },
    {
      q: 'What size breaker for a given wire?',
      a: 'The breaker protects the conductor, so it must not exceed the conductor ampacity in the applicable column, and for 14, 12 and 10 AWG it is hard-capped by NEC 240.4(D) at 15, 20 and 30 A. Above 10 AWG, standard sizes from 240.6(A) apply, and 240.4(B) lets you round up to the next standard size when the ampacity does not land on one, for circuits of 800 A or less that do not supply receptacles. Never install a bigger breaker to stop nuisance tripping — that is exactly the failure mode the breaker exists to prevent.',
    },
    {
      q: 'How many solar panels do I need?',
      a: 'Divide your monthly kWh by what one panel produces in a month. One 400 W panel at 4.5 peak sun hours and 80% system efficiency yields 0.4 × 4.5 × 30 × 0.8 = 43.2 kWh a month. A 900 kWh bill therefore needs 21 panels, which is about 8.4 kW of array and roughly 500 square feet of unshaded south-facing roof. Peak sun hours are the variable that moves the answer most: the same house in Phoenix needs about a third fewer panels than in Seattle.',
    },
    {
      q: 'Which way should solar panels face in the US?',
      a: 'South, at a tilt roughly equal to your latitude. This is worth stating because sizing tools written for the southern hemisphere say north, and the guidance flips exactly. West-facing arrays produce less total energy but shift it into the late afternoon, which pays better under time-of-use rates in some markets. East-west split arrays flatten the production curve. Any of these beats a shaded south roof.',
    },
    {
      q: 'What is the federal solar tax credit worth?',
      a: 'The Residential Clean Energy Credit under IRC section 25D is 30% of the total installed cost, including equipment, labor, permitting and battery storage, claimed against your federal income tax liability in the year the system is placed in service. It is a credit, not a deduction, and it is non-refundable but can be carried forward. State, utility and local incentives stack on top of it and vary enormously. Tax rules change, so confirm the current terms with the IRS or a tax professional before you count on a number.',
    },
    {
      q: 'What does power factor correction actually save?',
      a: 'It lowers the apparent power, in kVA, that the service has to carry for the same real work in kW. A 50 kW plant at 0.75 power factor pulls 66.7 kVA; corrected to 0.95 it pulls 52.6 kVA. That 14 kVA is transformer, cable and breaker capacity freed up without touching a conductor, and it removes any utility power factor penalty. What it does not do is reduce your kWh consumption — the real power is unchanged, which is why this never pays back on a residential meter.',
    },
    {
      q: 'Why does frequency matter for the capacitor?',
      a: 'Because capacitive reactance depends on it. The capacitance needed is the reactive power divided by two pi times frequency times voltage squared, so at the US 60 Hz you need about 17% less capacitance than the same correction at 50 Hz. A capacitor sized from a European or Latin American table and installed on a 60 Hz service will overcorrect. The kVAR rating stamped on a capacitor is also frequency-specific for the same reason.',
    },
    {
      q: 'How do metric cable sizes convert to AWG?',
      a: 'Not cleanly, because AWG is a geometric series and metric sizes are round numbers of square millimeters. The near equivalents are: 14 AWG is 2.08 mm² against a 2.5 mm² metric size, 12 AWG is 3.31 mm² against 4 mm², 10 AWG is 5.26 mm² against 6 mm², 8 AWG is 8.37 mm² against 10 mm², and 6 AWG is 13.3 mm² against 16 mm². In every case the metric size is the larger one, so substituting AWG for a metric spec without checking ampacity undersizes the conductor.',
    },
  ],

  sources: [
    {
      name: 'NFPA 70 National Electrical Code — Table 310.16, conductor ampacities',
      url: 'https://www.nfpa.org/codes-and-standards/nfpa-70-standard-development/70',
      publisher: 'National Fire Protection Association',
    },
    {
      name: 'NEC 240.4(D) and 240.6(A) — small conductor protection and standard breaker sizes',
      url: 'https://codes.iccsafe.org/codes/national-electrical-code',
      publisher: 'National Fire Protection Association',
    },
    {
      name: 'NREL PVWatts Calculator — production modeling and system derate factors',
      url: 'https://pvwatts.nrel.gov/',
      publisher: 'National Renewable Energy Laboratory',
    },
    {
      name: 'IRS — Residential Clean Energy Credit (IRC §25D)',
      url: 'https://www.irs.gov/credits-deductions/residential-clean-energy-credit',
      publisher: 'Internal Revenue Service',
    },
    {
      name: 'US Energy Information Administration — average residential electricity consumption',
      url: 'https://www.eia.gov/tools/faqs/faq.php?id=97',
      publisher: 'US Energy Information Administration',
    },
    {
      name: 'IEEE Std 141 (Red Book) — power factor correction and capacitor application',
      url: 'https://standards.ieee.org/ieee/141/1275/',
      publisher: 'IEEE',
    },
  ],

  replaces: [
    '/en/electricidad-cable-amperaje-seccion',
    '/en/cable-awg-amperage-section',
    '/en/solar-panel-kw-home-calculator',
    '/en/power-factor-correction',
  ],

lastReviewed: '2026-07-28',
};
