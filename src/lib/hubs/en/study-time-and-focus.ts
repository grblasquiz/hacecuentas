import type { HubData } from '../types';

/**
 * Hub EN — "How do I plan my study time?"
 *
 * Absorbe 5 calculadoras sueltas: sesión Pomodoro, capacidad diaria de Pomodoros,
 * plan de lectura anual, entrenamiento de lectura rápida y presupuesto de un
 * semestre en el exterior.
 *
 * Constantes espejadas de las fórmulas vivas:
 *  - tecnica-pomodoro-bloques-descanso-optimo.ts        → 25 / 5 / 20, largo cada 4, techo ~4,5 h de foco
 *  - productividad-pomodoro-sesiones-dia-efectivas.ts   → ciclo de 120 min, aviso a partir de 8 sesiones
 *  - leer-mes-libros-meta-anual-reto.ts                 → 300 páginas, 1,5 min/página, mes de 30 días
 *  - speed-reading-ejercicios-meses-mejora.ts           → semanas = brecha ÷ ganancia semanal; mes = 4,33 semanas
 *  - presupuesto-estudiar-exterior-universidad.ts       → semestre de 17 semanas, 7 rubros
 */

/** Duraciones clásicas de la técnica Pomodoro, en minutos. */
export const POMODORO_BLOCK = 25;
export const POMODORO_SHORT_BREAK = 5;
export const POMODORO_LONG_BREAK = 20;

/** El descanso largo reemplaza al corto cada N bloques. */
export const POMODORO_LONG_EVERY = 4;

/** Foco sostenible de una sentada, en horas, antes de que la calidad caiga. */
export const SUSTAINABLE_FOCUS_HOURS = 4.5;

/** Aviso de carga diaria: por encima de este número de Pomodoros la calidad se resiente. */
export const DAILY_POMODORO_CEILING = 10;

/** Supuestos del plan de lectura: libro promedio y ritmo de lectura. */
export const AVG_BOOK_PAGES = 300;
export const AVG_MINUTES_PER_PAGE = 1.5;
export const AVG_READING_WPM = 250;
export const DAYS_PER_MONTH = 30;

/** Semanas por mes calendario, tal como lo usa la fórmula de lectura rápida. */
export const WEEKS_PER_MONTH = 4.33;

/** Duración de un semestre académico de EE.UU., en semanas. */
export const SEMESTER_WEEKS = 17;

const DISCLAIMER =
  'Planning estimate based on your inputs. Focus capacity, reading speed and study-abroad prices vary widely by person, course and city; treat these as a starting budget to adjust, not a commitment.';

const MONEY_DISCLAIMER =
  'Informational estimate. Actual tuition, housing and insurance costs depend on the institution and the contract; compare official cost-of-attendance documents before deciding, and check the exchange rate on the day you pay.';

export const hub: HubData = {
  slug: 'en/school/study-time-and-focus',
  title: 'Study Time Planner: Pomodoro Sessions, Reading Goals and Study Abroad Budget',
  description:
    'Plan your study time: how many Pomodoros fit in the hours you have, how many you can sustain in a day, the daily reading needed to hit a book goal, how long a reading-speed target takes, and what a semester abroad costs.',
  silo: 'School & Learning',
  siloHref: '/en/school',
  locale: 'en',

  eyebrow: 'Study planning',
  h1: 'How do I plan my study time?',
  lede:
    'Five planning questions that decide whether a study goal survives contact with a real week: how many focus blocks actually fit in the time you have, how many of them a day can hold before quality drops, how many minutes of reading a book goal costs you daily, how long a reading-speed target takes to reach, and what a semester abroad adds up to.',
  stamps: [
    'Pomodoro at ' + POMODORO_BLOCK + '/' + POMODORO_SHORT_BREAK + ' minutes, long break every ' + POMODORO_LONG_EVERY + ' blocks',
    'Reading plan assumes a ' + AVG_BOOK_PAGES + '-page book at about ' + AVG_READING_WPM + ' words per minute',
    'Study-abroad totals spread over a ' + SEMESTER_WEEKS + '-week semester, in USD',
    'Replaces 5 single-purpose calculators',
  ],

  resultLabel: 'Your plan',

  cases: {
    title: 'Which one do you need?',
    intro: 'Pick the question. Only the fields that case needs are read.',
    items: [
      {
        id: 'session',
        label: 'How many Pomodoros fit in the time I have',
        hint: 'Blocks, short breaks and the long break packed into the minutes available.',
        yes: [
          'How many focus blocks fit, with the breaks placed between them',
          'Real focus time versus total session length, as a percentage',
          'Minutes left over that were not enough for another block',
        ],
        warn: [
          DISCLAIMER,
          'The session ends on a block, never on a break — a break after the last Pomodoro is just time you stopped studying, so it is not counted in the session length.',
          'Past roughly ' + SUSTAINABLE_FOCUS_HOURS + ' hours of real focus in one sitting, comprehension and retention fall off sharply. Split a long day into two separate sessions with a proper gap.',
          'The classic ' + POMODORO_BLOCK + '-minute block is a convention, not a finding. If your work has a long warm-up — proofs, code, translation — a 45- or 50-minute block usually loses less to context switching.',
        ],
        plazo: 'Decide the block length before you sit down. Adjusting it mid-session is itself a form of procrastination.',
        answer:
          'Blocks are packed greedily: each new block costs one break (long every ' + POMODORO_LONG_EVERY + ') plus the block itself, and the last break is dropped because the session ends on focus.',
      },
      {
        id: 'day',
        label: 'How many Pomodoros a day can hold',
        hint: 'The sustainable daily ceiling for your available hours, and the real focus time behind it.',
        yes: [
          'Pomodoros that fit in your available hours across full cycles',
          'Effective focus hours versus time spent on breaks',
          'Whether that load is sustainable day after day',
        ],
        warn: [
          DISCLAIMER,
          'Fitting the blocks in is arithmetic; sustaining them is not. Beyond about ' + DAILY_POMODORO_CEILING + ' Pomodoros a day, output per block drops enough that the extra blocks cost more than they return.',
          'Effective focus is always well under the clock time you set aside — the breaks are the point, not overhead to be optimised away.',
          'Sleep debt destroys this maths faster than anything else on the page. A short night cuts effective focus capacity more than adding an hour to the schedule adds.',
        ],
        plazo: 'Protect the first block of the day. It is the one that reliably happens, and the one most likely to be given away to email.',
        answer:
          'A full cycle is ' + POMODORO_LONG_EVERY + ' blocks plus their breaks and the long break. Whole cycles are packed first, then any leftover time is filled with block-plus-break pairs.',
      },
      {
        id: 'reading',
        label: 'How much I have to read to hit a book goal',
        hint: 'Books per month, days per book and daily reading minutes for an annual target.',
        yes: [
          'Books per month needed to reach the goal in the time left',
          'Days you get per book at that pace',
          'Daily reading minutes it works out to',
        ],
        warn: [
          DISCLAIMER,
          'The estimate assumes an average ' + AVG_BOOK_PAGES + '-page book at about ' + AVG_MINUTES_PER_PAGE + ' minutes a page. Dense non-fiction, technical texts and poetry all run far slower, and a long novel can be three times the average length.',
          'Reading goals fail on consistency, not on capacity. Twenty minutes every day beats three hours on Sunday, because the Sunday plan collapses the first weekend something happens.',
          'Audiobooks change the arithmetic entirely — a typical narration runs 150 to 160 words per minute, well under a comfortable silent reading pace.',
        ],
        plazo: 'Recalculate at the halfway point of the goal, not at the end. A pace that is 20% behind in June is recoverable; the same gap in November is not.',
        answer:
          'Books per month = goal ÷ months left. Daily minutes = books per month × ' + AVG_BOOK_PAGES + ' pages × ' + AVG_MINUTES_PER_PAGE + ' minutes ÷ ' + DAYS_PER_MONTH + ' days.',
      },
      {
        id: 'speed',
        label: 'How long to reach a reading-speed target',
        hint: 'Weeks and months of practice to close the gap between your current and target words per minute.',
        yes: [
          'The gap in words per minute between where you are and where you want to be',
          'Weeks of consistent practice to close it at your weekly rate of gain',
          'The same figure expressed in months',
        ],
        warn: [
          DISCLAIMER,
          'Speed without comprehension is not reading. Measure both: a gain that costs you 30% of what you retain is a loss, and the research on speed-reading claims of 1,000+ words per minute is consistently unkind to them.',
          'Progress is not linear. Early gains from stopping subvocalisation and regression come fast; each subsequent gain costs more practice than the one before, so a constant weekly rate flatters the later stages.',
          'Adult silent reading typically sits around ' + AVG_READING_WPM + ' words per minute for general prose, and technical material is read far more slowly by everyone, including fast readers.',
        ],
        plazo: 'Re-test your speed and comprehension together every two weeks — that is the interval at which a stalled plan is still cheap to change.',
        answer:
          'Weeks = (target WPM − current WPM) ÷ words per minute gained each week. Months = weeks ÷ ' + WEEKS_PER_MONTH + '.',
      },
      {
        id: 'abroad',
        label: 'What a semester abroad costs',
        hint: 'Tuition, housing, food, insurance, flights, visa and personal spending, per semester and per week.',
        yes: [
          'Total cost of one semester across all seven line items, in USD',
          'The weekly average over a ' + SEMESTER_WEEKS + '-week semester',
          'Which line items dominate the budget',
        ],
        warn: [
          MONEY_DISCLAIMER,
          'Tuition and housing normally account for most of the total. If those two are estimates rather than quoted figures, the whole budget is an estimate.',
          'The line most often left out is the one that hurts: currency conversion and card fees, deposits you do not get back until after you leave, and the flight home in a peak week.',
          'Check whether your home institution charges its own tuition while you are away — on many exchange programmes it does, and the host tuition is on top.',
          'Look at the Gilman Scholarship if you receive a Pell Grant, and at Boren awards for critical languages, before assuming the gap is yours to cover.',
        ],
        plazo: 'Most study-abroad funding closes one to two semesters ahead of departure — the budget has to exist before the applications do.',
        answer:
          'Semester total = tuition + housing + food + insurance + flights + visa + personal. Weekly average = total ÷ ' + SEMESTER_WEEKS + ' weeks.',
      },
    ],
  },

  inputsTitle: 'Your time and numbers',
  inputsIntro: 'Fill in what the case you picked needs — the rest is ignored.',
  fields: [
    { id: 'minutes', label: 'Minutes available for this session', type: 'number', value: 180, suffix: 'min', min: 5, step: 5 },
    { id: 'block', label: 'Focus block length', type: 'number', value: POMODORO_BLOCK, suffix: 'min', min: 5, max: 120, step: 5 },
    { id: 'shortbreak', label: 'Short break', type: 'number', value: POMODORO_SHORT_BREAK, suffix: 'min', min: 1, max: 60, step: 1 },
    { id: 'longbreak', label: 'Long break', type: 'number', value: POMODORO_LONG_BREAK, suffix: 'min', min: 5, max: 120, step: 5 },
    { id: 'every', label: 'Long break after how many blocks', type: 'number', value: POMODORO_LONG_EVERY, min: 2, max: 10, step: 1 },
    { id: 'hours', label: 'Hours you have available today', type: 'number', value: 8, suffix: 'hours', min: 0.5, max: 16, step: 0.5 },
    { id: 'books', label: 'Books you want to read', type: 'number', value: 24, min: 1, step: 1 },
    { id: 'months', label: 'Months left to read them', type: 'number', value: 12, min: 1, max: 60, step: 1 },
    { id: 'currentwpm', label: 'Your reading speed now', type: 'number', value: 220, suffix: 'wpm', min: 50, max: 2000, step: 10 },
    { id: 'targetwpm', label: 'Reading speed you want', type: 'number', value: 400, suffix: 'wpm', min: 50, max: 2000, step: 10 },
    { id: 'weeklygain', label: 'Words per minute you gain each week', type: 'number', value: 10, suffix: 'wpm/wk', min: 1, max: 200, step: 1 },
    { id: 'tuition', label: 'Tuition and fees', type: 'number', value: 9000, prefix: '$', min: 0, step: 100, thousands: true },
    { id: 'housing', label: 'Housing', type: 'number', value: 5400, prefix: '$', min: 0, step: 100, thousands: true },
    { id: 'food', label: 'Food', type: 'number', value: 2600, prefix: '$', min: 0, step: 100, thousands: true },
    { id: 'insurance', label: 'Health insurance', type: 'number', value: 700, prefix: '$', min: 0, step: 50, thousands: true },
    { id: 'flights', label: 'Flights', type: 'number', value: 1400, prefix: '$', min: 0, step: 50, thousands: true },
    { id: 'visa', label: 'Visa and paperwork', type: 'number', value: 500, prefix: '$', min: 0, step: 25, thousands: true },
    { id: 'personal', label: 'Personal spending and travel', type: 'number', value: 2000, prefix: '$', min: 0, step: 100, thousands: true },
  ],
  fineprint: DISCLAIMER,

  chart: {
    type: 'donut',
    title: 'How the total splits',
    caption:
      'What the answer is made of: focus time against breaks, the part of the goal already covered against what is left, or the line items that dominate the budget.',
  },

  breakdownTitle: 'Line by line',
  breakdownIntro:
    'Breaks are counted as part of the session rather than deducted from it, because the break is what makes the next block work — the efficiency figure shows what share of the clock is actual focus.',

  faq: [
    {
      q: 'How long should a Pomodoro block be?',
      a: 'The classic is ' + POMODORO_BLOCK + ' minutes of focus followed by a ' + POMODORO_SHORT_BREAK + '-minute break, with a longer break of around ' + POMODORO_LONG_BREAK + ' minutes after every ' + POMODORO_LONG_EVERY + ' blocks. Those numbers come from the original technique, not from a laboratory result. Work with a long warm-up — mathematical proofs, debugging, translation — often does better at 45 or 50 minutes, because each interruption costs the reload of everything you were holding in memory.',
    },
    {
      q: 'Why does the session end on a block instead of a break?',
      a: 'Because a break after the last block is not part of the study session, it is just the moment you stopped. Counting it would inflate the session length and understate the efficiency figure. The break only earns its place when there is another block after it.',
    },
    {
      q: 'How many hours of deep focus can I actually sustain in a day?',
      a: 'Far fewer than the hours you have. Most people top out at three to four hours of genuine deep focus daily, which is why the estimate flags anything past ' + SUSTAINABLE_FOCUS_HOURS + ' hours in a single sitting and past ' + DAILY_POMODORO_CEILING + ' blocks across the day. The rest of a working day goes to shallower work that is still useful — reviewing, organising, answering — just not the same thing.',
    },
    {
      q: 'Do the breaks have to be exactly five minutes?',
      a: 'No, but they have to be real. A break spent scrolling loads your attention rather than resetting it; standing up, walking, looking out a window or getting water resets it. The failure mode is not a break that is slightly too long, it is a break that never ended because it was spent on a screen.',
    },
    {
      q: 'How many minutes a day does a 24-book goal take?',
      a: 'Two books a month, at an average ' + AVG_BOOK_PAGES + '-page book and roughly ' + AVG_MINUTES_PER_PAGE + ' minutes a page, comes to about 30 minutes of reading a day. That is the average case: a 600-page novel is two books’ worth of time, and dense technical reading can run at half the pace, so the daily figure is a planning average rather than a nightly quota.',
    },
    {
      q: 'How fast do adults read?',
      a: 'General prose is typically read silently at around ' + AVG_READING_WPM + ' words per minute, with comfortable comprehension. Audiobook narration runs slower, around 150 to 160 words per minute. Technical material, legal text and anything you intend to remember are all read considerably more slowly, by everyone.',
    },
    {
      q: 'Can speed-reading training really double my reading rate?',
      a: 'Modest gains are real and come mostly from eliminating regression — re-reading lines you already read — and from reducing subvocalisation on easy material. Gains beyond roughly double the starting speed usually turn out, on testing, to be skimming with a corresponding drop in comprehension. Always re-test speed and comprehension together, or you have no way of knowing which one you improved.',
    },
    {
      q: 'Why does progress on reading speed slow down over time?',
      a: 'Because the cheap gains go first. Stopping regression and subvocalisation delivers a quick jump; after that you are up against how fast your eyes can move and how fast language is processed, and each extra word per minute costs more practice than the one before. A constant weekly gain, as assumed here, therefore flatters the later stages of the plan.',
    },
    {
      q: 'What does a semester abroad actually cost?',
      a: 'It depends far more on the city than on the programme. Tuition and housing normally make up most of the total, and the same course in Lisbon and in London can differ by a factor of two on housing alone. Build the budget from the host institution’s published cost of attendance rather than from a national average, and add the items that never appear in brochures: deposits, card and currency fees, and a peak-season flight home.',
    },
    {
      q: 'What funding exists for study abroad from the US?',
      a: 'The Gilman International Scholarship supports Pell Grant recipients and can be worth several thousand dollars; Boren Awards fund study of critical languages at considerably higher amounts in exchange for a federal service commitment. Many home institutions also let existing aid travel with you. Check whether your regular financial aid applies to the term abroad before assuming the whole gap is out of pocket.',
    },
    {
      q: 'Does my home tuition keep running while I am abroad?',
      a: 'On many exchange programmes, yes — you pay your home institution and the host waives its tuition, or you pay both. The arrangement varies by agreement and it is the single largest swing factor in the budget, so confirm it in writing with your study-abroad office before adding up anything else.',
    },
    {
      q: 'Is it better to study in long sessions or short daily ones?',
      a: 'Short and spaced, for anything you need to retain. Distributed practice — the same total hours spread across more days — consistently outperforms massing them into fewer, longer sessions, and the advantage grows the longer the delay before the exam. Long sessions feel more productive because effort is easier to notice than forgetting.',
    },
  ],

  sources: [
    { name: 'The Pomodoro Technique — original method and timings', url: 'https://www.pomodorotechnique.com/', publisher: 'Francesco Cirillo' },
    { name: 'Gilman International Scholarship Program', url: 'https://www.gilmanscholarship.org/', publisher: 'US Department of State, Bureau of Educational and Cultural Affairs' },
    { name: 'Boren Awards for International Study', url: 'https://www.borenawards.org/', publisher: 'Defense Language and National Security Education Office' },
    { name: 'Cost of attendance and how study abroad is treated in federal aid', url: 'https://studentaid.gov/understand-aid/types/international', publisher: 'US Department of Education, Federal Student Aid' },
    { name: 'Adult reading rate research — Brysbaert, "How many words do we read per minute?"', url: 'https://doi.org/10.1016/j.jml.2019.104047', publisher: 'Journal of Memory and Language' },
    { name: 'Organizing Instruction and Study to Improve Student Learning (distributed practice)', url: 'https://ies.ed.gov/ncee/wwc/PracticeGuide/1', publisher: 'Institute of Education Sciences, What Works Clearinghouse' },
  ],

  replaces: [
    '/en/pomodoro-25-5-timer',
    '/en/pomodoro-sessions-calculator',
    '/en/speed-reading-progress-improvement',
    '/en/leer-mes-libros-meta-anual-reto',
    '/en/study-abroad-costs-budget',
  ],

  lastReviewed: '2026-07-28',
};
