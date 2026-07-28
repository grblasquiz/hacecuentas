import type { HubData } from '../types';

/**
 * Decision hub EN — "When am I fertile, and when is the baby due?"
 *
 * Absorbs 14 loose calculators: ovulation and fertile window (regular and
 * irregular cycles), due date from LMP, from conception, from IVF transfer and
 * from an ultrasound CRL, gestational age, week-by-week calendar, fetal weight
 * percentile, pregnancy weight gain by BMI, corrected age for preemies and
 * paternal age.
 *
 * CONSTANTS: taken from the live formulas so the hub cannot drift from them —
 *  - ovulation and fertile window: src/lib/formulas/ovulation-fertile-window-calculator.ts
 *    (ovulation = LMP + cycle − luteal; window = ovulation − 5 to ovulation + 1)
 *  - IVF offsets: src/lib/formulas/ivf-due-date-calculator.ts (day-5 +261, day-3 +263)
 *  - Naegele / ACOG CO-700: EDD = LMP + 280 days, EDD = conception + 266 days
 *  - CRL dating: Robinson & Fleming (1975)
 *  - fetal weight: Hadlock composite in-utero growth curve (1991)
 *  - weight gain: IOM/NASEM 2009 ranges by pre-pregnancy BMI
 */

/** YMYL disclaimer — verbatim from src/lib/disclaimers.ts, COPY.en, domain 'health'. */
const DISCLAIMER =
  'For guidance only; this does not replace diagnosis, treatment, or professional follow-up. Consult a licensed healthcare professional.';

/** Days from the last menstrual period to the estimated due date (Naegele's rule). */
export const GESTATION_FROM_LMP = 280;
/** Days from conception to the estimated due date. */
export const GESTATION_FROM_CONCEPTION = 266;
/** Days added to the transfer date to get the EDD, from the live IVF formula. */
export const IVF_OFFSET = { day5: 261, day3: 263 };
/** Fertile window relative to ovulation, from the live ovulation formula. */
export const WINDOW = { spermDaysBefore: 5, eggDaysAfter: 1, peakDaysBefore: 2 };
/** Clinically accepted luteal phase length. */
export const LUTEAL_DEFAULT = 14;

/**
 * IOM / NASEM 2009 total weight gain ranges for a singleton pregnancy, in pounds,
 * plus the expected rate per week in the second and third trimesters.
 */
export const WEIGHT_GAIN = [
  { maxBmi: 18.5, label: 'Underweight (BMI under 18.5)', minLb: 28, maxLb: 40, rateMin: 1.0, rateMax: 1.3 },
  { maxBmi: 25, label: 'Normal weight (BMI 18.5–24.9)', minLb: 25, maxLb: 35, rateMin: 0.8, rateMax: 1.0 },
  { maxBmi: 30, label: 'Overweight (BMI 25–29.9)', minLb: 15, maxLb: 25, rateMin: 0.5, rateMax: 0.7 },
  { maxBmi: 999, label: 'Obesity (BMI 30 or more)', minLb: 11, maxLb: 20, rateMin: 0.4, rateMax: 0.6 },
];
/** Total gain expected in the whole first trimester, in pounds (IOM 2009). */
export const FIRST_TRIMESTER_LB = { min: 1.1, max: 4.4 };

/** Hadlock 1991 composite curve: mean estimated fetal weight and its coefficient of variation. */
export const HADLOCK = { a: 0.578, b: 0.332, c: 0.00354, cv: 0.127 };

export const hub: HubData = {
slug: 'en/health/fertility-and-pregnancy',
  title: 'Ovulation, fertile window and due date calculator — LMP, conception, IVF or ultrasound',
  description:
    'Find your fertile window and ovulation day for regular or irregular cycles, then get the due date from your last period, a known conception date, an IVF transfer or an ultrasound CRL, plus how many weeks you are, the fetal weight percentile and the weight gain range for your BMI.',
  silo: 'Health',
siloHref: '/en/health',
locale: 'en',

  eyebrow: 'Fertility and pregnancy dating',
  h1: 'When am I fertile, and when is the baby due?',
  lede:
    'One date is usually all it takes. Depending on where you are, this works out your fertile window and ovulation day, or your due date and exactly how many weeks and days along you are — from your last period, a known conception date, an IVF transfer or an early ultrasound — plus the trimester milestones still ahead.',
  stamps: ['Reviewed 27-07-2026', 'ACOG CO-700 · Robinson-Fleming · Hadlock · IOM 2009', '14 calculators inside'],

  resultLabel: 'Your key date',

  cases: {
    title: 'My situation is different',
    intro:
      'Every dating method answers the same question from a different starting point. Pick the one you actually have a date for — the accuracy order is ultrasound, then IVF transfer, then conception, then last period.',
    items: [
      {
        id: 'ttc',
        label: 'Trying to conceive',
        hint: 'I want to know when I ovulate.',
        yes: [
          'Ovulation day: first day of your last period plus your cycle length minus the luteal phase',
          'The six-day fertile window: five days before ovulation through the day after',
          'The two peak days — the day before ovulation and ovulation itself',
          'The date your next period is due if conception does not happen',
        ],
        warn: [
          DISCLAIMER,
          'This is a statistical estimate, not a contraceptive method: pregnancy is possible on days outside the predicted window',
          'Sperm survive up to five days in fertile cervical mucus, which is why the window opens well before ovulation',
          'If your cycles vary by more than about 8 days between the shortest and the longest, switch to the irregular-cycle case',
        ],
        plazo: 'most couples under 35 conceive within 12 months; see a specialist after 12 months, or after 6 if you are 35 or older.',
        answer:
          'Ovulation lands about 14 days before your next period, and the fertile window is the five days before it plus the day itself.',
      },
      {
        id: 'irregular',
        label: 'Irregular cycles',
        hint: 'My cycle length changes month to month.',
        yes: [
          'A wider window built from your shortest and longest cycles over the last 6–12 months',
          'The calendar rule: first fertile day = shortest cycle minus 18; last fertile day = longest cycle minus 11',
          'How many days of the month you are potentially fertile',
          'Whether your variation is wide enough that calendar tracking stops being useful',
        ],
        warn: [
          DISCLAIMER,
          'With irregular cycles the calendar method is the least reliable option: ovulation predictor kits or basal body temperature are far better',
          'Cycles consistently shorter than 21 days or longer than 35 are worth investigating — PCOS and thyroid problems are common causes',
          'A window wider than about 12 days means the calendar is telling you almost nothing useful',
        ],
        plazo: 'track at least 6 cycles before trusting the shortest-and-longest numbers.',
        answer:
          'With irregular cycles the fertile window runs from your shortest cycle minus 18 days to your longest cycle minus 11 days.',
      },
      {
        id: 'lmp',
        label: 'I know my last period',
        hint: 'Due date from LMP — the standard method.',
        yes: [
          'Due date by Naegele’s rule: last period plus 280 days, adjusted if your cycle is not 28 days',
          'How many weeks and days pregnant you are today, and which trimester',
          'The dates of the 12, 20, 28 and 37-week milestones',
          'Estimated fetal weight for that gestational age, on the Hadlock curve',
        ],
        warn: [
          DISCLAIMER,
          'LMP dating assumes a 28-day cycle and ovulation on day 14; a longer cycle pushes the due date later, and this hub adjusts for it',
          'Only about 4% of babies arrive on the due date — anything from 37 to 42 weeks is term',
          'ACOG says a first-trimester ultrasound overrides LMP dating when the two differ by more than 5 to 7 days',
        ],
        plazo: 'the first dating scan is usually offered between 8 and 13 weeks.',
        answer:
          'The estimated due date is 280 days after the first day of your last period, plus or minus the difference between your cycle and 28 days.',
      },
      {
        id: 'conception',
        label: 'I know the conception date',
        hint: 'A single known date, or a temperature or LH-tracked cycle.',
        yes: [
          'Due date: conception date plus 266 days',
          'The equivalent last-period date, which is what charts and scans use',
          'Current gestational age counted from that equivalent LMP, not from conception',
          'The remaining trimester milestones',
        ],
        warn: [
          DISCLAIMER,
          'Gestational age is always counted from the LMP equivalent, so you are "2 weeks pregnant" on the day you conceive — that is normal, not an error',
          'Intercourse date is not conception date: fertilisation can happen up to five days later',
          'Conception dating is more accurate than LMP dating but still loses to a first-trimester scan',
        ],
        plazo: 'a conception date is only reliable if it came from LH testing, basal temperature or a single timed intercourse.',
        answer:
          'From a known conception date, the due date is 266 days later, and the LMP equivalent is 14 days earlier.',
      },
      {
        id: 'ivf',
        label: 'IVF transfer',
        hint: 'Day-3 or day-5 embryo, fresh or frozen.',
        yes: [
          'Due date: transfer date plus 261 days for a day-5 blastocyst, or plus 263 days for a day-3 embryo',
          'The LMP equivalent your clinic and every chart will use',
          'Exact gestational age today — IVF dating is the most precise there is, because the fertilisation date is known',
          'The trimester milestones from that date',
        ],
        warn: [
          DISCLAIMER,
          'The embryo day matters: getting day-3 and day-5 the wrong way round shifts the due date by two days',
          'Fresh and frozen transfers use the same offsets — the embryo age at transfer is what counts',
          'IVF due dates should not be re-dated by a later ultrasound; the fertilisation date is already known exactly',
        ],
        plazo: 'the beta hCG test is usually 9 to 11 days after a day-5 transfer.',
        answer:
          'A day-5 transfer is due 261 days later; a day-3 transfer, 263 days later. Both are the most accurate dating available.',
      },
      {
        id: 'scan',
        label: 'Dating from an ultrasound',
        hint: 'I have a crown-rump length in millimetres.',
        yes: [
          'Gestational age from the crown-rump length by Robinson & Fleming',
          'The due date implied by that scan, and the LMP it corresponds to',
          'How that compares with the fetal weight expected at the same age',
          'The milestones still ahead',
        ],
        warn: [
          DISCLAIMER,
          'CRL dating is only valid between about 7 and 14 weeks, when the CRL is roughly 10 to 84 mm — after that, biometry replaces it',
          'A first-trimester scan is the most accurate dating method and, per ACOG, overrides LMP when they disagree by more than 5 to 7 days',
          'Estimated fetal weight carries about 10 to 15% error even in expert hands: use percentiles for trend, not for a single verdict',
        ],
        plazo: 'after 14 weeks the due date is normally not changed again.',
        answer:
          'Robinson & Fleming converts the crown-rump length straight into gestational age, and that gives the most reliable due date available.',
      },
    ],
  },

  inputsTitle: 'Your dates',
  inputsIntro:
    'Fill the date that matches the case you picked. The other fields only affect their own rows — leave them at zero to skip them.',
  fields: [
    {
      id: 'startDate',
      label: 'Key date',
      type: 'date',
      value: '2026-06-01',
      help: 'Last period for the LMP and fertility cases, conception date, IVF transfer date, or the date of the ultrasound.',
    },
    { id: 'cycle', label: 'Usual cycle length', type: 'number', suffix: 'days', min: 20, max: 45, step: 1, value: 28 },
    {
      id: 'luteal',
      label: 'Luteal phase',
      type: 'number',
      suffix: 'days',
      min: 10,
      max: 18,
      step: 1,
      value: 14,
      help: 'Days from ovulation to your period. Clinically 12 to 16; 14 is the standard assumption.',
    },
    {
      id: 'shortest',
      label: 'Shortest cycle in the last year (irregular cycles)',
      type: 'number',
      suffix: 'days',
      min: 0,
      max: 60,
      step: 1,
      value: 26,
    },
    {
      id: 'longest',
      label: 'Longest cycle in the last year (irregular cycles)',
      type: 'number',
      suffix: 'days',
      min: 0,
      max: 60,
      step: 1,
      value: 34,
    },
    {
      id: 'embryoDay',
      label: 'Embryo age at transfer (IVF)',
      type: 'select',
      value: '5',
      options: [
        { value: '5', label: 'Day-5 blastocyst' },
        { value: '3', label: 'Day-3 embryo' },
      ],
    },
    {
      id: 'crl',
      label: 'Crown-rump length (ultrasound)',
      type: 'number',
      suffix: 'mm',
      min: 0,
      max: 90,
      step: 0.1,
      value: 25,
      help: 'Valid roughly between 10 and 84 mm, which is about 7 to 14 weeks.',
    },
    {
      id: 'prePregWeight',
      label: 'Pre-pregnancy weight (optional)',
      type: 'number',
      suffix: 'lb',
      min: 0,
      max: 500,
      step: 0.5,
      value: 140,
    },
    { id: 'height', label: 'Height (optional)', type: 'number', suffix: 'inches', min: 0, max: 90, step: 0.5, value: 65 },
    {
      id: 'weeksAtBirth',
      label: 'Weeks at birth, if the baby was premature',
      type: 'number',
      suffix: 'weeks',
      min: 0,
      max: 42,
      step: 1,
      value: 0,
      help: 'Leave at 0 unless you want the corrected age for a preterm baby.',
    },
  ],
  fineprint: DISCLAIMER,

  chart: {
    type: 'timeline',
    title: 'Where you are in the 40 weeks',
    caption:
      'The timeline runs from week 0 to week 42 with the three trimesters and the term window marked. The marker shows the gestational age implied by the date and method you chose — which is the number every scan, test and milestone is scheduled against.',
    bands: [
      { label: 'First trimester (0–13 w)', from: 0, to: 13, tone: 'neutral' },
      { label: 'Second trimester (14–27 w)', from: 13, to: 27, tone: 'good' },
      { label: 'Third trimester (28–36 w)', from: 27, to: 37, tone: 'neutral' },
      { label: 'Term (37–42 w)', from: 37, to: 42, tone: 'good' },
    ],
  },
  breakdownTitle: 'Dates, weeks and reference ranges',
  breakdownIntro:
    'Each row states its own unit. Dates are shown as days from today, so a negative number means the date has already passed.',

  faq: [
    {
      q: 'How is the due date calculated?',
      a: 'Naegele’s rule: 280 days from the first day of your last period, which assumes a 28-day cycle with ovulation on day 14. If your cycle is longer or shorter, the due date shifts by the same number of days, and this hub applies that adjustment automatically.',
    },
    {
      q: 'When is my fertile window?',
      a: 'It is the six days ending on ovulation day: the five days before, because sperm survive up to five days in fertile mucus, plus ovulation itself and the day after, because the egg stays viable about 24 hours. The two highest-probability days are the day before ovulation and ovulation day.',
    },
    {
      q: 'How do I find my fertile days with irregular cycles?',
      a: 'Track at least six cycles, then use the calendar rule: the first fertile day is your shortest cycle minus 18, and the last is your longest cycle minus 11. If that produces a window wider than about 12 days, the calendar is not telling you much — ovulation predictor kits or basal body temperature will work far better.',
    },
    {
      q: 'How many weeks pregnant am I?',
      a: 'Gestational age is counted from the first day of your last period, not from conception. That is why you are already considered two weeks pregnant on the day you conceive. Enter your date and method and the hub gives you weeks and days exactly, plus the trimester.',
    },
    {
      q: 'What is the due date after an IVF transfer?',
      a: 'For a day-5 blastocyst, the transfer date plus 261 days; for a day-3 embryo, the transfer date plus 263 days. Fresh and frozen use the same offsets. IVF dating is the most accurate available, because the fertilisation date is known exactly, so it should not be re-dated by a later scan.',
    },
    {
      q: 'Which dating method wins if they disagree?',
      a: 'ACOG Committee Opinion 700 puts a first-trimester ultrasound first, then a known conception or IVF date, then the last menstrual period. If a first-trimester scan differs from LMP dating by more than 5 to 7 days, the scan date is used.',
    },
    {
      q: 'How accurate is the crown-rump length for dating?',
      a: 'Very, but only in a narrow window. Robinson & Fleming dating from CRL is accurate to about ±5 days between roughly 7 and 14 weeks, when the CRL runs about 10 to 84 mm. After 14 weeks, growth variation makes CRL unreliable and biometry takes over — and the due date is normally not changed again.',
    },
    {
      q: 'How much weight should I gain during pregnancy?',
      a: 'The IOM/NASEM 2009 ranges for a singleton, by pre-pregnancy BMI: 28 to 40 lb if underweight, 25 to 35 lb at normal weight, 15 to 25 lb if overweight, and 11 to 20 lb with obesity. Most of it comes in the second and third trimesters — the whole first trimester accounts for only about 1 to 4.5 lb.',
    },
    {
      q: 'What does a fetal weight percentile actually mean?',
      a: 'It compares the estimated weight against the Hadlock in-utero growth curve for that gestational age. Below the 10th percentile is flagged as small for gestational age and above the 90th as large. Estimated fetal weight carries about 10 to 15% error even in expert hands, so trend across scans matters far more than one number.',
    },
    {
      q: 'How do I work out corrected age for a premature baby?',
      a: 'Subtract the number of weeks the baby was born early from their chronological age. A baby born at 32 weeks is 8 weeks early, so at 6 months old their corrected age is 4 months — and that is the age their milestones should be judged against, usually until about age 2.',
    },
    {
      q: 'Does the father’s age matter?',
      a: 'It does, though far less sharply than maternal age. Time to conception lengthens from around 40 to 45, and large cohort studies link advanced paternal age to modestly higher rates of miscarriage and certain neurodevelopmental conditions. The absolute risks stay small; it is a factor to discuss with a specialist, not a deadline.',
    },
    {
      q: 'Can I use the fertile window as birth control?',
      a: 'No. Calendar-based methods have a typical-use failure rate in the double digits, and pregnancy is possible on days the calendar calls infertile — especially if your cycles vary. Use a method designed for contraception and talk to a clinician about which one fits.',
    },
  ],

  sources: [
    {
      name: 'ACOG Committee Opinion 700 — Methods for Estimating the Due Date',
      url: 'https://www.acog.org/clinical/clinical-guidance/committee-opinion/articles/2017/05/methods-for-estimating-the-due-date',
      publisher: 'American College of Obstetricians and Gynecologists',
      date: '2017',
    },
    {
      name: 'Wilcox AJ et al. — Timing of intercourse in relation to ovulation (NEJM)',
      url: 'https://pubmed.ncbi.nlm.nih.gov/7477165/',
      publisher: 'PubMed',
      date: '1995',
    },
    {
      name: 'Robinson HP, Fleming JEE — A critical evaluation of sonar crown-rump length measurements',
      url: 'https://pubmed.ncbi.nlm.nih.gov/1182090/',
      publisher: 'PubMed',
      date: '1975',
    },
    {
      name: 'Hadlock FP et al. — In utero analysis of fetal growth: a sonographic weight standard',
      url: 'https://pubmed.ncbi.nlm.nih.gov/1887021/',
      publisher: 'PubMed',
      date: '1991',
    },
    {
      name: 'Institute of Medicine / NASEM — Weight Gain During Pregnancy: Reexamining the Guidelines',
      url: 'https://www.ncbi.nlm.nih.gov/books/NBK32813/',
      publisher: 'National Academies Press',
      date: '2009',
    },
    {
      name: 'CDC — Infertility FAQs',
      url: 'https://www.cdc.gov/reproductivehealth/infertility/index.htm',
      publisher: 'Centers for Disease Control and Prevention',
    },
    {
      name: 'AAP — Corrected age for preterm infants',
      url: 'https://www.healthychildren.org/English/ages-stages/baby/preemie/Pages/Corrected-Age-For-Preemies.aspx',
      publisher: 'American Academy of Pediatrics',
    },
  ],

  replaces: [
    '/en/ovulation-calculator',
    '/en/ovulation-fertile-window-calculator',
    '/en/irregular-fertile-window',
    '/en/pregnancy-due-date-calculator',
    '/en/due-date-from-conception-date',
    '/en/ivf-due-date-calculator',
    '/en/gestational-age-calculator',
    '/en/pregnancy-week-calculator',
    '/en/pregnancy-calendar-week-by-week',
    '/en/pregnancy-weeks-by-ultrasound-crl',
    '/en/fetal-weight-percentile-by-week',
    '/en/pregnancy-weight-gain-bmi',
    '/en/male-fertility-age',
    '/en/premature-infant-corrected-age',
  ],

lastReviewed: '2026-07-28',
};
