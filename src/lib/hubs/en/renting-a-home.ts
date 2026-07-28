import type { HubData } from '../types';

/**
 * Decision hub EN — "What will renting this place really cost me?"
 *
 * Absorbs 8 loose calculators: security deposit and its return, renters
 * insurance / rent guarantee cost, comparing lease lengths, HOA and condo fees,
 * the eviction timeline and attorney fees, and moving-truck cost. Two Argentine
 * URLs (rent indexation and USD lease conversion) are absorbed by URL only.
 *
 * NUMBERS: every figure that varies by state or landlord is an EDITABLE FIELD,
 * not a hardcoded constant. State deposit caps change by legislature and there
 * is no single national table worth hardcoding — the hub explains the rule and
 * lets you enter yours.
 */

/** YMYL disclaimer — verbatim from src/lib/disclaimers.ts, COPY.en, domain 'finance'. */
const DISCLAIMER =
  'Informational estimate. Actual rates, fees, and terms depend on the provider and contract; compare official documents before deciding.';

/** Typical US renters-insurance premium as a share of annual rent, for the default only. */
export const RENTERS_INSURANCE = { typicalAnnualLow: 150, typicalAnnualHigh: 300 };

/** Rule-of-thumb affordability thresholds used by most US landlords. */
export const AFFORDABILITY = { incomeMultipleOfRent: 3, rentShareOfGrossPct: 30 };

export const hub: HubData = {
slug: 'en/money/renting-a-home',
  title: 'What does renting really cost? Move-in cost, deposit, insurance and fees',
  description:
    'Add up what a rental actually costs: first month, security deposit, application and pet fees, renters insurance, HOA or condo charges and the moving truck — then see the true monthly cost, whether it passes the 30% rule, and how much of the deposit you should get back.',
  silo: 'Money',
siloHref: '/en/money',
locale: 'en',

  eyebrow: 'Renting a home',
  h1: 'What will renting this place really cost me?',
  lede:
    'The advertised rent is never the number you pay. This adds the move-in cash you need on day one, the recurring cost once you are in, the share of your income it takes, and what happens to your deposit at the end — including the deductions a landlord can and cannot legally make.',
  stamps: ['Reviewed 27-07-2026', 'FTC and HUD tenant guidance', '8 calculators inside'],

  resultLabel: 'Cash needed to move in',

  cases: {
    title: 'My situation is different',
    intro: 'Renting has three separate money questions. Pick the one you are on right now.',
    items: [
      {
        id: 'movein',
        label: 'I am about to sign',
        hint: 'How much cash do I need on day one?',
        yes: [
          'First month’s rent, security deposit and any last month required up front',
          'Application, administrative, pet and parking fees',
          'Renters insurance, which most leases now require before you get the keys',
          'The moving truck and the total cash you have to have available',
        ],
        warn: [
          DISCLAIMER,
          'Many states cap the security deposit at one or two months’ rent and require it held in a separate account — check yours before paying more',
          'Application fees are often non-refundable even if you are declined; ask what the screening actually covers',
          '"Move-in special" discounts are usually amortised across the lease, so leaving early claws them back',
        ],
        plazo: 'do the walkthrough and photograph everything before you hand over a single dollar.',
        answer:
          'Budget first month plus deposit plus fees plus insurance plus the move — commonly two and a half to three and a half times the monthly rent in cash.',
      },
      {
        id: 'monthly',
        label: 'I want the true monthly cost',
        hint: 'Rent plus everything that comes with it.',
        yes: [
          'Rent plus HOA or condo charges, parking, pet rent and utilities that are not included',
          'Renters insurance spread monthly',
          'The share of your gross income the total takes, against the 30% rule',
          'The income most landlords will require you to show',
        ],
        warn: [
          DISCLAIMER,
          'The 30% rule is a screening convention, not a law — in high-cost metros half of renters are above it',
          'Utilities excluded from the rent can add 10 to 20% to the real monthly cost, and more in an old building',
          'Rent increases at renewal are unregulated in most of the US: budget for one unless you are in a rent-stabilised unit',
        ],
        plazo: 'ask for the last 12 months of utility bills for the unit before signing — landlords can usually provide them.',
        answer:
          'The true monthly cost is rent plus fees plus utilities plus insurance. Most landlords want that under 30% of gross income and want you to earn three times the rent.',
      },
      {
        id: 'deposit',
        label: 'I am moving out',
        hint: 'How much of my deposit should come back?',
        yes: [
          'The deposit less the deductions the landlord has itemised',
          'Which deductions are normally lawful and which are not',
          'The statutory deadline for returning it in most states',
          'What "normal wear and tear" actually covers',
        ],
        warn: [
          DISCLAIMER,
          'Normal wear and tear cannot be deducted anywhere: faded paint, minor carpet wear and small nail holes are the landlord’s cost, not yours',
          'Most states require an itemised written statement within 14 to 30 days; missing that deadline often forfeits the right to deduct at all',
          'Several states allow double or treble damages for a bad-faith withholding — photos taken at move-in are what win those cases',
        ],
        plazo: 'send a written forwarding address by certified mail: in many states the clock does not start until the landlord has it.',
        answer:
          'You get the deposit back less itemised, documented damage beyond normal wear and tear — typically within 14 to 30 days of moving out.',
      },
      {
        id: 'lease',
        label: 'Comparing lease lengths',
        hint: 'Is the longer lease actually cheaper?',
        yes: [
          'Total cost of each option over the same horizon, including any renewal increase',
          'What the shorter lease costs you in re-signing fees and moving risk',
          'The break-even rent increase that makes the longer lease worth locking in',
          'The cost of breaking the lease early, which is what the flexibility is really worth',
        ],
        warn: [
          DISCLAIMER,
          'A longer lease is only cheaper if you actually stay: early-termination clauses commonly cost two months’ rent plus the deposit',
          'Landlords often price the longer term slightly higher, not lower — check before assuming a discount',
          'Month-to-month gives maximum flexibility but is usually the most expensive per month and the easiest to terminate against you',
        ],
        plazo: 'renewal notice is typically due 30 to 60 days before the lease ends — missing it can roll you to month-to-month rates.',
        answer:
          'Lock in the longer lease when the expected annual rent increase is bigger than the premium the landlord charges for the extra term.',
      },
    ],
  },

  inputsTitle: 'The listing and your situation',
  inputsIntro: 'Enter what the listing says. Everything is editable because none of it is standardised across states.',
  fields: [
    { id: 'rent', label: 'Monthly rent', type: 'number', prefix: '$', min: 0, max: 20000, step: 25, value: 1800 },
    {
      id: 'depositMonths',
      label: 'Security deposit',
      type: 'number',
      suffix: 'months of rent',
      min: 0,
      max: 4,
      step: 0.5,
      value: 1,
      help: 'Many states cap this at one or two months. Enter what your lease actually asks for.',
    },
    { id: 'lastMonth', label: 'Last month’s rent required up front', type: 'select', value: 'no', options: [{ value: 'no', label: 'No' }, { value: 'yes', label: 'Yes' }] },
    { id: 'fees', label: 'Application, admin, pet and parking fees', type: 'number', prefix: '$', min: 0, max: 5000, step: 25, value: 250 },
    { id: 'hoa', label: 'HOA, condo or amenity fee', type: 'number', prefix: '$', suffix: 'per month', min: 0, max: 3000, step: 10, value: 0 },
    { id: 'utilities', label: 'Utilities not included in the rent', type: 'number', prefix: '$', suffix: 'per month', min: 0, max: 2000, step: 10, value: 180 },
    {
      id: 'insurance',
      label: 'Renters insurance',
      type: 'number',
      prefix: '$',
      suffix: 'per year',
      min: 0,
      max: 3000,
      step: 10,
      value: 200,
      help: 'Typical US policies run $150 to $300 a year for standard contents cover.',
    },
    { id: 'moving', label: 'Moving truck and movers', type: 'number', prefix: '$', min: 0, max: 20000, step: 50, value: 600 },
    { id: 'income', label: 'Your gross monthly income', type: 'number', prefix: '$', min: 0, max: 100000, step: 100, value: 6000 },
    { id: 'deductions', label: 'Deductions itemised by the landlord (moving out)', type: 'number', prefix: '$', min: 0, max: 20000, step: 25, value: 0 },
    {
      id: 'renewalIncreasePct',
      label: 'Expected rent increase at renewal',
      type: 'number',
      suffix: '%',
      min: 0,
      max: 40,
      step: 0.5,
      value: 4,
      help: 'Used to compare a 1-year against a 2-year lease.',
    },
  ],
  fineprint: DISCLAIMER,

  chart: {
    type: 'donut',
    title: 'What the move-in cash is made of',
    caption:
      'The move-in total split into first month, deposit, fees, insurance and the move itself. The deposit is the only piece you normally get back — the rest is spent.',
  },
  breakdownTitle: 'Every line of the cost',
  breakdownIntro: 'All amounts are in US dollars unless the row says otherwise.',

  faq: [
    {
      q: 'How much cash do I need to move into a rental?',
      a: 'Commonly two and a half to three and a half times the monthly rent. That is first month plus a security deposit of one to two months, plus application and admin fees, plus a renters insurance premium, plus the move itself. On $1,800 rent that is usually $4,500 to $6,500 in hand.',
    },
    {
      q: 'How much can a landlord charge for a security deposit?',
      a: 'It depends on the state. Many cap it at one or two months’ rent and require it held in a separate, sometimes interest-bearing account. Several states have no cap at all. Because there is no national rule, this hub takes the deposit as an input rather than assuming a limit — check your own state statute.',
    },
    {
      q: 'What is the 30% rule and does it still apply?',
      a: 'It is the convention that housing should take no more than 30% of gross income. It is a screening guideline, not a law, and in expensive metros roughly half of renters exceed it. Landlords more often apply a related rule: you must show gross income of at least three times the monthly rent.',
    },
    {
      q: 'When do I get my security deposit back?',
      a: 'Most states require the landlord to return it, with an itemised statement of any deductions, within 14 to 30 days of you moving out. In many states the clock only starts once the landlord has your written forwarding address — send it by certified mail so you can prove the date.',
    },
    {
      q: 'What counts as normal wear and tear?',
      a: 'Deterioration from ordinary living: faded paint, worn carpet in traffic paths, small nail holes, minor scuffs, loose grout. None of it is deductible anywhere. Damage is different — a burn in the counter, a broken door, a pet-stained carpet, holes needing patching. The line is between aging and harm.',
    },
    {
      q: 'What can I do if the landlord keeps my deposit unfairly?',
      a: 'Ask in writing for the itemised statement the law requires. If it does not arrive by the statutory deadline, many states forfeit the landlord’s right to deduct anything. Several states allow double or treble damages for bad-faith withholding, and small claims court is the usual venue. Dated move-in and move-out photos are what decide these cases.',
    },
    {
      q: 'Do I need renters insurance?',
      a: 'Most leases now require it, and it is cheap — typically $150 to $300 a year for standard contents cover plus liability. The landlord’s policy covers the building, never your belongings, and the liability portion is what protects you if a kitchen fire or a burst pipe damages a neighbour’s unit.',
    },
    {
      q: 'Is a two-year lease cheaper than a one-year lease?',
      a: 'Only if you stay and only if the expected renewal increase is bigger than any premium the landlord charges for the longer term. This hub compares both over the same horizon. Remember the flexibility you give up has a price: early-termination clauses commonly cost two months’ rent plus the deposit.',
    },
    {
      q: 'What are HOA or condo fees and do renters pay them?',
      a: 'They fund shared maintenance, amenities and reserves in a condo or planned community. In most rentals the owner pays them out of the rent, but some leases pass through an amenity or parking charge separately. Check whether the advertised rent includes them, because they can add $100 to $600 a month.',
    },
    {
      q: 'How long does an eviction take?',
      a: 'It varies enormously by state, from about three weeks in the fastest jurisdictions to several months where court backlogs are heavy. A landlord must give the required written notice, file in court and win a judgment; self-help lockouts and utility shutoffs are illegal everywhere. Attorney fees typically run into the low thousands, and many leases make the losing party pay them.',
    },
    {
      q: 'What does moving actually cost?',
      a: 'A DIY truck rental for a local move usually runs $150 to $600 with fuel and mileage; hiring local movers is commonly $600 to $2,000 depending on size and stairs. Long-distance moves scale into the thousands. Book three or more weeks out — end-of-month and summer dates carry the biggest premiums.',
    },
  ],

  sources: [
    {
      name: 'FTC — Renting a Home (consumer guidance)',
      url: 'https://consumer.ftc.gov/articles/renting-home',
      publisher: 'Federal Trade Commission',
    },
    {
      name: 'HUD — Tenant Rights, Laws and Protections by state',
      url: 'https://www.hud.gov/topics/rental_assistance/tenantrights',
      publisher: 'U.S. Department of Housing and Urban Development',
    },
    {
      name: 'Consumer Financial Protection Bureau — Renting basics',
      url: 'https://www.consumerfinance.gov/consumer-tools/',
      publisher: 'CFPB',
    },
    {
      name: 'Census Bureau / HUD — American Housing Survey (housing cost burden)',
      url: 'https://www.census.gov/programs-surveys/ahs.html',
      publisher: 'U.S. Census Bureau',
    },
    {
      name: 'National Association of Insurance Commissioners — Renters insurance',
      url: 'https://content.naic.org/consumer/renters-insurance.htm',
      publisher: 'NAIC',
    },
  ],

  replaces: [
    '/en/rental-deposit-months-return',
    '/en/rental-guarantee-insurance-monthly-cost',
    '/en/lease-comparison-2-vs-3-years',
    '/en/condo-fees-apartment-m2-category',
    '/en/eviction-timeline-attorney-fees',
    '/en/aumento-alquiler-trimestral-cuatrimestral-semestral',
    '/en/rental-contract-usd-pesification',
    '/en/moving-truck-cost-calculator',
  ],

lastReviewed: '2026-07-28',
};
