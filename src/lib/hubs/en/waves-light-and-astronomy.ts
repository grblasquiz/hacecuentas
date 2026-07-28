import type { HubData } from '../types';

/**
 * Hub EN — "How far, how fast, how much energy?"
 *
 * Absorbe 8 calculadoras sueltas: efecto Doppler, energía del fotón, distancia por paralaje,
 * velocidad radial por redshift, peso en otros planetas, decaimiento radiactivo, escala de
 * Richter y forzamiento radiativo del CO₂.
 *
 * Constantes: SI 2019 exactas. Las fórmulas viejas usaban h = 6,626e-34, c = 3e8,
 * 1 eV = 1,602e-19, 1 pc = 3,26 años luz y c = 299.792 km/s: todas redondeadas.
 * Acá van los valores exactos (ver comentario de cada una).
 */

/** Velocidad de la luz en el vacío, m/s. Exacta por definición del metro (SI). */
export const C_LIGHT = 299792458;
/** Constante de Planck, J·s. Exacta por definición del kilogramo (SI 2019). */
export const H_PLANCK = 6.62607015e-34;
/** Carga elemental, C. Exacta por definición del ampere (SI 2019). 1 eV = este valor en J. */
export const E_CHARGE = 1.602176634e-19;
/** Año luz en metros. Exacto: c × 365,25 días julianos. */
export const M_PER_LY = 9460730472580800;
/** Parsec en metros. Exacto por definición IAU 2015: 648000/π unidades astronómicas. */
export const M_PER_PC = 30856775814913673;
/** Años luz por parsec. M_PER_PC / M_PER_LY = 3,2615637769... */
export const LY_PER_PC = 3.2615637769445;
/** Velocidad del sonido en aire seco a 20 °C, m/s (referencia del caso Doppler). */
export const V_SOUND_20C = 343.2;
/** Gravedad superficial estándar terrestre, m/s². */
export const G_N = 9.80665;
export const KG_PER_LB = 0.45359237;
/** Gutenberg–Richter: log10(E en ergios) = 11,8 + 1,5 M → en joules, 4,8 + 1,5 M. */
export const RICHTER_A = 4.8;
export const RICHTER_B = 1.5;
/** Energía de 1 kg de TNT, J. Convención: 1 tonelada TNT = 4,184 GJ exactos. */
export const J_PER_KG_TNT = 4.184e6;
/** Forzamiento radiativo simplificado del CO₂: ΔF = α ln(C/C₀), W/m² (IPCC TAR). */
export const CO2_ALPHA = 5.35;
/** CO₂ preindustrial de referencia, ppm. */
export const CO2_PREINDUSTRIAL = 278;
/** Parámetro de sensibilidad climática, K por W/m² (IPCC AR6, rango 0,5–1,3). */
export const CLIMATE_LAMBDA = 0.8;

/**
 * Gravedad superficial relativa a la Tierra: fila "Surface gravity (eq.)" de las
 * NASA Planetary Fact Sheets, en m/s², dividida por g_n = 9,80665. Ojo: la fila
 * "Surface acceleration" de la misma tabla es menor porque le resta la fuerza
 * centrífuga de la rotación (Júpiter: 23,12 vs 24,79 m/s²). Acá se usa la primera,
 * de forma consistente para todos los cuerpos. Plutón va como cuerpo, no como planeta.
 */
export const GRAVITY_REL: Record<string, number> = {
  Mercury: 0.3774,
  Venus: 0.9045,
  Moon: 0.1652,
  Mars: 0.3783,
  Jupiter: 2.5279,
  Saturn: 1.0646,
  Uranus: 0.9045,
  Neptune: 1.1370,
  Pluto: 0.0632,
  Sun: 27.9396,
};

const DISCLAIMER =
  'Idealised models with the exact defined constants. Doppler assumes motion straight along the line of sight; parallax and redshift assume no dust, no peculiar velocity and, at large z, a cosmology this page does not model; the Richter energy relation is an empirical fit, not a measurement of your specific earthquake. Educational use — for anything operational, use the agency’s own published figure.';

export const hub: HubData = {
  slug: 'en/science/waves-light-and-astronomy',
  title: 'Doppler, Photon Energy, Parallax, Redshift and Half-Life Calculator',
  description:
    'How far, how fast and how much energy: Doppler shift of a passing siren, photon energy from wavelength, star distance from parallax, recession velocity from redshift, your weight on other planets, radioactive decay, earthquake energy from magnitude and the radiative forcing of CO₂.',
  silo: 'Science',
  siloHref: '/en/science',
  locale: 'en',

  eyebrow: 'Waves, light & the sky',
  h1: 'How far, how fast, how much energy?',
  lede:
    'A siren changing pitch, a photon of a given colour, a star with a measured parallax, a galaxy with a redshift, a sample halfway through its half-life, an earthquake with a magnitude, an atmosphere with a CO₂ reading. Eight questions that all come down to the same handful of defined constants — and here they are exact: c = 299,792,458 m/s and h = 6.62607015 × 10⁻³⁴ J·s.',
  stamps: [
    'Exact SI constants: c, h and the elementary charge',
    'IAU 2015 parsec and the Julian light-year, not rounded ones',
    'Distances in light-years, parsecs, miles and kilometres',
    'Replaces 8 single-purpose calculators',
  ],

  resultLabel: 'Your answer',

  cases: {
    title: 'What are you working out?',
    intro:
      'Pick your question. Only the fields that case needs are read — everything else is ignored.',
    items: [
      {
        id: 'doppler',
        label: 'Doppler shift — the siren that changes pitch',
        hint: 'Perceived frequency when the source or the listener is moving.',
        yes: [
          'The frequency you actually hear, approaching and receding',
          'The size of the shift in hertz and in percent',
          'The musical interval that jump corresponds to',
        ],
        warn: [
          DISCLAIMER,
          'This is the acoustic Doppler formula, and it is NOT symmetric: a moving source and a moving listener at the same speed produce slightly different shifts, because the medium — the air — is a preferred frame. For light there is no medium and the relativistic formula applies instead.',
          'If the source reaches the speed of sound the denominator goes to zero and the formula blows up. That is not a bug in the arithmetic — it is the sonic boom, where the model genuinely stops applying.',
          'The speed of sound is not a constant. It rises about 0.6 m/s per °C, so 343 m/s at 20 °C becomes 331 m/s at freezing point. Humidity and altitude shift it too.',
        ],
        plazo: 'The pitch does not slide as the vehicle passes: it holds high, drops sharply at the closest point, then holds low. The slide people remember is the last moment of the approach.',
        answer:
          'f′ = f (v + v_o) / (v − v_s) when closing. A 1,000 Hz siren at 30 m/s approaching in 20 °C air is heard at about 1,096 Hz.',
      },
      {
        id: 'photon',
        label: 'Photon energy from wavelength, frequency or colour',
        hint: 'E = hf = hc/λ, in joules and electronvolts, with the region of the spectrum.',
        yes: [
          'Photon energy in joules and electronvolts',
          'The matching wavelength and frequency, whichever you gave',
          'Which part of the spectrum it lands in and whether it is ionising',
        ],
        warn: [
          DISCLAIMER,
          'Energy per photon is not intensity. A bright red lamp delivers far more total energy than a dim ultraviolet one while every one of its photons is individually weaker — which is why UV damages skin and red light does not, at any brightness.',
          'The exact values are h = 6.62607015 × 10⁻³⁴ J·s and c = 299,792,458 m/s, both defined rather than measured since 2019. Tables using 6.626 × 10⁻³⁴ and 3 × 10⁸ carry a 0.07% error in c alone.',
          'The visible band is a convention, roughly 380–700 nm, and its edges vary between sources and between eyes. Do not treat the boundary as a physical threshold.',
        ],
        plazo: 'Ionising radiation starts around 10 eV — the energy that can strip an electron from water. Visible light peaks near 3 eV, well below it.',
        answer:
          'E = hc/λ. A 550 nm green photon carries 3.61 × 10⁻¹⁹ J, or 2.25 eV.',
      },
      {
        id: 'parallax',
        label: 'How far is that star? (parallax)',
        hint: 'Distance in parsecs is simply one divided by the parallax in arcseconds.',
        yes: [
          'Distance in parsecs, light-years, kilometres and miles',
          'How long the light you are seeing has been travelling',
          'How the star compares with Proxima Centauri',
        ],
        warn: [
          DISCLAIMER,
          'Parallax angles are tiny. Even the nearest star shifts by only 0.77 arcseconds — about the width of a coin seen from 3 miles — which is why the technique waited until 1838 for its first success.',
          'The relation d = 1/p defines the parsec, so it is exact by construction. What is uncertain is the measured parallax, and its error grows into the distance quadratically: a 10% parallax error at large distance is far worse than 10% in the distance.',
          'Ground-based parallax fails past a few hundred parsecs. Gaia pushed it to tens of thousands, but beyond that astronomers change method entirely — standard candles, not geometry.',
        ],
        plazo: 'The light arriving tonight from a star 100 light-years away left before television existed. You are never looking at the present sky.',
        answer:
          'd (parsecs) = 1 ÷ p (arcseconds), and 1 parsec is 3.2616 light-years. A parallax of 0.1″ means 10 pc, or 32.6 light-years.',
      },
      {
        id: 'redshift',
        label: 'How fast is that galaxy receding? (redshift)',
        hint: 'Radial velocity from z, switching to the relativistic formula when it matters.',
        yes: [
          'Recession velocity in km/s and as a fraction of light speed',
          'Which formula applies at your redshift, and why',
          'A rough distance from Hubble’s law',
        ],
        warn: [
          DISCLAIMER,
          'The simple v = cz only works for small z. Past about 0.1 it overestimates badly, and at z = 1 it would give the speed of light exactly — which is why the relativistic expression takes over here.',
          'At cosmological distances the redshift is not really a Doppler shift at all: space itself expanded while the light was in transit. The "velocity" is a convenient label, and at high z it can formally exceed c without breaking relativity.',
          'A Hubble-law distance depends on the Hubble constant, and the value measured from the local distance ladder and the value inferred from the cosmic microwave background still disagree by about 9%. That tension is unresolved.',
        ],
        plazo: 'z = 1 means the universe has doubled in scale since that light set out — its wavelength stretched by exactly the same factor.',
        answer:
          'For small z, v ≈ cz. Beyond that, v = c[(1+z)² − 1]/[(1+z)² + 1], which keeps the answer below the speed of light.',
      },
      {
        id: 'planets',
        label: 'What would I weigh on another planet?',
        hint: 'Your weight scaled by each body’s surface gravity — mass never changes.',
        yes: [
          'Your weight on the Moon, Mars, Jupiter and the rest, in pounds and kilograms',
          'The surface gravity of each body, relative and absolute',
          'How high you could jump there',
        ],
        warn: [
          DISCLAIMER,
          'Mass and weight are different quantities. Your mass is identical everywhere; only the force gravity exerts on it changes. Bathroom scales read weight and label it mass, which is where the confusion starts.',
          'The gas giants have no surface. The quoted gravity is at the one-bar pressure level in the atmosphere, a definition of convenience, not a place you could stand.',
          'Jupiter’s gravity varies noticeably with latitude because it rotates in under ten hours and bulges accordingly — the equatorial figure used here is the lower one.',
        ],
        plazo: 'On the Moon, at one sixth of Earth gravity, a jump goes six times higher and takes about 2.4 times as long to come back down.',
        answer:
          'Weight scales directly with surface gravity. 180 lb on Earth is 30 lb on the Moon, 68 lb on Mars and about 425 lb at Jupiter’s cloud tops.',
      },
      {
        id: 'halflife',
        label: 'How much of this sample is left? (half-life)',
        hint: 'Exponential decay: what fraction remains after a given time.',
        yes: [
          'Fraction of the original sample still present',
          'How many half-lives have elapsed',
          'The time to fall to 10% and to 1%',
        ],
        warn: [
          DISCLAIMER,
          'Decay is exponential, never linear. After one half-life 50% remains, after two 25%, after three 12.5% — it never reaches zero, it just becomes undetectable.',
          'A half-life is a statistical property of a large population, not a schedule for one atom. Any individual nucleus may decay in the next second or in a million years, and nothing about its past changes the odds.',
          'Use consistent time units. Mixing a half-life in years with an elapsed time in days is the standard way to get an answer wrong by a factor of 365.',
        ],
        plazo: 'Ten half-lives leave under 0.1% of the original activity — the usual rule of thumb for when a short-lived isotope has effectively gone.',
        answer:
          'Remaining fraction = 0.5^(t / half-life). Carbon-14 has a half-life of 5,730 years, so a 11,460-year-old sample retains 25% of its original ¹⁴C.',
      },
      {
        id: 'richter',
        label: 'How much energy did that earthquake release?',
        hint: 'From magnitude to joules, tonnes of TNT and a comparison you can picture.',
        yes: [
          'Energy released in joules and in tonnes of TNT',
          'Where the magnitude sits on the damage scale',
          'How it compares with one point lower on the scale',
        ],
        warn: [
          DISCLAIMER,
          'The scale is logarithmic in amplitude and steeper still in energy: one whole point is ten times the ground motion but about 31.6 times the energy. A magnitude 8 releases roughly a thousand times the energy of a magnitude 6.',
          'What agencies report today is usually moment magnitude (Mw), not the original 1935 Richter local magnitude, which saturates above about 7. The energy relation used here is the standard empirical fit and gives an order of magnitude, not a measurement.',
          'Energy released is not damage. Depth, distance, soil type, building stock and time of day matter enormously — a shallow magnitude 6 under a city is far deadlier than a deep magnitude 8 offshore.',
        ],
        plazo: 'Shaking intensity is what actually breaks things, and that is the Modified Mercalli scale, reported per location — not a single number for the whole event.',
        answer:
          'log₁₀E (joules) = 4.8 + 1.5 M. A magnitude 7 releases about 2 × 10¹⁵ J, roughly 480 kilotonnes of TNT.',
      },
      {
        id: 'co2',
        label: 'What does this CO₂ level do to the energy balance?',
        hint: 'Radiative forcing from a concentration in ppm, and the warming it implies.',
        yes: [
          'Radiative forcing in W/m² against the pre-industrial baseline',
          'The equilibrium warming that forcing implies',
          'How far along the doubling of CO₂ you are',
        ],
        warn: [
          DISCLAIMER,
          'ΔF = 5.35 ln(C/C₀) is the standard simplified expression for CO₂ alone. It excludes methane, nitrous oxide, aerosols and every feedback, so it is not the total forcing of the climate system.',
          'The relationship is logarithmic, not linear. Each doubling of CO₂ adds about the same 3.7 W/m², so the first 100 ppm mattered more than the last 100 — but the emissions needed for each successive doubling grow, and the warming keeps accumulating.',
          'Turning forcing into temperature requires the climate sensitivity parameter, and its uncertainty is the largest in the chain. The figure here uses roughly 0.8 K per W/m²; the assessed range is wide enough that the warming number should be read as an order of magnitude.',
        ],
        plazo: 'Pre-industrial CO₂ was about 278 ppm and the level has passed 420 ppm — the highest in at least 800,000 years of ice-core record.',
        answer:
          'ΔF = 5.35 × ln(C/278) W/m². At 420 ppm that is about 2.2 W/m², implying roughly 1.8 °C of eventual equilibrium warming from CO₂ alone.',
      },
    ],
  },

  inputsTitle: 'The numbers you have',
  inputsIntro:
    'Fill in the fields for the question you picked — the rest are ignored and can stay at their defaults.',
  fields: [
    { id: 'freq', label: 'Source frequency', type: 'number', value: 1000, suffix: 'Hz', min: 1, step: 1, thousands: true },
    { id: 'vsource', label: 'Speed of the source', type: 'number', value: 30, suffix: 'm/s', min: 0, step: 1, help: 'Divide mph by 2.2369 to get m/s. 30 m/s is 67 mph.' },
    { id: 'vobs', label: 'Speed of the listener', type: 'number', value: 0, suffix: 'm/s', min: 0, step: 1 },
    {
      id: 'ddir',
      label: 'They are',
      type: 'select',
      value: 'closing',
      options: [
        { value: 'closing', label: 'Closing — the pitch rises' },
        { value: 'receding', label: 'Moving apart — the pitch falls' },
      ],
    },
    { id: 'airtemp', label: 'Air temperature', type: 'number', value: 68, suffix: '°F', min: -60, max: 140, step: 1, help: 'The speed of sound changes about 1.1 ft/s per °F.' },
    { id: 'photval', label: 'Photon wavelength or frequency', type: 'number', value: 550, min: 0.000001, step: 1 },
    {
      id: 'photunit',
      label: 'Given in',
      type: 'select',
      value: 'nm',
      options: [
        { value: 'nm', label: 'nanometres (wavelength)' },
        { value: 'um', label: 'micrometres (wavelength)' },
        { value: 'thz', label: 'terahertz (frequency)' },
        { value: 'ev', label: 'electronvolts (energy)' },
      ],
    },
    { id: 'parallax', label: 'Parallax angle', type: 'number', value: 0.1, suffix: 'arcsec', min: 0.000001, step: 0.001, help: 'Divide milliarcseconds by 1,000. Proxima Centauri is 0.7687″.' },
    { id: 'zred', label: 'Redshift z', type: 'number', value: 0.05, step: 0.001 },
    { id: 'bodyweight', label: 'Your weight on Earth', type: 'number', value: 180, suffix: 'lb', min: 0, step: 1, thousands: true },
    { id: 'halflife', label: 'Half-life', type: 'number', value: 5730, suffix: 'years', min: 0.000001, step: 1, thousands: true },
    { id: 'elapsed', label: 'Time elapsed', type: 'number', value: 11460, suffix: 'years', min: 0, step: 1, thousands: true },
    { id: 'magnitude', label: 'Earthquake magnitude', type: 'number', value: 7, min: 0, max: 10, step: 0.1 },
    { id: 'co2now', label: 'CO₂ concentration', type: 'number', value: 425, suffix: 'ppm', min: 1, step: 1 },
    { id: 'co2base', label: 'Baseline for comparison', type: 'number', value: 278, suffix: 'ppm', min: 1, step: 1, help: 'Pre-industrial is about 278 ppm.' },
  ],
  fineprint: DISCLAIMER,

  chart: {
    type: 'donut',
    title: 'How the answer splits',
    caption:
      'Your number against its natural reference — the emitted frequency against the shift, your distance against Proxima Centauri, what remains against what has decayed.',
  },

  breakdownTitle: 'Line by line',
  breakdownIntro:
    'The speed of light, the Planck constant, the elementary charge, the parsec and the light-year are all exact defined values here, not the rounded ones most tables carry.',

  faq: [
    {
      q: 'Why does a siren change pitch as it passes?',
      a: 'Because the source is moving through the air while it emits. Approaching, each successive wave crest starts closer to you than the last, so the crests arrive more often and the pitch is higher. Receding, they are stretched out and the pitch drops. The change happens most sharply at the moment of closest approach, not gradually along the road.',
    },
    {
      q: 'Is the Doppler effect the same for light and sound?',
      a: 'The physics rhymes but the formulas differ. Sound travels in a medium, so it matters whether the source or the listener is the one moving — the two cases give slightly different answers. Light has no medium, so only the relative velocity matters, and the relativistic formula includes time dilation, which has no acoustic counterpart.',
    },
    {
      q: 'How much energy does a single photon carry?',
      a: 'E = hf, or equivalently hc/λ. A green photon at 550 nm carries 3.61 × 10⁻¹⁹ joules, which is 2.25 electronvolts. Both h and c have been exact defined constants since the 2019 SI revision, so this is one of the few calculations in physics with no measurement uncertainty in its constants.',
    },
    {
      q: 'Why does ultraviolet damage skin when bright red light does not?',
      a: 'Because damage depends on the energy of the individual photon, not on total brightness. Breaking a chemical bond takes a minimum quantum of energy, and red photons at about 1.8 eV simply do not have it however many arrive. UV photons at 4 eV and up do, so even a weak UV source causes damage a blazing red one cannot.',
    },
    {
      q: 'How do astronomers measure the distance to a star?',
      a: 'For nearby stars, by parallax: the star appears to shift slightly against the background as the Earth moves from one side of its orbit to the other, and the distance in parsecs is one divided by that shift in arcseconds. The angles are minute — under one arcsecond even for the closest star — which is why the first successful measurement came only in 1838.',
    },
    {
      q: 'What exactly is a parsec, and how many light-years is it?',
      a: 'A parsec is the distance at which one astronomical unit subtends one arcsecond, which the IAU fixed exactly in 2015 as 648,000/π AU. That works out to 3.2615638 light-years, or about 30.857 trillion kilometres. The commonly printed 3.26 is a rounding of an exactly defined value.',
    },
    {
      q: 'How do I convert redshift into a velocity?',
      a: 'For small redshifts, v ≈ cz, so z = 0.001 means about 300 km/s. Beyond z ≈ 0.1 that overestimates, and the relativistic form v = c[(1+z)² − 1]/[(1+z)² + 1] takes over — which keeps the result under the speed of light no matter how large z gets.',
    },
    {
      q: 'Can a galaxy recede faster than light?',
      a: 'Its recession velocity as we define it at cosmological scales can exceed c, and relativity is untroubled by that. Nothing is moving through space faster than light; space between us and the galaxy is expanding, and there is no speed limit on the expansion of space itself. We still see such galaxies because light emitted long ago was travelling through regions that were closer.',
    },
    {
      q: 'What would I weigh on Mars or the Moon?',
      a: 'About 38% of your Earth weight on Mars and 16.6% on the Moon. Someone at 180 pounds here weighs 68 pounds on Mars and 30 on the Moon. Your mass has not changed by a gram — what changed is the force each body’s gravity exerts on it.',
    },
    {
      q: 'What is the difference between mass and weight?',
      a: 'Mass is how much matter there is, in kilograms, and it is the same everywhere in the universe. Weight is the force gravity exerts on that mass, in newtons or pounds-force, and it changes with where you stand. Everyday language uses "weight" for both, which is harmless on Earth and immediately confusing anywhere else.',
    },
    {
      q: 'How does half-life actually work?',
      a: 'Each half-life halves what remains, so it is exponential rather than linear: 50% after one, 25% after two, 12.5% after three. It never quite reaches zero. The half-life is a property of a large population — individual nuclei decay at random, with no memory of how long they have already survived.',
    },
    {
      q: 'How much more energy is a magnitude 8 earthquake than a 6?',
      a: 'About a thousand times more. Each whole point on the magnitude scale multiplies the ground-motion amplitude by ten but the energy released by roughly 31.6, and two points therefore multiply the energy by around 1,000. That is why the gap between a 6 and an 8 is the difference between local damage and a regional catastrophe.',
    },
    {
      q: 'What does radiative forcing in W/m² actually mean?',
      a: 'It is the extra energy retained by each square metre of the Earth per second, relative to a baseline, before the climate has adjusted. Two watts per square metre sounds trivial until you multiply it by the planet’s 510 trillion square metres and let it run for decades — the accumulated energy is what drives the temperature change.',
    },
    {
      q: 'Why is the CO₂ effect logarithmic?',
      a: 'Because the strongest absorption bands become saturated: once most of the outgoing radiation at those wavelengths is already being captured, added molecules can only work at the weaker edges of each band. Each doubling of concentration therefore contributes about the same 3.7 W/m², so 280 to 560 ppm has roughly the same effect as 560 to 1,120.',
    },
  ],

  sources: [
    { name: 'Speed of light in vacuum, c = 299,792,458 m/s (exact)', url: 'https://physics.nist.gov/cgi-bin/cuu/Value?c', publisher: 'NIST / CODATA' },
    { name: 'Planck constant, h = 6.62607015 × 10⁻³⁴ J·s (exact)', url: 'https://physics.nist.gov/cgi-bin/cuu/Value?h', publisher: 'NIST / CODATA' },
    { name: 'IAU 2015 Resolution B2 — exact definition of the astronomical unit and parsec', url: 'https://www.iau.org/static/resolutions/IAU2015_English.pdf', publisher: 'International Astronomical Union' },
    { name: 'Planetary Fact Sheets — surface gravity of each body', url: 'https://nssdc.gsfc.nasa.gov/planetary/factsheet/', publisher: 'NASA / NSSDC' },
    { name: 'Earthquake magnitude, energy release and shaking intensity', url: 'https://www.usgs.gov/programs/earthquake-hazards/earthquake-magnitude-energy-release-and-shaking-intensity', publisher: 'USGS' },
    { name: 'Trends in atmospheric carbon dioxide — Mauna Loa record', url: 'https://gml.noaa.gov/ccgg/trends/', publisher: 'NOAA Global Monitoring Laboratory' },
    { name: 'Radiative forcing of climate change — simplified expressions', url: 'https://www.ipcc.ch/report/ar6/wg1/', publisher: 'IPCC AR6 WGI' },
  ],

  replaces: [
    '/en/doppler-effect-frequency-calculator',
    '/en/photon-energy-frequency-wavelength',
    '/en/parallax-distance-parsecs',
    '/en/redshift-radial-velocity',
    '/en/weight-on-other-planets',
    '/en/radioactive-decay-half-life',
    '/en/richter-scale-magnitude-energy',
    '/en/radiative-forcing-co2-ppm',
  ],

  lastReviewed: '2026-07-28',
};
