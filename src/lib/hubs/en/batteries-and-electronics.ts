import type { HubData } from '../types';

/**
 * Hub EN — "How long will it run, and what supply does it need?"
 *
 * Absorbe 8 calculadoras: autonomía de batería en Ah, autonomía en mAh, dimensionado de
 * fuente DC, carga de parlantes en un amplificador, ángulo de servo por PWM, resolución
 * de motor paso a paso, reactancia inductiva/capacitiva y costo de una pieza impresa en 3D.
 *
 * Constantes espejadas de las fórmulas reales:
 *  - bateria-capacidad-runtime-ah.ts (Wh útil = Ah × V × DoD × eficiencia)
 *  - autonomia-bateria-dispositivo-mah.ts (h = mAh ÷ mA)
 *  - fuente-dc-watts-amperaje.ts (margen 1,3 por defecto)
 *  - amplificador-watts-parlantes.ts (serie z×n, paralelo z÷n; umbrales 4 Ω y 2 Ω)
 *  - servo-pwm-angulo.ts (ángulo = (pulso − 1) × rango)
 *  - stepper-pasos-grado.ts (pasos/rev = 360/ángulo × microstepping)
 *  - reactancia-inductiva-capacitiva.ts (XL = 2πfL, XC = 1/(2πfC))
 *  - costo-impresion-3d-pieza.ts (material + luz + 10% de desgaste, × margen)
 *
 * 🔴 La versión inglesa de la calc de impresión 3D venía con los valores por defecto en
 * PESOS ARGENTINOS (filamento 15.000 "$"/kg y electricidad 120 "$"/kWh). En dólares eso
 * infla el costo unas 750×. Acá los defaults son de mercado estadounidense y el campo es
 * editable: filamento ~USD 20/kg y electricidad ~USD 0,17/kWh (promedio residencial EIA).
 */

/** Filamento PLA de marca, USD por kilo. Editable — el precio se mueve. */
export const FILAMENT_USD_PER_KG = 20;
/** Precio medio residencial de la electricidad en EE. UU., USD por kWh. Editable. */
export const USD_PER_KWH = 0.17;
/** Desgaste de la máquina como porcentaje de material + electricidad. */
export const WEAR_RATE = 0.1;

/** Margen de seguridad por defecto al dimensionar una fuente DC. */
export const PSU_MARGIN = 1.3;

/** Umbrales de impedancia total en la salida de un amplificador, en ohmios. */
export const Z_SAFE = 4;
export const Z_PREMIUM = 2;

/** Servo estándar: pulso neutro y extremos, en milisegundos. */
export const SERVO_MIN_MS = 1;
export const SERVO_NEUTRAL_MS = 1.5;
export const SERVO_MAX_MS = 2;

const DISCLAIMER =
  'Engineering estimate based on the values you enter. Verify units, assumptions and rounding against the datasheet of your actual parts before wiring anything up — and treat mains voltage, lithium cells and anything that gets hot as the hazards they are.';

export const hub: HubData = {
slug: 'en/tech/batteries-and-electronics',
  title: 'Battery Runtime, DC Power Supply, Speaker Load, Servo, Stepper and 3D Print Cost Calculator',
  description:
    'How long a battery in amp-hours or milliamp-hours will run your load, what DC supply the circuit needs, whether a speaker wiring plan is safe for the amplifier, what angle a servo pulse gives, a stepper motor’s resolution, inductive and capacitive reactance, and what a 3D printed part costs in dollars.',
  silo: 'Tech',
siloHref: '/en/tech',
  locale: 'en',

  eyebrow: 'Power & electronics',
  h1: 'How long will it run, and what supply does it need?',
  lede:
    'Bench-side arithmetic for anything that draws current. Real battery runtime once depth of discharge and conversion losses are taken out, the supply rating a circuit actually needs, whether a speaker wiring plan will cook the amplifier, the pulse and step maths behind servos and stepper motors, reactance at a given frequency, and what a printed part costs once you count the electricity.',
  stamps: [
    'Runtime worked out on usable energy, not the number printed on the label',
    'Money in US dollars at US filament and electricity prices, and every price is editable',
    'Impedance thresholds at the 4 Ω and 2 Ω lines amplifiers are actually rated to',
    'Replaces 8 single-purpose calculators',
  ],

  resultLabel: 'Your number',

  cases: {
    title: 'What are you working out?',
    intro:
      'Pick the question. Only the fields that case needs get read — the rest are ignored.',
    items: [
      {
        id: 'battery-ah',
        label: 'Runtime of a battery bank (amp-hours)',
        hint: 'Real hours from capacity, voltage, depth of discharge and conversion efficiency.',
        yes: [
          'Nominal energy in watt-hours from the amp-hour rating',
          'Usable energy after depth of discharge and losses',
          'Runtime in hours at your load',
          'How much of the label capacity you never get to use',
        ],
        warn: [
          DISCLAIMER,
          'Never plan on the nameplate capacity. A lead-acid battery discharged past 50% has its cycle life cut dramatically, and even LiFePO4 is normally limited to 80–90% depth of discharge. The energy you can actually take out is well below the number on the label.',
          'Conversion losses come off on top. An inverter running at 90% efficiency takes another tenth away, and inverters are least efficient at very light loads — a 2,000 W inverter powering a 30 W load can waste more in its own idle draw than the load consumes.',
          'Amp-hours mean nothing without a voltage. A 100 Ah battery at 12 V is 1,200 Wh; the same 100 Ah at 48 V is 4,800 Wh. Always compare in watt-hours, never in amp-hours.',
        ],
        plazo: 'Size the bank for the depth of discharge you intend to use, not the capacity you bought — that is the difference between a bank that lasts a decade and one that lasts two years.',
        answer:
          'Usable watt-hours = amp-hours × volts × depth of discharge × efficiency. Divide by your load in watts for hours of runtime.',
      },
      {
        id: 'battery-mah',
        label: 'Runtime of a small device (milliamp-hours)',
        hint: 'Hours and days from a mAh cell and a milliamp draw.',
        yes: [
          'Runtime in hours and days at a constant draw',
          'What the same cell gives at a heavier draw',
          'A realistic figure after typical battery inefficiency',
        ],
        warn: [
          DISCLAIMER,
          'This is the ideal case: constant current, fresh cell, room temperature. Real batteries deliver roughly 80–90% of it, and a cold cell delivers substantially less again.',
          'A device that sleeps most of the time is not described by a single current figure at all. Work out an average from the duty cycle — sleep current multiplied by sleep time plus active current multiplied by active time — or your estimate will be off by orders of magnitude.',
          'Rechargeable cells lose capacity with every cycle. A battery rated 2,000 mAh typically delivers around 1,600 mAh after a few hundred cycles, which is why an old phone still charges to "100%" and dies by lunchtime.',
        ],
        plazo: 'For anything battery-powered and long-lived, measure the sleep current rather than trusting the datasheet — a stray pull-up resistor can wipe out a year of expected life.',
        answer:
          'Hours = mAh ÷ mA. A 3,000 mAh cell driving 150 mA runs about 20 hours in ideal conditions, and realistically closer to 17.',
      },
      {
        id: 'dc-supply',
        label: 'What DC power supply this circuit needs',
        hint: 'Required watts and amps at your voltage, with a safety margin.',
        yes: [
          'Absolute minimum current at your voltage',
          'Recommended current with a safety margin',
          'The supply wattage to buy',
          'What the margin protects you against',
        ],
        warn: [
          DISCLAIMER,
          'Never run a supply at its rated maximum continuously. Cheap units are rated for peak, not sustained output, and running one at 100% is how it ends up hot, noisy and short-lived. A 30% margin is the normal engineering answer.',
          'Voltage must match; current does not. A device that needs 12 V at 2 A is perfectly happy on a 12 V 5 A supply — it draws only what it needs. But a 12 V supply on a 5 V device destroys it instantly, and polarity matters just as much.',
          'Inrush current at switch-on can be many times the steady-state draw, especially with motors and anything with large capacitors. A supply sized only for the running current may trip its protection every time you turn it on.',
        ],
        plazo: 'Check the polarity and the connector size as carefully as the voltage — centre-positive versus centre-negative has killed more devices than undersized supplies.',
        answer:
          'Current = watts ÷ volts, then add about 30%. A 30 W load at 12 V draws 2.5 A, so buy a 12 V supply rated at 3.25 A or more.',
      },
      {
        id: 'speakers',
        label: 'Whether this speaker wiring is safe for the amp',
        hint: 'Total impedance in series or parallel, watts per speaker and whether the amp survives it.',
        yes: [
          'Total impedance the amplifier sees',
          'Power delivered to each speaker',
          'Whether that load is safe, marginal or dangerous',
          'What the alternative wiring configuration would give',
        ],
        warn: [
          DISCLAIMER,
          'Impedance below the amplifier’s rating is genuinely dangerous. Wiring speakers in parallel divides the impedance, so two 8 Ω speakers in parallel present 4 Ω and four present 2 Ω — at which point most home amplifiers either shut down into protection or fail from excess current.',
          'Series wiring multiplies impedance instead, which is safe for the amplifier but delivers less power and can sound worse, since each speaker is affected by the others’ back-EMF.',
          'Check the amplifier’s minimum rated impedance on its own spec sheet before wiring anything. "It seemed fine" is a common report right up until the output stage fails at volume.',
        ],
        plazo: 'If you need more speakers than the impedance allows, use a second amplifier channel or a proper 70 V distributed line rather than paralleling more onto one output.',
        answer:
          'Parallel divides impedance by the number of speakers; series multiplies it. Stay at or above the amplifier’s minimum rating — usually 4 Ω for home equipment.',
      },
      {
        id: 'servo',
        label: 'What angle a servo pulse gives',
        hint: 'Angle and travel percentage from the PWM pulse width.',
        yes: [
          'The resulting angle for that pulse width',
          'Where it sits as a percentage of the servo’s travel',
          'The pulse widths for the two extremes and the centre',
          'Degrees of movement per microsecond of pulse',
        ],
        warn: [
          DISCLAIMER,
          'The 1 ms to 2 ms convention is a convention, not a standard. Many servos actually travel from about 0.5 ms to 2.5 ms, and driving one past its real mechanical limit makes it buzz, draw heavy current and strip its gears.',
          'Servos are noisy loads. Powering one from the microcontroller’s own regulator causes brownouts and mysterious resets — use a separate supply and tie the grounds together.',
          'A standard servo has no position feedback to you. It holds against load by drawing more current, so a stalled servo can pull an amp or more and overheat within seconds.',
        ],
        plazo: 'Find your specific servo’s real minimum and maximum pulse experimentally, at low speed, before letting any code drive it to an extreme.',
        answer:
          'With the usual convention, 1 ms is one end of travel, 1.5 ms is centre and 2 ms is the other end, spread linearly across the servo’s rated range.',
      },
      {
        id: 'stepper',
        label: 'Resolution of a stepper motor',
        hint: 'Steps per revolution and per degree, from step angle and microstepping.',
        yes: [
          'Steps per full revolution at your microstepping setting',
          'Steps per degree of rotation',
          'The smallest angle the motor can be commanded to',
          'What microstepping costs you in torque',
        ],
        warn: [
          DISCLAIMER,
          'Microstepping improves smoothness and quietness far more than it improves real accuracy. At 1/16 microstepping the holding torque of an individual microstep is a small fraction of a full step, so the motor can be pushed off position without ever losing a full step.',
          'Steppers run open-loop by default: if the load exceeds the torque available the motor skips steps and the controller has no idea. Every position after that is wrong, which is exactly how a 3D print shifts halfway through a layer.',
          'Torque falls as speed rises. A stepper that holds firmly at rest may barely turn at high step rates, so acceleration ramps matter as much as the step maths.',
        ],
        plazo: 'Set the driver current to the motor’s rating rather than the maximum — an overdriven stepper runs hot and loses torque as it heats.',
        answer:
          'Steps per revolution = 360 ÷ step angle × microstepping. A 1.8° motor at 1/16 microstepping gives 3,200 steps per revolution.',
      },
      {
        id: 'reactance',
        label: 'Reactance of a coil or capacitor at this frequency',
        hint: 'XL and XC in ohms, which one dominates, and the resonant frequency.',
        yes: [
          'Inductive reactance at your frequency',
          'Capacitive reactance at your frequency',
          'Which one dominates and what that does to phase',
          'The frequency at which the two cancel',
        ],
        warn: [
          DISCLAIMER,
          'Reactance moves in opposite directions with frequency: inductive reactance rises with it and capacitive reactance falls. That is why an inductor blocks high frequencies and a capacitor blocks low ones, and why the two together make a filter.',
          'At resonance the two reactances cancel and the impedance becomes purely resistive. In a series circuit that means current peaks, and it can rise far above what the components are rated for — resonance is useful and it is also how things burn out.',
          'Reactance stores energy rather than dissipating it, so it produces no heat itself, but it does produce reactive current. In power systems that current is real enough to require larger conductors and to attract a power-factor penalty on the bill.',
        ],
        plazo: 'Check the component’s self-resonant frequency on its datasheet — above it, a capacitor behaves like an inductor and vice versa.',
        answer:
          'XL = 2πfL and XC = 1 ÷ (2πfC). They are equal at the resonant frequency f = 1 ÷ (2π√(LC)).',
      },
      {
        id: 'print3d',
        label: 'What a 3D printed part costs to make',
        hint: 'Filament, electricity, machine wear and your margin, in US dollars.',
        yes: [
          'Filament cost for the grams used',
          'Electricity cost for the print time',
          'Machine wear as a share of the running cost',
          'Total cost and a selling price at your margin',
        ],
        warn: [
          DISCLAIMER,
          'Filament and electricity are only part of the real cost. Failed prints, support material, post-processing time and above all your own labour usually exceed the material cost several times over on anything you sell.',
          'A 0% margin does not mean breaking even. It means you are covering material and power only, with nothing to absorb the print that fails at hour nine — and on a long print, that happens often enough to matter.',
          'The default prices here are US market figures for branded PLA and average residential electricity. Both vary considerably by region and supplier, so replace them with your own — that is why the fields are editable.',
        ],
        plazo: 'Price by the hour of machine time as well as by the gram; a light part that occupies the printer for twelve hours costs far more than its filament suggests.',
        answer:
          'Cost = (grams ÷ 1000 × price per kg) + (hours × watts ÷ 1000 × price per kWh), plus about 10% for wear. Then apply your margin.',
      },
    ],
  },

  inputsTitle: 'The numbers from your parts',
  inputsIntro: 'Fill in the fields for the case you picked — everything else is ignored.',
  fields: [
    { id: 'ah', label: 'Battery capacity', type: 'number', value: 100, suffix: 'Ah', min: 0.1, max: 10000, step: 1, thousands: true },
    { id: 'volts', label: 'Battery nominal voltage', type: 'number', value: 12, suffix: 'V', min: 1, max: 1000, step: 1 },
    { id: 'watts', label: 'Load you are powering', type: 'number', value: 100, suffix: 'W', min: 1, max: 100000, step: 10, thousands: true },
    { id: 'dod', label: 'Depth of discharge you allow', type: 'number', value: 80, suffix: '%', min: 1, max: 100, step: 5, help: '50% for lead-acid, 80–90% for LiFePO4.' },
    { id: 'efficiency', label: 'Inverter or converter efficiency', type: 'number', value: 95, suffix: '%', min: 10, max: 100, step: 1 },
    { id: 'mah', label: 'Cell capacity', type: 'number', value: 3000, suffix: 'mAh', min: 1, step: 100, thousands: true },
    { id: 'ma', label: 'Current the device draws', type: 'number', value: 150, suffix: 'mA', min: 0.001, step: 1, thousands: true },
    { id: 'supplyV', label: 'Supply voltage', type: 'number', value: 12, suffix: 'V', min: 1, max: 600, step: 1 },
    { id: 'loadW', label: 'Total load on the supply', type: 'number', value: 30, suffix: 'W', min: 0.1, max: 10000, step: 1, thousands: true },
    { id: 'margin', label: 'Safety margin factor', type: 'number', value: 1.3, min: 1, max: 3, step: 0.05, help: '1.3 means a 30% margin over the load.' },
    { id: 'ampW', label: 'Amplifier power per channel', type: 'number', value: 100, suffix: 'W RMS', min: 1, max: 10000, step: 5, thousands: true },
    { id: 'speakerZ', label: 'Impedance of each speaker', type: 'number', value: 8, suffix: 'Ω', min: 0.5, max: 64, step: 0.5 },
    { id: 'speakerN', label: 'Speakers on this channel', type: 'number', value: 2, min: 1, max: 16, step: 1 },
    {
      id: 'wiring',
      label: 'Wiring configuration',
      type: 'select',
      value: 'parallel',
      options: [
        { value: 'parallel', label: 'Parallel — divides impedance' },
        { value: 'series', label: 'Series — multiplies impedance' },
      ],
    },
    { id: 'pulse', label: 'Servo pulse width', type: 'number', value: 1.5, suffix: 'ms', min: 0.5, max: 2.5, step: 0.05 },
    { id: 'servoRange', label: 'Servo rated travel', type: 'number', value: 180, suffix: '°', min: 10, max: 360, step: 10 },
    { id: 'stepAngle', label: 'Stepper step angle', type: 'number', value: 1.8, suffix: '°', min: 0.1, max: 90, step: 0.1 },
    {
      id: 'microstep',
      label: 'Microstepping',
      type: 'select',
      value: '16',
      options: [
        { value: '1', label: 'Full steps' },
        { value: '2', label: '1/2 step' },
        { value: '4', label: '1/4 step' },
        { value: '8', label: '1/8 step' },
        { value: '16', label: '1/16 step' },
        { value: '32', label: '1/32 step' },
      ],
    },
    { id: 'freq', label: 'Frequency', type: 'number', value: 1000, suffix: 'Hz', min: 0.1, step: 10, thousands: true },
    { id: 'inductance', label: 'Inductance', type: 'number', value: 10, suffix: 'mH', min: 0, step: 0.1, help: 'Leave at 0 to skip the inductive side.' },
    { id: 'capacitance', label: 'Capacitance', type: 'number', value: 1, suffix: 'µF', min: 0, step: 0.1, help: 'Leave at 0 to skip the capacitive side.' },
    { id: 'grams', label: 'Filament used by the part', type: 'number', value: 50, suffix: 'g', min: 0.1, max: 20000, step: 1, thousands: true },
    { id: 'filamentPrice', label: 'Filament price per kilogram', type: 'number', value: 20, prefix: '$', min: 0, step: 1, help: 'US price for branded PLA. Put your own supplier’s figure in.' },
    { id: 'printHours', label: 'Print time', type: 'number', value: 4, suffix: 'hours', min: 0.1, max: 500, step: 0.5 },
    { id: 'printerW', label: 'Printer power draw', type: 'number', value: 150, suffix: 'W', min: 1, max: 3000, step: 10 },
    { id: 'kwhPrice', label: 'Electricity price per kWh', type: 'number', value: 0.17, prefix: '$', min: 0, step: 0.01, help: 'US residential average. Check your own utility bill.' },
    { id: 'marginPct', label: 'Profit margin', type: 'number', value: 50, suffix: '%', min: 0, max: 500, step: 5 },
  ],
  fineprint:
    DISCLAIMER +
    ' Filament and electricity prices are US market defaults and vary widely — both fields are editable on purpose, so use your own supplier and utility figures.',

  chart: {
    type: 'donut',
    title: 'How the number splits',
    caption:
      'The composition behind the result — usable energy against what depth of discharge and losses take away, load against safety margin, filament against electricity against wear.',
  },

  breakdownTitle: 'Line by line',
  breakdownIntro:
    'Both unit systems shown where it helps, and every price traced back to a field you can change.',

  faq: [
    {
      q: 'How long will a 100 Ah battery run a 100 W load?',
      a: 'Not the 12 hours the nameplate suggests. A 100 Ah 12 V battery holds 1,200 Wh nominally, but at 80% depth of discharge and 95% inverter efficiency only about 912 Wh is usable — around 9.1 hours at 100 W. On lead-acid limited to 50% depth of discharge it is closer to 5.7 hours.',
    },
    {
      q: 'Why can’t I use the full capacity of a battery?',
      a: 'Because deep discharge destroys cycle life. A lead-acid battery routinely taken below 50% may last only a couple of hundred cycles instead of a thousand or more. LiFePO4 tolerates 80–90% comfortably, which is a large part of why it is worth its higher price. On top of that, converting DC to AC costs another 5–15% in the inverter.',
    },
    {
      q: 'What is the difference between amp-hours and watt-hours?',
      a: 'Watt-hours measure energy; amp-hours measure charge and are meaningless without a voltage. A 100 Ah battery at 12 V holds 1,200 Wh, while 100 Ah at 48 V holds 4,800 Wh — four times the energy from the same amp-hour figure. Always compare batteries in watt-hours.',
    },
    {
      q: 'How long does a 3000 mAh battery last?',
      a: 'Divide capacity by draw: 3,000 mAh at 150 mA is 20 hours in ideal conditions, realistically about 17 after inefficiency. But most devices do not draw a constant current — anything that sleeps needs an average worked out from its duty cycle, and getting that wrong is why battery-life estimates for small devices are so often out by an order of magnitude.',
    },
    {
      q: 'What size DC power supply do I need?',
      a: 'Divide the load in watts by the voltage to get current, then add about 30%. A 30 W load at 12 V draws 2.5 A, so you want a 12 V supply rated at 3.25 A or more. Running a supply continuously at its rated maximum is how it ends up hot and short-lived, especially with inexpensive units rated for peak rather than sustained output.',
    },
    {
      q: 'Can I use a power supply with a higher amp rating than my device needs?',
      a: 'Yes, and it is usually a good idea. A device draws only the current it needs, so a 12 V 5 A supply on a 12 V 2 A device simply runs cooler and lasts longer. Voltage is the parameter that must match exactly — and so must the polarity, which is a far more common cause of destroyed equipment than the current rating.',
    },
    {
      q: 'What happens if I wire speakers in parallel?',
      a: 'The total impedance divides by the number of speakers, so two 8 Ω speakers in parallel present 4 Ω and four present 2 Ω. That draws more current from the amplifier, and once you go below its minimum rated impedance the amplifier either trips into protection or fails outright. Check the amp’s minimum rating before wiring anything.',
    },
    {
      q: 'Series or parallel for speakers — which should I use?',
      a: 'Parallel gives each speaker the full voltage and more power, but lowers the impedance the amplifier sees, which is the risky direction. Series raises the impedance, which is safe but delivers less power and lets the speakers interact through their back-EMF. If neither gives a load your amplifier likes, use another channel rather than compromising.',
    },
    {
      q: 'What pulse width do I send a servo?',
      a: 'By the usual convention, 1 ms drives it to one end of its travel, 1.5 ms centres it and 2 ms drives it to the other end, mapped linearly across the rated range. It is only a convention though: many servos actually accept 0.5 ms to 2.5 ms, and pushing one past its true mechanical limit makes it buzz, draw heavy current and eventually strip its gears.',
    },
    {
      q: 'How many steps per revolution does a stepper motor have?',
      a: '360 divided by the step angle, multiplied by the microstepping factor. The common 1.8° motor gives 200 full steps per revolution, which becomes 3,200 at 1/16 microstepping. The extra resolution buys smoothness and quiet rather than genuine accuracy, since the holding torque of a single microstep is very small.',
    },
    {
      q: 'Does microstepping make a stepper more accurate?',
      a: 'Not meaningfully. It makes motion smoother and much quieter, which is why 3D printers use it, but the torque holding any individual microstep is a fraction of a full step, so the rotor can be pushed off the commanded position without the controller noticing. Positional accuracy still comes down to the motor’s inherent step error and the mechanics around it.',
    },
    {
      q: 'How do I calculate inductive and capacitive reactance?',
      a: 'XL = 2πfL, with L in henries, and XC = 1 ÷ (2πfC), with C in farads. Inductive reactance rises with frequency and capacitive reactance falls, which is the whole basis of filtering. They are equal at the resonant frequency, f = 1 ÷ (2π√(LC)), where they cancel and the circuit becomes purely resistive.',
    },
    {
      q: 'How much does a 3D printed part cost to make?',
      a: 'Filament plus electricity plus wear. A 50 g part at $20 per kilo is $1.00 of filament; four hours at 150 W and $0.17 per kWh is about $0.10 of electricity; add roughly 10% for machine wear and the running cost is around $1.21. What that leaves out is the part that actually costs money: your time, failed prints and post-processing.',
    },
    {
      q: 'What margin should I charge on a printed part?',
      a: 'Enough to absorb the print that fails at hour nine, which a 0% margin does not. Material and power are the small part of the real cost — labour, design time, support removal, sanding and the occasional total loss dominate. Pricing by machine hour as well as by gram is the usual way to make a light but slow part pay for itself.',
    },
  ],

  sources: [
    { name: 'Average price of electricity to residential customers', url: 'https://www.eia.gov/electricity/monthly/epm_table_grapher.php?t=epmt_5_6_a', publisher: 'U.S. Energy Information Administration' },
    { name: 'Battery depth of discharge and cycle life', url: 'https://www.energy.gov/eere/vehicles/articles/energy-storage-basics', publisher: 'U.S. Department of Energy' },
    { name: 'Peukert’s law and battery discharge behaviour', url: 'https://www.nrel.gov/transportation/energy-storage.html', publisher: 'NREL' },
    { name: 'Speaker impedance and amplifier loading', url: 'https://www.aes.org/standards/', publisher: 'Audio Engineering Society' },
    { name: 'Stepper motor basics — step angle and microstepping', url: 'https://www.ti.com/motor-drivers/stepper-drivers/overview.html', publisher: 'Texas Instruments' },
    { name: 'Reactance and impedance in AC circuits', url: 'https://www.nist.gov/pml/electromagnetics', publisher: 'NIST' },
    { name: 'NFPA 70 (National Electrical Code) — wiring and overcurrent protection', url: 'https://www.nfpa.org/codes-and-standards/nfpa-70-standard-development/70', publisher: 'NFPA' },
  ],

  replaces: [
    '/en/battery-capacity-runtime-ah',
    '/en/battery-runtime-mah-calculator',
    '/en/dc-power-supply-watts-amperage',
    '/en/amplifier-watts-per-channel',
    '/en/servo-pwm-angle',
    '/en/stepper-pasos-grado',
    '/en/inductive-capacitive-reactance',
    '/en/3d-print-cost-per-part',
  ],

lastReviewed: '2026-07-28',
};
