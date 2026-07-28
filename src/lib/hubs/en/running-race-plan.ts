import type { HubData } from '../types';

/**
 * Hub EN — "How do I train for and pace this race?"
 *
 * Absorbe 8 calculadoras sueltas de running: plan de 5K, plan de 10K, pace objetivo
 * de maratón (DOS calcs duplicadas), proyección 21K desde 10K (Cameron), regla del 10%,
 * descanso post-maratón y ajuste de ritmo por desnivel en trail.
 *
 * Unidades: US primero (millas, pies de desnivel, min/mile) con el métrico al lado.
 */

/** Exacto por definición internacional. */
export const KM_PER_MILE = 1.609344;
export const M_PER_FT = 0.3048;

/** Distancias oficiales de ruta, en kilómetros (World Athletics). */
export const RACE_KM: Record<string, number> = {
  '5k': 5,
  '10k': 10,
  half: 21.0975,
  marathon: 42.195,
};

/**
 * Planes de 5K. Espejo de plan-entrenamiento-5k-semanas.ts (ACSM / Higdon / Galloway):
 * semanas totales, pico de volumen semanal en km y días de carrera por semana.
 */
export const PLAN_5K: Record<string, { weeks: number; peakKm: number; days: number; goal: string }> = {
  beginner: { weeks: 10, peakKm: 28, days: 3, goal: '35–45 min' },
  intermediate: { weeks: 7, peakKm: 40, days: 4, goal: '25–34 min' },
  advanced: { weeks: 5, peakKm: 58, days: 6, goal: 'sub-25 min' },
};

/**
 * Planes de 10K. Espejo de plan-entrenamiento-10k-semanas.ts: el pico se calcula
 * componiendo la tasa de aumento sobre las semanas de construcción.
 */
export const PLAN_10K: Record<string, { weeks: number; startKm: number; buildWeeks: number; rate: number }> = {
  beginner: { weeks: 12, startKm: 15, buildWeeks: 10, rate: 0.1 },
  intermediate: { weeks: 10, startKm: 30, buildWeeks: 8, rate: 0.08 },
  advanced: { weeks: 8, startKm: 50, buildWeeks: 6, rate: 0.06 },
};

/** Regla del 10%: techo de aumento de volumen semanal. */
export const WEEKLY_BUILD_RATE = 0.1;

/**
 * Cameron (1998): t_D2 = t_D1 × (D2/D1)^(1,07 + 0,0065 × ln t_D1), con t en minutos.
 * El exponente sube con el tiempo del corredor, así que castiga más al corredor lento
 * que un Riegel de exponente fijo.
 */
export const CAMERON_A = 1.07;
export const CAMERON_B = 0.0065;

/** Regla de recuperación: 1 día suave por cada 2 km corridos en competencia. */
export const RECOVERY_DAYS_PER_KM = 0.5;
/** Variante anglosajona equivalente: 1 día suave por milla corrida. */
export const RECOVERY_DAYS_PER_MILE = 1;

/**
 * Naismith: 100 m de ascenso equivalen a 1 km llano. En unidades US eso es
 * exactamente 528 pies de ascenso por milla equivalente (5.280 ft × 0,1).
 */
export const FT_GAIN_PER_EQUIV_MILE = 528;

/** ACSM: disclaimer de deportes, versión inglesa de src/lib/disclaimers.ts. */
const DISCLAIMER =
  'General estimate. Adapt loads and goals to your condition; consult a qualified professional for pain, injury, or health risk.';

export const hub: HubData = {
  slug: 'en/fitness/running-race-plan',
  title: 'Race Pace, Training Plan and Recovery Calculator for Runners',
  description:
    'Work out the pace you need per mile, how many weeks of training the race takes, how fast you can safely add mileage, what a 10K predicts for your half marathon, how long to recover afterwards and what hills do to your pace.',
  silo: 'Fitness & Sports',
  siloHref: '/en/fitness',
  locale: 'en',

  eyebrow: 'Running',
  h1: 'How do I train for and pace this race?',
  lede:
    'One question with six moving parts: the pace you have to hold, the weeks of build-up it takes to hold it, how quickly you may add mileage without getting hurt, what your 10K really predicts for a half, how long you owe your legs afterwards, and what the elevation profile does to all of it. All six, in miles and minutes per mile.',
  stamps: [
    'Miles and min/mile first, kilometres alongside',
    'Cameron prediction, Naismith elevation rule, 10% build rule',
    'Plan volumes mirrored from ACSM-aligned coaching tables',
    'Replaces 8 single-purpose calculators',
  ],

  resultLabel: 'Your number',

  cases: {
    title: 'What are you working out?',
    intro:
      'Pick the question you actually have. Only the fields that question needs are read — everything else is ignored.',
    items: [
      {
        id: 'pace',
        label: 'The pace I need for my goal time',
        hint: 'Goal finish time in, required pace per mile and per kilometre out, with the halfway split.',
        yes: [
          'Required pace in min/mile and min/km',
          'The halfway split you should hit',
          'What each minute of goal time is worth in pace',
          'An even-split and a slight negative-split target',
        ],
        warn: [
          DISCLAIMER,
          'This is an even-split pace. Almost every personal best is run on an even or slightly negative split, and almost every blow-up starts with banking time in the first three miles.',
          'Course profile, heat and wind can cost a minute per mile on their own. Race by effort on a hard day and treat this number as the plan, not the law.',
          'A goal pace you have never held in training for half the race distance is a wish, not a goal. Test it in a tune-up race first.',
        ],
        plazo: 'Lock your goal pace three to four weeks out, when your longest run and your last tune-up race are already behind you.',
        answer:
          'Required pace = goal time ÷ race distance. A 4-hour marathon is 9:09 per mile (5:41 per km), with the half passed at 2:00:00.',
      },
      {
        id: 'plan',
        label: 'How many weeks of training this race takes',
        hint: 'Weeks to the start line and peak weekly mileage for a 5K or a 10K, by experience level.',
        yes: [
          'Weeks of preparation for your level',
          'Peak weekly mileage in miles and kilometres',
          'How many days a week you should be running',
          'A realistic finish-time band for that level',
        ],
        warn: [
          DISCLAIMER,
          'These plan lengths assume you can already run continuously for about 20 minutes. Starting from nothing, add four to six weeks of walk-run before week one.',
          'Peak weekly mileage is the top of the block, not week one. Arriving at it too early is the single most common way runners get hurt in a short-race build.',
          'The last one to two weeks are a taper: volume drops sharply while intensity stays. Skipping the taper costs more time than any workout you would gain.',
        ],
        plazo: 'Count backwards from race day and add one spare week for illness or a missed block — nearly every plan needs it.',
        answer:
          'A beginner 5K takes about 10 weeks peaking near 17 miles a week; a beginner 10K takes about 12 weeks peaking near 24 miles a week.',
      },
      {
        id: 'buildup',
        label: 'How fast I can add weekly mileage',
        hint: 'The 10% rule applied to your current weekly volume, week by week.',
        yes: [
          'Next week’s ceiling from your current mileage',
          'Where you land after four weeks of compounding',
          'How many miles that is per week, added',
          'When a cutback week belongs in the sequence',
        ],
        warn: [
          DISCLAIMER,
          'The 10% figure is a ceiling, not a target. Weeks where you feel flat, sleep badly or race should stay flat or go down.',
          'The rule breaks at the extremes: 10% of 8 miles is under a mile and pointlessly cautious, while 10% of 70 miles is a 7-mile jump that most runners cannot absorb.',
          'Every third or fourth week should be a cutback of 20 to 30%. Continuous compounding for eight weeks straight is how stress fractures happen.',
        ],
        plazo: 'Hold any new weekly volume for at least two weeks before raising it again — adaptation lags the training that caused it.',
        answer:
          'Add at most 10% per week. From 20 miles a week that is 22 next week and about 29 after four weeks of compounding.',
      },
      {
        id: 'predict',
        label: 'What my 10K predicts for a half marathon',
        hint: 'Cameron’s formula, whose exponent adapts to how fast you already are.',
        yes: [
          'Projected half-marathon time from your 10K',
          'The pace that projection implies, per mile and per km',
          'How much slower than 10K pace the half should feel',
          'Why the prediction is harsher for slower runners',
        ],
        warn: [
          DISCLAIMER,
          'Any race-equivalence formula assumes you have trained for the longer distance. A sharp 10K runner with no long runs will not hit the projected half — endurance, not speed, is the limiter.',
          'Cameron’s exponent grows with your 10K time, so it predicts a bigger slowdown for slower runners than the fixed 1.06 exponent of Riegel. That is deliberate and better matched to real results.',
          'The projection assumes a comparable course and comparable conditions. A flat 10K does not predict a hilly half.',
        ],
        plazo: 'Use a 10K run within the last six weeks. Older results overstate your current fitness.',
        answer:
          'Cameron predicts t_half = t_10K × 2.10975^(1.07 + 0.0065 × ln t_10K). A 50-minute 10K projects to about 1:53 for the half.',
      },
      {
        id: 'recover',
        label: 'How long to rest after the race',
        hint: 'Easy days owed after a hard race, by distance.',
        yes: [
          'Easy days before you train hard again',
          'The same figure in weeks',
          'What "easy" actually permits',
          'How the classic one-day-per-mile rule compares',
        ],
        warn: [
          DISCLAIMER,
          'Easy does not mean zero. Walking, gentle jogging, swimming and cycling all speed recovery; sitting still for three weeks does not.',
          'Muscle damage from a marathon is measurable for two to three weeks even when the soreness is gone by day four. Feeling fine is not the same as being recovered.',
          'Racing again inside the recovery window is the classic way to turn one good race into a season of injury. Book the next race outside it.',
        ],
        plazo: 'No hard intervals and no racing until the recovery window closes; the first quality session after it should be short and controlled.',
        answer:
          'Allow roughly one easy day per two kilometres raced — about 21 days after a marathon, 11 after a half.',
      },
      {
        id: 'trail',
        label: 'What the hills do to my trail pace',
        hint: 'Naismith’s elevation rule turns feet of climb into equivalent flat miles.',
        yes: [
          'Equivalent flat distance from your climb',
          'Estimated finish time on the real course',
          'Effective pace per actual mile',
          'Climb per mile, the number that decides how it feels',
        ],
        warn: [
          DISCLAIMER,
          'Naismith adds time for going up but nothing for coming down. On steep, technical descents you may be slower than on the flat, so the estimate runs optimistic on out-and-back courses.',
          'The rule was written for hill walking. Runners on runnable grades beat it; runners on scree, mud or above 8,000 feet of altitude fall well behind it.',
          'Altitude, heat and a heavy pack are not in this model at all. Above roughly 6,500 feet, add time on top of whatever this gives you.',
        ],
        plazo: 'Check the elevation profile the week before, not the morning of — the climb per mile decides your shoe and your pack, not just your pace.',
        answer:
          'Every 528 feet of climb costs you roughly one flat mile. A 13-mile trail race with 2,640 feet of gain runs like an 18-mile flat race.',
      },
    ],
  },

  inputsTitle: 'Your numbers',
  inputsIntro: 'Fill in the fields your case needs — the rest are ignored.',
  fields: [
    {
      id: 'race',
      label: 'Race distance',
      type: 'select',
      value: 'marathon',
      options: [
        { value: '5k', label: '5K (3.11 mi)' },
        { value: '10k', label: '10K (6.21 mi)' },
        { value: 'half', label: 'Half marathon (13.11 mi)' },
        { value: 'marathon', label: 'Marathon (26.22 mi)' },
      ],
    },
    { id: 'goalH', label: 'Goal finish — hours', type: 'number', value: 4, min: 0, max: 12, step: 1 },
    { id: 'goalM', label: 'Goal finish — minutes', type: 'number', value: 0, min: 0, max: 59, step: 1 },
    {
      id: 'level',
      label: 'Your experience level',
      type: 'select',
      value: 'beginner',
      options: [
        { value: 'beginner', label: 'Beginner — finishing is the goal' },
        { value: 'intermediate', label: 'Intermediate — a few races behind me' },
        { value: 'advanced', label: 'Advanced — chasing a personal best' },
      ],
    },
    { id: 'weekly', label: 'Weekly mileage right now', type: 'number', value: 20, suffix: 'mi', min: 0, max: 150, step: 1 },
    { id: 'tenk', label: 'Your recent 10K time', type: 'number', value: 50, suffix: 'minutes', min: 25, max: 120, step: 1 },
    { id: 'raced', label: 'Distance you just raced', type: 'number', value: 26.22, suffix: 'mi', min: 1, max: 100, step: 0.1 },
    { id: 'trailMi', label: 'Trail race distance', type: 'number', value: 13.1, suffix: 'mi', min: 0.5, max: 100, step: 0.1 },
    { id: 'gainFt', label: 'Total elevation gain', type: 'number', value: 2640, suffix: 'ft', min: 0, max: 40000, step: 50, thousands: true },
    { id: 'baseMin', label: 'Your flat pace — minutes', type: 'number', value: 9, suffix: 'min/mi', min: 3, max: 20, step: 1 },
    { id: 'baseSec', label: 'Your flat pace — seconds', type: 'number', value: 40, suffix: 's', min: 0, max: 59, step: 5 },
  ],
  fineprint: DISCLAIMER,

  chart: {
    type: 'bars',
    title: 'The numbers side by side',
    caption:
      'What the bars compare depends on your case: the two halves of the race, the weeks and mileage of a plan, this week against four weeks out, or the flat miles you actually ran against the ones the climb added.',
  },

  breakdownTitle: 'Line by line',
  breakdownIntro:
    'Paces are shown as decimal minutes so the arithmetic is checkable; the readable mm:ss version sits in the reference column beside each one.',

  faq: [
    {
      q: 'What pace do I need for a 4-hour marathon?',
      a: '9:09 per mile, or 5:41 per kilometre, held for the whole 26.2 miles. That means passing halfway in 2:00:00. If you cross the half in 1:55 you have banked five minutes you will hand back with interest after mile 20 — the marathon is the one distance where going out fast is almost never recoverable.',
    },
    {
      q: 'Should I aim for an even split or a negative split?',
      a: 'Even, or one to two percent slower in the first half than the second. Analysis of large marathon fields consistently shows negative and even splits correlate with personal bests, while positive splits of more than three percent correlate with the classic late-race collapse. Practically: run the first three miles feeling like you are holding back.',
    },
    {
      q: 'How many weeks does it take to train for a 5K?',
      a: 'About 10 weeks for a beginner, peaking near 17 miles a week over three running days; roughly 7 weeks for an intermediate runner peaking near 25 miles a week; and 5 weeks for an advanced runner already carrying 36 miles a week. All three assume you can already run continuously for about 20 minutes on day one.',
    },
    {
      q: 'How many weeks does a 10K plan take?',
      a: 'Twelve weeks from a beginner base of about 9 miles a week, ten weeks from an intermediate base of about 19, and eight weeks from an advanced base of about 31. The plan compounds weekly volume — 10% a week for beginners, 8% for intermediate, 6% for advanced — through the build phase and then tapers.',
    },
    {
      q: 'What exactly is the 10% rule?',
      a: 'Do not increase weekly running volume by more than about 10% over the previous week. It is a ceiling for the tissue that adapts slowest — tendon, bone and fascia — which lags cardiovascular fitness by weeks. It is not a schedule: plenty of weeks should be flat, and every third or fourth should drop 20 to 30%.',
    },
    {
      q: 'Does the 10% rule work at very low or very high mileage?',
      a: 'Poorly at both ends. At 8 miles a week it permits less than a mile of increase, which is needlessly slow. At 70 miles a week it permits a 7-mile jump in a single week, which is far more than most runners absorb. Below about 15 miles a week, add a mile or two; above about 40, cap the increase at 3 to 5 miles regardless of percentage.',
    },
    {
      q: 'How accurate is predicting a half marathon from a 10K?',
      a: 'Good if you have done the long runs, optimistic if you have not. Cameron’s formula uses an exponent that rises with your 10K time, so it predicts a larger slowdown for slower runners than fixed-exponent methods. Its blind spot is the same as every equivalence formula: it measures your speed, not your endurance, and the half exposes endurance.',
    },
    {
      q: 'Why does Cameron give a different answer from Riegel?',
      a: 'Riegel raises the distance ratio to a fixed 1.06 for everyone. Cameron makes the exponent 1.07 + 0.0065 × ln(t), so a 35-minute 10K runner gets an exponent near 1.093 while a 70-minute runner gets about 1.098. The gap is small in the exponent but grows over a doubled distance, and it tracks real results better across a wide range of abilities.',
    },
    {
      q: 'How long should I rest after a marathon?',
      a: 'Roughly 21 easy days by the one-day-per-two-kilometres rule, and about 26 by the older one-day-per-mile version. Either way it is around three weeks before hard training resumes. Easy means walking, gentle jogging or cross-training — movement helps, intensity does not.',
    },
    {
      q: 'Can I race again soon after a marathon?',
      a: 'Not inside the recovery window without paying for it. Blood markers of muscle damage stay elevated for one to two weeks after a marathon even when the soreness has gone, and immune function is measurably suppressed in the days immediately after. Book the next hard race at least four weeks out, and a short one before a long one.',
    },
    {
      q: 'How much does climbing slow me down on a trail?',
      a: 'Naismith’s rule, converted to US units, says every 528 feet of gain costs you about one flat mile of effort. A 13-mile race with 2,640 feet of climb therefore runs like an 18-mile flat race. On very steep or technical ground the real cost is higher, because the rule was written for hill walking and credits nothing for a difficult descent.',
    },
    {
      q: 'Why does climb per mile matter more than total climb?',
      a: 'Because it sets the grade, and the grade decides whether you run or hike. Under about 100 feet of climb per mile a course is essentially rolling and runnable; over about 300 feet per mile most runners are power-hiking the ups, which changes your pacing, your fuelling and often your footwear.',
    },
  ],

  sources: [
    {
      name: 'ACSM Guidelines for Exercise Testing and Prescription — training progression',
      url: 'https://www.acsm.org/education-resources/books/guidelines-exercise-testing-prescription',
      publisher: 'American College of Sports Medicine',
    },
    {
      name: 'Physical Activity Guidelines for Americans, 2nd edition',
      url: 'https://health.gov/our-work/nutrition-physical-activity/physical-activity-guidelines',
      publisher: 'U.S. Department of Health and Human Services',
    },
    {
      name: 'Competition rules — official road race distances',
      url: 'https://worldathletics.org/about-iaaf/documents/book-of-rules',
      publisher: 'World Athletics',
    },
    {
      name: 'Naismith’s rule for hill walking and its running adaptations',
      url: 'https://www.mountaineering.scot/safety-and-skills/essential-skills/navigation',
      publisher: 'Mountaineering Scotland',
    },
    {
      name: 'Running injury and training-load research overview',
      url: 'https://bjsm.bmj.com/content/50/5/273',
      publisher: 'British Journal of Sports Medicine',
    },
  ],

  replaces: [
    '/en/5k-training-plan-weeks',
    '/en/10k-training-plan-weeks',
    '/en/marathon-pace-goal-time-split-kilometer',
    '/en/pace-objetivo-maraton-tiempo',
    '/en/half-marathon-projection-from-10k-cameron',
    '/en/running-10-percent-rule',
    '/en/post-marathon-rest-days-calculator',
    '/en/trail-running-elevation-pace-adjustment',
  ],

  lastReviewed: '2026-07-28',
};
