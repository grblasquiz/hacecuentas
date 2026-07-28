import type { HubData } from '../types';

/**
 * Hub EN — "How much time is that, exactly?"
 *
 * Absorbe 4 calculadoras sueltas de tiempo: edad exacta, días entre fechas,
 * horas trabajadas de la semana (time card con FLSA) y cuánto falta para recibirse.
 *
 * Las constantes laborales salen de la fórmula viva, no de memoria.
 */

/**
 * Umbral semanal de horas extra de la FLSA — 29 U.S.C. § 207.
 * Espejo de src/lib/formulas/time-card-hours-worked-calculator.ts.
 */
export const WEEKLY_OT_THRESHOLD = 40;

/** Multiplicador de horas extra de la FLSA: tiempo y medio. */
export const OT_MULTIPLIER = 1.5;

/** Expectativa de vida de referencia para poner la edad en contexto (CDC/NCHS, EE.UU.). */
export const US_LIFE_EXPECTANCY = 78.4;

const DISCLAIMER =
  'Informational estimate. For pay disputes, immigration filings, contract deadlines or academic requirements, confirm the figure against the official record — day-count conventions and overtime rules vary by jurisdiction and by contract.';

export const hub: HubData = {
  slug: 'en/life/dates-and-hours',
  title: 'Date, Age and Hours Worked Calculator: Days Between, Exact Age, Overtime',
  description:
    'Work out your exact age, the days and business days between two dates, your weekly hours with FLSA overtime and gross pay, and how many terms are left before you graduate.',
  silo: 'Everyday Life',
  siloHref: '/en/life',
  locale: 'en',

  eyebrow: 'Dates & time',
  h1: 'How much time is that, exactly?',
  lede:
    'Four time questions that are annoying to do in your head and easy to get slightly wrong: how old you are to the day, how many days — and how many working days — sit between two dates, what your week comes to once overtime kicks in at 40 hours, and how long is left on a degree at your current pace.',
  stamps: [
    'Overtime at 40 h/week, 1.5× — FLSA, 29 U.S.C. § 207',
    'Business days count Monday to Friday, holidays excluded',
    'Calendar maths handles leap years and uneven months',
    'Replaces 4 single-purpose calculators',
  ],

  resultLabel: 'Your answer',

  cases: {
    title: 'Which one do you need?',
    intro: 'Pick the question. Only the fields that case needs are read.',
    items: [
      {
        id: 'age',
        label: 'My exact age',
        hint: 'Years, months and days, total days lived, and the next birthday.',
        yes: [
          'Age in years, months and days, handling uneven month lengths',
          'Total days, hours and weeks you have been alive',
          'Days until your next birthday, and the age you turn',
        ],
        warn: [
          DISCLAIMER,
          'Legal age of majority is reached on the birthday itself in most US states, but some jurisdictions and some contracts use the day before. If it matters legally, check the applicable rule rather than the day count.',
          'Date arithmetic runs in your device’s time zone. Crossing a date line can shift the answer by a day.',
        ],
        plazo: 'Passport and visa rules frequently key off age on the date of travel, not the date of application.',
        answer:
          'Exact age subtracts the birth date from today, borrowing days from the previous month when the day number has not been reached yet.',
      },
      {
        id: 'between',
        label: 'Days between two dates',
        hint: 'Calendar days, weeks, months and business days from one date to another.',
        yes: [
          'Total calendar days between the two dates',
          'Business days, counting Monday to Friday only',
          'The same span expressed in weeks, months and years',
        ],
        warn: [
          DISCLAIMER,
          'Business days here exclude weekends but NOT public holidays — federal, state and company holidays all differ, so subtract them yourself for a contractual deadline.',
          'Watch inclusive versus exclusive counting. A contract that says "within 30 days" may or may not count the start date; the difference decides whether you filed on time.',
        ],
        plazo: 'For anything with a legal deadline, count backwards from the due date and leave a buffer for the weekend it inevitably lands on.',
        answer:
          'Calendar days = the difference between the two dates. Business days remove Saturdays and Sundays but keep public holidays, which you have to deduct yourself.',
      },
      {
        id: 'timecard',
        label: 'Hours worked and overtime this week',
        hint: 'Weekly hours after unpaid breaks, the FLSA overtime split and gross pay.',
        yes: [
          'Net hours after unpaid breaks are deducted',
          'The split between regular hours and overtime at the 40-hour line',
          'Gross pay with overtime paid at time and a half',
        ],
        warn: [
          DISCLAIMER,
          'Federal overtime is weekly, not daily: under the FLSA it starts after 40 hours in a workweek, so a 12-hour day does not by itself create overtime. Several states — California among them — add a daily rule on top, and the more generous one applies.',
          'Only non-exempt employees are entitled to overtime. Exempt status depends on the duties test and a salary threshold, not on being paid a salary alone — misclassification is common and costly.',
          'Bona fide meal breaks of 30 minutes or more, where you are fully relieved of duty, are unpaid. Short rest breaks of roughly 5 to 20 minutes are compensable and cannot be deducted.',
        ],
        plazo: 'Keep your own record of hours. In a wage dispute where the employer’s records are inadequate, the employee’s reasonable estimate carries real weight.',
        answer:
          'Gross pay = regular hours × rate + hours over 40 × rate × 1.5. Unpaid meal breaks come off the total before the 40-hour line is applied.',
      },
      {
        id: 'graduation',
        label: 'When I will finish my degree',
        hint: 'Terms and years remaining at your current pace and pass rate.',
        yes: [
          'Courses remaining out of the total',
          'Terms left, adjusted for the share of courses you actually pass',
          'Estimated graduation date and percentage complete',
        ],
        warn: [
          DISCLAIMER,
          'The pass rate is what makes or breaks this. Dropping from 100% to 70% does not add 30% to the timeline — it adds about 43%, because you have to retake the failures on top of the new load.',
          'Prerequisite chains can stop you taking a full load even when you have the capacity, and required courses offered only once a year can add a term on their own.',
          'Financial aid and scholarships usually have a maximum-timeframe rule — often 150% of the published program length — beyond which funding stops.',
        ],
        plazo: 'Check your degree audit before every registration window; that is where prerequisite surprises surface with time left to fix them.',
        answer:
          'Terms remaining = courses left ÷ (courses per term × pass rate). Multiply by the term length to get the finish date.',
      },
    ],
  },

  inputsTitle: 'Your dates and numbers',
  inputsIntro: 'Fill in what the case you picked needs — the rest is ignored.',
  fields: [
    { id: 'birth', label: 'Date of birth', type: 'date', value: '1990-06-15' },
    { id: 'from', label: 'From date', type: 'date', value: '2026-01-01' },
    { id: 'to', label: 'To date', type: 'date', value: '2026-12-25' },
    { id: 'days', label: 'Days worked this week', type: 'number', value: 5, min: 0, max: 7, step: 1 },
    { id: 'hoursday', label: 'Hours on the clock per day', type: 'number', value: 9, suffix: 'hours', min: 0, max: 24, step: 0.25 },
    { id: 'breakmin', label: 'Unpaid break per day', type: 'number', value: 30, suffix: 'minutes', min: 0, max: 240, step: 5 },
    { id: 'rate', label: 'Hourly rate', type: 'number', value: 22, prefix: '$', min: 0, step: 0.5 },
    { id: 'total', label: 'Courses in the whole degree', type: 'number', value: 40, min: 1, step: 1 },
    { id: 'passed', label: 'Courses already passed', type: 'number', value: 14, min: 0, step: 1 },
    { id: 'perterm', label: 'Courses you take per term', type: 'number', value: 4, min: 1, step: 1 },
    { id: 'passrate', label: 'Share of them you pass', type: 'number', value: 75, suffix: '%', min: 10, max: 100, step: 5 },
  ],
  fineprint: DISCLAIMER,

  chart: {
    type: 'donut',
    title: 'How the total splits',
    caption:
      'The composition behind the answer: weekdays versus weekends, regular hours versus overtime, or the part of the degree done versus what is left.',
  },

  breakdownTitle: 'Line by line',
  breakdownIntro: 'Calendar arithmetic runs on real dates, so leap years and 28-, 30- and 31-day months are all handled.',

  faq: [
    {
      q: 'How is exact age calculated when the month lengths differ?',
      a: 'You subtract year from year, month from month and day from day, then borrow. If the day number has not been reached yet this month, you borrow the number of days in the previous month and reduce the month count by one; if the month count then goes negative you borrow twelve and reduce the years. That is why "one month" between 31 January and 28 February is not the same number of days as between 31 March and 30 April.',
    },
    {
      q: 'How many days are between two dates, inclusive or exclusive?',
      a: 'This calculator returns the exclusive count — the difference between the two dates, so 1 January to 2 January is one day. Legal and contractual deadlines frequently use inclusive counting, which adds one. When a deadline matters, read the definition in the document rather than assuming.',
    },
    {
      q: 'Do business days here exclude public holidays?',
      a: 'No. Only Saturdays and Sundays are removed. Federal holidays, state holidays and company closures all vary, and there are eleven federal holidays in a typical US year, so subtract the ones that apply to you before relying on the figure for a filing deadline.',
    },
    {
      q: 'When does overtime start under federal law?',
      a: 'After 40 hours in a single workweek, paid at one and a half times the regular rate — 29 U.S.C. § 207. The workweek is a fixed, recurring 168-hour period your employer defines; it does not have to start on Monday, but it cannot be moved around to avoid overtime.',
    },
    {
      q: 'Is there such a thing as daily overtime?',
      a: 'Not under federal law, but several states have it. California, for example, requires overtime past 8 hours in a day and double time past 12. Where state and federal rules differ, the one more favourable to the employee applies, so a Californian working four 10-hour days gets daily overtime even though the week never reaches 40 hours.',
    },
    {
      q: 'Can my employer deduct meal breaks from my hours?',
      a: 'Only genuine meal periods, generally 30 minutes or longer, during which you are completely relieved of duty. Eating at your desk while still answering calls is working time and must be paid. Short rest breaks of roughly 5 to 20 minutes are always compensable and cannot be deducted.',
    },
    {
      q: 'Does paid time off count towards the 40-hour overtime threshold?',
      a: 'Under federal law, no. Overtime is owed on hours actually worked, so a week with 8 hours of holiday pay and 36 hours worked totals 44 paid hours but no overtime. Some union contracts and employer policies are more generous — check yours.',
    },
    {
      q: 'What does "exempt" mean and does it stop me getting overtime?',
      a: 'Exempt employees are excluded from overtime, but exemption requires meeting both a salary threshold and a duties test — the work has to be genuinely executive, administrative, professional, outside sales or certain computer roles. Being paid a salary, or having a managerial job title, is not on its own enough, and misclassification is one of the most common wage-and-hour violations.',
    },
    {
      q: 'Why does a lower pass rate hurt the graduation timeline so much?',
      a: 'Because failures do not just delay the course, they consume a slot you needed for the next one. At a 70% pass rate you effectively complete 2.8 of every 4 courses attempted, so a 26-course backlog takes about 43% longer than at a perfect pass rate — and the retakes compete with the new load for the same limited seats.',
    },
    {
      q: 'What else can push a graduation date beyond this estimate?',
      a: 'Prerequisite chains that force a sequential order, required courses offered only in one term a year, capacity caps on popular sections, and internship or thesis requirements that cannot be compressed. The estimate here assumes courses are freely available every term, which is the optimistic case.',
    },
    {
      q: 'How many days have I been alive?',
      a: 'Roughly 365.2425 days per year, so a 30-year-old has lived about 10,957 days and a 50-year-old about 18,262. The calculator uses real calendar dates rather than that average, so leap days are counted individually and the answer is exact rather than approximate.',
    },
  ],

  sources: [
    { name: 'Overtime Pay — Fair Labor Standards Act, 29 U.S.C. § 207', url: 'https://www.dol.gov/agencies/whd/overtime', publisher: 'US Department of Labor, Wage and Hour Division' },
    { name: 'Fact Sheet #22: Hours Worked under the FLSA', url: 'https://www.dol.gov/agencies/whd/fact-sheets/22-flsa-hours-worked', publisher: 'US Department of Labor' },
    { name: 'Fact Sheet #17A: Exemption for Executive, Administrative and Professional Employees', url: 'https://www.dol.gov/agencies/whd/fact-sheets/17a-overtime', publisher: 'US Department of Labor' },
    { name: 'Federal Holidays', url: 'https://www.opm.gov/policy-data-oversight/pay-leave/federal-holidays/', publisher: 'US Office of Personnel Management' },
    { name: 'Satisfactory Academic Progress and maximum timeframe', url: 'https://studentaid.gov/help-center/answers/article/what-is-satisfactory-academic-progress', publisher: 'US Department of Education, Federal Student Aid' },
  ],

  replaces: [
    '/en/exact-age-calculator',
    '/en/date-difference-calculator',
    '/en/time-card-hours-worked-calculator',
    '/en/graduation-timeline-calculator',
  ],

  lastReviewed: '2026-07-28',
};
