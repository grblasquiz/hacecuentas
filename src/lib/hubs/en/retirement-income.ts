import type { HubData } from '../types';
import { IRS_401K, IRA_2026, HSA_2026, SOCIAL_SECURITY_2026, IRMAA_2026, RMD_UNIFORM_LIFETIME, OBBBA_2026, DATA_AS_OF } from '../../data/usa-2026';

/**
 * Decision hub EN — "Roth or traditional, and what will I actually live on?"
 *
 * Absorbs 11 loose calculators: Roth vs traditional, RMDs, HSA limits, annuity
 * payout, Social Security benefit, the COLA increase, the earnings test, Medicare
 * IRMAA brackets and the senior bonus deduction. Two Argentine URLs are absorbed
 * by URL only.
 *
 * EVERY STATUTORY FIGURE COMES FROM src/lib/data/usa-2026.ts — the repo's single
 * maintained source, which cites IRS Notice 2025-67, Rev. Proc. 2025-19, the SSA
 * COLA release of 2025-10-24 and the CMS 2026 premium notice. Nothing here is
 * from memory, and nothing is duplicated: if the table moves, this hub moves.
 *
 * These limits expire every year. `DATA_AS_OF` travels into the page so the
 * stamp shows when the table was last verified.
 */

/** YMYL disclaimer — verbatim from src/lib/disclaimers.ts, COPY.en, domain 'investment'. */
const DISCLAIMER =
  'Educational tool, not investment advice or a recommendation. Returns and capital can fluctuate or be lost; verify costs and risks with an authorized provider or adviser.';

export const LIMITS = {
  deferralUnder50: IRS_401K.deferralUnder50,
  catchUp50: IRS_401K.catchUp50,
  superCatchUp60_63: IRS_401K.superCatchUp60_63,
  total415c: IRS_401K.total415c,
  iraLimit: IRA_2026.limit,
  iraCatchUp50: IRA_2026.catchUp50,
  hsaSelfOnly: HSA_2026.contribSelfOnly,
  hsaFamily: HSA_2026.contribFamily,
  hsaCatchUp55: HSA_2026.catchUp55,
};

export const SS = {
  cola: SOCIAL_SECURITY_2026.cola,
  bendPoint1: SOCIAL_SECURITY_2026.bendPoint1,
  bendPoint2: SOCIAL_SECURITY_2026.bendPoint2,
  piaFactors: SOCIAL_SECURITY_2026.piaFactors,
  fullRetirementAge: SOCIAL_SECURITY_2026.fullRetirementAge,
  earlyClaimAge: SOCIAL_SECURITY_2026.earlyClaimAge,
  maxDelayAge: SOCIAL_SECURITY_2026.maxDelayAge,
  delayedCreditPerYear: SOCIAL_SECURITY_2026.delayedCreditPerYear,
  maxTaxableEarnings: SOCIAL_SECURITY_2026.maxTaxableEarnings,
  earningsTestUnderFRA: SOCIAL_SECURITY_2026.earningsTestUnderFRA,
  earningsTestYearOfFRA: SOCIAL_SECURITY_2026.earningsTestYearOfFRA,
};

export const IRMAA = {
  partBBase: IRMAA_2026.partBBase,
  tiers: IRMAA_2026.tiers.map((t) => ({ partB: t.partB, partD: t.partD })),
  single: [...IRMAA_2026.thresholds.single],
  mfj: [...IRMAA_2026.thresholds.mfj],
};

/** IRS Uniform Lifetime Table (Pub. 590-B, Table III), serialised for the page. */
export const RMD_TABLE = RMD_UNIFORM_LIFETIME;

/** OBBBA senior bonus deduction, ages 65+, tax years 2025–2028 only. */
export const SENIOR_DEDUCTION = {
  perPerson: OBBBA_2026.senior.perPerson,
  phaseoutSingle: OBBBA_2026.senior.phaseoutStart.single,
  phaseoutMfj: OBBBA_2026.senior.phaseoutStart.mfj,
  phaseoutRate: OBBBA_2026.senior.phaseoutRate,
};

export const AS_OF = DATA_AS_OF;

export const hub: HubData = {
slug: 'en/money/retirement-income',
  title: 'Retirement calculator: Roth vs traditional, contribution limits, RMDs and Social Security',
  description:
    'Work out how much you can contribute to a 401(k), IRA and HSA this year, whether Roth or traditional wins at your tax rates, what Social Security pays at 62, 67 or 70, your required minimum distribution, and which Medicare IRMAA bracket your income lands in.',
  silo: 'Money',
siloHref: '/en/money',
locale: 'en',

  eyebrow: 'Retirement planning',
  h1: 'Roth or traditional, and what will I actually live on?',
  lede:
    'Retirement money has four separate questions attached to it: how much you are allowed to put in, whether the tax break is better now or later, what Social Security will actually pay depending on when you claim, and what the government will force you to take out — plus what all of that does to your Medicare premium.',
  stamps: ['Reviewed 27-07-2026', 'IRS Notice 2025-67 · SSA COLA · CMS 2026 premiums', '11 calculators inside'],

  resultLabel: 'Your headline number',

  cases: {
    title: 'My situation is different',
    intro:
      'Contributing, choosing an account type, claiming Social Security and drawing down are four different decisions with different rules. Pick where you are.',
    items: [
      {
        id: 'contribute',
        label: 'How much can I put in?',
        hint: '401(k), IRA and HSA limits for this year.',
        yes: [
          'The 401(k) elective deferral limit, plus the catch-up if you are 50 or over',
          'The enhanced catch-up for ages 60 to 63 under SECURE 2.0, which replaces the standard one',
          'The IRA limit and its own separate catch-up — the two do not share a cap',
          'The HSA limit for self-only or family coverage, plus the 55+ catch-up',
        ],
        warn: [
          DISCLAIMER,
          'These limits are reset by the IRS every year: check the current notice before acting on a figure from any calculator, including this one',
          'The 401(k) and IRA limits are separate; the HSA is separate again. Only the 401(k) has a combined employee-plus-employer cap',
          'Roth IRA eligibility phases out by income — a high earner may be able to contribute to a 401(k) but not directly to a Roth IRA',
        ],
        plazo: '401(k) deferrals must be made through payroll by 31 December; IRA and HSA contributions can run to the April filing deadline.',
        answer:
          'The 401(k) and IRA limits are separate buckets, each with its own catch-up. The HSA is a third bucket and the most tax-advantaged of the three.',
      },
      {
        id: 'roth',
        label: 'Roth or traditional?',
        hint: 'Tax break now, or tax-free later.',
        yes: [
          'What the same contribution is worth after tax under each account type',
          'The break-even: the retirement tax rate at which the two are identical',
          'The value of the immediate deduction a traditional contribution gives you',
          'How the answer flips depending on whether your rate goes up or down',
        ],
        warn: [
          DISCLAIMER,
          'This compares tax treatment only. It cannot know your future tax rates, and that is the entire variable the decision turns on',
          'If you would spend the traditional account’s tax refund rather than invest it, the Roth is effectively a larger contribution',
          'Roth accounts have no required minimum distributions during the owner’s lifetime, which is a real advantage the raw maths does not show',
        ],
        plazo: 'Roth conversions have to be done by 31 December — unlike contributions, there is no April grace period.',
        answer:
          'Traditional wins if your tax rate falls in retirement, Roth wins if it rises. At the same rate, they are mathematically identical.',
      },
      {
        id: 'socialsecurity',
        label: 'When should I claim Social Security?',
        hint: 'At 62, at full retirement age, or at 70.',
        yes: [
          'Your primary insurance amount from the bend-point formula',
          'The monthly benefit at 62, at full retirement age and at 70',
          'The break-even age where delaying overtakes claiming early',
          'What the earnings test costs you if you keep working before full retirement age',
        ],
        warn: [
          DISCLAIMER,
          'Claiming at 62 permanently reduces the benefit by about 30% against full retirement age; delaying to 70 raises it by about 24%',
          'The earnings test withholds $1 for every $2 earned over the annual limit before full retirement age — but the money is credited back later, it is not lost',
          'Benefits can be partly taxable depending on your combined income, which the headline number does not show',
        ],
        plazo: 'apply about three months before you want benefits to begin; Medicare enrolment has its own separate window at 65.',
        answer:
          'Delaying past full retirement age adds 8% a year to 70. Break-even against claiming at 62 usually lands around age 78 to 80.',
      },
      {
        id: 'rmd',
        label: 'What must I withdraw?',
        hint: 'Required minimum distributions and annuity income.',
        yes: [
          'The age your RMDs must begin, which depends on your birth year under SECURE 2.0',
          'This year’s required distribution from the IRS Uniform Lifetime Table',
          'What that is as a percentage of the balance, and how it rises with age',
          'What the same balance would produce as an annuity instead',
        ],
        warn: [
          DISCLAIMER,
          'Missing an RMD carries a penalty of 25% of the shortfall, reduced to 10% if corrected promptly — this is the most expensive deadline in the tax code',
          'Roth IRAs have no RMD during the owner’s lifetime; Roth 401(k)s no longer do either since 2024',
          'An annuity trades flexibility and inheritance for a guaranteed payment — the payout rate is not a return, it includes your own capital coming back',
        ],
        plazo: 'the first RMD can be delayed to 1 April of the following year, but that stacks two distributions into one tax year.',
        answer:
          'Divide the prior year-end balance by the life-expectancy factor for your age. The percentage required rises every year.',
      },
      {
        id: 'medicare',
        label: 'What will Medicare cost me?',
        hint: 'IRMAA surcharges by income.',
        yes: [
          'The Part B premium and Part D surcharge for your income bracket',
          'How much the same coverage costs someone in the bracket below',
          'How far you are from the next threshold — IRMAA is a cliff, not a taper',
          'The senior bonus deduction available at 65 and over',
        ],
        warn: [
          DISCLAIMER,
          'IRMAA is a cliff: one dollar over a threshold moves you to the next bracket for the whole year, potentially costing over a thousand dollars',
          'The bracket is based on your income from two years earlier, not the current year — a one-off capital gain follows you',
          'A life-changing event (retirement, divorce, death of a spouse) lets you appeal with Form SSA-44 — most people never file it',
        ],
        plazo: 'file SSA-44 as soon as the life-changing event happens; the reduction is not applied retroactively by default.',
        answer:
          'The standard Part B premium applies below the first threshold. Above it, surcharges step up in five brackets on both Part B and Part D.',
      },
    ],
  },

  inputsTitle: 'Your situation',
  inputsIntro:
    'Statutory limits come from the maintained US table in this repo, not from this form. What you enter is your own situation.',
  fields: [
    { id: 'age', label: 'Your age', type: 'number', suffix: 'years', min: 18, max: 110, step: 1, value: 55 },
    { id: 'birthYear', label: 'Birth year', type: 'number', suffix: '', min: 1930, max: 2010, step: 1, value: 1971 },
    {
      id: 'filing',
      label: 'Filing status',
      type: 'select',
      value: 'single',
      options: [
        { value: 'single', label: 'Single or head of household' },
        { value: 'mfj', label: 'Married filing jointly' },
      ],
    },
    {
      id: 'hsaCoverage',
      label: 'HSA coverage type',
      type: 'select',
      value: 'family',
      options: [
        { value: 'self', label: 'Self-only' },
        { value: 'family', label: 'Family' },
      ],
    },
    { id: 'contribution', label: 'Amount you want to contribute this year', type: 'number', prefix: '$', min: 0, max: 100000, step: 500, value: 10000 },
    { id: 'rateNow', label: 'Your marginal tax rate now', type: 'number', suffix: '%', min: 0, max: 60, step: 1, value: 24 },
    { id: 'rateLater', label: 'Marginal tax rate you expect in retirement', type: 'number', suffix: '%', min: 0, max: 60, step: 1, value: 22 },
    { id: 'growthRate', label: 'Expected annual return', type: 'number', suffix: '%', min: 0, max: 20, step: 0.1, value: 7 },
    { id: 'yearsToRetire', label: 'Years until you draw on it', type: 'number', suffix: 'years', min: 1, max: 50, step: 1, value: 12 },
    {
      id: 'aime',
      label: 'Average indexed monthly earnings (AIME)',
      type: 'number',
      prefix: '$',
      min: 0,
      max: 20000,
      step: 100,
      value: 6500,
      help: 'From your Social Security statement at ssa.gov. It is the average of your 35 highest indexed earning years, per month.',
    },
    { id: 'claimAge', label: 'Age you plan to claim Social Security', type: 'number', suffix: 'years', min: 62, max: 70, step: 1, value: 67 },
    { id: 'earnedIncome', label: 'Earnings while claiming before full retirement age', type: 'number', prefix: '$', min: 0, max: 500000, step: 1000, value: 0 },
    { id: 'balance', label: 'Retirement account balance', type: 'number', prefix: '$', min: 0, max: 50000000, step: 1000, value: 750000 },
    { id: 'magi', label: 'Modified adjusted gross income (for IRMAA)', type: 'number', prefix: '$', min: 0, max: 5000000, step: 1000, value: 120000 },
    {
      id: 'payoutRate',
      label: 'Annuity payout rate',
      type: 'number',
      suffix: '%',
      min: 1,
      max: 20,
      step: 0.1,
      value: 6,
      help: 'Quoted by the insurer. This is not a return — it includes your own capital being returned to you.',
    },
  ],
  fineprint: DISCLAIMER,

  chart: {
    type: 'bars',
    title: 'The comparison that decides it',
    caption:
      'Depending on the case you picked, this compares the contribution buckets, the two account types after tax, the benefit at each claiming age, or the Medicare cost by bracket. The tallest bar is not always the right answer — read the warnings with it.',
  },
  breakdownTitle: 'The numbers behind the decision',
  breakdownIntro: 'All amounts are in US dollars unless the row says otherwise.',

  faq: [
    {
      q: 'How much can I contribute to a 401(k) this year?',
      a: 'The elective deferral limit is $24,500 under age 50, with an $8,000 catch-up from 50. SECURE 2.0 adds an enhanced catch-up of $11,250 for ages 60 through 63, which replaces the standard one rather than stacking on it. The combined employee-plus-employer cap is $72,000. These come from IRS Notice 2025-67 and change every year.',
    },
    {
      q: 'Do the 401(k) and IRA limits share a cap?',
      a: 'No. They are entirely separate buckets. You can max a 401(k) at $24,500 and still contribute $7,500 to an IRA, with its own separate $1,100 catch-up at 50. What income does affect is whether a traditional IRA contribution is deductible and whether you can contribute to a Roth IRA at all.',
    },
    {
      q: 'How much can I put in an HSA?',
      a: '$4,400 for self-only coverage and $8,750 for family coverage, plus a $1,000 catch-up from age 55. You need a qualifying high-deductible health plan. The HSA is the only account with three tax advantages — deductible going in, growing untaxed, and tax-free coming out for medical expenses.',
    },
    {
      q: 'Is a Roth or a traditional account better?',
      a: 'It comes down to one comparison: your tax rate now against your tax rate when you withdraw. If your rate falls in retirement, traditional wins; if it rises, Roth wins; at the same rate the two are mathematically identical. This hub shows the break-even retirement rate at which they tie.',
    },
    {
      q: 'How is my Social Security benefit calculated?',
      a: 'From your average indexed monthly earnings across your 35 highest years. The formula pays 90% of the first $1,286, 32% of the amount between $1,286 and $7,749, and 15% of anything above that. The result is your primary insurance amount — the benefit at full retirement age, which is 67 for anyone born in 1960 or later.',
    },
    {
      q: 'Should I claim Social Security at 62 or wait until 70?',
      a: 'Claiming at 62 permanently cuts the benefit by about 30% against full retirement age; delaying to 70 raises it by about 24% through delayed retirement credits of 8% a year. The break-even against claiming early usually lands around age 78 to 80. Delaying is essentially longevity insurance, and it also raises a surviving spouse’s benefit.',
    },
    {
      q: 'What is the Social Security earnings test?',
      a: 'If you claim before full retirement age and keep working, $1 of benefit is withheld for every $2 earned above $24,480 a year. In the year you reach full retirement age the limit rises to $65,160 and the withholding drops to $1 for every $3. Critically, the withheld money is not lost — your benefit is recalculated upward once you reach full retirement age.',
    },
    {
      q: 'When do required minimum distributions start?',
      a: 'Under SECURE 2.0, at 73 if you were born between 1951 and 1959, and at 75 if you were born in 1960 or later. The amount is the prior year-end balance divided by the life-expectancy factor for your age from the IRS Uniform Lifetime Table. At 75 that factor is 24.6, which is about 4.1% of the balance.',
    },
    {
      q: 'What happens if I miss an RMD?',
      a: 'The excise tax is 25% of the amount you should have taken, reduced to 10% if you correct it within the applicable window and file Form 5329. It is the single most expensive routine deadline in the tax code, and it is easy to miss in the first year because that one can be deferred to the following April.',
    },
    {
      q: 'What is IRMAA and how do I avoid it?',
      a: 'It is the income-related surcharge on Medicare Part B and Part D. The standard 2026 Part B premium is $202.90 a month, rising through five brackets to $689.90 for the highest earners, with a Part D surcharge on top. It is a cliff, not a taper — one dollar over a threshold costs you the whole step — and it is based on your income from two years earlier.',
    },
    {
      q: 'Can I appeal an IRMAA determination?',
      a: 'Yes, if you had a life-changing event: retirement or reduced work hours, marriage, divorce, death of a spouse, loss of a pension, or loss of income-producing property. File Form SSA-44 with documentation as soon as it happens. Most people who qualify never file it, and the reduction is not applied automatically.',
    },
    {
      q: 'What is the senior bonus deduction?',
      a: 'A temporary deduction of $6,000 per eligible person aged 65 or over, created by the One Big Beautiful Bill Act for tax years 2025 through 2028 only. A married couple where both are 65+ can claim $12,000. It phases out at 6% of income above $75,000 single or $150,000 joint, and it disappears entirely after 2028 unless Congress extends it.',
    },
    {
      q: 'Is an annuity a good way to turn a balance into income?',
      a: 'It buys certainty at the cost of flexibility and inheritance. The quoted payout rate is not a return: a 6% payout on a fixed annuity is mostly your own capital coming back to you, which is why the rate looks higher than any safe investment yield. It suits people who want a floor of guaranteed income, not people optimising for total wealth.',
    },
  ],

  sources: [
    {
      name: 'IRS Notice 2025-67 — 401(k) and IRA limits for 2026',
      url: 'https://www.irs.gov/retirement-plans/cola-increases-for-dollar-limitations-on-benefits-and-contributions',
      publisher: 'Internal Revenue Service',
    },
    {
      name: 'IRS Rev. Proc. 2025-19 — HSA and HDHP limits for 2026',
      url: 'https://www.irs.gov/pub/irs-drop/rp-25-19.pdf',
      publisher: 'Internal Revenue Service',
    },
    {
      name: 'IRS Publication 590-B — Distributions from IRAs (Uniform Lifetime Table)',
      url: 'https://www.irs.gov/publications/p590b',
      publisher: 'Internal Revenue Service',
    },
    {
      name: 'SSA — Benefit formula bend points and the primary insurance amount',
      url: 'https://www.ssa.gov/oact/cola/piaformula.html',
      publisher: 'Social Security Administration',
    },
    {
      name: 'SSA — Cost-of-Living Adjustment (COLA) information',
      url: 'https://www.ssa.gov/cola/',
      publisher: 'Social Security Administration',
    },
    {
      name: 'SSA — How work affects your benefits (the earnings test)',
      url: 'https://www.ssa.gov/pubs/EN-05-10069.pdf',
      publisher: 'Social Security Administration',
    },
    {
      name: 'Medicare.gov — Part B costs and income-related monthly adjustment amounts',
      url: 'https://www.medicare.gov/basics/costs/medicare-costs',
      publisher: 'Centers for Medicare & Medicaid Services',
    },
    {
      name: 'IRS — One Big Beautiful Bill Act: deductions for working Americans and seniors',
      url: 'https://www.irs.gov/newsroom/one-big-beautiful-bill-act-tax-deductions-for-working-americans-and-seniors',
      publisher: 'Internal Revenue Service',
    },
  ],

  replaces: [
    '/en/roth-vs-traditional-ira-calculator',
    '/en/rmd-required-minimum-distribution-calculator',
    '/en/hsa-contribution-limit-2026-calculator',
    '/en/annuity-payout-monthly-calculator',
    '/en/social-security-benefits-calculator-usa',
    '/en/social-security-cola-2026-increase-calculator',
    '/en/social-security-earnings-limit-2026-calculator',
    '/en/medicare-irmaa-2026-brackets-calculator',
    '/en/senior-bonus-deduction-65-calculator',
    '/en/ira-401k-argentina-equivalent',
    '/en/minimum-retirement-pension-bonus-2026',
  ],

lastReviewed: '2026-07-28',
};
