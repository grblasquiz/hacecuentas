import type { HubData } from '../types';

/**
 * Decision hub EN — "How hard should I train, and what do I need to drink?"
 *
 * Absorbs 7 loose calculators: max heart rate by age, RPE/RIR to percentage of
 * 1RM, daily step targets, calories burned by yoga style, electrolyte
 * replacement, sports hydration, and the coffee-dehydration question.
 *
 * SOURCE DISCIPLINE: two max-heart-rate formulas are shown side by side because
 * they disagree by a lot after 40 — Fox (220 − age) is the famous one and Tanaka
 * (208 − 0.7 × age) is the one derived from a meta-analysis. Energy cost uses MET
 * values from the Compendium of Physical Activities, and hydration follows the
 * ACSM position stand.
 */

/** YMYL disclaimer — verbatim from src/lib/disclaimers.ts, COPY.en, domain 'sports'. */
const DISCLAIMER =
  'General estimate. Adapt loads and goals to your condition; consult a qualified professional for pain, injury, or health risk.';

/** Maximum heart rate formulas. */
export const HRMAX = { foxBase: 220, tanakaBase: 208, tanakaSlope: 0.7 };

/** Training zones as a share of maximum heart rate. */
export const ZONES = [
  { name: 'Zone 1 — recovery', from: 0.5, to: 0.6 },
  { name: 'Zone 2 — aerobic base', from: 0.6, to: 0.7 },
  { name: 'Zone 3 — tempo', from: 0.7, to: 0.8 },
  { name: 'Zone 4 — threshold', from: 0.8, to: 0.9 },
  { name: 'Zone 5 — VO2 max', from: 0.9, to: 1.0 },
];

/** MET values from the Compendium of Physical Activities. */
export const METS = {
  walkSlow: 3.0,
  walkBrisk: 4.3,
  hatha: 2.5,
  vinyasa: 4.0,
  ashtanga: 4.0,
  hot: 5.0,
  yin: 2.0,
};

/** Step-count evidence: the mortality benefit plateaus well before the famous 10,000. */
export const STEPS = { marketingTarget: 10000, benefitPlateau: 8000, olderAdultPlateau: 7500, stepsPerMile: 2000 };

/** ACSM position stand on exercise and fluid replacement. */
export const HYDRATION = {
  mlPerHourLow: 400,
  mlPerHourHigh: 800,
  sodiumMgPerLiterLow: 300,
  sodiumMgPerLiterHigh: 600,
  /** Litres to replace per kilogram of body mass lost after exercise. */
  replaceLowPerKg: 1.25,
  replaceHighPerKg: 1.5,
  /** FDA guidance on habitual caffeine intake for healthy adults, in mg per day. */
  caffeineDailyMax: 400,
};

export const hub: HubData = {
slug: 'en/health/exercise-and-training',
  title: 'Max heart rate, training zones, RPE and hydration calculator',
  description:
    'Get your maximum heart rate by both the Fox and Tanaka formulas, your five training zones in beats per minute, the percentage of 1RM behind an RPE or reps-in-reserve target, a step goal based on the actual evidence, calories by yoga style, and how much fluid and sodium to replace.',
  silo: 'Health',
siloHref: '/en/health',
locale: 'en',

  eyebrow: 'Training and recovery',
  h1: 'How hard should I train, and what do I need to drink?',
  lede:
    'Enter your age, weight and session and you get your heart-rate zones in beats per minute, the load an RPE or reps-in-reserve target actually corresponds to, what a step count is worth against the evidence rather than the marketing, the calories a class of that style burns, and the fluid and sodium a session of that length costs you.',
  stamps: ['Reviewed 27-07-2026', 'Tanaka 2001 · ACSM position stand · Compendium of Physical Activities', '7 calculators inside'],

  resultLabel: 'Your training target',

  cases: {
    title: 'My situation is different',
    intro: 'Pick what you are actually planning. Each branch uses different fields and a different reference.',
    items: [
      {
        id: 'zones',
        label: 'Cardio heart-rate zones',
        hint: 'What BPM should I be training at?',
        yes: [
          'Maximum heart rate by Fox (220 − age) and by Tanaka (208 − 0.7 × age), so you can see how far apart they are',
          'The five zones in beats per minute, not percentages',
          'Karvonen zones from your resting heart rate, which are more individual than plain percentage-of-max',
          'Where the aerobic base zone actually sits — usually lower than people train it',
        ],
        warn: [
          DISCLAIMER,
          'Every age-based formula carries a standard deviation of 10 to 12 bpm: two people the same age can differ by 20 bpm and both be normal',
          'Fox and Tanaka diverge with age — by 60, Fox says 160 and Tanaka says 166, which changes every zone underneath',
          'Chest pain, unusual breathlessness or fainting during exercise is a stop-and-get-assessed signal, not a zone problem',
        ],
        plazo: 'a field test or a lab test beats any formula; retest every 6 to 12 months if you train seriously.',
        answer:
          'Tanaka (208 − 0.7 × age) is the better-validated estimate. Zone 2 sits at 60 to 70% of that, and it is where most base training should happen.',
      },
      {
        id: 'strength',
        label: 'Strength: RPE and reps in reserve',
        hint: 'What load matches an RPE 8 for 5 reps?',
        yes: [
          'The percentage of your one-rep max implied by a target reps and reps-in-reserve combination',
          'The load in pounds if you enter your 1RM',
          'The RPE that matches the reps in reserve you picked',
          'How the estimated 1RM changes if you actually hit that set',
        ],
        warn: [
          DISCLAIMER,
          'RPE is a skill: novice lifters routinely under-report by 2 to 3 reps in reserve, which makes every derived load wrong',
          'Percentage charts are population averages — high-rep ability varies enormously between people at the same 1RM',
          'Repeatedly training to true failure raises injury and fatigue cost far more than it raises adaptation',
        ],
        plazo: 'recalibrate your 1RM estimate every 4 to 8 weeks rather than every session.',
        answer:
          'Reps in reserve plus target reps gives the effective reps to failure, and that maps onto a percentage of your 1RM.',
      },
      {
        id: 'steps',
        label: 'Daily steps and walking',
        hint: 'Is 10,000 steps really the number?',
        yes: [
          'What your step count is worth in distance and calories for your body weight',
          'The step count where the mortality benefit actually plateaus in the research',
          'Where the 10,000 figure came from, and why it is not a guideline',
          'The pace-adjusted energy cost, since brisk walking costs meaningfully more than strolling',
        ],
        warn: [
          DISCLAIMER,
          '10,000 steps came from a 1960s Japanese pedometer name, not from evidence — the measured benefit plateaus around 7,500 to 8,000',
          'Step counts on a wrist tracker over-count by 5 to 15% from arm movement alone',
          'Calorie estimates from steps carry wide error: use them for trend, never for a food budget',
        ],
        plazo: 'the biggest health return is in the first few thousand steps: moving from 3,000 to 6,000 matters more than 8,000 to 10,000.',
        answer:
          'Around 7,500 to 8,000 steps a day is where the measured mortality benefit levels off. 10,000 is a marketing number, not a target.',
      },
      {
        id: 'class',
        label: 'Yoga and class calories',
        hint: 'How much does this style actually burn?',
        yes: [
          'Calories for the style you picked, from its MET value and your body weight',
          'How far apart the styles really are — restorative and power yoga differ by more than double',
          'The same session compared against a brisk walk of equal length',
          'Why a heated room raises the heart rate without raising the energy cost much',
        ],
        warn: [
          DISCLAIMER,
          'MET-based estimates carry roughly 20% error, and heated classes inflate perceived effort far more than actual energy cost',
          'Weight lost in a hot class is water, not fat: it comes back with the next drink',
          'Wearable calorie estimates for yoga are among the least accurate of any activity',
        ],
        plazo: 'strength and mobility gains from yoga show up in 6 to 8 weeks of twice-weekly practice.',
        answer:
          'Restorative and yin sit around 2 METs, hatha 2.5, vinyasa and ashtanga 4, and hot yoga about 5 — roughly a brisk walk.',
      },
      {
        id: 'hydration',
        label: 'Fluid and electrolytes',
        hint: 'How much should I drink for this session?',
        yes: [
          'Fluid to drink during the session, at the ACSM rate for its length',
          'Sodium to replace when the session runs beyond an hour',
          'Your actual sweat rate, if you weigh yourself before and after',
          'How much to drink afterwards to fully replace what you lost',
        ],
        warn: [
          DISCLAIMER,
          'Overdrinking plain water in long events causes exercise-associated hyponatraemia, which is more dangerous than mild dehydration',
          'Thirst is a good enough guide for sessions under an hour — the sodium and volume maths only matters beyond that',
          'Sweat rate varies three-fold between people and with heat: measure yours instead of trusting a table',
        ],
        plazo: 'replace 125 to 150% of the weight you lost, over the 4 to 6 hours after the session.',
        answer:
          'Drink 400 to 800 mL per hour during exercise, add 300 to 600 mg of sodium per litre past the first hour, and replace 1.25 to 1.5 L for every kilogram lost.',
      },
    ],
  },

  inputsTitle: 'Your session',
  inputsIntro: 'Age and weight drive most of it. The rest only affects the branch you picked.',
  fields: [
    { id: 'age', label: 'Age', type: 'number', suffix: 'years', min: 10, max: 100, step: 1, value: 40 },
    { id: 'weight', label: 'Body weight', type: 'number', suffix: 'lb', min: 60, max: 500, step: 1, value: 165 },
    {
      id: 'restingHr',
      label: 'Resting heart rate',
      type: 'number',
      suffix: 'bpm',
      min: 0,
      max: 120,
      step: 1,
      value: 60,
      help: 'Measured on waking, before getting up. Enables the Karvonen zones.',
    },
    { id: 'minutes', label: 'Session length', type: 'number', suffix: 'minutes', min: 0, max: 400, step: 5, value: 60 },
    { id: 'reps', label: 'Target reps in the set (strength)', type: 'number', suffix: 'reps', min: 1, max: 20, step: 1, value: 5 },
    {
      id: 'rir',
      label: 'Reps in reserve (strength)',
      type: 'number',
      suffix: 'reps left',
      min: 0,
      max: 6,
      step: 1,
      value: 2,
      help: 'RPE 10 is 0 reps in reserve, RPE 9 is 1, RPE 8 is 2, and so on.',
    },
    { id: 'oneRm', label: 'Your one-rep max (optional)', type: 'number', suffix: 'lb', min: 0, max: 1200, step: 5, value: 225 },
    { id: 'steps', label: 'Steps today', type: 'number', suffix: 'steps', min: 0, max: 60000, step: 500, value: 8000, thousands: false },
    {
      id: 'style',
      label: 'Class style',
      type: 'select',
      value: 'vinyasa',
      options: [
        { value: 'yin', label: 'Yin or restorative' },
        { value: 'hatha', label: 'Hatha' },
        { value: 'vinyasa', label: 'Vinyasa flow' },
        { value: 'ashtanga', label: 'Ashtanga or power' },
        { value: 'hot', label: 'Hot or Bikram' },
      ],
    },
    {
      id: 'weightLost',
      label: 'Weight lost during the session (optional)',
      type: 'number',
      suffix: 'lb',
      min: 0,
      max: 12,
      step: 0.1,
      value: 0,
      help: 'Weigh yourself before and after, towelled dry. Leave at 0 to use the standard rate instead.',
    },
  ],
  fineprint: DISCLAIMER,

  chart: {
    type: 'scale',
    title: 'Where this session sits',
    caption:
      'The scale shows the bands that matter for the branch you picked — training zones, percentage of one-rep max, step counts or fluid loss — with your session marked on it.',
    bands: [
      { label: 'Easy', from: 0, to: 40, tone: 'good' },
      { label: 'Moderate', from: 40, to: 75, tone: 'neutral' },
      { label: 'Hard', from: 75, to: 100, tone: 'warn' },
    ],
  },
  breakdownTitle: 'The numbers behind it',
  breakdownIntro: 'Each row names its own unit and the source it comes from.',

  faq: [
    {
      q: 'What is my maximum heart rate?',
      a: 'Two formulas are in common use and they disagree. Fox (220 − age) is the famous one; Tanaka (208 − 0.7 × age) came from a meta-analysis and fits the data better, especially over 40. At 25 they differ by about 1 bpm; at 65 by nearly 8. Both carry a standard deviation of 10 to 12 bpm, so treat either as a starting point rather than a fact.',
    },
    {
      q: 'What are the five training zones?',
      a: 'As a share of maximum heart rate: zone 1 is 50–60% (recovery), zone 2 is 60–70% (aerobic base), zone 3 is 70–80% (tempo), zone 4 is 80–90% (threshold) and zone 5 is 90–100% (VO2 max). Most endurance training should sit in zone 2, which usually feels easier than people expect.',
    },
    {
      q: 'What is the Karvonen method and why is it different?',
      a: 'Karvonen works from heart-rate reserve — maximum minus resting — instead of maximum alone, then adds resting heart rate back. For a fit person with a low resting rate, Karvonen zones come out noticeably higher than plain percentage-of-max, which is why the two methods can disagree by 10 bpm or more.',
    },
    {
      q: 'How does RPE relate to reps in reserve?',
      a: 'They are two names for the same scale. RPE 10 means 0 reps left in the tank, RPE 9 means 1, RPE 8 means 2, and so on down. Adding your target reps to your reps in reserve gives the total reps you could have done, and that maps onto a percentage of your one-rep max.',
    },
    {
      q: 'What percentage of my 1RM is 5 reps at RPE 8?',
      a: '5 reps with 2 in reserve is a 7-rep-to-failure effort, which lands around 78 to 80% of a one-rep max on standard charts. The estimate is a population average: at the same 1RM, some people manage far more reps than others at the same percentage.',
    },
    {
      q: 'Do I really need 10,000 steps a day?',
      a: 'No. The number came from the name of a 1960s Japanese pedometer, not from research. The measured association with lower mortality plateaus around 7,500 to 8,000 steps a day in adults, and around 7,500 in older women. The largest gains come at the bottom of the range — moving from 3,000 to 6,000 does more than 8,000 to 10,000.',
    },
    {
      q: 'How many calories does yoga burn?',
      a: 'It depends heavily on style. By MET values, yin and restorative sit around 2, hatha 2.5, vinyasa and ashtanga around 4, and hot yoga around 5 — roughly the cost of a brisk walk. For a 165 lb person, an hour of vinyasa is about 300 calories and an hour of restorative about 150.',
    },
    {
      q: 'Does a hot room make me burn more?',
      a: 'Much less than it feels. Heat raises heart rate and sweat rate sharply, but the extra energy cost is modest. The weight you lose in a hot class is water and returns with the next drink. Perceived effort in heat is a poor proxy for calories burned.',
    },
    {
      q: 'How much should I drink during exercise?',
      a: 'The ACSM position stand puts it at roughly 400 to 800 mL per hour during exercise, adjusted for sweat rate and conditions. For sessions under an hour, drinking to thirst is enough. Beyond an hour, add 300 to 600 mg of sodium per litre to reduce the risk of exercise-associated hyponatraemia.',
    },
    {
      q: 'How do I measure my sweat rate?',
      a: 'Weigh yourself naked and towelled dry before and after a session, and add back anything you drank. The difference divided by the hours gives your sweat rate. It varies up to three-fold between people and rises sharply with heat, so measuring beats any table.',
    },
    {
      q: 'Does coffee dehydrate me?',
      a: 'Not at habitual intakes. Controlled trials show moderate coffee consumption produces no meaningful difference in hydration status compared with water in regular drinkers. Coffee counts toward daily fluid intake. The FDA points to about 400 mg of caffeine a day — roughly four cups — as a level not generally associated with negative effects in healthy adults.',
    },
    {
      q: 'How much should I drink after a hard session?',
      a: 'Replace 125 to 150% of the weight you lost, spread over the following 4 to 6 hours rather than in one go. That is about 1.25 to 1.5 litres per kilogram lost. Include sodium — plain water alone drives some of it straight back out as urine.',
    },
  ],

  sources: [
    {
      name: 'Tanaka H, Monahan KD, Seals DR — Age-predicted maximal heart rate revisited (JACC)',
      url: 'https://pubmed.ncbi.nlm.nih.gov/11153730/',
      publisher: 'PubMed',
      date: '2001',
    },
    {
      name: 'ACSM — Exercise and Fluid Replacement position stand',
      url: 'https://pubmed.ncbi.nlm.nih.gov/17277604/',
      publisher: 'PubMed',
      date: '2007',
    },
    {
      name: 'Ainsworth BE et al. — Compendium of Physical Activities',
      url: 'https://pubmed.ncbi.nlm.nih.gov/21681120/',
      publisher: 'PubMed',
      date: '2011',
    },
    {
      name: 'Lee IM et al. — Association of step volume and intensity with all-cause mortality in older women (JAMA Intern Med)',
      url: 'https://pubmed.ncbi.nlm.nih.gov/31141585/',
      publisher: 'PubMed',
      date: '2019',
    },
    {
      name: 'Paluch AE et al. — Daily steps and all-cause mortality: a meta-analysis of 15 international cohorts (Lancet Public Health)',
      url: 'https://pubmed.ncbi.nlm.nih.gov/35247352/',
      publisher: 'PubMed',
      date: '2022',
    },
    {
      name: 'Killer SC, Blannin AK, Jeukendrup AE — No evidence of dehydration with moderate daily coffee intake (PLoS One)',
      url: 'https://pubmed.ncbi.nlm.nih.gov/24416202/',
      publisher: 'PubMed',
      date: '2014',
    },
    {
      name: 'FDA — Spilling the Beans: How Much Caffeine is Too Much?',
      url: 'https://www.fda.gov/consumers/consumer-updates/spilling-beans-how-much-caffeine-too-much',
      publisher: 'U.S. Food and Drug Administration',
    },
    {
      name: 'HHS — Physical Activity Guidelines for Americans, 2nd edition',
      url: 'https://health.gov/our-work/nutrition-physical-activity/physical-activity-guidelines',
      publisher: 'U.S. Department of Health and Human Services',
    },
  ],

  replaces: [
    '/en/maximum-heart-rate-by-age',
    '/en/rpe-rir-training-percentage',
    '/en/daily-steps-calculator',
    '/en/yoga-calories-by-style',
    '/en/electrolyte-replacement-exercise',
    '/en/sports-hydration-electrolytes-exercise',
    '/en/coffee-hydration-myths',
  ],

lastReviewed: '2026-07-28',
};
