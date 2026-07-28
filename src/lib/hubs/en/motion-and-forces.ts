import type { HubData } from '../types';

/**
 * Hub EN — "What's the force, energy or motion here?"
 *
 * Absorbe 9 calculadoras sueltas de mecánica clásica: caída libre, energía cinética,
 * energía potencial gravitatoria, trabajo mecánico, fuerza de rozamiento, ley de Hooke,
 * momento angular, período del péndulo simple y empuje de Arquímedes.
 *
 * Constantes: exactas por definición (CGPM / NIST SP 811). Las fórmulas viejas usaban
 * g = 9,81 m/s²; acá va g_n = 9,80665 m/s² (diferencia +0,034% en las que dependen de g).
 */

/** Standard acceleration of gravity, m/s² (CGPM 1901, exact by definition). */
export const G_N = 9.80665;
/** Exactos por definición (NIST SP 811). */
export const KG_PER_LB = 0.45359237;
export const M_PER_FT = 0.3048;
export const M_PER_IN = 0.0254;
export const MPS_PER_MPH = 0.44704;
/** 1 ft·lbf = 0,45359237 × 9,80665 × 0,3048 J. Exacto. */
export const J_PER_FTLBF = 1.3558179483314004;
/** Caloría termoquímica: 1 kcal = 4184 J exactos. */
export const J_PER_KCAL = 4184;
/** Densidad del agua dulce a 4 °C, kg/m³ (referencia del caso de flotación). */
export const RHO_WATER = 1000;

const DISCLAIMER =
  'Idealised physics: point masses, rigid bodies, no air resistance and constant gravity unless the field says otherwise. Real experiments drift from these numbers, and that gap is usually the interesting part. Educational use — not a substitute for an engineering calculation with safety factors.';

export const hub: HubData = {
  slug: 'en/science/motion-and-forces',
  title: 'Force, Energy and Motion Calculator — free fall, work, friction, springs',
  description:
    'Nine mechanics problems in one place: free-fall distance and impact speed, kinetic and potential energy, mechanical work at an angle, friction force, Hooke’s law springs, angular momentum, pendulum period and buoyancy — with exact constants and results in both SI and US units.',
  silo: 'Science',
  siloHref: '/en/science',
  locale: 'en',

  eyebrow: 'Classical mechanics',
  h1: 'What’s the force, energy or motion here?',
  lede:
    'Something is falling, sliding, stretching, spinning, swinging or floating, and you need a number. Nine standard mechanics problems solved with the exact defined constants — standard gravity is 9.80665 m/s², not the rounded 9.81 most tables use — and every result given in SI and in feet, pounds and miles per hour.',
  stamps: [
    'Standard gravity g = 9.80665 m/s² (CGPM, exact)',
    'Exact conversion factors from NIST SP 811',
    'Every answer in SI and US customary units',
    'Replaces 9 single-purpose calculators',
  ],

  resultLabel: 'Your answer',

  cases: {
    title: 'Which problem are you solving?',
    intro:
      'Pick the situation. Only the fields that case needs are read — everything else is ignored, so you can leave the rest at their defaults.',
    items: [
      {
        id: 'freefall',
        label: 'Something is falling — how far, how fast?',
        hint: 'Drop distance and impact speed after a given time in free fall.',
        yes: [
          'Distance fallen from h = ½ g t²',
          'Impact speed in m/s, mph and km/h',
          'How the drop accelerates: the second half of the time covers three times the first',
        ],
        warn: [
          DISCLAIMER,
          'Air resistance is ignored. A human body reaches terminal velocity around 120 mph after roughly 12 seconds, so beyond about 5 seconds this model overestimates both distance and speed badly.',
          'The result does not depend on mass. A hammer and a feather fall identically in vacuum — the feather loses only because of the air this model leaves out.',
          'Gravity is treated as constant. That is fine near the surface; it is wrong for orbits or for drops of many kilometres.',
        ],
        plazo: 'Reaction time matters here: a dropped object falls about 4.9 m (16 ft) in the first second, before most people have finished flinching.',
        answer:
          'Distance = ½ × 9.80665 × t². After 3 seconds that is 44.1 m (145 ft), arriving at 29.4 m/s — about 66 mph.',
      },
      {
        id: 'kinetic',
        label: 'How much kinetic energy does a moving mass carry?',
        hint: 'Ek = ½ m v², plus the height it would take to build the same energy.',
        yes: [
          'Kinetic energy in joules, kilojoules and foot-pounds',
          'The equivalent drop height that would produce it',
          'How much of the energy comes from the last half of the speed',
        ],
        warn: [
          DISCLAIMER,
          'Energy scales with the SQUARE of speed. Going from 30 to 60 mph does not double the energy — it quadruples it, which is why crash severity climbs so steeply with speed.',
          'Use SI inputs: kilograms and metres per second. Feeding it pounds and miles per hour gives a number in no unit at all.',
          'This is Newtonian. Above roughly 10% of the speed of light the relativistic expression is required and this one under-reads.',
        ],
        plazo: 'A 1,500 kg car at 60 mph (26.8 m/s) carries about 540 kJ — the same energy as dropping it from a 37 m building.',
        answer:
          'Ek = ½ m v². Doubling the speed multiplies the energy by four; doubling the mass only doubles it.',
      },
      {
        id: 'potential',
        label: 'How much energy is stored at this height?',
        hint: 'Ep = m g h, and the speed that energy becomes on the way down.',
        yes: [
          'Gravitational potential energy in joules and kilocalories',
          'The impact speed if it falls the whole way',
          'The same energy expressed in foot-pounds',
        ],
        warn: [
          DISCLAIMER,
          'Potential energy is always measured against a reference level you choose. Only the difference between two heights is physically meaningful.',
          'Impact speed does not depend on mass — a heavier object arrives at exactly the same speed, just carrying more energy when it does.',
          'The kilocalorie figure is the physics conversion, not a nutrition claim. Climbing stairs costs your body roughly four to five times the mechanical energy because muscles are about 20–25% efficient.',
        ],
        plazo: 'Anything above about 3 m (10 ft) of drop is enough to be a serious fall hazard; OSHA requires fall protection in general industry from 4 ft.',
        answer:
          'Ep = m × 9.80665 × h, and all of it converts to kinetic energy in a free fall, arriving at v = √(2 g h).',
      },
      {
        id: 'work',
        label: 'How much work does this force do?',
        hint: 'W = F d cos θ — including the case where the angle makes the work zero.',
        yes: [
          'Work done in joules and foot-pounds',
          'The component of the force along the motion',
          'The component doing nothing at all',
        ],
        warn: [
          DISCLAIMER,
          'At exactly 90° the work is zero no matter how hard you push. Carrying a heavy box across a level floor does no work on the box in the physics sense, even though you get tired.',
          'Beyond 90° the work is negative: the force is taking energy out, like brakes or friction.',
          'Work is not force and it is not power. Divide the work by the time taken to get power in watts.',
        ],
        plazo: 'One horsepower is 745.7 W — 550 ft·lbf of work every second, the rate a horse could sustain in Watt’s original measurements.',
        answer:
          'W = F × d × cos θ. The cosine is what turns a 1,000 N push into far less useful work as soon as it is not aligned with the motion.',
      },
      {
        id: 'friction',
        label: 'How much friction is holding this back?',
        hint: 'F = μ N, and the equivalent mass you would be lifting.',
        yes: [
          'Friction force in newtons and pounds-force',
          'The mass equivalent you have to overcome',
          'The normal force it is derived from',
        ],
        warn: [
          DISCLAIMER,
          'Static friction (breaking it loose) is always higher than kinetic friction (keeping it moving). Coefficient tables usually list both — use the static one to size the push you need to start.',
          'The normal force is not always the weight. On a slope it is m g cos θ, and anything pressing down or lifting up changes it.',
          'The Coulomb model ignores contact area and speed. It is a very good approximation for dry sliding and a poor one for lubricated, very smooth, or very high-speed contacts.',
        ],
        plazo: 'Rubber on dry asphalt runs μ ≈ 0.7–0.9; on wet asphalt about 0.5; on ice as low as 0.1. That single number is the whole difference in stopping distance.',
        answer:
          'F = μ × N. A 0.5 coefficient means you need half the normal force to slide the object — and half is a lot more than most people expect.',
      },
      {
        id: 'spring',
        label: 'How stiff is this spring, or how far will it stretch?',
        hint: 'Hooke’s law F = k x, plus the elastic energy stored.',
        yes: [
          'Spring force in newtons and pounds-force',
          'Deflection in metres, centimetres and inches',
          'Elastic potential energy stored, ½ k x²',
        ],
        warn: [
          DISCLAIMER,
          'Hooke’s law only holds below the elastic limit. Past it the spring takes a permanent set and the linear relationship silently stops being true — the calculation will still return a number.',
          'Force is linear in deflection but stored energy is quadratic. Doubling the stretch doubles the force and quadruples the energy, which is why a compressed spring is a hazard to disassemble.',
          'A spring rate quoted in lb/in is not N/m. 1 lb/in equals 175.13 N/m — mixing them up is a factor-of-175 error, not a rounding error.',
        ],
        plazo: 'Never release a compressed spring by hand: the stored ½ k x² all comes back in milliseconds.',
        answer:
          'F = k x and E = ½ k x². A 500 N/m spring pulled 10 cm exerts 50 N and stores 2.5 J.',
      },
      {
        id: 'angular',
        label: 'What is the angular momentum of this spinning thing?',
        hint: 'L = I ω, plus rotational energy and the spinning-skater effect.',
        yes: [
          'Angular momentum in kg·m²/s',
          'Rotational speed in rad/s and in rpm',
          'Rotational kinetic energy, ½ I ω²',
        ],
        warn: [
          DISCLAIMER,
          'Angular momentum is conserved without external torque, but rotational ENERGY is not. Pull your arms in and halve I: ω doubles, L stays put, and the energy doubles — supplied by the muscular work of pulling in.',
          'The moment of inertia depends on the axis, not just the object. The same rod has three different values about three different axes.',
          'Angular velocity here is radians per second. Divide rpm by 9.5493 to get rad/s, or multiply rad/s by 9.5493 to go the other way.',
        ],
        plazo: 'Flywheel energy grows with ω², so doubling the spin speed of a storage flywheel quadruples what it holds — and quadruples what it releases if it fails.',
        answer:
          'L = I ω. With no external torque L stays constant, so any drop in the moment of inertia has to be paid for with a rise in spin rate.',
      },
      {
        id: 'pendulum',
        label: 'How fast does a pendulum of this length swing?',
        hint: 'T = 2π √(L/g) — period, frequency and the length for a one-second beat.',
        yes: [
          'Period of a full swing in seconds',
          'Frequency in hertz and swings per minute',
          'Length in metres and inches, and the seconds-pendulum length',
        ],
        warn: [
          DISCLAIMER,
          'The formula is the small-angle approximation. Past about 15° of amplitude the real period runs longer — around 0.7% longer at 30°, and the error grows fast after that.',
          'The period does not depend on the mass of the bob. It depends only on length and local gravity, which is why pendulums were used to map gravity across the Earth.',
          'Local gravity varies by about ±0.3% between the equator and the poles, and that shifts a precision pendulum clock by roughly two minutes a day.',
        ],
        plazo: 'The classic "seconds pendulum" — one second per half swing, a two-second period — is 0.9940 m long at standard gravity.',
        answer:
          'T = 2π √(L/g). A one-metre pendulum has a period of 2.006 s, so almost exactly one second per swing in each direction.',
      },
      {
        id: 'buoyancy',
        label: 'Will this float, and with how much force?',
        hint: 'Archimedes: buoyant force equals the weight of the fluid displaced.',
        yes: [
          'Buoyant force in newtons and pounds-force',
          'Mass of the displaced fluid in kg and lb',
          'Whether the object floats or sinks, and by what margin',
        ],
        warn: [
          DISCLAIMER,
          'Buoyancy depends on the fluid, not on the object. Seawater at about 1,025 kg/m³ lifts roughly 2.5% harder than fresh water — the reason a ship rides higher leaving a river for the sea.',
          'A floating object only displaces its own weight of fluid, so it uses less than its full volume. Fully submerged volume is only the right input for a submerged object.',
          'Enter volume in cubic metres. A litre is 0.001 m³ and a US gallon 0.0037854 m³ — this is where most buoyancy calculations go off by a factor of a thousand.',
        ],
        plazo: 'Ice floats with roughly 90% of its volume below the waterline, which is why an iceberg shows you a tenth of its problem.',
        answer:
          'Buoyant force = ρ_fluid × V_displaced × g. One cubic metre in fresh water lifts with 9,807 N — the weight of a tonne.',
      },
    ],
  },

  inputsTitle: 'The numbers from your problem',
  inputsIntro:
    'SI units throughout: kilograms, metres, seconds, newtons. Fill in the fields your case needs — the rest are ignored.',
  fields: [
    { id: 'tfall', label: 'Time falling', type: 'number', value: 3, suffix: 's', min: 0, max: 60, step: 0.1 },
    { id: 'mass', label: 'Mass', type: 'number', value: 1500, suffix: 'kg', min: 0, step: 1, thousands: true },
    { id: 'speed', label: 'Speed', type: 'number', value: 26.8, suffix: 'm/s', min: 0, step: 0.1, help: '26.8 m/s is 60 mph. Divide mph by 2.2369 to convert.' },
    { id: 'height', label: 'Height above the reference level', type: 'number', value: 10, suffix: 'm', min: 0, step: 0.1 },
    { id: 'force', label: 'Applied force', type: 'number', value: 1000, suffix: 'N', min: 0, step: 1, thousands: true },
    { id: 'distance', label: 'Distance moved', type: 'number', value: 5, suffix: 'm', min: 0, step: 0.1 },
    { id: 'angle', label: 'Angle between force and motion', type: 'number', value: 0, suffix: '°', min: 0, max: 180, step: 5 },
    { id: 'mu', label: 'Coefficient of friction μ', type: 'number', value: 0.5, min: 0, max: 2, step: 0.01 },
    { id: 'normal', label: 'Normal force', type: 'number', value: 500, suffix: 'N', min: 0, step: 1, thousands: true },
    { id: 'kspring', label: 'Spring constant k', type: 'number', value: 500, suffix: 'N/m', min: 0, step: 1, thousands: true },
    { id: 'deform', label: 'Spring deflection x', type: 'number', value: 0.1, suffix: 'm', min: 0, step: 0.001 },
    { id: 'inertia', label: 'Moment of inertia I', type: 'number', value: 2, suffix: 'kg·m²', min: 0, step: 0.1 },
    { id: 'omega', label: 'Angular velocity ω', type: 'number', value: 10, suffix: 'rad/s', min: 0, step: 0.1 },
    { id: 'plength', label: 'Pendulum length', type: 'number', value: 1, suffix: 'm', min: 0.001, step: 0.01 },
    {
      id: 'fluid',
      label: 'Fluid',
      type: 'select',
      value: '1000',
      options: [
        { value: '1000', label: 'Fresh water (1,000 kg/m³)' },
        { value: '1025', label: 'Seawater (1,025 kg/m³)' },
        { value: '1.225', label: 'Air at sea level (1.225 kg/m³)' },
        { value: '13534', label: 'Mercury (13,534 kg/m³)' },
        { value: '820', label: 'Diesel fuel (820 kg/m³)' },
      ],
    },
    { id: 'vol', label: 'Volume displaced', type: 'number', value: 0.05, suffix: 'm³', min: 0, step: 0.001, help: '1 litre = 0.001 m³ · 1 US gallon = 0.0037854 m³.' },
    { id: 'objmass', label: 'Mass of the object (for the float check)', type: 'number', value: 40, suffix: 'kg', min: 0, step: 0.1 },
  ],
  fineprint: DISCLAIMER,

  chart: {
    type: 'donut',
    title: 'How the answer splits',
    caption:
      'The two or three quantities behind the result — useful versus wasted force, energy before and after, buoyancy versus weight — sized against each other.',
  },

  breakdownTitle: 'Line by line',
  breakdownIntro:
    'Gravity is the exact standard value 9.80665 m/s² and every unit conversion uses the exact defined factor, so a conversion and its inverse return the same number.',

  faq: [
    {
      q: 'How far does something fall in 3 seconds?',
      a: 'About 44.1 metres, or 145 feet, ignoring air resistance — from h = ½ g t² with g = 9.80665 m/s². It arrives at 29.4 m/s, roughly 66 mph. The acceleration is what makes this counter-intuitive: it covers 4.9 m in the first second and 24.5 m in the third.',
    },
    {
      q: 'Does a heavier object fall faster?',
      a: 'No. In the absence of air, everything accelerates at the same 9.80665 m/s² regardless of mass, because a heavier object needs proportionally more force to accelerate it and gravity supplies exactly that. In real air, shape and density decide: a feather loses to a hammer because of drag, not gravity.',
    },
    {
      q: 'Why is 9.80665 used instead of 9.81?',
      a: 'Because 9.80665 m/s² is the internationally agreed standard value of gravitational acceleration, fixed by the CGPM in 1901, and every other unit built on force — the pound-force, the kilogram-force, psi, the foot-pound — is defined from it. Using 9.81 introduces a 0.034% error that quietly breaks the round trip between derived units. The actual local value where you are is a different question again, varying about ±0.3% with latitude and altitude.',
    },
    {
      q: 'Why does kinetic energy grow with the square of speed?',
      a: 'Because the work needed to accelerate an object is force times distance, and at higher speed you cover more distance during each interval of acceleration. Integrating that gives ½ m v². The practical consequence is severe: a 40% speed increase doubles the energy that has to be absorbed in a crash.',
    },
    {
      q: 'What is the difference between work, energy and power?',
      a: 'Energy is a stored quantity, measured in joules. Work is the transfer of energy by a force acting through a distance, also in joules. Power is the rate at which that transfer happens, in watts — joules per second. Lifting the same box the same height is the same work whether you take one second or one minute; only the power differs.',
    },
    {
      q: 'Can work be zero even when I am pushing hard?',
      a: 'Yes, and it is the standard classroom example. If the force is perpendicular to the motion, cos 90° = 0 and the work is exactly zero: carrying a suitcase along a level corridor does no work on the suitcase. Your muscles still burn energy holding it, but that energy goes into your body, not into the load.',
    },
    {
      q: 'How do I know how much force it takes to slide something?',
      a: 'Multiply the coefficient of static friction by the normal force. On level ground the normal force is the weight, m g. A 100 kg crate on a floor with μ = 0.5 needs about 490 N — roughly 110 pounds-force — just to break loose, and slightly less to keep it moving once it is going.',
    },
    {
      q: 'What is a spring constant and what units does it use?',
      a: 'It is the stiffness: how many newtons of force each metre of deflection produces, so N/m. Automotive and industrial specs often use lb/in instead, and 1 lb/in equals 175.1268 N/m. A soft laboratory spring might be 20 N/m; a car coil spring is tens of thousands.',
    },
    {
      q: 'Why does a spinning skater speed up when they pull their arms in?',
      a: 'Angular momentum L = I ω is conserved when nothing outside applies a torque. Pulling the arms in cuts the moment of inertia I, so ω has to rise to keep L the same. Notice that rotational energy ½ I ω² does not stay constant — it goes up, and the increase comes from the muscular work of pulling the arms against the outward pull.',
    },
    {
      q: 'Does a pendulum swing slower if the weight is heavier?',
      a: 'No. The period depends only on length and gravity: T = 2π √(L/g). Mass cancels out, because a heavier bob experiences proportionally more restoring force. This is precisely why pendulums made good clocks and good gravimeters — the one thing hardest to control, the mass, does not enter the answer.',
    },
    {
      q: 'How long does a one-metre pendulum take to swing?',
      a: 'A full there-and-back cycle takes 2.006 seconds at standard gravity, so almost exactly one second in each direction. To get a period of exactly two seconds — the classic seconds pendulum used in clock design — the length has to be 0.9940 m, about 39.14 inches.',
    },
    {
      q: 'How do I tell whether something will float?',
      a: 'Compare its average density with the fluid’s. If the object’s mass divided by its total volume is less than the fluid density, it floats, and it settles at the depth where the displaced fluid weighs exactly what the object does. Steel ships float because the hull encloses mostly air, so the ship’s average density is well below that of water.',
    },
    {
      q: 'Why does the same boat float higher in seawater?',
      a: 'Seawater is about 1,025 kg/m³ against fresh water’s 1,000, so each cubic metre displaced lifts about 2.5% harder. A vessel therefore needs 2.5% less submerged volume to support the same weight and rides visibly higher — the reason load lines on a hull are marked separately for fresh and salt water.',
    },
  ],

  sources: [
    { name: 'Standard acceleration of gravity, g = 9.80665 m/s²', url: 'https://physics.nist.gov/cgi-bin/cuu/Value?gn', publisher: 'NIST / CODATA' },
    { name: 'NIST Special Publication 811 — Guide for the Use of the International System of Units', url: 'https://www.nist.gov/pml/special-publication-811', publisher: 'NIST' },
    { name: 'The International System of Units (SI Brochure, 9th edition)', url: 'https://www.bipm.org/en/publications/si-brochure', publisher: 'BIPM' },
    { name: 'Fall protection requirements, 29 CFR 1910 Subpart D', url: 'https://www.osha.gov/walking-working-surfaces', publisher: 'OSHA' },
    { name: 'Density of seawater and fresh water — physical properties', url: 'https://www.noaa.gov/jetstream/ocean/sea-water', publisher: 'NOAA' },
  ],

  replaces: [
    '/en/free-fall-distance',
    '/en/kinetic-energy-ec',
    '/en/gravitational-potential-energy',
    '/en/mechanical-work-force-distance',
    '/en/friction-force-coefficient',
    '/en/hookes-law-spring-force',
    '/en/momento-angular-rotacion',
    '/en/simple-pendulum-period',
    '/en/buoyancy-force-volume',
  ],

  lastReviewed: '2026-07-28',
};
