import type { HubData } from '../types';

/**
 * Hub EN — "What's my GPA and what do I need to keep the scholarship?"
 *
 * Absorbe 4 calculadoras sueltas de notas: GPA en escala 4.0, promedio de
 * secundaria, mínimo de promedio para beca y puntaje de antecedentes docentes.
 *
 * Las constantes salen de las fórmulas vivas:
 *  - gpa-promedio-americano-escala-4-0.ts  → conversión (nota ÷ escala) × 4.0 y las bandas A/B/C/D-F
 *  - beca-promedio-minimo-requisito-universidades.ts → cortes 3.0 y 3.5
 *  - concurso-docente-puntaje-antecedentes-baires.ts → bandas 30 / 50 / 80 de puntaje
 */

/** Tope de la escala estándar de EE.UU. Espejo de gpa-promedio-americano-escala-4-0.ts. */
export const GPA_MAX = 4.0;

/**
 * Bandas por letra en la escala 4.0, tal como las aplica la fórmula viva:
 * 3.7+ = A, 3.0+ = B, 2.0+ = C, por debajo D/F.
 */
export const GPA_BAND_A = 3.7;
export const GPA_BAND_B = 3.0;
export const GPA_BAND_C = 2.0;

/**
 * Cortes de beca de referencia (beca-promedio-minimo-requisito-universidades.ts):
 * el piso habitual es 3.0 y las de mérito competitivas piden 3.5 o más.
 */
export const SCHOLARSHIP_FLOOR = 3.0;
export const SCHOLARSHIP_MERIT = 3.5;

/** Techo típico de una escala ponderada con bonus de AP/honors de 1.0 punto. */
export const WEIGHTED_MAX = 5.0;

/** Bandas del puntaje de antecedentes (concurso-docente-puntaje-antecedentes-baires.ts). */
export const PORTFOLIO_BANDS = { basic: 30, medium: 50, high: 80 };

const DISCLAIMER =
  'Estimated result based on your inputs. Every institution computes GPA its own way — credit weighting, plus/minus grades, repeated courses and transfer credit are all handled differently. Check your official transcript and your scholarship agreement before relying on this figure for a deadline.';

export const hub: HubData = {
  slug: 'en/school/gpa-and-grades',
  title: 'GPA Calculator: 4.0 Scale, Weighted vs Unweighted, Scholarship Minimum',
  description:
    'Work out your GPA on the 4.0 scale from credits and grade points, convert a percentage average, add the AP and honors weighting, and find the GPA you need next term to keep a scholarship.',
  silo: 'School & Learning',
  siloHref: '/en/school',
  locale: 'en',

  eyebrow: 'Grades & GPA',
  h1: 'What’s my GPA and what do I need to keep the scholarship?',
  lede:
    'Your GPA is one number that decides scholarship eligibility, honors standing, transfer applications and sometimes a first job screen. This works it out four ways: straight from credits and grade points, from a percentage average, with the AP and honors bump applied, and backwards — the grades you need next term to pull the average up to the minimum you have to hit.',
  stamps: [
    'Standard US 4.0 scale: A = 4.0 down to F = 0.0',
    'Common scholarship floor 3.0 · competitive merit awards 3.5+',
    'Weighted GPA adds the AP and honors bonus on top',
    'Replaces 4 single-purpose calculators',
  ],

  resultLabel: 'Your GPA',

  cases: {
    title: 'Which one do you need?',
    intro: 'Pick the question. Only the fields that case needs are read.',
    items: [
      {
        id: 'unweighted',
        label: 'My unweighted GPA',
        hint: 'The 4.0-scale average from your credit hours and grade points, plus the percentage conversion.',
        yes: [
          'Credit-weighted GPA on the 4.0 scale — the way registrars actually compute it',
          'The equivalent letter-grade band: A, B, C or D/F',
          'A percentage average converted to the 4.0 scale, for comparison',
        ],
        warn: [
          DISCLAIMER,
          'Credit hours matter. A 4-credit course moves your GPA twice as much as a 2-credit one, so averaging letter grades without weighting them by credits gives the wrong number.',
          'Percentage-to-GPA conversion is an approximation, not a standard. Most US institutions map ranges to letters first (say 93–100 = A = 4.0), which is not the same as scaling the percentage linearly. Use the linear conversion only for a rough comparison.',
          'Plus and minus grades change things: on a typical scale A− is 3.7 and B+ is 3.3, so a transcript full of minuses lands well under a straight-A average.',
        ],
        plazo: 'Check your GPA before the add/drop deadline each term — withdrawing from a course you are failing usually protects the average, and after the deadline that option is gone.',
        answer:
          'GPA = total grade points ÷ total credit hours attempted, where each course contributes (grade point value × its credits).',
      },
      {
        id: 'weighted',
        label: 'My weighted GPA with AP and honors',
        hint: 'The bump advanced courses add, and how it compares with the unweighted number.',
        yes: [
          'Weighted GPA with the AP and honors bonus spread across your course load',
          'How many points the advanced courses are actually adding',
          'Both numbers side by side, because applications ask for both',
        ],
        warn: [
          DISCLAIMER,
          'There is no national standard for weighting. Many high schools add 1.0 for AP and 0.5 for honors, others add 0.5 for everything, and some do not weight at all — so a "4.3" from one school is not comparable to a "4.3" from another.',
          'Most selective universities recalculate your GPA themselves, stripping the weighting and often counting only core academic courses. The unweighted number is the one that travels.',
          'Chasing the weighted number by loading up on AP courses and getting Bs in them can leave you worse off than taking fewer and getting As, on both the weighted and unweighted count.',
        ],
        plazo: 'Course selection for next year is when this is decided — once the schedule is locked in, the weighting is locked in with it.',
        answer:
          'Weighted GPA ≈ unweighted GPA + (share of your courses that are AP or honors × the bonus your school grants each of them).',
      },
      {
        id: 'scholarship',
        label: 'The GPA I need to keep my scholarship',
        hint: 'What you have to average next term to bring the cumulative GPA up to the minimum.',
        yes: [
          'Where your cumulative GPA sits against the minimum you have to hit',
          'The GPA you need to average next term to reach it',
          'Whether that is mathematically possible in one term or needs two',
        ],
        warn: [
          DISCLAIMER,
          'Falling below the stated minimum disqualifies you regardless of anything else in the application. Read whether your award checks cumulative GPA or term GPA — they can point in opposite directions in the same semester.',
          'Most awards also carry a credit-completion rule (often 67% of attempted credits) and a maximum timeframe (often 150% of the published program length). Passing the GPA test alone is not enough.',
          'Withdrawals usually count as attempted credits for the completion rule even though they carry no grade points, so dropping courses to protect the GPA can break the other requirement.',
          'If you lose eligibility, ask about the appeal and reinstatement process immediately — most programs have one, and most have a short window.',
        ],
        plazo: 'Eligibility is normally checked at the end of each term, so the term you are in right now is the one that decides it.',
        answer:
          'Required term GPA = (target GPA × total credits after the term − grade points you already have) ÷ credits you are taking now.',
      },
      {
        id: 'portfolio',
        label: 'My application portfolio score',
        hint: 'Points from degrees, years of service, publications and coursework, on a competitive scale.',
        yes: [
          'Total points from qualifications, seniority, publications and professional development',
          'Which competitive band that total falls into',
          'Where the next points are cheapest to add',
        ],
        warn: [
          DISCLAIMER,
          'Point schedules are set by each district, board or hiring body and are not interchangeable. Use this to compare your own profile over time, not to predict a specific ranking.',
          'Seniority points usually accrue automatically, which means everyone in your cohort gains them too — the categories that actually move you up the list are the ones you choose to add.',
        ],
        plazo: 'Most point schedules have a cut-off date after which new credentials count for the following cycle, not the current one — file the paperwork early.',
        answer:
          'Portfolio score = qualifications + seniority + publications + professional development, read against the band thresholds published by the body you are applying to.',
      },
    ],
  },

  inputsTitle: 'Your grades and credits',
  inputsIntro: 'Fill in what the case you picked needs — the rest is ignored.',
  fields: [
    { id: 'gradepoints', label: 'Total grade points earned', type: 'number', value: 51, min: 0, step: 0.1, help: 'For each course: grade point value × credit hours. Add them all up.' },
    { id: 'credits', label: 'Total credit hours attempted', type: 'number', value: 16, min: 1, step: 0.5 },
    { id: 'pct', label: 'Your percentage average', type: 'number', value: 88, suffix: '%', min: 0, step: 0.1 },
    { id: 'pctmax', label: 'Top of that percentage scale', type: 'number', value: 100, min: 1, step: 1 },
    { id: 'advanced', label: 'AP or honors courses on your transcript', type: 'number', value: 4, min: 0, step: 1 },
    { id: 'allcourses', label: 'Total courses on your transcript', type: 'number', value: 24, min: 1, step: 1 },
    {
      id: 'bump',
      label: 'Bonus your school adds per advanced course',
      type: 'select',
      value: '1',
      options: [
        { value: '1', label: '1.0 point — typical for AP' },
        { value: '0.5', label: '0.5 point — typical for honors' },
        { value: '0', label: 'None — my school does not weight' },
      ],
    },
    { id: 'target', label: 'GPA you have to reach', type: 'number', value: 3.0, min: 0, max: 5, step: 0.1 },
    { id: 'futurecredits', label: 'Credit hours you are taking now', type: 'number', value: 15, min: 1, step: 0.5 },
    { id: 'pdegrees', label: 'Portfolio: points for qualifications', type: 'number', value: 30, min: 0, step: 1 },
    { id: 'pseniority', label: 'Portfolio: points for years of service', type: 'number', value: 20, min: 0, step: 1 },
    { id: 'ppubs', label: 'Portfolio: points for publications', type: 'number', value: 10, min: 0, step: 1 },
    { id: 'pcourses', label: 'Portfolio: points for professional development', type: 'number', value: 15, min: 0, step: 1 },
  ],
  fineprint: DISCLAIMER,

  chart: {
    type: 'scale',
    title: 'Where your average lands',
    caption:
      'The 4.0 scale split into its letter-grade bands, with a marker on your result. The 3.0 line is where most scholarship floors sit and 3.7 is the usual honors threshold.',
  },

  breakdownTitle: 'Line by line',
  breakdownIntro:
    'Grade points are credit-weighted, so a 4-credit course counts twice as heavily as a 2-credit one — that is why a straight average of letter grades rarely matches the registrar’s number.',

  faq: [
    {
      q: 'How is GPA actually calculated on the 4.0 scale?',
      a: 'Each letter grade has a point value — A = 4.0, B = 3.0, C = 2.0, D = 1.0, F = 0.0 — and each course contributes that value multiplied by its credit hours. Add up all those grade points, divide by the total credit hours attempted, and that is your GPA. A student with an A in a 4-credit course and a C in a 2-credit course has (4×4 + 2×2) ÷ 6 = 3.33, not the 3.0 you would get by averaging the letters.',
    },
    {
      q: 'What is the difference between weighted and unweighted GPA?',
      a: 'Unweighted GPA caps every course at 4.0 no matter how hard it is. Weighted GPA adds a bonus for advanced work — commonly 1.0 for AP or IB and 0.5 for honors — so it can exceed 4.0. Weighted rewards taking a harder schedule; unweighted is the one that compares cleanly across schools, which is why most colleges recalculate it themselves.',
    },
    {
      q: 'Can my GPA be higher than 4.0?',
      a: 'Only on a weighted scale. On an unweighted 4.0 scale the arithmetic maximum is 4.0. Weighted scales commonly top out at 5.0 where AP courses carry a full extra point, and a few schools use 4.5 or 6.0 scales. Since the ceiling is a local decision, a weighted GPA means nothing without knowing the scale it came from.',
    },
    {
      q: 'How do plus and minus grades affect the calculation?',
      a: 'On the common scale A− is 3.7, B+ is 3.3, B− is 2.7 and so on, while a plain A is 4.0. Many institutions do not award an A+ above 4.0, which means the pluses cannot fully offset the minuses — a transcript of A− and B+ grades averages roughly 3.5, not the 3.85 the letters suggest.',
    },
    {
      q: 'What GPA do I need to keep a scholarship?',
      a: 'The most common floor is 3.0 cumulative, with competitive merit awards asking for 3.5 or higher and some honors programs 3.7. But the number is set by the awarding body, not by a national rule, and federal aid uses satisfactory academic progress standards instead — which combine a GPA minimum, a credit-completion rate and a maximum timeframe. Read your specific award letter.',
    },
    {
      q: 'How do I work out the grades I need next term?',
      a: 'Take the GPA you must reach, multiply by the total credits you will have after this term, subtract the grade points you have already banked, and divide by the credits you are taking now. If the answer comes out above 4.0 it cannot be done in a single term, and you should be talking to an advisor about a longer plan or an appeal rather than hoping.',
    },
    {
      q: 'Does retaking a course fix my GPA?',
      a: 'Sometimes. Grade replacement policies, where the new grade supersedes the old one in the GPA, are common but usually limited — often only for grades below C, only once per course, and only a set number of times per degree. Where the policy is grade forgiveness rather than replacement, both attempts stay on the transcript and both may still count for scholarship or graduate-school recalculations.',
    },
    {
      q: 'Do withdrawals hurt my GPA?',
      a: 'A W carries no grade points, so it does not move the GPA itself — which is why withdrawing before the deadline is often better than failing. It does count as attempted credits for financial-aid completion rules, though, so repeated withdrawals can cost you eligibility even while your GPA looks healthy.',
    },
    {
      q: 'Do pass/fail courses count towards GPA?',
      a: 'A pass normally carries credit but no grade points, so it is excluded from the GPA calculation entirely. A fail, on many campuses, does count as 0.0 and does damage the average. Check which convention applies before electing pass/fail as a way to protect a GPA.',
    },
    {
      q: 'How do percentage averages convert to a 4.0 GPA?',
      a: 'There is no official conversion. The common shortcut scales the percentage linearly — 88 out of 100 becomes (88 ÷ 100) × 4.0 = 3.52 — but institutions normally map ranges to letters first, so 88 might be a B+ worth 3.3. Use the linear figure for a ballpark and the letter mapping for anything that matters.',
    },
    {
      q: 'Do transfer credits affect my GPA?',
      a: 'Usually the credits transfer but the grade points do not: the course counts towards your degree requirements while your GPA restarts at the new institution. That means transfer students often cannot dilute a weak GPA by bringing in strong grades from elsewhere, and graduate programs frequently recalculate across every transcript anyway.',
    },
    {
      q: 'How much does one bad term really cost?',
      a: 'It depends entirely on how many credits you already have. A 2.0 term of 15 credits pulls a 3.5 cumulative built on 30 credits down to about 3.0, but the same term against 90 existing credits only drops it to roughly 3.29. Early terms carry disproportionate weight, and late terms are correspondingly hard to recover with.',
    },
  ],

  sources: [
    { name: 'Satisfactory Academic Progress: GPA, completion rate and maximum timeframe', url: 'https://studentaid.gov/help-center/answers/article/what-is-satisfactory-academic-progress', publisher: 'US Department of Education, Federal Student Aid' },
    { name: 'AP course credit and placement policies', url: 'https://apstudents.collegeboard.org/getting-credit-placement', publisher: 'College Board' },
    { name: 'How colleges evaluate your high school transcript and course rigor', url: 'https://bigfuture.collegeboard.org/plan-for-college/college-basics/how-to-choose-a-college/what-colleges-look-for-in-an-application', publisher: 'College Board BigFuture' },
    { name: 'Digest of Education Statistics — grade point averages of high school graduates', url: 'https://nces.ed.gov/programs/digest/', publisher: 'National Center for Education Statistics' },
    { name: 'Federal Pell Grant eligibility and enrollment requirements', url: 'https://studentaid.gov/understand-aid/types/grants/pell', publisher: 'US Department of Education, Federal Student Aid' },
  ],

  replaces: [
    '/en/gpa-4-0-american-scale-calculator',
    '/en/high-school-gpa-calculator',
    '/en/scholarship-minimum-gpa-requirement',
    '/en/teacher-competition-scoring-calculator',
  ],

  lastReviewed: '2026-07-28',
};
