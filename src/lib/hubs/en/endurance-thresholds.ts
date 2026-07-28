import type { HubData } from '../types';

/**
 * Hub EN — "What are my training zones and what do I eat during the race?"
 *
 * Absorbe 7 calculadoras sueltas: FTP desde el test de 20 minutos, Critical Power y W′
 * desde dos esfuerzos, ritmo de umbral (MLSS) desde la FC de umbral, pace de natación
 * por 100, índice SWOLF, geles/carbohidratos por hora de carrera y dosis de cafeína.
 *
 * La rama de cafeína es YMYL-dosis: el disclaimer médico va en el fineprint y como
 * primer warn de TODAS las ramas.
 */

/** Coggan: el FTP se estima como el 95% de la potencia media de un test de 20 minutos. */
export const FTP_FROM_20MIN = 0.95;

/** Zonas de potencia de Coggan, como fracción del FTP. */
export const POWER_ZONES: Array<{ z: string; name: string; lo: number; hi: number }> = [
  { z: 'Z1', name: 'Active recovery', lo: 0, hi: 0.55 },
  { z: 'Z2', name: 'Endurance', lo: 0.56, hi: 0.75 },
  { z: 'Z3', name: 'Tempo', lo: 0.76, hi: 0.9 },
  { z: 'Z4', name: 'Threshold', lo: 0.91, hi: 1.05 },
  { z: 'Z5', name: 'VO2 max', lo: 1.06, hi: 1.2 },
  { z: 'Z6', name: 'Anaerobic capacity', lo: 1.21, hi: 1.5 },
];

/** Exacto por definición. */
export const KG_PER_LB = 0.45359237;
export const M_PER_YD = 0.9144;

/**
 * Bandas de ritmo de umbral por frecuencia cardíaca de umbral, en min/km.
 * Espejo exacto de vla-max-maximo-lactato-estado-estable.ts. Es una tabla de
 * referencia, NO una medición de lactato: el MLSS real sólo se determina con
 * varios tests de carga constante y muestras de sangre.
 */
export const MLSS_PACE_BANDS: Array<{ maxHr: number; loMinKm: number; hiMinKm: number }> = [
  { maxHr: 140, loMinKm: 5.5, hiMinKm: 6.0 },
  { maxHr: 155, loMinKm: 5.0, hiMinKm: 5.5 },
  { maxHr: 170, loMinKm: 4.5, hiMinKm: 5.0 },
  { maxHr: 999, loMinKm: 4.0, hiMinKm: 4.5 },
];

/** Bandas de nivel de pace de natación, en segundos por 100 m. */
export const SWIM_BANDS: Array<{ under: number; label: string }> = [
  { under: 65, label: 'Elite' },
  { under: 90, label: 'Advanced' },
  { under: 120, label: 'Intermediate' },
  { under: 9999, label: 'Beginner' },
];

/** Bandas de nivel SWOLF (tiempo por largo + brazadas; menor es mejor). */
export const SWOLF_BANDS: Array<{ under: number; label: string }> = [
  { under: 40, label: 'Elite' },
  { under: 56, label: 'Advanced' },
  { under: 70, label: 'Intermediate' },
  { under: 9999, label: 'Beginner' },
];

/** ACSM: 60 g de carbohidrato por hora en esfuerzos de más de 75 minutos. */
export const CARBS_PER_HOUR_G = 60;
/** Gel estándar. */
export const GEL_CARBS_G = 30;
/** Por debajo de esta duración el glucógeno propio alcanza. */
export const FUEL_THRESHOLD_H = 1.25;

/** ISSN: 3–6 mg/kg de cafeína para rendimiento. Rango por tolerancia declarada. */
export const CAFFEINE_MG_PER_KG: Record<string, { lo: number; hi: number }> = {
  low: { lo: 2, hi: 3 },
  medium: { lo: 3, hi: 5 },
  high: { lo: 4, hi: 6 },
};
/** Tope diario que la EFSA considera seguro para un adulto sano. */
export const CAFFEINE_DAILY_CAP_MG = 400;
/** Cafeína de una taza de café de filtro. */
export const MG_PER_COFFEE = 95;

/**
 * YMYL: combina el disclaimer 'sports' y el 'medical-dose' de src/lib/disclaimers.ts,
 * en su redacción inglesa oficial.
 */
const DISCLAIMER =
  'General estimate. Adapt loads and goals to your condition; consult a qualified professional for pain, injury, or health risk. Doses are general references, not medical advice or a prescription. Do not self-medicate or change professional guidance; consult a physician or pharmacist.';

export const hub: HubData = {
  slug: 'en/fitness/endurance-thresholds',
  title: 'FTP, Critical Power, Threshold Pace, SWOLF and Race Fueling Calculator',
  description:
    'Set your endurance training zones and your race-day plan: FTP from a 20-minute test, Critical Power and W′ from two efforts, threshold pace from threshold heart rate, swim pace per 100 and SWOLF, carbohydrate needs per hour and a caffeine dose in mg per pound.',
  silo: 'Fitness & Sports',
  siloHref: '/en/fitness',
  locale: 'en',

  eyebrow: 'Endurance & zones',
  h1: 'What are my training zones and what do I eat during the race?',
  lede:
    'Endurance training runs on two sets of numbers: the intensities you can hold, and the fuel that lets you hold them. Turn a 20-minute test into an FTP and six power zones, two efforts into Critical Power and an anaerobic battery, a threshold heart rate into a tempo pace, a swim split into a level, and a race duration into grams of carbohydrate and milligrams of caffeine.',
  stamps: [
    'Coggan power zones, ACSM fueling, ISSN caffeine dosing',
    'US units: pounds, yards and min/mile, with metric alongside',
    'EFSA 400 mg daily ceiling enforced on the caffeine dose',
    'Replaces 7 single-purpose calculators',
  ],

  resultLabel: 'Your number',

  cases: {
    title: 'Which number are you setting?',
    intro:
      'Pick what you are working out. Only the fields that case needs are read — the rest are ignored.',
    items: [
      {
        id: 'ftp',
        label: 'My cycling FTP and power zones',
        hint: 'FTP from a 20-minute test, the six Coggan zones, and watts per pound.',
        yes: [
          'FTP as 95% of your 20-minute average power',
          'All six power zones in watts',
          'Watts per pound and watts per kilogram',
          'Where your endurance and threshold work should sit',
        ],
        warn: [
          DISCLAIMER,
          'The 95% factor assumes a properly executed 20-minute all-out effort after a full warm-up including an opener. Pace it badly and the number is wrong in whichever direction you erred.',
          'FTP drifts. Re-test every six to eight weeks, or after any block that changed your training substantially — riding to a stale FTP makes every zone slightly wrong.',
          'Power meters differ. Comparing an FTP measured on a smart trainer with one measured on a crank-based meter can produce a 5% gap that has nothing to do with fitness.',
        ],
        plazo: 'Re-test every six to eight weeks, always on the same equipment, and always rested.',
        answer:
          'FTP = 95% of your average power over an all-out 20 minutes. A 300-watt 20-minute average gives an FTP of 285 watts.',
      },
      {
        id: 'cp',
        label: 'My Critical Power and W′',
        hint: 'Two maximal efforts of different durations give the aerobic ceiling and the anaerobic reserve.',
        yes: [
          'Critical Power, your true sustainable ceiling',
          'W′, the finite work available above it',
          'How long you can hold a given power above CP',
          'How CP compares with a 20-minute FTP estimate',
        ],
        warn: [
          DISCLAIMER,
          'Both efforts have to be genuinely maximal for their duration and separated by full recovery, ideally on different days. A pair where one was paced conservatively produces a nonsense CP — sometimes negative.',
          'Use durations far enough apart to be informative: something like 3 minutes and 10 to 12 minutes. Two efforts a minute apart amplify measurement noise enormously.',
          'The two-parameter model assumes W′ is a fixed tank that empties above CP and refills below it. Reality is messier — recovery of W′ is slower than the model implies, especially late in a hard ride.',
        ],
        plazo: 'Do both tests inside the same week, rested, and repeat the pair whenever you want a fresh CP rather than mixing an old effort with a new one.',
        answer:
          'CP = (P1×t1 − P2×t2) ÷ (t1 − t2) and W′ = (P1 − CP) × t1. A 320 W three-minute effort and a 270 W ten-minute effort give CP ≈ 249 W with W′ ≈ 12.9 kJ.',
      },
      {
        id: 'mlss',
        label: 'My threshold running pace from threshold heart rate',
        hint: 'A reference tempo pace band from the heart rate you can hold at threshold.',
        yes: [
          'A threshold pace band in min/mile and min/km',
          'How that translates to a tempo run',
          'The pace band as a speed in mph',
          'What separates this from a real lactate test',
        ],
        warn: [
          DISCLAIMER,
          'This is a reference table keyed to heart rate, not a measurement. True maximal lactate steady state requires several constant-load tests with blood samples, and individual results scatter widely around any table like this one.',
          'Heart rate at threshold depends on age, genetics, heat, hydration and caffeine. Two runners of identical ability can differ by 20 beats, so treat the band as a starting point and adjust from how the effort actually feels.',
          'Cardiac drift means heart rate climbs during a long tempo effort at constant pace. Setting a tempo run by heart rate alone will make you slow down when you should not.',
        ],
        plazo: 'Confirm the band against a recent race: threshold pace is usually close to the pace you could hold for about an hour of racing.',
        answer:
          'Threshold pace is roughly the pace you could race for an hour. From a threshold heart rate of 165 the table suggests about 7:14–8:03 per mile.',
      },
      {
        id: 'swimpace',
        label: 'My swim pace and what level it is',
        hint: 'Pace per 100 metres and per 100 yards from a distance and a time, with the level band.',
        yes: [
          'Pace per 100 m and per 100 yd',
          'Speed in metres per second',
          'Which level band that pace sits in',
          'What each pace band corresponds to in a pool session',
        ],
        warn: [
          DISCLAIMER,
          'Pool length changes the number. A 25-yard pool gives more push-offs per 100 than a 50-metre pool, and the gap can be several seconds per 100 for the same swimmer.',
          'Level bands are for freestyle. Breaststroke and butterfly paces are not comparable, and open water is typically 5 to 10 seconds per 100 slower than the same effort in a pool.',
          'Technique dominates swimming far more than fitness does. A swimmer who gains 10 seconds per 100 almost always did it with stroke changes, not with harder sets.',
        ],
        plazo: 'Retest over the same distance in the same pool, otherwise you are measuring the venue rather than yourself.',
        answer:
          'Pace per 100 = time ÷ distance × 100. Under 1:30 per 100 m is advanced, under 1:05 is elite territory.',
      },
      {
        id: 'swolf',
        label: 'My SWOLF efficiency score',
        hint: 'Seconds for a lap plus strokes taken for it — the lower the sum, the more efficient the stroke.',
        yes: [
          'Your SWOLF score and its level band',
          'How much comes from time and how much from strokes',
          'Distance covered per stroke',
          'Which of the two levers to pull first',
        ],
        warn: [
          DISCLAIMER,
          'SWOLF is only comparable within the same pool length. A SWOLF taken in a 25-yard pool cannot be compared with one from a 50-metre pool — different lap, different scale.',
          'The score can be gamed by gliding: taking very few, very slow strokes lowers the stroke count but raises the time. A genuinely better SWOLF comes from covering more distance per stroke at the same or higher speed.',
          'Do not chase SWOLF at the expense of race pace. It is an efficiency diagnostic, not the objective — the objective is swimming the distance faster.',
        ],
        plazo: 'Track SWOLF at a fixed pace across a block rather than measuring it once. The trend is the useful part.',
        answer:
          'SWOLF = seconds per lap + strokes per lap. Under 40 is elite, under 56 advanced, under 70 intermediate.',
      },
      {
        id: 'fuel',
        label: 'How much to eat and drink during the race',
        hint: 'Carbohydrate grams per hour and how many standard gels that is.',
        yes: [
          'Total carbohydrate needed for the race',
          'How many standard 30 g gels that is',
          'How often to take one',
          'When a race is short enough not to need any',
        ],
        warn: [
          DISCLAIMER,
          'Sixty grams an hour is the ceiling for glucose alone, because intestinal glucose transport saturates there. Going beyond it requires a glucose-to-fructose blend, which uses a second transporter and lets trained athletes reach 90 grams an hour or more.',
          'Never try a new gel, drink or dose on race day. Gut tolerance for carbohydrate is trainable but individual, and the classic cause of a race-day stomach disaster is a product used for the first time.',
          'Every gel needs water — roughly 5 to 7 ounces. Taking concentrated gels with a sports drink instead of water pushes the carbohydrate concentration high enough to slow gastric emptying and cause cramping.',
        ],
        plazo: 'Rehearse the exact fueling plan on at least two long training sessions before you race it.',
        answer:
          'About 60 g of carbohydrate per hour for anything over 75 minutes — two standard 30 g gels an hour, one roughly every 25 to 30 minutes.',
      },
      {
        id: 'caffeine',
        label: 'How much caffeine before an event',
        hint: 'A dose in milligrams from your body weight and your habitual tolerance, capped at the safe daily limit.',
        yes: [
          'A dose range in milligrams for your body weight',
          'The equivalent in cups of filter coffee',
          'When to take it relative to the start',
          'Where the dose sits against the 400 mg daily ceiling',
        ],
        warn: [
          DISCLAIMER,
          'This is a performance dose for a healthy adult, and it is not for everyone. Skip it entirely if you are pregnant or breastfeeding, under 18, taking medication that interacts with caffeine, or living with a heart-rhythm, anxiety or blood-pressure condition — ask a physician first.',
          'The dose is capped at 400 mg because that is the daily ceiling the EFSA considers safe for a healthy adult. Anything you drink or eat later in the day counts against the same 400 mg, not on top of it.',
          'More is not better. Above roughly 6 mg per kilogram the ergogenic benefit plateaus while jitters, elevated heart rate, gut distress and disrupted sleep all keep rising.',
          'Never trial a caffeine dose for the first time on race day, and note that caffeine has a half-life of about five hours — an afternoon dose is still working at bedtime.',
        ],
        plazo: 'Take it 30 to 60 minutes before the start; if your tolerance is low, use the bottom of the range and allow the full 60 minutes.',
        answer:
          'The ISSN performance range is 3 to 6 mg per kilogram of body weight, roughly 1.4 to 2.7 mg per pound, taken 30 to 60 minutes before the effort and capped at 400 mg a day.',
      },
    ],
  },

  inputsTitle: 'Your numbers',
  inputsIntro: 'Fill in the fields your case needs — the rest are ignored.',
  fields: [
    { id: 'w20', label: 'Average power over a 20-minute test', type: 'number', value: 300, suffix: 'W', min: 50, max: 600, step: 5 },
    { id: 'bodyLb', label: 'Your body weight', type: 'number', value: 165, suffix: 'lb', min: 60, max: 450, step: 1 },
    { id: 'p1', label: 'Shorter effort — average power', type: 'number', value: 320, suffix: 'W', min: 50, max: 900, step: 5 },
    { id: 't1', label: 'Shorter effort — duration', type: 'number', value: 180, suffix: 'seconds', min: 60, max: 1800, step: 10 },
    { id: 'p2', label: 'Longer effort — average power', type: 'number', value: 270, suffix: 'W', min: 50, max: 900, step: 5 },
    { id: 't2', label: 'Longer effort — duration', type: 'number', value: 600, suffix: 'seconds', min: 120, max: 3600, step: 10 },
    { id: 'thrHr', label: 'Your threshold heart rate', type: 'number', value: 165, suffix: 'bpm', min: 100, max: 210, step: 1 },
    { id: 'swimDist', label: 'Distance swum', type: 'number', value: 400, min: 25, max: 5000, step: 25, thousands: true },
    {
      id: 'swimUnit',
      label: 'Distance is in',
      type: 'select',
      value: 'm',
      options: [
        { value: 'm', label: 'metres' },
        { value: 'yd', label: 'yards' },
      ],
    },
    { id: 'swimMin', label: 'Time it took', type: 'number', value: 7, suffix: 'minutes', min: 0.2, max: 240, step: 0.1 },
    { id: 'lapSec', label: 'Seconds for one lap', type: 'number', value: 30, suffix: 's', min: 8, max: 180, step: 1 },
    { id: 'strokes', label: 'Strokes taken in that lap', type: 'number', value: 22, min: 4, max: 80, step: 1 },
    { id: 'raceH', label: 'How long the race will take you', type: 'number', value: 4, suffix: 'hours', min: 0.25, max: 30, step: 0.25 },
    {
      id: 'tolerance',
      label: 'Your usual caffeine tolerance',
      type: 'select',
      value: 'medium',
      options: [
        { value: 'low', label: 'Low — I rarely drink coffee' },
        { value: 'medium', label: 'Medium — a cup or two a day' },
        { value: 'high', label: 'High — habitual, several a day' },
      ],
    },
  ],
  fineprint: DISCLAIMER,

  chart: {
    type: 'bars',
    title: 'The numbers side by side',
    caption:
      'What the bars compare depends on your case: aerobic against anaerobic contribution, the two halves of a SWOLF score, carbohydrate covered by gels against the total needed, or your caffeine dose against the 400 mg daily ceiling.',
  },

  breakdownTitle: 'Line by line',
  breakdownIntro:
    'Power is in watts, weight in pounds with kilograms alongside, swim pace per 100 metres and per 100 yards, and every dose in milligrams.',

  faq: [
    {
      q: 'Why is FTP 95% of a 20-minute test?',
      a: 'Because FTP is defined as the power you could hold for roughly an hour, and a well-executed maximal 20 minutes sits about 5% above that. The factor is an approximation fitted to trained cyclists; riders with a large anaerobic capacity tend to overshoot it and would be better served by a longer test or by a Critical Power protocol.',
    },
    {
      q: 'What is the difference between FTP and Critical Power?',
      a: 'FTP is a single number estimated from one test with a fixed correction factor. Critical Power comes from fitting a two-parameter model to two or more maximal efforts, and it produces a second number — W′, the finite work available above CP. CP is usually a few watts lower than a 20-minute FTP and is better grounded physiologically; FTP is easier to test.',
    },
    {
      q: 'What is W′ and what is it for?',
      a: 'W′ is the fixed quantity of work, measured in kilojoules, that you can perform above Critical Power before you have to slow down. It behaves like a battery: an attack, a hill or a sprint drains it, and riding below CP recharges it. Knowing yours tells you how many matches you have to burn and roughly how long each one lasts.',
    },
    {
      q: 'How do I find my threshold running pace?',
      a: 'The most reliable field method is a race: threshold pace is close to what you could hold for about an hour of hard racing, which for most amateurs is somewhere between 10K and half-marathon pace. Heart-rate tables like the one here are a starting point only, because threshold heart rate varies enormously between individuals of equal ability.',
    },
    {
      q: 'Is this a real MLSS measurement?',
      a: 'No, and it is important to be clear about that. Genuine maximal lactate steady state is determined by several 30-minute constant-load trials on separate days with blood lactate sampled throughout, looking for the highest intensity where lactate rises by less than 1 mmol/L over the final 20 minutes. What this offers is a reference band keyed to threshold heart rate.',
    },
    {
      q: 'What is a good swim pace per 100?',
      a: 'Under 2:00 per 100 metres puts you ahead of most recreational swimmers, under 1:30 is a solid advanced pace, and under 1:05 is elite territory. Bear in mind that pace per 100 yards runs roughly 8 to 9% faster than per 100 metres simply because the distance is shorter, so always state which one you mean.',
    },
    {
      q: 'What does the SWOLF score actually measure?',
      a: 'Efficiency, expressed as the sum of the seconds and the strokes for one lap. Two swimmers covering a lap in the same time have different SWOLF scores if one used fewer strokes, and the one using fewer is getting more distance from each pull. Because it mixes two units it is a comparative index, not a physical quantity, and it is only valid within one pool length.',
    },
    {
      q: 'How many carbohydrates should I take per hour of racing?',
      a: 'About 60 grams an hour for anything over 75 minutes, which is two standard gels. Sixty grams is the practical ceiling for glucose alone because the SGLT1 intestinal transporter saturates there. Products blending glucose and fructose use a second transporter and let well-trained, gut-adapted athletes take 90 grams an hour or more in long events.',
    },
    {
      q: 'When should I take my first gel?',
      a: 'Around 40 minutes in, then one every 25 to 30 minutes after that. Starting early keeps blood glucose steady rather than trying to rescue it once you already feel flat — by the time you notice the drop, you are 15 to 20 minutes from feeling better. Always take each gel with 5 to 7 ounces of plain water.',
    },
    {
      q: 'How much caffeine improves performance?',
      a: 'The ISSN position stand puts the ergogenic range at 3 to 6 mg per kilogram of body weight, roughly 1.4 to 2.7 mg per pound, taken 30 to 60 minutes before the effort. For a 165-pound athlete that is about 225 to 375 mg. Benefits plateau above that range while side effects continue to increase, so more is genuinely not better.',
    },
    {
      q: 'Why is the caffeine dose capped at 400 mg?',
      a: 'Because 400 mg a day is the intake the European Food Safety Authority concluded does not raise safety concerns for healthy adults, and single doses up to 200 mg are considered safe. The cap applies to your whole day, not to this dose in isolation — the coffee you had at breakfast counts against the same total.',
    },
    {
      q: 'Should habitual coffee drinkers take more?',
      a: 'Slightly, which is why the tolerance setting shifts the range. Regular consumers show a somewhat blunted response and typically need the upper end. But the practical advice is the reverse of what people expect: a short taper from caffeine in the days before an event restores sensitivity better than escalating the dose does.',
    },
  ],

  sources: [
    {
      name: 'ISSN position stand — caffeine and exercise performance',
      url: 'https://jissn.biomedcentral.com/articles/10.1186/s12970-020-00383-4',
      publisher: 'Journal of the International Society of Sports Nutrition',
    },
    {
      name: 'Scientific opinion on the safety of caffeine — 400 mg daily reference',
      url: 'https://www.efsa.europa.eu/en/efsajournal/pub/4102',
      publisher: 'European Food Safety Authority',
    },
    {
      name: 'ACSM / AND / DC joint position — nutrition and athletic performance',
      url: 'https://journals.lww.com/acsm-msse/fulltext/2016/03000/nutrition_and_athletic_performance.25.aspx',
      publisher: 'Medicine & Science in Sports & Exercise',
    },
    {
      name: 'Critical power — implications for determination of VO2max and exercise tolerance',
      url: 'https://pubmed.ncbi.nlm.nih.gov/20881877/',
      publisher: 'Medicine & Science in Sports & Exercise',
    },
    {
      name: 'Maximal lactate steady state — concept and determination',
      url: 'https://pubmed.ncbi.nlm.nih.gov/12617691/',
      publisher: 'Sports Medicine',
    },
  ],

  replaces: [
    '/en/ftp-cycling-watts',
    '/en/critical-power-cp',
    '/en/mlss-max-lactate-steady-state',
    '/en/swimming-pace-100m',
    '/en/swolf-swimming-index',
    '/en/endurance-race-gel-calculator',
    '/en/cafeina-dosis-rendimiento',
  ],

  lastReviewed: '2026-07-28',
};
