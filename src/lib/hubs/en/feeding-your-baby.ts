import type { HubData } from '../types';

/**
 * Decision hub EN — "How much should my baby be eating?"
 *
 * Absorbs 6 loose calculators: formula bottle volume by age, breast-milk intake,
 * pumping output, amount per feed, baby-led weaning start and diaper counts.
 *
 * NUMBERS: AAP / HealthyChildren.org. The rule of thumb is ~2.5 fl oz of formula
 * per pound of body weight per 24 h, capped in practice at 32 oz/day. The old
 * site calculator for formula ran roughly 40% below this guidance — see the
 * migration report. This hub ships the AAP number, not the old one.
 *
 * Units: US customary first (fl oz, lb), metric shown alongside (mL, mL/kg/day),
 * because the clinical guidance is written in mL/kg.
 */

/** YMYL disclaimer — verbatim from src/lib/disclaimers.ts, domain 'family', language 'en'. */
const DISCLAIMER =
  'General information. Consult the appropriate professional for health, fertility, pregnancy, or parenting decisions.';

/** 1 US fluid ounce in millilitres. */
export const ML_PER_OZ = 29.5735;
/** 1 pound in kilograms. */
export const KG_PER_LB = 0.453592;

/** AAP rule of thumb for formula: fl oz per pound of body weight per 24 h, with a practical daily cap. */
export const FORMULA_RULE = { ozPerLb: 2.5, dailyCapOz: 32 };

/**
 * Typical intake and feeding pattern by age, from AAP / HealthyChildren.
 * `solidsFactor` is how much of the milk volume remains once solids are established.
 */
export const AGE_BANDS = [
  { maxMonths: 1, feeds: 9, diapers: 10, solidsFactor: 1, breastOzDay: 20, note: 'Newborns feed 8–12 times a day, day and night.' },
  { maxMonths: 3, feeds: 7, diapers: 8, solidsFactor: 1, breastOzDay: 25, note: 'Feeds space out to roughly every 3–4 hours.' },
  { maxMonths: 6, feeds: 6, diapers: 7, solidsFactor: 1, breastOzDay: 27, note: 'Milk is still the only food needed until about 6 months.' },
  { maxMonths: 9, feeds: 5, diapers: 6, solidsFactor: 0.85, breastOzDay: 24, note: 'Solids start, but milk stays the main source of calories.' },
  { maxMonths: 12, feeds: 4, diapers: 6, solidsFactor: 0.7, breastOzDay: 20, note: 'Three solid meals a day plus 3–4 milk feeds.' },
  { maxMonths: 24, feeds: 3, diapers: 5, solidsFactor: 0.45, breastOzDay: 15, note: 'Whole milk from 12 months; food is now the main source of calories.' },
];

/** Healthy daily-intake band used for the scale chart, in fl oz per 24 h. */
export const INTAKE_SCALE = { min: 12, max: 36, low: 19, high: 32 };

export const hub: HubData = {
slug: 'en/family/feeding-your-baby',
  title: 'How much should my baby eat? Formula, breast milk and bottle sizes by age',
  description:
    'Work out how many ounces of formula or breast milk your baby needs per day and per bottle, using the AAP rule of 2.5 fl oz per pound of body weight, plus typical pumping output, diaper counts and when to start solids.',
  silo: 'Family',
siloHref: '/en/family',
locale: 'en',

  eyebrow: 'Infant feeding guide',
  h1: 'How much should my baby be eating?',
  lede:
    'Enter your baby’s age and weight and you get the total ounces for a 24-hour day, how much goes in each bottle, the millilitres per kilogram that pediatricians actually use, how many wet and dirty diapers to expect, and — if you are pumping — what a full milk supply looks like.',
  stamps: ['Reviewed 27-07-2026', 'AAP / HealthyChildren guidance', '6 calculators inside'],

  resultLabel: 'Milk per 24 hours',

  cases: {
    title: 'My situation is different',
    intro:
      'Formula, breastfeeding and pumping all answer the same question with different numbers. Pick the one that matches your day.',
    items: [
      {
        id: 'formula',
        label: 'Formula fed',
        hint: 'Bottles of infant formula, all or most feeds.',
        yes: [
          'Daily volume from the AAP rule: about 2.5 fl oz of prepared formula per pound of body weight per 24 hours',
          'A practical ceiling of 32 fl oz a day — more than that usually means the baby needs solids, not more formula',
          'Ounces per bottle for the number of feeds you actually do',
          'The same figure in mL/kg/day, which is how pediatric charts are written',
        ],
        warn: [
          DISCLAIMER,
          'Never dilute formula to stretch a can: extra water can cause dangerous sodium imbalance and seizures in infants',
          'Weight-based volumes stop working around 6 months — from then on solids take over part of the calories',
          'A baby who is consistently far under these numbers, or who has fewer wet diapers than expected, should be seen by a pediatrician',
        ],
        plazo: 'weigh-ins matter more than ounces: expect roughly 5–7 oz of weight gain per week in the first 4 months.',
        answer:
          'A formula-fed baby needs roughly 2.5 fl oz per pound of body weight per day, capped around 32 oz, split across the number of feeds that suits their age.',
      },
      {
        id: 'breast',
        label: 'Breastfeeding',
        hint: 'Directly at the breast, on demand.',
        yes: [
          'Typical intake for age: breastfed babies settle around 25 fl oz (about 750 mL) a day between 1 and 6 months',
          'Intake stays roughly flat as the baby grows — breast milk gets more energy-dense, so the volume does not scale with weight',
          'Expected number of feeds and diapers for the age',
          'When solids start, the milk volume that typically remains',
        ],
        warn: [
          DISCLAIMER,
          'You cannot measure a direct feed: diapers and weight gain are the real signals, not minutes on the breast',
          'The weight-based formula rule does NOT apply to breastfed babies — do not use ounces per pound here',
          'Fewer than 6 wet diapers a day after the first week, or no weight gain, needs a same-week call to your pediatrician or a lactation consultant',
        ],
        plazo: 'babies usually regain their birth weight by day 10–14; that is the first checkpoint.',
        answer:
          'Breastfed babies take about 25 fl oz (750 mL) a day from roughly one month, and that stays fairly constant until solids begin.',
      },
      {
        id: 'pumping',
        label: 'Pumping or mixed feeding',
        hint: 'Exclusive pumping, or bottles plus breast.',
        yes: [
          'The daily target a full milk supply has to cover, and what that means per pumping session',
          'How many sessions it takes to reach the target at your current output',
          'The gap you would need to cover with formula if you are mixed feeding',
          'Bottle size for a caregiver feeding expressed milk',
        ],
        warn: [
          DISCLAIMER,
          'Output per session varies a lot and is not a measure of supply: 0.5–2 fl oz per breast per session is normal in the early weeks',
          'Dropping sessions lowers supply within days — spacing matters more than the length of each session',
          'Expressed breast milk keeps about 4 hours at room temperature, 4 days in the fridge and 6 months in a deep freezer',
        ],
        plazo: 'a full supply is usually established by 4–6 weeks of consistent 8–12 removals a day.',
        answer:
          'A full supply is about 25–30 fl oz a day. Divide that by your sessions to see what each one needs to produce.',
      },
    ],
  },

  inputsTitle: 'Your baby',
  inputsIntro: 'Age and weight are enough. The number of feeds fine-tunes the bottle size.',
  fields: [
    { id: 'months', label: 'Age', type: 'number', suffix: 'months', min: 0, max: 24, step: 1, value: 3 },
    {
      id: 'weight',
      label: 'Weight',
      type: 'number',
      suffix: 'lb',
      min: 4,
      max: 40,
      step: 0.1,
      value: 13,
      help: 'Use the most recent weight from the pediatrician. 13 lb is around average at 3 months.',
    },
    {
      id: 'feeds',
      label: 'Feeds or bottles per day',
      type: 'number',
      suffix: 'per day',
      min: 1,
      max: 14,
      step: 1,
      value: 0,
      help: 'Leave at 0 to use the typical number for your baby’s age.',
    },
    {
      id: 'sessionOz',
      label: 'Output per pumping session (pumping only)',
      type: 'number',
      suffix: 'fl oz',
      min: 0,
      max: 12,
      step: 0.5,
      value: 3,
      help: 'Combined from both breasts. Only used in the pumping case.',
    },
  ],
  fineprint: DISCLAIMER,

  chart: {
    type: 'scale',
    title: 'Where the daily volume falls',
    caption:
      'The scale runs from 12 to 36 fl oz a day. Below about 19 oz is low for a baby under six months, 19 to 32 oz is the usual range, and above 32 oz means the baby is likely ready for more solids rather than more milk.',
    bands: [
      { label: 'Low for age', from: 12, to: 19, tone: 'warn' },
      { label: 'Usual range', from: 19, to: 32, tone: 'good' },
      { label: 'Above the practical cap', from: 32, to: 36, tone: 'warn' },
    ],
  },
  breakdownTitle: 'The day, broken down',
  breakdownIntro:
    'Volumes are US fluid ounces unless the row says otherwise. Bars compare each figure against the largest one.',

  faq: [
    {
      q: 'How many ounces of formula should my baby drink per day?',
      a: 'The AAP rule of thumb is about 2.5 fl oz of prepared formula per pound of body weight over 24 hours. A 10 lb baby lands around 25 oz a day; a 13 lb baby around 32 oz. Most babies do not go above about 32 oz a day, no matter how much they weigh — past that point the answer is solids, not more formula.',
    },
    {
      q: 'How much breast milk does a breastfed baby take?',
      a: 'Roughly 25 fl oz (about 750 mL) a day from about one month until solids begin, with a normal range of 19 to 30 oz. Unlike formula, this does not scale with weight: as the baby grows, breast milk becomes more energy-dense, so the volume stays fairly flat.',
    },
    {
      q: 'How much should each bottle be?',
      a: 'Divide the daily total by the number of feeds. A 13 lb three-month-old on about 32 oz a day over 7 bottles works out to roughly 4.5 oz per bottle. Newborns take much smaller, more frequent feeds — often 1.5 to 3 oz, 8 to 12 times a day.',
    },
    {
      q: 'Is my pumping output normal?',
      a: '0.5 to 2 fl oz per breast per session is typical in the early weeks, and output per session is not a measure of supply. What matters is the daily total: a full supply is about 25 to 30 oz a day across 8 to 12 removals. Dropping sessions lowers supply within a few days.',
    },
    {
      q: 'How many diapers a day should I expect?',
      a: 'After the first week, at least 6 wet diapers a day is the benchmark. Newborns typically go through 8 to 12 diapers a day, dropping to around 6 by six months. Consistently fewer than 6 wet diapers is a reason to call your pediatrician the same week.',
    },
    {
      q: 'When can my baby start solids?',
      a: 'Around 6 months, and readiness is about the baby rather than the calendar: sitting with support, steady head control, loss of the tongue-thrust reflex, and interest in what you are eating. Before 6 months, breast milk or formula covers everything the baby needs.',
    },
    {
      q: 'How does baby-led weaning change the milk volume?',
      a: 'Not much at first. Between 6 and 9 months solids are practice, not calories — milk still supplies roughly 85% of intake. By 9 to 12 months solids take over more, and milk drops to around 70% of the earlier volume. This hub applies that taper automatically once you enter an age above 6 months.',
    },
    {
      q: 'Can I dilute formula to make it last longer?',
      a: 'No. Diluting formula is dangerous: it can cause water intoxication and low blood sodium, which leads to seizures in infants. Always mix to the ratio printed on the tin. If cost is the problem, ask your pediatrician about assistance programs rather than stretching the can.',
    },
    {
      q: 'How long does expressed breast milk keep?',
      a: 'About 4 hours at room temperature, 4 days in the back of a refrigerator, and up to 6 to 12 months in a deep freezer, per CDC storage guidance. Thawed milk should be used within 24 hours and never refrozen.',
    },
    {
      q: 'My baby drinks less than this calculator says — should I worry?',
      a: 'Not on its own. Intake varies day to day and appetite dips during growth pauses and illness. The signals that matter are weight gain, wet diapers and alertness. If two of those look off, or the baby is not back to birth weight by two weeks, call your pediatrician.',
    },
    {
      q: 'Why does the number change when I switch from formula to breastfeeding?',
      a: 'Because the two are calculated in completely different ways. Formula volume scales with body weight; breast-milk intake is age-based and roughly constant. Using the weight rule on a breastfed baby overstates the volume badly in the second half of the first year.',
    },
  ],

  sources: [
    {
      name: 'AAP HealthyChildren — Amount and Schedule of Baby Formula Feedings',
      url: 'https://www.healthychildren.org/English/ages-stages/baby/formula-feeding/Pages/Amount-and-Schedule-of-Formula-Feedings.aspx',
      publisher: 'American Academy of Pediatrics',
    },
    {
      name: 'AAP HealthyChildren — How Often and How Much Should Your Baby Eat?',
      url: 'https://www.healthychildren.org/English/ages-stages/baby/feeding-nutrition/Pages/how-often-and-how-much-should-your-baby-eat.aspx',
      publisher: 'American Academy of Pediatrics',
    },
    {
      name: 'CDC — Proper Storage and Preparation of Breast Milk',
      url: 'https://www.cdc.gov/breastfeeding/recommendations/handling_breastmilk.htm',
      publisher: 'Centers for Disease Control and Prevention',
    },
    {
      name: 'CDC — When, What, and How to Introduce Solid Foods',
      url: 'https://www.cdc.gov/nutrition/infantandtoddlernutrition/foods-and-drinks/when-to-introduce-solid-foods.html',
      publisher: 'Centers for Disease Control and Prevention',
    },
    {
      name: 'Kent JC et al. — Volume and frequency of breastfeedings and fat content of breast milk (Pediatrics)',
      url: 'https://pubmed.ncbi.nlm.nih.gov/16585322/',
      publisher: 'PubMed',
      date: '2006',
    },
    {
      name: 'WHO — Infant and young child feeding',
      url: 'https://www.who.int/news-room/fact-sheets/detail/infant-and-young-child-feeding',
      publisher: 'World Health Organization',
    },
  ],

  replaces: [
    '/en/infant-formula-bottle-ml-by-age',
    '/en/breast-milk-formula',
    '/en/breast-pump-production',
    '/en/baby-feeding-amount-by-age-calculator',
    '/en/blw-introduction-6-months',
    '/en/baby-diaper-calculator',
  ],

lastReviewed: '2026-07-28',
};
