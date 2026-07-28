import type { HubData } from '../types';
import {
  CAPITAL_GAINS_2026,
  NIIT_2026,
  FEDERAL_BRACKETS_2026,
  VA_CAR_TAX_2026,
  MO_PROPERTY_TAX_2026,
} from '../../data/usa-2026';

/**
 * Decision hub EN/US — "What tax will I pay on this purchase or on my property?"
 *
 * Statutory constants come from src/lib/data/usa-2026.ts (capital gains brackets and
 * NIIT from IRS Rev. Proc. 2025-32; the Missouri 33⅓% assessment ratio from RSMo
 * 137.115; the Virginia PPTRA $20,000 relief cap). Nothing from memory.
 *
 * ⚠️ Sales tax rates, property tax levies and local vehicle rates are set by
 * thousands of separate jurisdictions and move every year. The state property tax
 * figures below are average EFFECTIVE rates for owner-occupied homes, useful for a
 * ballpark and useless for a bill — which is why every one of them can be overridden
 * with a custom rate, and why the sales tax rate is always a user input.
 *
 * Source formulas mirrored here:
 *   src/lib/formulas/sales-tax-calculator.ts
 *   src/lib/formulas/sales-tax-holiday-2026-savings-calculator.ts
 *   src/lib/formulas/property-tax-calculator-by-state-usa.ts
 *   src/lib/formulas/missouri-personal-property-tax-vehicle-calculator.ts
 *   src/lib/formulas/virginia-car-tax-personal-property-calculator.ts
 *   src/lib/formulas/capital-gains-tax-calculator-usa.ts
 */

/** YMYL disclaimer — copied verbatim from src/lib/disclaimers.ts, domain 'tax', language 'en'. */
export const DISCLAIMER_TAX =
  'Informational estimate based on the stated parameters. Rules and brackets may change; verify the relevant tax authority and consult a qualified tax professional for a final filing.';

export const CAPITAL_GAINS = CAPITAL_GAINS_2026;
export const NIIT = NIIT_2026;
export const BRACKETS = FEDERAL_BRACKETS_2026;
export const VA_CAR_TAX = VA_CAR_TAX_2026;
export const MO_PROPERTY_TAX = MO_PROPERTY_TAX_2026;

/**
 * Average effective property tax rate on owner-occupied housing, by state (%).
 * Mirrors STATE_RATES in src/lib/formulas/property-tax-calculator-by-state-usa.ts,
 * sourced from Tax Foundation / U.S. Census ACS. These are STATE AVERAGES: your
 * county and school district set the real levy, so treat them as a starting point.
 */
export const STATE_RATES: Record<string, number> = {
  AL: 0.43, AK: 1.07, AZ: 0.63, AR: 0.64, CA: 0.75, CO: 0.55, CT: 1.98, DE: 0.55,
  FL: 0.91, GA: 0.92, HI: 0.28, ID: 0.67, IL: 2.32, IN: 0.84, IA: 1.52, KS: 1.34,
  KY: 0.85, LA: 0.51, ME: 1.24, MD: 1.05, MA: 1.14, MI: 1.38, MN: 1.11, MS: 0.79,
  MO: 0.98, MT: 0.74, NE: 1.63, NV: 0.55, NH: 2.15, NJ: 2.38, NM: 0.73, NY: 1.64,
  NC: 0.80, ND: 0.98, OH: 1.53, OK: 0.90, OR: 0.93, PA: 1.49, RI: 1.40, SC: 0.57,
  SD: 1.17, TN: 0.67, TX: 1.68, UT: 0.57, VT: 1.83, VA: 0.82, WA: 0.87, WV: 0.57,
  WI: 1.61, WY: 0.61, DC: 0.57,
};

export const STATE_NAMES: Record<string, string> = {
  AL: 'Alabama', AK: 'Alaska', AZ: 'Arizona', AR: 'Arkansas', CA: 'California',
  CO: 'Colorado', CT: 'Connecticut', DE: 'Delaware', FL: 'Florida', GA: 'Georgia',
  HI: 'Hawaii', ID: 'Idaho', IL: 'Illinois', IN: 'Indiana', IA: 'Iowa', KS: 'Kansas',
  KY: 'Kentucky', LA: 'Louisiana', ME: 'Maine', MD: 'Maryland', MA: 'Massachusetts',
  MI: 'Michigan', MN: 'Minnesota', MS: 'Mississippi', MO: 'Missouri', MT: 'Montana',
  NE: 'Nebraska', NV: 'Nevada', NH: 'New Hampshire', NJ: 'New Jersey', NM: 'New Mexico',
  NY: 'New York', NC: 'North Carolina', ND: 'North Dakota', OH: 'Ohio', OK: 'Oklahoma',
  OR: 'Oregon', PA: 'Pennsylvania', RI: 'Rhode Island', SC: 'South Carolina',
  SD: 'South Dakota', TN: 'Tennessee', TX: 'Texas', UT: 'Utah', VT: 'Vermont',
  VA: 'Virginia', WA: 'Washington', WV: 'West Virginia', WI: 'Wisconsin', WY: 'Wyoming',
  DC: 'District of Columbia',
};

/** Approximate national average effective rate (%), same figure the old calc used. */
export const NATIONAL_AVG_RATE = 0.90;

const stateOptions = Object.keys(STATE_RATES)
  .sort((a, b) => STATE_NAMES[a].localeCompare(STATE_NAMES[b], 'en'))
  .map((code) => ({ value: code, label: `${STATE_NAMES[code]} — ${STATE_RATES[code]}% avg` }));
stateOptions.push({ value: 'CUSTOM', label: 'Use my own rate (from my tax bill)' });

export const hub: HubData = {
slug: 'en/money/sales-and-property-tax',
  title: 'Sales tax, property tax and capital gains: what will this actually cost?',
  description:
    'Add or back out sales tax on a purchase, estimate annual property tax on a home by state, work out a vehicle personal property tax bill in Missouri or Virginia, and calculate the capital gains tax on a sale.',
  silo: 'Money',
siloHref: '/en/money',
  locale: 'en',

  eyebrow: 'United States · sales, property and gains',
  h1: 'What tax will I pay on this purchase or on my property?',
  lede:
    'Four taxes that all arrive as a surprise: the sales tax added at the register, the property tax folded into your escrow, the personal property tax some states charge on your car, and the capital gains tax when you sell something for more than you paid. One calculator, one answer each.',
  stamps: [
    'Average effective property tax rates for all 50 states and DC',
    `Long-term capital gains bands 0% / 15% / 20% plus the ${(NIIT_2026.rate * 100).toFixed(1)}% NIIT`,
    '8 calculators inside',
  ],

  resultLabel: 'The tax you will pay',

  cases: {
    title: 'Which tax are you facing?',
    intro:
      'Sales tax is a percentage of a price, property tax is a rate against an assessed value, and capital gains tax is a percentage of a profit. Different bases, different answers.',
    items: [
      {
        id: 'purchase',
        label: 'Sales tax on something I am buying',
        hint: 'Add it, or back it out of a total',
        answer:
          'Sales tax is your combined state, county and city rate applied to the pre-tax price — and you can run it backwards from a tax-inclusive total.',
        yes: [
          'The pre-tax price and your combined state plus local rate',
          'The tax added, and the total you will pay',
          'The reverse: given a receipt total, the pre-tax price and the tax hidden inside it',
          'What a sales tax holiday would save on the same basket',
        ],
        warn: [
          DISCLAIMER_TAX,
          'The rate is a combination of state, county, city and sometimes special district levies. It changes street by street — use your exact address, not the state rate.',
          'What is taxable varies wildly by state: groceries, prescription drugs, clothing and services are exempt in some states and fully taxed in others.',
          'Sales tax holidays are set individually by each state, cover only listed categories, and usually carry per-item price caps. Check your state’s official list for the current year before counting on it.',
        ],
        plazo:
          'if you buy from out of state without paying sales tax, most states expect you to pay use tax at the same rate on your return.',
      },
      {
        id: 'home',
        label: 'Property tax on a home',
        hint: 'Annual bill and monthly escrow',
        answer:
          'Property tax is the assessed value times the local rate — nationally it averages around 1% of market value, but ranges from under 0.3% to over 2.3% by state.',
        yes: [
          'Your home value against the average effective rate for the state, or a rate you enter yourself',
          'The annual bill and the monthly amount your escrow will collect',
          'How your state compares with the national average',
          'The dollars per $1,000 of value, which is how a mill rate is usually quoted',
        ],
        warn: [
          DISCLAIMER_TAX,
          'These are STATE AVERAGES. The real bill comes from your county, city and school district, and neighbouring towns routinely differ by 50% or more.',
          'Many states assess at a fraction of market value and apply homestead exemptions, senior freezes or caps on annual increases — all of which cut the effective rate below the headline number.',
          'Buying a home often triggers a reassessment. The previous owner’s tax bill is not a reliable guide to yours.',
        ],
        plazo:
          'assessment appeal windows are short and strictly enforced — usually a few weeks after the notice is mailed.',
      },
      {
        id: 'vehicle',
        label: 'Personal property tax on a vehicle',
        hint: 'Missouri and Virginia',
        answer:
          'A handful of states tax you every year on the value of your car — Missouri assesses at 33⅓% of market value, Virginia taxes the assessed value with partial state relief.',
        yes: [
          `Missouri: assessed value at ${(MO_PROPERTY_TAX_2026.assessmentRatio * 100).toFixed(2).replace('.33', '⅓')}% of market value (RSMo 137.115), taxed at your district's combined levy per $100`,
          `Virginia: assessed value taxed at your locality's rate per $100, with PPTRA relief on the first $${VA_CAR_TAX_2026.pptraReliefCap.toLocaleString('en-US')} of value`,
          'The effective percentage of your car’s value that the tax represents',
        ],
        warn: [
          DISCLAIMER_TAX,
          'The levy or rate is set by your county, city and school district combined — the defaults here are examples, not your rate. Get the real figure from your county collector or commissioner of revenue.',
          'The Virginia PPTRA relief percentage is set annually by each locality and only applies to personal-use vehicles. Business vehicles get none.',
          'Missouri values from the January 1 vehicle guide, so a car you sold in February can still generate a bill for that year.',
        ],
        plazo:
          'Missouri personal property tax is due December 31; Virginia due dates are set locally and commonly fall in the summer and autumn.',
      },
      {
        id: 'gain',
        label: 'Capital gains tax on something I sold',
        hint: 'Short-term vs long-term',
        answer:
          'Held over a year, the gain is taxed at 0%, 15% or 20% stacked on your other income; held a year or less, it is taxed as ordinary income.',
        yes: [
          'Sale price minus cost basis, including commissions and improvements that raise the basis',
          `The long-term bands: 0% up to $${CAPITAL_GAINS_2026.single.zeroMax.toLocaleString('en-US')} of stacked taxable income for single filers, 15% to $${CAPITAL_GAINS_2026.single.fifteenMax.toLocaleString('en-US')}, 20% above`,
          `The ${(NIIT_2026.rate * 100).toFixed(1)}% Net Investment Income Tax above $${NIIT_2026.threshold.single.toLocaleString('en-US')} single or $${NIIT_2026.threshold.mfj.toLocaleString('en-US')} joint`,
          'Short-term treatment at your ordinary marginal rate',
        ],
        warn: [
          DISCLAIMER_TAX,
          'The one-year holding period is measured from the day after acquisition. Selling one day early moves the whole gain from the 15% band to your ordinary rate.',
          'Selling your main home has its own exclusion of gain, subject to ownership and use tests, and is not modelled here.',
          'State capital gains tax is on top and varies enormously — several states have none, others tax gains as ordinary income at high rates.',
          'Capital losses offset gains, and a limited amount of net loss can offset ordinary income each year with the rest carried forward.',
        ],
        plazo:
          'a gain is taxed in the year the sale settles, and a large one may require an estimated payment before filing to avoid an underpayment penalty.',
      },
    ],
  },

  inputsTitle: 'Your numbers',
  inputsIntro:
    'All amounts in U.S. dollars. Only the fields your case uses affect the result — the rest can stay as they are.',
  fields: [
    {
      id: 'purchase_amount',
      label: 'Purchase amount',
      type: 'number',
      prefix: '$',
      value: 1200,
      min: 0,
      step: 10,
      help: 'The pre-tax price, or the tax-inclusive total if you are backing the tax out.',
    },
    {
      id: 'sales_tax_rate',
      label: 'Combined sales tax rate',
      type: 'number',
      value: 8.25,
      min: 0,
      max: 20,
      step: 0.001,
      suffix: '%',
      help: 'State plus county plus city plus any special district. Look it up for your exact address.',
    },
    {
      id: 'tax_mode',
      label: 'What the amount above represents',
      type: 'select',
      value: 'add',
      options: [
        { value: 'add', label: 'A pre-tax price — add the tax' },
        { value: 'extract', label: 'A total with tax included — back the tax out' },
      ],
    },
    {
      id: 'holiday_share',
      label: 'Share of the basket covered by a tax holiday',
      type: 'number',
      value: 100,
      min: 0,
      max: 100,
      step: 5,
      suffix: '%',
      help: 'Tax holidays only exempt listed categories, usually with per-item price caps.',
    },
    {
      id: 'home_value',
      label: 'Home market value',
      type: 'number',
      prefix: '$',
      value: 350000,
      min: 0,
      step: 5000,
    },
    {
      id: 'state',
      label: 'State',
      type: 'select',
      value: 'TX',
      options: stateOptions,
      help: 'Average effective rate on owner-occupied homes. Pick "use my own rate" if you have the real one.',
    },
    {
      id: 'custom_rate',
      label: 'Your own property tax rate',
      type: 'number',
      value: 1.5,
      min: 0,
      max: 10,
      step: 0.01,
      suffix: '%',
      help: 'Only used when the state selector is set to "use my own rate".',
    },
    {
      id: 'vehicle_state',
      label: 'Vehicle tax state',
      type: 'select',
      value: 'MO',
      options: [
        { value: 'MO', label: 'Missouri (assessed at 33⅓% of market value)' },
        { value: 'VA', label: 'Virginia (assessed value with PPTRA relief)' },
      ],
    },
    {
      id: 'vehicle_value',
      label: 'Vehicle value',
      type: 'number',
      prefix: '$',
      value: 22000,
      min: 0,
      step: 500,
      help: 'Market value for Missouri; assessed value from your notice for Virginia.',
    },
    {
      id: 'vehicle_rate',
      label: 'Local rate or levy, per $100 of assessed value',
      type: 'number',
      prefix: '$',
      value: 4.57,
      min: 0,
      max: 20,
      step: 0.01,
      help: `Missouri combined levies commonly run around $${MO_PROPERTY_TAX_2026.defaultLevyPer100.toFixed(2)}; Virginia localities range from about $3.09 to $5.00.`,
    },
    {
      id: 'pptra_relief',
      label: 'Virginia PPTRA relief percentage',
      type: 'number',
      value: VA_CAR_TAX_2026.defaultReliefPct,
      min: 0,
      max: 100,
      step: 1,
      suffix: '%',
      help: `Set annually by each locality, applied to the first $${VA_CAR_TAX_2026.pptraReliefCap.toLocaleString('en-US')} of assessed value on personal-use vehicles.`,
    },
    {
      id: 'purchase_price',
      label: 'What you paid for the asset (cost basis)',
      type: 'number',
      prefix: '$',
      value: 40000,
      min: 0,
      step: 1000,
    },
    {
      id: 'sale_price',
      label: 'What you sold it for',
      type: 'number',
      prefix: '$',
      value: 65000,
      min: 0,
      step: 1000,
    },
    {
      id: 'other_costs',
      label: 'Commissions and improvements that raise the basis',
      type: 'number',
      prefix: '$',
      value: 2000,
      min: 0,
      step: 500,
    },
    {
      id: 'other_taxable_income',
      label: 'Your other taxable income',
      type: 'number',
      prefix: '$',
      value: 70000,
      min: 0,
      step: 1000,
      help: 'The gain stacks on top of this to decide which capital gains band applies.',
    },
    {
      id: 'holding',
      label: 'How long you held it',
      type: 'select',
      value: 'long',
      options: [
        { value: 'long', label: 'More than one year (long-term)' },
        { value: 'short', label: 'One year or less (short-term)' },
      ],
    },
    {
      id: 'filing_status',
      label: 'Filing status',
      type: 'select',
      value: 'single',
      options: [
        { value: 'single', label: 'Single' },
        { value: 'mfj', label: 'Married filing jointly' },
        { value: 'mfs', label: 'Married filing separately' },
        { value: 'hoh', label: 'Head of household' },
      ],
    },
  ],
  fineprint: DISCLAIMER_TAX,

  chart: {
    type: 'donut',
    title: 'Tax versus what you keep',
    caption:
      'Shows the split between the amount that is yours and the amount the tax takes: pre-tax price versus sales tax, home value versus the annual bill, or the after-tax gain versus the tax on it.',
  },
  breakdownTitle: 'How the bill is built',
  breakdownIntro:
    'The assessed base, the rate applied, and every reduction — so you can check it against a receipt, an assessment notice or a Schedule D.',

  faq: [
    {
      q: 'How do I calculate sales tax?',
      a: 'Multiply the pre-tax price by the combined rate expressed as a decimal: $1,200 at 8.25% is $1,200 × 0.0825 = $99, for a total of $1,299. To go the other way — from a receipt total back to the pre-tax price — divide rather than subtract: $1,299 ÷ 1.0825 = $1,200, and the difference is the tax. Subtracting 8.25% from the total is the classic mistake and gives the wrong answer every time.',
    },
    {
      q: 'Why is my sales tax rate different from the state rate?',
      a: 'Because most of the United States layers local taxes on top. A state might levy 6.25% while your county adds 1% and your city another 1%, giving a combined 8.25%. Rates change at municipal and even special-district boundaries, which is why online sellers use address-level lookups rather than state tables. Five states — Alaska, Delaware, Montana, New Hampshire and Oregon — have no statewide sales tax at all, though some Alaskan localities levy their own.',
    },
    {
      q: 'How do sales tax holidays work?',
      a: 'A state suspends sales tax on specific categories for a few days, most commonly back-to-school clothing, school supplies and computers in late July and August, and sometimes emergency preparedness or energy-efficient appliances at other times of year. Each state sets its own dates, its own list of qualifying items and its own per-item price caps — a $120 cap on clothing means a $150 jacket is taxed on the full amount, not just the excess. Check the official list published by your state department of revenue for the current year, because both dates and categories change.',
    },
    {
      q: 'How is property tax on a home calculated?',
      a: 'The assessor sets a value for your property, the taxing districts set rates, and the bill is the assessed value multiplied by the combined rate. Rates are often quoted as mills — dollars per $1,000 of value — so 15 mills is 1.5%. The effective rate people quote is the bill divided by market value, which is lower than the nominal rate wherever the state assesses at a fraction of market value.',
    },
    {
      q: 'Which states have the highest and lowest property taxes?',
      a: `On average effective rates for owner-occupied homes, New Jersey (${STATE_RATES.NJ}%), Illinois (${STATE_RATES.IL}%) and New Hampshire (${STATE_RATES.NH}%) sit at the top, while Hawaii (${STATE_RATES.HI}%), Alabama (${STATE_RATES.AL}%) and Louisiana (${STATE_RATES.LA}%) are at the bottom. The national average is around ${NATIONAL_AVG_RATE}%. Be careful drawing conclusions: Hawaii's low rate applies to very high home values, and states with no income tax often lean harder on property tax to compensate.`,
    },
    {
      q: 'Why do I pay property tax on my car?',
      a: 'A minority of states levy an annual personal property tax on vehicles in addition to registration fees. Missouri, Virginia, Connecticut, Rhode Island, South Carolina and a few others do; most states do not. In Missouri, statute sets the assessed value at 33⅓% of market value and the local districts set a combined levy per $100 of that assessed value. Virginia taxes the assessed value at a rate set by each city or county, and the state then subsidises part of the bill on personal-use vehicles.',
    },
    {
      q: 'What is Virginia’s PPTRA relief?',
      a: `Under the Personal Property Tax Relief Act, Virginia reimburses localities so that a percentage of the tax on the first $${VA_CAR_TAX_2026.pptraReliefCap.toLocaleString('en-US')} of assessed value on a qualifying personal-use vehicle is not charged to you. The percentage is set each year by each locality out of a fixed pot of state money, so it drifts down as vehicle values rise — it has ranged from the high twenties to around 50% in recent years depending on where you live. Value above the cap gets no relief, and business-use vehicles get none at all.`,
    },
    {
      q: 'What is the difference between short-term and long-term capital gains?',
      a: `Hold an asset more than one year and the gain qualifies for the preferential long-term rates of 0%, 15% or 20%, applied to the gain stacked on top of your other taxable income. Hold it a year or less and the gain is taxed as ordinary income at your marginal rate, which can be as high as ${(FEDERAL_BRACKETS_2026.single[6][1] * 100).toFixed(0)}%. The holding period runs from the day after you acquired the asset through the day you sold it, so timing a sale around that anniversary can be worth a large amount of money.`,
    },
    {
      q: 'Can I really pay 0% capital gains tax?',
      a: `Yes. For tax year 2026 the 0% band covers long-term gains stacked up to $${CAPITAL_GAINS_2026.single.zeroMax.toLocaleString('en-US')} of taxable income for single filers and $${CAPITAL_GAINS_2026.mfj.zeroMax.toLocaleString('en-US')} filing jointly. Because the band is measured on taxable income — after the standard deduction — a retired couple with modest income can realise a meaningful long-term gain and owe no federal capital gains tax at all. Note that the gain itself counts toward the stack, so only the portion sitting below the threshold gets the 0% rate.`,
    },
    {
      q: 'What is the Net Investment Income Tax?',
      a: `An additional ${(NIIT_2026.rate * 100).toFixed(1)}% on the lesser of your net investment income and the amount by which your modified adjusted gross income exceeds $${NIIT_2026.threshold.single.toLocaleString('en-US')} single or head of household, $${NIIT_2026.threshold.mfj.toLocaleString('en-US')} married filing jointly, or $${NIIT_2026.threshold.mfs.toLocaleString('en-US')} married filing separately. It applies on top of the capital gains rate, which is how a 20% headline rate becomes an effective 23.8% for high earners. The thresholds are not indexed for inflation, so more filers cross them every year.`,
    },
    {
      q: 'How do I work out my cost basis?',
      a: 'Start with what you paid, then add purchase commissions, and for real estate add capital improvements — a new roof or an addition, not repainting. Subtract any depreciation you claimed. The result is your adjusted basis, and the gain is the sale price minus that basis minus selling costs. Poor basis records are the single most common reason people overpay capital gains tax: without documentation you may end up treating the entire sale proceeds as gain.',
    },
    {
      q: 'What happens if I sell at a loss?',
      a: 'Capital losses first offset capital gains of the same type, then the other type. If losses still exceed gains, up to $3,000 of net loss can offset ordinary income in a year ($1,500 if married filing separately), and anything left carries forward indefinitely to future years. The wash sale rule blocks the deduction if you buy a substantially identical security within 30 days before or after the sale — the disallowed loss is added to the basis of the replacement.',
    },
  ],

  sources: [
    {
      name: 'IRS — Topic no. 409, Capital gains and losses',
      url: 'https://www.irs.gov/taxtopics/tc409',
      publisher: 'Internal Revenue Service',
    },
    {
      name: 'IRS Revenue Procedure 2025-32 — 2026 inflation adjustments, including capital gains thresholds',
      url: 'https://www.irs.gov/newsroom/irs-releases-tax-inflation-adjustments-for-tax-year-2026-including-amendments-from-the-one-big-beautiful-bill',
      publisher: 'Internal Revenue Service',
    },
    {
      name: 'IRS — Questions and answers on the Net Investment Income Tax',
      url: 'https://www.irs.gov/newsroom/questions-and-answers-on-the-net-investment-income-tax',
      publisher: 'Internal Revenue Service',
    },
    {
      name: 'Tax Foundation — How high are property taxes in your state?',
      url: 'https://taxfoundation.org/data/all/state/property-taxes-by-state-county/',
      publisher: 'Tax Foundation',
    },
    {
      name: 'Tax Foundation — State and local sales tax rates',
      url: 'https://taxfoundation.org/data/all/state/2025-sales-taxes/',
      publisher: 'Tax Foundation',
    },
    {
      name: 'Missouri Revised Statutes §137.115 — assessment of personal property',
      url: 'https://revisor.mo.gov/main/OneSection.aspx?section=137.115',
      publisher: 'Missouri Revisor of Statutes',
    },
    {
      name: 'Virginia Department of Motor Vehicles / Tax — Personal Property Tax Relief Act',
      url: 'https://www.tax.virginia.gov/personal-property-tax-relief-act',
      publisher: 'Virginia Department of Taxation',
    },
    {
      name: 'U.S. Census Bureau — American Community Survey, real estate taxes paid',
      url: 'https://www.census.gov/programs-surveys/acs',
      publisher: 'U.S. Census Bureau',
    },
  ],

  replaces: [
    '/en/sales-tax-calculator',
    '/en/sales-tax-holiday-2026-savings-calculator',
    '/en/property-tax-calculator-by-state-usa',
    '/en/missouri-personal-property-tax-vehicle-calculator',
    '/en/virginia-car-tax-personal-property-calculator',
    '/en/capital-gains-tax-calculator-usa',
    '/en/cedular-investment-income-tax',
    '/en/iva-refund-debit-card',
  ],

lastReviewed: '2026-07-28',
};
