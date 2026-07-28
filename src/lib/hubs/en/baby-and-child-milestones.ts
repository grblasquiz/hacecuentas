import type { HubData } from '../types';

/**
 * Decision hub EN — "Is my child on track for their age?"
 *
 * Absorbs 8 loose calculators: sleep hours by age (two duplicate URLs), tooth
 * eruption timeline, shoe size, screen-time limits, allowance by age, caregiver
 * to child ratios and the age to discuss difficult topics.
 *
 * SOURCE DISCIPLINE: sleep = AASM consensus 2016 (endorsed by AAP); teeth = ADA
 * eruption chart; screen time = AAP media guidance; ratios = Caring for Our
 * Children, 4th ed. (AAP/APHA/NRC).
 * Allowance and "age to talk about X" have NO governing body — they are stated
 * as conventions and the amount is an editable field, not a hardcoded constant.
 */

/** YMYL disclaimer — verbatim from src/lib/disclaimers.ts, domain 'family', language 'en'. */
const DISCLAIMER =
  'General information. Consult the appropriate professional for health, fertility, pregnancy, or parenting decisions.';

/** AASM 2016 consensus: recommended sleep per 24 h, including naps. Under 4 months AASM gives no figure; NSF 2015 is used. */
export const SLEEP = [
  { maxMonths: 3, min: 14, max: 17, naps: 4, ref: 'NSF 2015 (AASM gives no figure under 4 months)' },
  { maxMonths: 11, min: 12, max: 16, naps: 3, ref: 'AASM 2016 — 4 to 12 months' },
  { maxMonths: 35, min: 11, max: 14, naps: 1, ref: 'AASM 2016 — 1 to 2 years' },
  { maxMonths: 71, min: 10, max: 13, naps: 1, ref: 'AASM 2016 — 3 to 5 years' },
  { maxMonths: 155, min: 9, max: 12, naps: 0, ref: 'AASM 2016 — 6 to 12 years' },
  { maxMonths: 216, min: 8, max: 10, naps: 0, ref: 'AASM 2016 — 13 to 18 years' },
];

/** ADA primary-tooth eruption chart: age window in months and how many teeth are in by the end of it. */
export const TEETH = [
  { from: 6, to: 10, name: 'Lower central incisors', cumulative: 2 },
  { from: 8, to: 12, name: 'Upper central incisors', cumulative: 4 },
  { from: 9, to: 13, name: 'Upper lateral incisors', cumulative: 6 },
  { from: 10, to: 16, name: 'Lower lateral incisors', cumulative: 8 },
  { from: 13, to: 19, name: 'First molars', cumulative: 12 },
  { from: 16, to: 22, name: 'Canines', cumulative: 16 },
  { from: 25, to: 33, name: 'Second molars', cumulative: 20 },
];

/** AAP media guidance, expressed as recommended screen minutes per day. */
export const SCREEN = [
  { maxMonths: 17, minutes: 0, ref: 'AAP — video chat only under 18 months' },
  { maxMonths: 23, minutes: 30, ref: 'AAP — high-quality content, watched together' },
  { maxMonths: 71, minutes: 60, ref: 'AAP — 1 hour a day of high-quality programming, ages 2 to 5' },
  { maxMonths: 216, minutes: 120, ref: 'AAP — no fixed cap from age 6; set consistent limits that protect sleep and activity' },
];

/** Caring for Our Children, 4th ed.: caregiver-to-child ratio and maximum group size. */
export const RATIOS = [
  { maxMonths: 11, perAdult: 3, group: 6 },
  { maxMonths: 35, perAdult: 4, group: 8 },
  { maxMonths: 47, perAdult: 7, group: 14 },
  { maxMonths: 71, perAdult: 8, group: 16 },
  { maxMonths: 107, perAdult: 10, group: 20 },
  { maxMonths: 216, perAdult: 12, group: 24 },
];

/** Ages commonly recommended for first conversations. No governing body — developmental-guidance convention. */
export const TALKS = [
  { months: 36, topic: 'Body safety and correct names for body parts' },
  { months: 48, topic: 'Where babies come from, at a basic level' },
  { months: 54, topic: 'Death and loss, in concrete terms' },
  { months: 60, topic: 'Money: earning, saving and spending' },
  { months: 72, topic: 'Online safety and what not to share' },
  { months: 96, topic: 'Puberty — before it starts, not during' },
  { months: 108, topic: 'Alcohol, vaping and drugs' },
  { months: 132, topic: 'Consent and healthy relationships' },
];

/** Approximate US children's shoe size from foot length in inches. Add growth room before buying. */
export const SHOE = { slope: 3, offset: 9.5, growthRoomInches: 0.5 };

export const hub: HubData = {
slug: 'en/family/baby-and-child-milestones',
  title: 'Is my child on track? Sleep, teeth, screen time and shoe size by age',
  description:
    'Age-by-age reference for children: how many hours of sleep they need per AASM, which baby teeth should be in per the ADA chart, the AAP screen-time limit, the caregiver-to-child ratio for daycare, shoe size from foot length and when to have the harder conversations.',
  silo: 'Family',
siloHref: '/en/family',
locale: 'en',

  eyebrow: 'Child development reference',
  h1: 'Is my child on track for their age?',
  lede:
    'One age gives you the whole picture: recommended sleep including naps, how many baby teeth should have come in and which one is next, the screen-time limit for that age, the legal-standard caregiver ratio for group care, an approximate shoe size, and which conversations are usually due about now.',
  stamps: ['Reviewed 27-07-2026', 'AASM · ADA · AAP · Caring for Our Children', '8 calculators inside'],

  resultLabel: 'Sleep needed per 24 hours',

  cases: {
    title: 'My situation is different',
    intro:
      'The same age means different things depending on the stage. Pick the one that matches and the warnings change with it.',
    items: [
      {
        id: 'infant',
        label: 'Baby, under 1 year',
        hint: 'Naps still make up a big share of the day.',
        yes: [
          'Total sleep across 24 hours, naps included — not night sleep alone',
          'How many baby teeth should be in and which set comes next',
          'Screen time: video chat only under 18 months, per AAP',
          'Caregiver ratio for infants: one adult per 3 children, group of 6 maximum',
        ],
        warn: [
          DISCLAIMER,
          'Sleep ranges are population guidance, not a target to force — a baby an hour outside the range but thriving is usually fine',
          'Teething does not cause high fever: a temperature over 100.4 °F needs a different explanation',
          'Safe sleep matters more than sleep hours: on the back, alone, in a crib, with nothing soft in it',
        ],
        plazo: 'the first tooth usually shows between 6 and 10 months; no teeth by 18 months is worth a dental visit.',
        answer:
          'Under a year, expect 12 to 16 hours of sleep a day including naps, the first teeth between 6 and 10 months, and no screens beyond video chat.',
      },
      {
        id: 'toddler',
        label: 'Toddler, 1 to 3 years',
        hint: 'One nap, full set of baby teeth arriving.',
        yes: [
          '11 to 14 hours of sleep including one nap',
          'The full set of 20 primary teeth, usually complete between 25 and 33 months',
          'Screen time: none before 18 months, then up to 1 hour a day of high-quality content from age 2',
          'Caregiver ratio: one adult per 4 children, group of 8 maximum',
        ],
        warn: [
          DISCLAIMER,
          'Dropping the nap before age 3 usually shows up as harder bedtimes, not less total sleep needed',
          'Background TV counts: it reduces the words a toddler hears even when nobody is watching',
          'Shoe sizes here are approximate — a toddler foot grows about half a size every 2 to 3 months',
        ],
        plazo: 'first dental visit by the first birthday or within 6 months of the first tooth, per the ADA.',
        answer:
          'Between 1 and 3 years: 11 to 14 hours of sleep, all 20 baby teeth in by about 33 months, and at most an hour of screen time a day from age 2.',
      },
      {
        id: 'preschool',
        label: 'Preschooler, 3 to 5 years',
        hint: 'Nap fading, first real conversations.',
        yes: [
          '10 to 13 hours of sleep, with or without a nap',
          'One hour a day of high-quality screen content, watched together where possible',
          'Caregiver ratio: 1 adult per 7 children at age 3, 1 per 8 from age 4',
          'The conversations usually due at this age: body safety, where babies come from, death and loss',
        ],
        warn: [
          DISCLAIMER,
          'Losing the nap is normal between 3 and 5, but bedtime should move earlier to keep the 24-hour total',
          'Screens within an hour of bedtime delay sleep onset measurably at this age',
          'These conversation ages are developmental convention, not an official standard — follow the child’s questions',
        ],
        plazo: 'the first permanent molars and the loss of the first baby tooth usually arrive around age 6.',
        answer:
          'Between 3 and 5: 10 to 13 hours of sleep, one hour of quality screen time, and the age where the first hard conversations land best.',
      },
      {
        id: 'school',
        label: 'School age, 6 to 12 years',
        hint: 'Permanent teeth, allowance, more screens.',
        yes: [
          '9 to 12 hours of sleep a night',
          'No fixed screen cap from age 6 — AAP asks for consistent limits that protect sleep, activity and homework',
          'Caregiver ratio: 1 adult per 10 to 12 children',
          'Allowance: the common convention is about $1 per week per year of age, adjusted to your budget',
        ],
        warn: [
          DISCLAIMER,
          'The allowance figure is a household convention, not official guidance — it is an editable field for that reason',
          'Sleep debt on school nights is not repaid on weekends; the schedule has to work Monday to Friday',
          'Puberty conversations work best before puberty starts, which for many children is around age 8 to 9',
        ],
        plazo: 'baby teeth are typically all replaced between ages 6 and 12.',
        answer:
          'From 6 to 12: 9 to 12 hours of sleep, screen limits by household rule rather than a fixed cap, and the age when allowance and puberty conversations start.',
      },
      {
        id: 'teen',
        label: 'Teenager, 13 and over',
        hint: 'Less sleep than they need, more autonomy.',
        yes: [
          '8 to 10 hours of sleep — most teenagers get well under this',
          'Screen limits negotiated rather than imposed, with device-free sleep as the non-negotiable',
          'Conversations due: consent, healthy relationships, alcohol, vaping and drugs',
          'Allowance scaled to responsibilities rather than to age alone',
        ],
        warn: [
          DISCLAIMER,
          'Teen circadian rhythm shifts later biologically: early school start times, not laziness, drive the deficit',
          'Devices in the bedroom overnight are the single strongest predictor of short teen sleep',
          'If mood, appetite or withdrawal change sharply, that is a clinical question, not a scheduling one',
        ],
        plazo: 'wisdom teeth usually appear between 17 and 21 — worth a dental check in the late teens.',
        answer:
          'Teenagers need 8 to 10 hours of sleep. Most get 6 to 7, and the fix is usually the phone and the bedtime, not the alarm.',
      },
    ],
  },

  inputsTitle: 'Your child',
  inputsIntro: 'Age drives everything. The other two fields are optional and only affect their own rows.',
  fields: [
    { id: 'months', label: 'Age', type: 'number', suffix: 'months', min: 0, max: 216, step: 1, value: 24, help: 'In months. 24 = 2 years, 72 = 6 years, 156 = 13 years.' },
    {
      id: 'foot',
      label: 'Foot length (optional)',
      type: 'number',
      suffix: 'inches',
      min: 0,
      max: 11,
      step: 0.1,
      value: 5.5,
      help: 'Measure heel to longest toe, standing, in the afternoon. Leave at 0 to skip the shoe size.',
    },
    {
      id: 'allowancePerYear',
      label: 'Allowance convention',
      type: 'number',
      prefix: '$',
      suffix: 'per week per year of age',
      min: 0,
      max: 10,
      step: 0.25,
      value: 1,
      help: 'Editable on purpose: there is no official allowance guidance. $1 per year of age per week is the common US convention.',
    },
    {
      id: 'sleepActual',
      label: 'Hours your child actually sleeps (optional)',
      type: 'number',
      suffix: 'hours',
      min: 0,
      max: 20,
      step: 0.5,
      value: 0,
      help: 'Total across 24 hours, naps included. Leave at 0 to just see the recommendation.',
    },
  ],
  fineprint: DISCLAIMER,

  chart: {
    type: 'timeline',
    title: 'Where your child sits on the 0–18 timeline',
    caption:
      'The timeline runs from birth to 18 years, split into the stages the guidance itself uses: infant, toddler, preschool, school age and teenager. The marker shows where your child falls, which is what decides every number below.',
    bands: [
      { label: 'Baby (0–12 m)', from: 0, to: 12, tone: 'good' },
      { label: 'Toddler (1–3 y)', from: 12, to: 36, tone: 'neutral' },
      { label: 'Preschool (3–6 y)', from: 36, to: 72, tone: 'good' },
      { label: 'School age (6–13 y)', from: 72, to: 156, tone: 'neutral' },
      { label: 'Teen (13–18 y)', from: 156, to: 216, tone: 'good' },
    ],
  },
  breakdownTitle: 'What that age means, line by line',
  breakdownIntro:
    'Each row states its own unit and the body that publishes it. Bars compare the figures against the largest one.',

  faq: [
    {
      q: 'How many hours should my child sleep?',
      a: 'Per the AASM 2016 consensus, endorsed by the AAP, and counting naps: 12 to 16 hours from 4 to 12 months, 11 to 14 hours from 1 to 2 years, 10 to 13 hours from 3 to 5, 9 to 12 hours from 6 to 12, and 8 to 10 hours from 13 to 18. Under 4 months AASM gives no figure; the National Sleep Foundation suggests 14 to 17 hours.',
    },
    {
      q: 'When do baby teeth come in, and in what order?',
      a: 'Per the ADA eruption chart: lower central incisors at 6 to 10 months, upper central at 8 to 12, upper lateral at 9 to 13, lower lateral at 10 to 16, first molars at 13 to 19, canines at 16 to 22 and second molars at 25 to 33 months. That completes the set of 20 primary teeth.',
    },
    {
      q: 'My baby has no teeth yet — is that a problem?',
      a: 'Wide variation is normal, and a first tooth anywhere from 4 to 15 months is still within range. No teeth at all by 18 months is worth a dental evaluation. Late eruption on its own, with normal growth otherwise, is usually just family timing.',
    },
    {
      q: 'How much screen time is appropriate by age?',
      a: 'The AAP asks for no screen media other than video chat before 18 months, high-quality content watched together from 18 to 24 months, no more than one hour a day of quality programming from 2 to 5, and from age 6 consistent limits rather than a fixed cap — with sleep, physical activity and homework protected first.',
    },
    {
      q: 'How many children can one adult look after?',
      a: 'Caring for Our Children, the AAP/APHA/NRC national standard, sets 1 adult per 3 infants with a group cap of 6, 1 per 4 toddlers with a group of 8, 1 per 7 three-year-olds, 1 per 8 from age 4, and 1 per 10 to 12 for school age. State licensing rules can be less strict than this standard — check yours.',
    },
    {
      q: 'What shoe size is my child?',
      a: 'This hub estimates it from foot length: roughly three times the length in inches minus 9.5 gives the US children\'s size. Always measure standing, in the afternoon when the foot is largest, and add about half an inch of growth room before buying. Toddlers move up about half a size every two to three months.',
    },
    {
      q: 'How much allowance should I give?',
      a: 'There is no official guidance, which is why the amount here is an editable field. The most common US convention is about $1 per week per year of age, so $8 a week at age 8. What matters more than the number is that it is predictable and that some of it has to be saved.',
    },
    {
      q: 'At what age should I talk about death, puberty or drugs?',
      a: 'As a rough sequence: body safety around 3, where babies come from around 4, death and loss around 4 to 5 in concrete terms, money around 5, online safety around 6, puberty around 8 to 9 — before it starts, not during — drugs and alcohol around 9, and consent and relationships by 11. These are developmental conventions, not a standard: follow the child\'s own questions.',
    },
    {
      q: 'My child sleeps an hour less than the recommended range. Should I worry?',
      a: 'Not by itself. The ranges are population guidance with a wide normal spread. Look at daytime function instead: a child who wakes on their own, is alert through the morning and does not crash in the afternoon is probably getting enough. Persistent difficulty waking, or falling asleep in the car every day, is the signal to act on.',
    },
    {
      q: 'When do baby teeth fall out?',
      a: 'Usually starting around age 6 with the lower central incisors, in roughly the same order they came in, and finishing between 11 and 12. The first permanent molars come in behind the baby teeth around age 6 without anything falling out first, which is why they are often missed.',
    },
    {
      q: 'Does the nap count toward the daily sleep total?',
      a: 'Yes. Every figure here is total sleep across 24 hours, naps included. That is why dropping the nap between ages 3 and 5 does not lower the requirement — it just means bedtime has to move earlier to keep the same total.',
    },
  ],

  sources: [
    {
      name: 'AASM — Recommended Amount of Sleep for Pediatric Populations (consensus statement)',
      url: 'https://jcsm.aasm.org/doi/10.5664/jcsm.5866',
      publisher: 'Journal of Clinical Sleep Medicine',
      date: '2016',
    },
    {
      name: 'American Dental Association — Tooth Eruption Charts',
      url: 'https://www.mouthhealthy.org/all-topics-a-z/eruption-charts',
      publisher: 'ADA MouthHealthy',
    },
    {
      name: 'AAP — Media and Children Communication Toolkit / family media plan',
      url: 'https://www.healthychildren.org/English/fmp/Pages/MediaPlan.aspx',
      publisher: 'American Academy of Pediatrics',
    },
    {
      name: 'Caring for Our Children, 4th edition — Ratios and group size (standard 1.1.1.2)',
      url: 'https://nrckids.org/CFOC/Database/1.1.1.2',
      publisher: 'AAP / APHA / National Resource Center for Health and Safety in Child Care',
    },
    {
      name: 'CDC — Developmental Milestones (Learn the Signs. Act Early.)',
      url: 'https://www.cdc.gov/ncbddd/actearly/milestones/index.html',
      publisher: 'Centers for Disease Control and Prevention',
    },
    {
      name: 'National Sleep Foundation — Sleep duration recommendations',
      url: 'https://pubmed.ncbi.nlm.nih.gov/29073412/',
      publisher: 'PubMed',
      date: '2015',
    },
  ],

  replaces: [
    '/en/baby-sleep-hours-by-age',
    '/en/baby-sleep-hours-by-age-chart',
    '/en/baby-teeth-eruption-timeline',
    '/en/baby-shoe-size',
    '/en/screen-time-recommendations-by-age',
    '/en/child-allowance-by-age',
    '/en/caregiver-child-ratio-by-age',
    '/en/age-discuss-difficult-topics-with-kids',
  ],

lastReviewed: '2026-07-28',
};
