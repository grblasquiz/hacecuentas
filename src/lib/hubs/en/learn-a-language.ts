import type { HubData } from '../types';

/**
 * Hub EN — "How long until I actually speak this language?"
 *
 * Absorbe 10 calculadoras sueltas de aprendizaje de idiomas. Las constantes
 * salen de las fórmulas vivas y de las fuentes que ellas citan:
 *  - ingles-niveles-cambridge-duolingo-tiempo-conversion.ts → horas acumuladas por nivel MCER
 *  - tiempo-aprender-idioma-horas-semana-nivel.ts           → horas a B2 por idioma (escala FSI)
 *  - vocabulario-idioma-palabras-nivel-conocido.ts          → cortes de vocabulario activo por nivel
 *  - podcasts-aprender-idioma-minutos-diarios.ts            → minutos de escucha por nivel
 *  - ensayos-semanales-mejorar-writing-idioma.ts            → sesiones y palabras de escritura por nivel
 *  - duolingo-tiempo-dia-nivel-mcer-progreso.ts             → minutos/día = minutos totales ÷ días
 *  - idiomas-mas-utiles-profesion-internacional.ts          → idiomas de mayor retorno por profesión
 *  - edad-optima-aprender-idioma-ninos-adultos.ts           → bandas de edad 6 / 12 / 20
 */

/**
 * Horas guiadas acumuladas por nivel MCER, escala Cambridge English.
 * Espejo exacto de ingles-niveles-cambridge-duolingo-tiempo-conversion.ts.
 */
export const CEFR_CUMULATIVE_HOURS: Record<string, number> = {
  zero: 0,
  a1: 100,
  a2: 250,
  b1: 450,
  b2: 750,
  c1: 1150,
  c2: 1350,
};

export const CEFR_ORDER = ['zero', 'a1', 'a2', 'b1', 'b2', 'c1', 'c2'];

/**
 * Horas de estudio hasta B2 por idioma, para un hablante nativo de inglés.
 * Los valores de portugués, francés, italiano, alemán, japonés, mandarín y árabe
 * son los de tiempo-aprender-idioma-horas-semana-nivel.ts. Español, ruso y coreano
 * se agregaron según la misma escala del Foreign Service Institute (categoría I
 * como portugués/francés/italiano, categoría III y categoría IV respectivamente).
 */
export const HOURS_TO_B2: Record<string, number> = {
  spanish: 600,
  portuguese: 600,
  italian: 650,
  french: 650,
  german: 900,
  russian: 1100,
  japanese: 2200,
  mandarin: 2200,
  korean: 2200,
  arabic: 2200,
};

/** Idiomas que el FSI clasifica como de dificultad alta para anglohablantes. */
export const HARD_LANGUAGES = ['japanese', 'mandarin', 'korean', 'arabic'];

/**
 * Vocabulario activo mínimo por nivel MCER.
 * Espejo de vocabulario-idioma-palabras-nivel-conocido.ts.
 */
export const VOCAB_THRESHOLDS: Array<{ level: string; words: number }> = [
  { level: 'A1', words: 0 },
  { level: 'A2', words: 1500 },
  { level: 'B1', words: 2500 },
  { level: 'B2', words: 4000 },
  { level: 'C1', words: 8000 },
  { level: 'C2', words: 10000 },
];

/**
 * Minutos diarios de escucha recomendados por nivel y tipo de material.
 * Espejo de podcasts-aprender-idioma-minutos-diarios.ts (el rango 30-45 de B2 se
 * expresa acá como su punto medio para poder sumarlo al plan semanal).
 */
export const LISTENING_PLAN: Record<string, { minutes: number; material: string }> = {
  a1: { minutes: 15, material: 'material for absolute beginners' },
  a2: { minutes: 20, material: 'graded audio with a transcript' },
  b1: { minutes: 30, material: 'graded audio without a transcript' },
  b2: { minutes: 38, material: 'slow native speakers' },
  c1: { minutes: 45, material: 'native speakers at normal speed' },
  c2: { minutes: 45, material: 'unadapted native material of any kind' },
};

/**
 * Plan de escritura deliberada por nivel meta: [sesiones por semana, palabras por sesión].
 * Espejo de ensayos-semanales-mejorar-writing-idioma.ts.
 */
export const WRITING_PLAN: Record<string, [number, number]> = {
  b1: [4, 125],
  b2: [5, 180],
  c1: [7, 250],
  c2: [7, 360],
};

/**
 * Idiomas de mayor retorno por profesión.
 * Espejo de idiomas-mas-utiles-profesion-internacional.ts. El inglés queda como
 * línea de base para este mercado, así que se muestra aparte de los dos que suman.
 */
export const PROFESSION_LANGUAGES: Record<string, string[]> = {
  tech: ['English', 'Mandarin', 'German'],
  business: ['English', 'Mandarin', 'Spanish'],
  diplomacy: ['English', 'French', 'Arabic'],
  healthcare: ['English', 'Spanish', 'French'],
  academia: ['English', 'German', 'French'],
};

/** Bandas de edad de edad-optima-aprender-idioma-ninos-adultos.ts. */
export const AGE_BANDS = { earlyChildhood: 6, childhood: 12, adolescence: 20 };

const DISCLAIMER =
  'Estimated result based on your inputs. Hours-to-level figures are institutional averages for motivated learners with good instruction; individual progress varies enormously with exposure, prior languages and how much of the time is spent actually producing the language rather than consuming it.';

export const hub: HubData = {
  slug: 'en/school/learn-a-language',
  title: 'Language Learning Time Calculator: Hours to B2, CEFR Levels and Daily Practice',
  description:
    'Work out how many hours a language takes to reach B2 or the next CEFR level, the daily minutes needed to hit a deadline, what your vocabulary size says about your level, and the weekly listening and writing routine behind it.',
  silo: 'School & Learning',
  siloHref: '/en/school',
  locale: 'en',

  eyebrow: 'Languages',
  h1: 'How long until I actually speak this language?',
  lede:
    'Every app promises fluency and none of them tell you the number of hours. This does: how many study hours the language you picked actually takes to reach B2, how that converts into a daily habit against a deadline, what your vocabulary size means on the CEFR scale, what a week of listening and writing should look like at your target level, and which languages pay off in your field.',
  stamps: [
    'CEFR hours from the Cambridge English guided-hours scale',
    'Hours-to-B2 by language on the Foreign Service Institute difficulty scale',
    'Vocabulary thresholds: 1,500 words for A2 up to 10,000+ for C2',
    'Replaces 10 single-purpose calculators',
  ],

  resultLabel: 'Your estimate',

  cases: {
    title: 'Which one do you need?',
    intro: 'Pick the question. Only the fields that case needs are read.',
    items: [
      {
        id: 'hours',
        label: 'How many hours to the next level',
        hint: 'Guided hours from where you are now to the next CEFR level and to B2, at your weekly pace.',
        yes: [
          'Guided hours the next CEFR step requires from your current level',
          'Weeks, months and years at the hours a week you can realistically give it',
          'The total still standing between you and B2 in the language you chose',
        ],
        warn: [
          DISCLAIMER,
          'The steps get longer as you climb. A1 to A2 is about 150 hours; B1 to B2 is about 300 and B2 to C1 about 400. The feeling of slowing down at intermediate level is arithmetic, not failure.',
          'Difficulty is relative to the languages you already speak. For an English speaker, Spanish or Portuguese takes roughly a quarter of the hours Mandarin, Japanese, Korean or Arabic does — and those four also demand a writing system on top.',
          'Hours only count if they involve producing the language. Passive exposure with no speaking or writing stretches the same number of hours over far more calendar time.',
        ],
        plazo: 'Book the speaking practice before you feel ready. The gap between passive comprehension and being able to say something only closes by saying things.',
        answer:
          'Hours needed = cumulative hours for the target level − cumulative hours for your current level. Weeks = hours ÷ hours you study each week.',
      },
      {
        id: 'daily',
        label: 'How many minutes a day to hit my deadline',
        hint: 'Daily practice needed to cover the hours before a fixed date, and whether that load is sustainable.',
        yes: [
          'Minutes per day required to cover the hours before your date',
          'Whether that is a light, demanding or unsustainable daily load',
          'What the same total looks like split across the week instead',
        ],
        warn: [
          DISCLAIMER,
          'Above about an hour a day of app time, adherence collapses within weeks for most people. If the number comes out high, moving the target date is usually a better answer than promising yourself the hours.',
          'Consistency beats intensity: an hour every day beats seven hours on Sunday, because spaced retrieval is what moves vocabulary into long-term memory.',
          'App streak minutes are not equivalent to guided study hours. Tapping through review exercises builds recognition faster than production, so a streak-based total flatters the estimate.',
        ],
        plazo: 'Anchor the session to something that already happens daily — the commute, the coffee, before opening a laptop. Habits attach to cues, not to intentions.',
        answer:
          'Minutes per day = total minutes the goal requires ÷ days you have left. Split into two sessions if it goes past about 30 minutes.',
      },
      {
        id: 'vocab',
        label: 'What my vocabulary size means',
        hint: 'The CEFR level your active vocabulary places you at, and the next threshold.',
        yes: [
          'The CEFR level your active vocabulary corresponds to',
          'Words still needed to reach the next threshold',
          'How far the same word count goes in everyday text coverage',
        ],
        warn: [
          DISCLAIMER,
          'Active vocabulary — words you can produce — is typically a fraction of passive vocabulary, the words you recognise. Estimating from a recognition test therefore overstates your level.',
          'Word counts alone do not make a level. Grammar, listening under real conditions and the ability to speak without rehearsing count for as much, which is why a large vocabulary and a small speaking ability commonly go together.',
          'The first few thousand words carry disproportionate weight: the most frequent 2,000 word families cover the majority of everyday conversation, and every thousand after that buys less coverage than the one before.',
        ],
        plazo: 'Test yourself on production, not recognition: cover the target word and try to produce it from the meaning. That is the count that matches these thresholds.',
        answer:
          'Thresholds on the CEFR scale: about 1,500 active words for A2, 2,500 for B1, 4,000 for B2, 8,000 for C1 and 10,000+ for C2.',
      },
      {
        id: 'routine',
        label: 'What a week of practice should look like',
        hint: 'Daily listening minutes and weekly writing volume for the level you are aiming at.',
        yes: [
          'Daily listening minutes and the type of material for your target level',
          'Writing sessions per week and words per session',
          'The total weekly hours that routine adds up to',
        ],
        warn: [
          DISCLAIMER,
          'Listening only works at the right difficulty. Material you understand almost none of trains nothing; material you understand roughly 90% of is where new language actually gets acquired.',
          'Writing without correction plateaus fast. The value is in the feedback loop, so a shorter piece that someone corrects beats a longer one nobody reads.',
          'This routine covers input and written output. It does not replace speaking, which is the skill that decays fastest and the one people postpone longest.',
        ],
        plazo: 'Fix the days in the calendar rather than the total. "Four sessions this week" quietly becomes zero by Friday; "Monday, Tuesday, Thursday, Saturday" does not.',
        answer:
          'The routine scales by level: 15 minutes of graded listening a day at A1 up to 45 at C1, and 4 writing sessions of 125 words a week at B1 up to 7 of 360 at C2.',
      },
      {
        id: 'career',
        label: 'Which language is worth it for my field',
        hint: 'The highest-leverage languages for your profession and what each one costs in hours.',
        yes: [
          'The languages with the most leverage in your field',
          'What your chosen target language costs in hours to B2',
          'How that compares with the easiest and hardest options',
        ],
        warn: [
          DISCLAIMER,
          'Return on a language is concentrated where you actually work. A language that is globally important but absent from your industry and your city returns very little, however impressive the speaker numbers.',
          'Regional variants matter more than beginners expect. Peninsular and Rioplatense Spanish, Brazilian and European Portuguese, and above all Modern Standard Arabic versus the spoken dialects, differ enough to affect which materials are worth your hours.',
          'Age changes the strategy, not the outcome. Under about ' + AGE_BANDS.earlyChildhood + ' the accent comes for free with exposure; after about ' + AGE_BANDS.adolescence + ' explicit grammar and discipline compensate, and adults reach functional fluency perfectly well — a native-sounding accent is the part that gets genuinely harder.',
        ],
        plazo: 'Pick one and commit for at least a year. Switching languages at month four resets the clock and is the most common way the hours are wasted.',
        answer:
          'Hours to B2 range from about 600 for Spanish or Portuguese to about 2,200 for Mandarin, Japanese, Korean or Arabic, for an English speaker.',
      },
    ],
  },

  inputsTitle: 'Your level, language and pace',
  inputsIntro: 'Fill in what the case you picked needs — the rest is ignored.',
  fields: [
    {
      id: 'level',
      label: 'Your level right now',
      type: 'select',
      value: 'a2',
      options: [
        { value: 'zero', label: 'Complete beginner' },
        { value: 'a1', label: 'A1 — basic phrases' },
        { value: 'a2', label: 'A2 — simple everyday exchanges' },
        { value: 'b1', label: 'B1 — can get by independently' },
        { value: 'b2', label: 'B2 — comfortable on most topics' },
        { value: 'c1', label: 'C1 — fluent and precise' },
        { value: 'c2', label: 'C2 — near-native command' },
      ],
    },
    {
      id: 'language',
      label: 'Language you are learning',
      type: 'select',
      value: 'spanish',
      options: [
        { value: 'spanish', label: 'Spanish' },
        { value: 'portuguese', label: 'Portuguese' },
        { value: 'italian', label: 'Italian' },
        { value: 'french', label: 'French' },
        { value: 'german', label: 'German' },
        { value: 'russian', label: 'Russian' },
        { value: 'arabic', label: 'Arabic' },
        { value: 'mandarin', label: 'Mandarin Chinese' },
        { value: 'japanese', label: 'Japanese' },
        { value: 'korean', label: 'Korean' },
      ],
    },
    { id: 'weekly', label: 'Hours you study per week', type: 'number', value: 5, suffix: 'hours', min: 0.5, max: 60, step: 0.5 },
    { id: 'totalmin', label: 'Total minutes your goal needs', type: 'number', value: 9000, suffix: 'min', min: 1, step: 100, thousands: true },
    { id: 'days', label: 'Days until your deadline', type: 'number', value: 180, suffix: 'days', min: 1, step: 1 },
    { id: 'words', label: 'Words you can actively produce', type: 'number', value: 3200, min: 0, step: 100, thousands: true },
    {
      id: 'target',
      label: 'Level you are aiming at',
      type: 'select',
      value: 'b2',
      options: [
        { value: 'a1', label: 'A1' },
        { value: 'a2', label: 'A2' },
        { value: 'b1', label: 'B1' },
        { value: 'b2', label: 'B2' },
        { value: 'c1', label: 'C1' },
        { value: 'c2', label: 'C2' },
      ],
    },
    {
      id: 'profession',
      label: 'Your field',
      type: 'select',
      value: 'tech',
      options: [
        { value: 'tech', label: 'Technology and engineering' },
        { value: 'business', label: 'Business and trade' },
        { value: 'diplomacy', label: 'Diplomacy and international affairs' },
        { value: 'healthcare', label: 'Healthcare' },
        { value: 'academia', label: 'Academia and research' },
      ],
    },
    { id: 'age', label: 'Age of the learner', type: 'number', value: 30, suffix: 'years', min: 1, max: 100, step: 1 },
  ],
  fineprint: DISCLAIMER,

  chart: {
    type: 'scale',
    title: 'Where you are on the CEFR scale',
    caption:
      'The full A1-to-C2 ladder measured in cumulative guided hours, with a marker on where your current level, vocabulary or accumulated hours put you.',
  },

  breakdownTitle: 'Line by line',
  breakdownIntro:
    'Hours are cumulative guided-study hours on the Cambridge scale, adjusted for how hard the language is for an English speaker — the steps get longer at every level, which is why intermediate feels slower than beginner.',

  faq: [
    {
      q: 'How many hours does it take to learn a language?',
      a: 'To reach B2 — comfortable on most everyday and work topics — an English speaker needs roughly 600 to 700 hours for Spanish, Portuguese, Italian or French, around 900 for German, and about 2,200 for Mandarin, Japanese, Korean or Arabic. Those are guided study hours with good instruction; the same content self-taught with little speaking practice typically takes considerably longer.',
    },
    {
      q: 'What do the CEFR levels actually mean?',
      a: 'A1 and A2 cover survival language: introductions, ordering, simple routine exchanges. B1 is independence — you can handle most situations while travelling and describe experiences. B2 is where work and study in the language become realistic. C1 is fluent and precise use including implicit meaning, and C2 is near-native command. Most people who say they want to be "fluent" are describing B2.',
    },
    {
      q: 'Why does each level take longer than the last?',
      a: 'Because the amount of language each level covers grows. On the Cambridge guided-hours scale, zero to A1 is about 100 hours, A1 to A2 about 150, A2 to B1 about 200, B1 to B2 about 300 and B2 to C1 about 400. The intermediate plateau people describe is largely this: the same weekly effort now buys a smaller visible jump.',
    },
    {
      q: 'How many words do I need to know to be fluent?',
      a: 'On the thresholds used here, about 1,500 active words puts you at A2, 2,500 at B1, 4,000 at B2, 8,000 at C1 and 10,000 or more at C2. Coverage is heavily front-loaded: the most frequent couple of thousand word families account for the majority of everyday conversation, so the first 2,000 words do more work than the next 6,000.',
    },
    {
      q: 'What is the difference between active and passive vocabulary?',
      a: 'Passive vocabulary is what you recognise when you hear or read it; active vocabulary is what you can produce when you need it. Passive is typically several times larger. Since the level thresholds here are stated in active words, testing yourself with recognition — "do I know this word?" — will place you a level or so higher than you really are.',
    },
    {
      q: 'How many minutes a day should I study?',
      a: 'Whatever you can hold every day beats a bigger number you cannot. Up to about 20 minutes is a light, sustainable load; 20 to 60 is demanding but workable if you split it into two sessions; past an hour of app time daily, most people stop within weeks. If your deadline demands more than that, move the deadline or lower the target level.',
    },
    {
      q: 'Which languages are hardest for English speakers?',
      a: 'The Foreign Service Institute groups languages by the time its students need. Spanish, Portuguese, French and Italian sit in the easiest category; German is a step up; Russian, Greek, Hindi and similar are harder again; and Arabic, Mandarin, Cantonese, Japanese and Korean are the hardest, needing roughly four times the hours of the easiest group. Japanese is often singled out as the hardest of all for an English speaker.',
    },
    {
      q: 'Is it too late to learn a language as an adult?',
      a: 'No. Adults learn grammar and vocabulary faster than children do, because they can use explicit rules, transfer patterns from languages they already know and study deliberately. What genuinely gets harder with age is a native-sounding accent, and that is a cosmetic ceiling rather than a functional one — adults reach full working fluency routinely.',
    },
    {
      q: 'Do language apps actually work?',
      a: 'They work well for what they are: building recognition vocabulary and keeping a daily habit alive. They are weak at exactly the thing that decides fluency, which is unrehearsed production. The realistic use is an app for daily vocabulary maintenance paired with something that forces output — a tutor, a conversation exchange, a writing partner. Used alone, an app plateaus somewhere around A2 or B1.',
    },
    {
      q: 'How much listening practice do I need per day?',
      a: 'Around 15 minutes a day at A1 using beginner material, 20 at A2 with a transcript, 30 at B1 without one, 30 to 45 at B2 with slower native speakers, and 45 or more at C1 with unadapted native audio. The difficulty of the material matters as much as the minutes: aim for content you understand roughly 90% of, where the remaining 10% is what you are actually learning.',
    },
    {
      q: 'How much writing should I do to improve?',
      a: 'A workable ladder is four sessions of about 125 words a week for B1, five of 180 for B2, seven of 250 for C1 and seven of 360 for C2. What makes it work is correction — feedback on what you got wrong is where the improvement comes from, so a corrected paragraph beats an uncorrected page.',
    },
    {
      q: 'Which variant of the language should I learn?',
      a: 'Whichever one the people you will speak to use. Spanish splits into Peninsular, Rioplatense, Mexican and Andean varieties whose differences go beyond accent to pronouns and everyday vocabulary; Brazilian and European Portuguese differ enough in pronunciation to trip up learners of the other; and Arabic is the extreme case, where Modern Standard Arabic is the written and formal register while the spoken dialects can be mutually unintelligible.',
    },
    {
      q: 'Which language should I learn for my career?',
      a: 'It depends on the field. Mandarin and German carry weight in technology and engineering, Mandarin and Spanish in business and trade, French and Arabic in diplomacy, Spanish in US healthcare, and German and French in academic research. But local demand beats global rankings: the language actually spoken by the clients, patients or collaborators in front of you is the one that pays.',
    },
  ],

  sources: [
    { name: 'Foreign Service Institute — language difficulty categories and expected hours', url: 'https://www.state.gov/foreign-language-training/', publisher: 'US Department of State' },
    { name: 'Guided learning hours by CEFR level', url: 'https://www.cambridgeenglish.org/exams-and-tests/cefr/', publisher: 'Cambridge English' },
    { name: 'Common European Framework of Reference for Languages — Companion Volume', url: 'https://www.coe.int/en/web/common-european-framework-reference-languages', publisher: 'Council of Europe' },
    { name: 'Global Scale of English — level descriptors and mapping to CEFR', url: 'https://www.pearson.com/languages/why-pearson/the-global-scale-of-english.html', publisher: 'Pearson' },
    { name: 'Vocabulary size and text coverage research', url: 'https://www.lextutor.ca/', publisher: 'Compleat Lexical Tutor / Nation vocabulary studies' },
  ],

  replaces: [
    '/en/duolingo-time-cefr-level-progress',
    '/en/english-levels-cambridge-duolingo-time-conversion',
    '/en/language-learning-hours-calculator',
    '/en/podcasts-learn-language-daily-minutes',
    '/en/weekly-essay-writing-language-level',
    '/en/vocabulary-level-calculator',
    '/en/optimal-age-language-learning',
    '/en/language-app-effectiveness-comparison',
    '/en/best-languages-by-profession',
    '/en/language-variants-by-region',
  ],

  lastReviewed: '2026-07-28',
};
