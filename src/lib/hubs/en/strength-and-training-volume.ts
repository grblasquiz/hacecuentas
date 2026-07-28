import type { HubData } from '../types';

/**
 * Hub EN — "How much weight, how many sets, how often?"
 *
 * Absorbe 5 calculadoras sueltas: 1RM general (Epley/Brzycki/Lombardi), 1RM de peso
 * muerto (Epley), volumen semanal MEV/MRV por grupo muscular, frecuencia semanal por
 * grupo y horas de recuperación muscular.
 *
 * Unidades: libras primero, kilos al lado. Las tres fórmulas de 1RM son adimensionales,
 * así que corren igual en lb que en kg.
 */

/** Exacto por definición: 1 lb avoirdupois = 0,45359237 kg. */
export const KG_PER_LB = 0.45359237;

/** Denominador de Epley: 1RM = w × (1 + reps/30). */
export const EPLEY_DIV = 30;
/** Brzycki: 1RM = w × 36 / (37 − reps). */
export const BRZYCKI_NUM = 36;
export const BRZYCKI_SUB = 37;
/** Lombardi: 1RM = w × reps^0,10. */
export const LOMBARDI_EXP = 0.1;

/** Porcentajes de 1RM y repeticiones típicas asociadas (tabla clásica de fuerza). */
export const PCT_TABLE: Array<{ pct: number; reps: number }> = [
  { pct: 95, reps: 2 },
  { pct: 90, reps: 4 },
  { pct: 85, reps: 6 },
  { pct: 80, reps: 8 },
  { pct: 75, reps: 10 },
  { pct: 70, reps: 12 },
  { pct: 65, reps: 15 },
];

/** Volumen mínimo efectivo, series duras por grupo y semana. */
export const MEV: Record<string, Record<string, number>> = {
  chest: { beginner: 8, intermediate: 10, advanced: 12 },
  back: { beginner: 10, intermediate: 12, advanced: 14 },
  legs: { beginner: 10, intermediate: 12, advanced: 14 },
  arms: { beginner: 6, intermediate: 8, advanced: 10 },
};

/** Volumen máximo recuperable, series duras por grupo y semana. */
export const MRV: Record<string, Record<string, number>> = {
  chest: { beginner: 15, intermediate: 22, advanced: 28 },
  back: { beginner: 18, intermediate: 25, advanced: 30 },
  legs: { beginner: 16, intermediate: 22, advanced: 26 },
  arms: { beginner: 10, intermediate: 16, advanced: 20 },
};

/** Frecuencia semanal recomendada por nivel (sesiones por grupo). */
export const FREQUENCY: Record<string, { low: number; high: number; note: string }> = {
  beginner: { low: 3, high: 3, note: 'three full-body sessions a week' },
  intermediate: { low: 2, high: 3, note: 'each muscle two to three times a week' },
  advanced: { low: 3, high: 4, note: 'each muscle three to four times a week' },
};

/** Horas base de recuperación por grupo muscular tras una sesión moderada. */
export const RECOVERY_BASE_H: Record<string, number> = {
  legs: 60,
  back: 56,
  chest: 48,
  shoulders: 48,
  biceps: 36,
  triceps: 36,
  abs: 24,
};

/** Multiplicadores de recuperación. */
export const INTENSITY_MULT: Record<string, number> = { low: 0.7, moderate: 1, high: 1.35 };
export const AGE_MULT = [
  { over: 50, mult: 1.4 },
  { over: 40, mult: 1.2 },
  { over: 35, mult: 1.1 },
];
export const SLEEP_MULT = [
  { under: 6, mult: 1.3 },
  { under: 7, mult: 1.15 },
];

const DISCLAIMER =
  'General estimate. Adapt loads and goals to your condition; consult a qualified professional for pain, injury, or health risk.';

export const hub: HubData = {
  slug: 'en/fitness/strength-and-training-volume',
  title: 'One-Rep Max, Weekly Sets, Frequency and Recovery Calculator',
  description:
    'Estimate your 1RM in pounds from any set with Epley, Brzycki and Lombardi, get the training percentages, then find the weekly set range that actually grows the muscle, how often to hit it and how many hours it needs to recover.',
  silo: 'Fitness & Sports',
  siloHref: '/en/fitness',
  locale: 'en',

  eyebrow: 'Strength training',
  h1: 'How much weight, how many sets, how often?',
  lede:
    'Every lifting program is three numbers wearing a costume: the load, the volume and the frequency. Work out your one-rep max from a set you have already done, turn it into training percentages, find the weekly set range that grows the muscle without burying you, and see how long that muscle actually needs before it is ready again.',
  stamps: [
    'Pounds first, kilograms alongside',
    'Three 1RM formulas side by side, not one',
    'MEV and MRV set ranges by muscle group and level',
    'Replaces 5 single-purpose calculators',
  ],

  resultLabel: 'Your number',

  cases: {
    title: 'Which part of the program are you setting?',
    intro:
      'Pick what you are deciding right now. Only the fields that decision needs are read — the rest are ignored.',
    items: [
      {
        id: 'onerm',
        label: 'My one-rep max from a set I already did',
        hint: 'Epley, Brzycki and Lombardi from a weight and a rep count, plus the training percentages.',
        yes: [
          'Estimated 1RM from three independent formulas',
          'The average, and how far apart the three are',
          'Training loads at 65% through 95%',
          'The same numbers in kilograms',
        ],
        warn: [
          DISCLAIMER,
          'Estimates are trustworthy from sets of one to six reps and get progressively vaguer above that. At 12 or 15 reps, fatigue and technique breakdown dominate and the three formulas can disagree by more than 10%.',
          'The set has to have been genuinely close to failure. A set of 8 you could have taken to 12 will understate your max by a wide margin.',
          'Never test a true single without a spotter, a warm-up progression and a lift you already own technically. The estimate exists precisely so you do not have to.',
        ],
        plazo: 'Re-estimate every four to six weeks, from a top set inside your normal programming — not from a one-off max attempt.',
        answer:
          'Epley gives weight × (1 + reps ÷ 30), Brzycki weight × 36 ÷ (37 − reps) and Lombardi weight × reps^0.10. Averaging the three is more robust than trusting any one.',
      },
      {
        id: 'volume',
        label: 'How many hard sets a week this muscle needs',
        hint: 'Minimum effective volume and maximum recoverable volume for the muscle group and your level.',
        yes: [
          'The minimum weekly sets that still produce growth',
          'The ceiling your recovery can absorb',
          'Where to start inside that range',
          'How many sets per session that implies',
        ],
        warn: [
          DISCLAIMER,
          'A "set" here means a hard working set taken within a few reps of failure. Warm-ups, back-off sets and half-hearted sets do not count towards the total, which is why people who think they do 25 sets are often doing 12.',
          'MEV and MRV are ranges, not personal constants. Sleep, calories, stress and how much other work the muscle gets as a synergist all shift them week to week.',
          'Start near the bottom of the range and add sets only when progress stalls. Beginning at your MRV leaves you nowhere to go and no room to recover.',
        ],
        plazo: 'Add two sets a week at most, hold the new volume for two to three weeks, and deload before you reach the ceiling rather than after.',
        answer:
          'Most muscle groups grow on roughly 10 to 20 hard sets a week. Arms need fewer, back tolerates more, and beginners get results at the bottom of the range.',
      },
      {
        id: 'frequency',
        label: 'How often to train each muscle',
        hint: 'Sessions per muscle per week by experience level, and what that does to per-session volume.',
        yes: [
          'Weekly sessions per muscle group for your level',
          'How the weekly set total splits across them',
          'Why splitting beats one giant session',
          'What a sensible per-session cap looks like',
        ],
        warn: [
          DISCLAIMER,
          'Frequency matters mainly because it lets you distribute volume. Twenty sets in one session are far less productive than the same twenty across three, because the last sets of a long session are done with degraded output.',
          'Beginners do better on full-body training three times a week than on a body-part split; there is not yet enough volume to justify dedicating a whole session to one muscle.',
          'More than about 10 hard sets for one muscle in a single session gives sharply diminishing returns. Split the surplus into another day instead.',
        ],
        plazo: 'Leave at least 48 hours between hard sessions for the same muscle, and treat consecutive heavy leg days as a mistake rather than a plan.',
        answer:
          'Beginners: three full-body sessions a week. Intermediate: each muscle two to three times. Advanced: three to four, with the weekly set total split evenly across them.',
      },
      {
        id: 'recovery',
        label: 'How long before I train this muscle again',
        hint: 'Recovery hours from the muscle group, the session intensity, your age and your sleep.',
        yes: [
          'Recovery hours for that muscle and intensity',
          'The same figure in days',
          'How many times a week that allows',
          'What age and short sleep are costing you',
        ],
        warn: [
          DISCLAIMER,
          'Soreness is a poor recovery signal. It usually resolves before the muscle has finished repairing, and it can be absent entirely after a session that did plenty of damage.',
          'Sleeping under six hours stretches the recovery window by roughly 30% in this model. Sleep is the single largest modifiable input here — larger than any supplement.',
          'Persistent joint pain, a stalled or falling performance and a resting heart rate that will not come down are signs of under-recovery, not of needing to push harder.',
        ],
        plazo: 'If a muscle is still meaningfully sore at the 48-hour mark, cut the next session’s volume rather than skipping it entirely.',
        answer:
          'Legs need roughly 60 hours after a moderate session, chest and shoulders about 48, arms about 36 and abs about 24 — before any adjustment for intensity, age or sleep.',
      },
    ],
  },

  inputsTitle: 'Your numbers',
  inputsIntro: 'Fill in the fields your case needs — the rest are ignored.',
  fields: [
    { id: 'weight', label: 'Weight lifted', type: 'number', value: 225, suffix: 'lb', min: 1, max: 1200, step: 5, thousands: true },
    { id: 'reps', label: 'Reps completed with it', type: 'number', value: 5, min: 1, max: 15, step: 1, help: 'Estimates are most accurate from 1 to 6 reps.' },
    {
      id: 'muscle',
      label: 'Muscle group',
      type: 'select',
      value: 'chest',
      options: [
        { value: 'chest', label: 'Chest' },
        { value: 'back', label: 'Back' },
        { value: 'legs', label: 'Legs' },
        { value: 'arms', label: 'Arms' },
      ],
    },
    {
      id: 'level',
      label: 'Training experience',
      type: 'select',
      value: 'intermediate',
      options: [
        { value: 'beginner', label: 'Beginner — under a year of consistent lifting' },
        { value: 'intermediate', label: 'Intermediate — one to three years' },
        { value: 'advanced', label: 'Advanced — three years or more' },
      ],
    },
    {
      id: 'recMuscle',
      label: 'Muscle you just trained',
      type: 'select',
      value: 'legs',
      options: [
        { value: 'legs', label: 'Legs' },
        { value: 'back', label: 'Back' },
        { value: 'chest', label: 'Chest' },
        { value: 'shoulders', label: 'Shoulders' },
        { value: 'biceps', label: 'Biceps' },
        { value: 'triceps', label: 'Triceps' },
        { value: 'abs', label: 'Abs' },
      ],
    },
    {
      id: 'intensity',
      label: 'How hard that session was',
      type: 'select',
      value: 'moderate',
      options: [
        { value: 'low', label: 'Light — well short of failure' },
        { value: 'moderate', label: 'Moderate — normal working sets' },
        { value: 'high', label: 'Hard — to or near failure, heavy loads' },
      ],
    },
    { id: 'age', label: 'Your age', type: 'number', value: 32, suffix: 'years', min: 14, max: 90, step: 1 },
    { id: 'sleep', label: 'Hours of sleep you average', type: 'number', value: 7, suffix: 'h', min: 3, max: 12, step: 0.5 },
  ],
  fineprint: DISCLAIMER,

  chart: {
    type: 'bars',
    title: 'The numbers side by side',
    caption:
      'What the bars compare depends on your case: the three 1RM formulas against each other, the minimum against the maximum weekly sets, sessions per week, or recovery hours against a 48-hour reference.',
  },

  breakdownTitle: 'Line by line',
  breakdownIntro:
    'Loads are shown in pounds with the kilogram equivalent alongside; the 1RM formulas are dimensionless, so they give the same answer in either unit.',

  faq: [
    {
      q: 'How accurate are one-rep max estimates?',
      a: 'Very good from one to six reps — usually within about 3% of a tested max — and progressively worse above that. Beyond ten reps, muscular endurance starts to matter more than maximal strength, and two lifters with the same true max can produce very different rep counts at the same load. That is why this shows three formulas rather than one.',
    },
    {
      q: 'Why do Epley, Brzycki and Lombardi disagree?',
      a: 'They fit different curves to the same relationship. Epley is linear in reps, Brzycki is a hyperbola that blows up as reps approach 37, and Lombardi is a power function. At five reps they land within a couple of percent of each other. At twelve, Brzycki reads noticeably lower than Epley, and the spread between them is a useful honesty check on the estimate.',
    },
    {
      q: 'What weight should I use for sets of eight?',
      a: 'Roughly 80% of your estimated one-rep max, though the honest answer is whatever gets you to eight reps with one or two left in reserve. Percentage tables are a starting point, not a prescription: the same 80% feels very different on a deadlift than on a lateral raise, and it drifts with fatigue across a training block.',
    },
    {
      q: 'How many sets per muscle per week should I do?',
      a: 'Most people grow on 10 to 20 hard sets a week per muscle group. Beginners see results at the bottom of that; advanced lifters usually need the top of it. Arms tolerate less absolute volume than back or legs, partly because they already work as synergists in every pressing and pulling movement you do.',
    },
    {
      q: 'What are MEV and MRV?',
      a: 'MEV is the minimum effective volume — the fewest hard sets a week that still produce growth. MRV is the maximum recoverable volume — the most you can do and still recover from before the next session. The productive range sits between them. Below MEV you maintain; above MRV you accumulate fatigue faster than you adapt.',
    },
    {
      q: 'Does a warm-up set count towards weekly volume?',
      a: 'No. Only hard working sets taken within a few reps of failure count. This is the single most common reason people believe they are doing far more volume than they really are: a session logged as twenty sets often contains eight warm-ups and back-offs, leaving twelve that actually drove adaptation.',
    },
    {
      q: 'Is it better to train a muscle once or three times a week?',
      a: 'For equal weekly volume, splitting it across two or three sessions generally wins. The mechanism is quality, not magic: the last sets of a twenty-set chest session are performed with badly degraded output, whereas seven fresh sets three times a week are all productive. Once you exceed roughly ten hard sets for a muscle in one session, adding more gives very little.',
    },
    {
      q: 'How long does a muscle take to recover?',
      a: 'Roughly 24 hours for abs, 36 for arms, 48 for chest and shoulders and 60 for legs and back, after a moderate session. A genuinely hard session multiplies that by about 1.35. Those are working figures for programming, not physiological constants — the actual repair timeline varies with the exercise, the eccentric load and how novel the stimulus was.',
    },
    {
      q: 'Does age change how long I need to recover?',
      a: 'Yes, and the effect is real rather than an excuse. This model adds about 10% after 35, 20% after 40 and 40% after 50. The usual practical consequence is not training less but training each muscle slightly less often, with the same weekly volume spread over a longer cycle.',
    },
    {
      q: 'How much does poor sleep affect recovery?',
      a: 'A great deal. Under six hours a night stretches the recovery window by roughly 30% in this model, and under seven by about 15%. Growth hormone release is concentrated in deep sleep and protein synthesis follows it, so short sleep does not merely make training feel harder — it lengthens the time until the muscle is ready again.',
    },
    {
      q: 'Should I train a muscle while it is still sore?',
      a: 'Mild soreness is not a reason to skip a session; significant soreness is a reason to reduce its volume. Soreness and readiness are only loosely related — you can be sore and recovered, or unsore and under-recovered. Performance in the first working set is a far better signal: if it is well below normal, cut the session short.',
    },
    {
      q: 'Do the 1RM formulas work in pounds and kilograms?',
      a: 'Both, without adjustment. All three multiply your load by a factor that depends only on the rep count, so the unit passes straight through. A 225 lb set of five and a 102.06 kg set of five produce exactly the same estimated max in their respective units.',
    },
  ],

  sources: [
    {
      name: 'ACSM position stand — progression models in resistance training',
      url: 'https://www.acsm.org/education-resources/books/guidelines-exercise-testing-prescription',
      publisher: 'American College of Sports Medicine',
    },
    {
      name: 'Physical Activity Guidelines for Americans — muscle-strengthening activity',
      url: 'https://health.gov/our-work/nutrition-physical-activity/physical-activity-guidelines',
      publisher: 'U.S. Department of Health and Human Services',
    },
    {
      name: 'Dose-response relationship between weekly sets and muscle hypertrophy',
      url: 'https://pubmed.ncbi.nlm.nih.gov/27433992/',
      publisher: 'Journal of Sports Sciences',
    },
    {
      name: 'Effects of resistance training frequency on measures of muscle hypertrophy',
      url: 'https://pubmed.ncbi.nlm.nih.gov/27102172/',
      publisher: 'Sports Medicine',
    },
    {
      name: 'Sleep and muscle recovery — endocrinological and molecular basis',
      url: 'https://pubmed.ncbi.nlm.nih.gov/21550729/',
      publisher: 'Medical Hypotheses / NIH PubMed',
    },
  ],

  replaces: [
    '/en/one-rep-max-calculator',
    '/en/1rm-deadlift-estimator',
    '/en/weekly-volume-muscle-group',
    '/en/weekly-training-frequency-muscle-group',
    '/en/muscle-recovery-hours',
  ],

  lastReviewed: '2026-07-28',
};
