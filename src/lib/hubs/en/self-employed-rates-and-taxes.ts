import type { HubData } from '../types';

/**
 * Hub EN — "What do I charge, and what do I actually keep?"
 *
 * Absorbe 3 calculadoras sueltas del mercado de EE.UU.:
 *  - /en/freelance-hourly-rate-calculator  (freelance-hourly-rate-calculator.ts)
 *  - /en/side-hustle-tax-savings-calculator (side-hustle-tax-savings-calculator.ts)
 *  - /en/meeting-cost-calculator            (reuniones-costo-tiempo-personas-empresa.ts)
 *
 * Constantes espejadas de las fórmulas vivas, con dos correcciones documentadas:
 *  1. SS_WAGE_BASE: la fórmula vieja usaba 176.100 rotulado "2026". Ése es el tope
 *     de 2025. El tope de 2026 anunciado por la SSA es 184.500. Se corrige y se
 *     deja el campo editable.
 *  2. La fórmula de tarifa freelance ofrecía "brackets" de 25/28/30/33% citando
 *     IRS Pub. 505. Esos porcentajes NO son tramos del IRS. Acá el porcentaje es
 *     un campo libre rotulado como "reserva total para impuestos", sin cita falsa.
 */

/** Social Security: tope de base imponible 2026 (SSA, Fact Sheet oct-2025). Editable. */
export const SS_WAGE_BASE = 184500;

/** Tasas de self-employment tax (IRC §1401 / Schedule SE). */
export const SS_RATE = 0.124;
export const MEDICARE_RATE = 0.029;
export const SE_TAX_RATE = SS_RATE + MEDICARE_RATE;

/** Schedule SE: la base imponible es el 92,35% de la ganancia neta. */
export const SE_MULTIPLIER = 0.9235;

/** Umbral de ganancia neta a partir del cual se debe SE tax (IRS, Schedule SE). */
export const SE_FILING_THRESHOLD = 400;

/** Deducción QBI del 20% (IRC §199A). */
export const QBI_RATE = 0.2;

/** Horas de un día facturable estándar, como lo asume la fórmula de tarifa. */
export const BILLABLE_DAY_HOURS = 8;

/** Horas trabajadas al mes que usa la fórmula de costo de reunión (176 = 44 sem × 4). */
export const MONTHLY_WORK_HOURS = 176;

/** Horas anuales de un empleo de tiempo completo en EE.UU. (40 h × 52 sem). */
export const FULLTIME_YEAR_HOURS = 2080;

const MONEY_DISCLAIMER =
  'Informational estimate, not tax advice. It models federal self-employment tax, a flat marginal federal bracket and a flat state rate on one stream of self-employment income. It does not model your full return, other income, itemized deductions, credits, local income tax, QBI phase-outs or the additional 0.9% Medicare tax on high earners. Confirm with a CPA or an enrolled agent before you file or set aside money.';

export const hub: HubData = {
  slug: 'en/money/self-employed-rates-and-taxes',
  title: 'Freelance Rate & Side-Hustle Tax Calculator: what to charge and what you keep',
  description:
    'Work out the minimum hourly rate that actually pays your target income, how much self-employment, federal and state tax a side hustle owes, what to send in each quarter, and what an hour-long meeting costs in labor.',
  silo: 'Money',
  siloHref: '/en/money',
  locale: 'en',

  eyebrow: 'Self-employed money',
  h1: 'What do I charge, and what do I actually keep?',
  lede:
    'Working for yourself breaks the two numbers an employee never has to think about. Your rate is not your salary divided by 2,080 — it has to carry unbillable hours, business expenses and the employer half of payroll tax. And your profit is not your income — self-employment tax lands before the first dollar of income tax does. This hub does the rate, the tax bill, the quarterly payment and the cost of the meetings eating your billable day.',
  stamps: [
    'Self-employment tax at ' + (SE_TAX_RATE * 100).toFixed(1) + '% on ' + (SE_MULTIPLIER * 100).toFixed(2) + '% of net profit (Schedule SE)',
    'Social Security capped at the $' + SS_WAGE_BASE.toLocaleString('en-US') + ' wage base; Medicare uncapped',
    'Quarterly estimates on Form 1040-ES',
    'Replaces 3 single-purpose calculators',
  ],

  resultLabel: 'Your number',

  cases: {
    title: 'Which one do you need?',
    intro: 'Pick the question. Only the fields that case reads are used.',
    items: [
      {
        id: 'rate',
        label: 'The minimum hourly rate I can charge',
        hint: 'Target take-home plus expenses plus tax, divided by the hours you can actually bill.',
        yes: [
          'The gross revenue you have to bill to land on your target take-home',
          'That figure divided by real billable hours — your floor rate',
          'The same rate as a day rate, a week and a month',
        ],
        warn: [
          MONEY_DISCLAIMER,
          'Billable hours are the number that sinks most freelance rates. A 40-hour week is not 40 billable hours: sales, admin, invoicing, unpaid revisions and dead time between projects routinely take a third of it. If you plug in 40, you will underprice yourself by roughly half.',
          'Weeks worked is the other trap. Employees get paid holidays, sick days and vacation; you do not. Charging as if you bill 52 weeks means every week off comes out of the rate you already set.',
          'The tax reserve percentage here is your own estimate of everything you set aside — self-employment tax plus federal plus state. Run the side-hustle case below to get a grounded number instead of a guess.',
          'This is a floor, not a price. It is what you cannot go below without working at a loss. What the work is worth to the client is a separate conversation, and usually a larger number.',
        ],
        plazo: 'Recalculate the rate every time your expenses or your billable share change — and at minimum once a year, before you quote the first job of the new year.',
        answer:
          'Gross revenue needed = (target take-home + business expenses) ÷ (1 − tax reserve). Floor hourly rate = gross revenue ÷ (billable hours per week × weeks worked).',
      },
      {
        id: 'tax',
        label: 'What a side hustle owes in tax',
        hint: 'Self-employment tax, federal income tax, state tax, what you keep and the quarterly payment.',
        yes: [
          'Net profit after business expenses (Schedule C)',
          'Self-employment tax at ' + (SE_TAX_RATE * 100).toFixed(1) + '%, with Social Security capped at the wage base',
          'Federal income tax on the side income after the half-SE deduction and QBI',
          'State income tax, what you keep and the Form 1040-ES quarterly payment',
        ],
        warn: [
          MONEY_DISCLAIMER,
          'Self-employment tax is the part that surprises people. It is ' + (SE_TAX_RATE * 100).toFixed(1) + '% — both halves of Social Security and Medicare — and it applies to profit, before any income tax and regardless of how small your income tax bill is.',
          'Below $' + SE_FILING_THRESHOLD + ' of net profit no self-employment tax is owed, but the income still belongs on Schedule C.',
          'If you also have a W-2 job, the Social Security portion is capped across both together at the $' + SS_WAGE_BASE.toLocaleString('en-US') + ' wage base — wages count first. This estimate treats the side hustle in isolation, so it can overstate the SS portion for high W-2 earners. Medicare is never capped.',
          'The federal figure applies one marginal bracket to the whole taxable side income. Real returns stack side income on top of everything else and can straddle two brackets, so pick the bracket the last dollar of this income lands in, not your average rate.',
          'QBI (IRC §199A) is modelled as a flat 20% of profit minus the half-SE deduction. Real eligibility phases out at higher incomes and is restricted for specified service trades — treat it as an optimistic case, not a certainty.',
          'The nine states with no broad income tax should use 0%. Flat-rate states can use their headline rate; graduated states are approximations.',
        ],
        plazo: 'Estimated payments are due roughly April 15, June 15, September 15 and January 15. Underpay by enough and the IRS adds a penalty even if you settle up in April.',
        answer:
          'SE tax = net profit × ' + SE_MULTIPLIER + ' × ' + (SE_TAX_RATE * 100).toFixed(1) + '% (SS capped at $' + SS_WAGE_BASE.toLocaleString('en-US') + '). Federal = (profit − half SE tax − QBI) × bracket. State = profit × state rate. Quarterly = total ÷ 4.',
      },
      {
        id: 'meeting',
        label: 'What this meeting costs',
        hint: 'Headcount times duration times loaded hourly rate — the number nobody puts on the invite.',
        yes: [
          'The labor cost of one meeting at the attendees you listed',
          'Cost per attendee and cost per minute',
          'What the same meeting costs repeated weekly for a year',
        ],
        warn: [
          'This counts salary only. Loaded cost — payroll tax, benefits, equipment, office — typically runs 1.25 to 1.4 times base pay, so the real number is higher than the one shown here.',
          'It also ignores the switching cost. A meeting dropped into the middle of an afternoon does not cost its own length; it costs its length plus the focus block it broke in half on either side.',
          'The point of the figure is not to ban meetings. It is to make the comparison explicit: a recurring 30-minute status call with eight people is a standing line item, and it should clear the same bar as any other recurring expense.',
          'Hourly rate here is monthly salary ÷ ' + MONTHLY_WORK_HOURS + ' hours. If you think in annual salary, an equivalent figure is annual ÷ ' + FULLTIME_YEAR_HOURS.toLocaleString('en-US') + '.',
        ],
        plazo: 'Audit recurring meetings once a quarter. A standing invite nobody has questioned in a year is the single most reliable place to find the cost back.',
        answer:
          'Meeting cost = attendees × (duration in minutes ÷ 60) × (monthly salary ÷ ' + MONTHLY_WORK_HOURS + ').',
      },
    ],
  },

  inputsTitle: 'Your numbers',
  inputsIntro: 'Fill in what the case you picked needs — the rest is ignored.',
  fields: [
    { id: 'target', label: 'Target annual take-home', type: 'number', value: 80000, prefix: '$', min: 0, step: 1000, thousands: true },
    { id: 'expenses', label: 'Annual business expenses', type: 'number', value: 12000, prefix: '$', min: 0, step: 500, thousands: true, help: 'Software, insurance, equipment, accounting, coworking — everything the business pays for.' },
    { id: 'billable', label: 'Hours you can actually bill per week', type: 'number', value: 25, suffix: 'h/wk', min: 1, max: 80, step: 1, help: 'Not hours worked. Hours a client pays for.' },
    { id: 'weeks', label: 'Weeks you work per year', type: 'number', value: 46, suffix: 'weeks', min: 1, max: 52, step: 1, help: 'Subtract vacation, holidays and sick days — nobody pays you for them.' },
    { id: 'reserve', label: 'Total tax reserve', type: 'number', value: 30, suffix: '%', min: 0, max: 90, step: 1, help: 'Everything you set aside: SE tax + federal + state. Run the tax case to ground this number.' },
    { id: 'gross', label: 'Side-hustle gross income', type: 'number', value: 30000, prefix: '$', min: 0, step: 500, thousands: true },
    { id: 'bizexp', label: 'Side-hustle business expenses', type: 'number', value: 5000, prefix: '$', min: 0, step: 250, thousands: true },
    {
      id: 'bracket',
      label: 'Your marginal federal bracket',
      type: 'select',
      value: '22',
      options: [
        { value: '10', label: '10%' },
        { value: '12', label: '12%' },
        { value: '22', label: '22%' },
        { value: '24', label: '24%' },
        { value: '32', label: '32%' },
        { value: '35', label: '35%' },
        { value: '37', label: '37%' },
      ],
      help: 'The bracket the last dollar of this income lands in — not your average rate.',
    },
    { id: 'staterate', label: 'State income tax rate', type: 'number', value: 5, suffix: '%', min: 0, max: 15, step: 0.1, help: 'Use 0% in AK, FL, NV, NH, SD, TN, TX, WA and WY.' },
    {
      id: 'qbi',
      label: 'Claim the 20% QBI deduction?',
      type: 'select',
      value: 'yes',
      options: [
        { value: 'yes', label: 'Yes — I expect to qualify' },
        { value: 'no', label: 'No / not sure' },
      ],
    },
    { id: 'wagebase', label: 'Social Security wage base', type: 'number', value: SS_WAGE_BASE, prefix: '$', min: 0, step: 100, thousands: true, help: 'SSA sets this every October. Check the current year before relying on the cap.' },
    { id: 'people', label: 'People in the meeting', type: 'number', value: 8, min: 1, max: 200, step: 1 },
    { id: 'minutes', label: 'Meeting length', type: 'number', value: 60, suffix: 'min', min: 5, max: 600, step: 5 },
    { id: 'salary', label: 'Average monthly salary of an attendee', type: 'number', value: 7000, prefix: '$', min: 0, step: 250, thousands: true },
  ],
  fineprint: MONEY_DISCLAIMER,

  chart: {
    type: 'donut',
    title: 'How the money splits',
    caption:
      'What the total is made of: the revenue you bill split into take-home, expenses and tax reserve, or the profit split into what you keep and each tax that takes a piece.',
  },

  breakdownTitle: 'Line by line',
  breakdownIntro:
    'Self-employment tax is calculated first, on 92.35% of net profit, because half of it then becomes a deduction that shrinks the income the federal bracket applies to. Doing it in the other order overstates the federal number.',

  faq: [
    {
      q: 'How do I set a freelance hourly rate?',
      a: 'Start from the total you need to bill, not from what you used to earn. Add your target take-home and your annual business expenses, divide by one minus your total tax reserve, and divide that by the hours you genuinely bill in a year. The figure that comes out is a floor: below it you are subsidising the client. What to charge above the floor is a question about value and market, not arithmetic.',
    },
    {
      q: 'Why is my freelance rate so much higher than my old salary per hour?',
      a: 'Because an employee’s hourly cost to a company is far more than the salary line. As a freelancer you carry the employer half of payroll tax, health insurance, paid time off, equipment, software, sick days, retirement contributions and every unbillable hour. A rough sanity check that has survived decades: a defensible freelance rate is often two to three times the raw hourly equivalent of the salary you would accept for the same work.',
    },
    {
      q: 'How many hours a week can I actually bill?',
      a: 'For most solo freelancers, 20 to 30 out of a 40-hour week. The rest goes to finding work, quoting, invoicing, chasing payment, admin and the gaps between projects. Agencies plan around 60 to 75% utilisation for exactly this reason. If your rate assumes 40 billable hours, the first quiet month reveals the error.',
    },
    {
      q: 'What is self-employment tax and why is it ' + (SE_TAX_RATE * 100).toFixed(1) + '%?',
      a: 'It is Social Security and Medicare for people without an employer. An employee pays 7.65% and the employer pays a matching 7.65%; self-employed, you are both, so you pay ' + (SE_TAX_RATE * 100).toFixed(1) + '%. It is charged on 92.35% of net profit, which approximates the employer-side deduction an employee never sees, and half of what you pay is then deductible against income tax.',
    },
    {
      q: 'Is there an income level where Social Security tax stops?',
      a: 'Yes for Social Security, no for Medicare. The 12.4% Social Security portion only applies up to the annual wage base, set by the Social Security Administration each October — this hub defaults to $' + SS_WAGE_BASE.toLocaleString('en-US') + ' and leaves it editable. The 2.9% Medicare portion has no ceiling, and higher earners owe an additional 0.9% Medicare surtax that this estimate does not model.',
    },
    {
      q: 'Do I owe tax on a side hustle that made almost nothing?',
      a: 'Self-employment tax kicks in at $' + SE_FILING_THRESHOLD + ' of net profit. Below that, no SE tax is owed — but the income still gets reported on Schedule C, and it can still be subject to income tax as part of your overall return. "I did not get a 1099" is not the test; income is reportable whether or not a form arrives.',
    },
    {
      q: 'How much should I set aside from each payment?',
      a: 'A common working rule is 25 to 35% of profit, and the tax case here replaces the rule with your actual numbers. Move it out of the operating account the day the payment clears rather than at quarter end. The failure mode is never the calculation — it is spending money in March that belonged to the IRS in January.',
    },
    {
      q: 'When are quarterly estimated taxes due?',
      a: 'Roughly April 15, June 15, September 15 and the following January 15, on Form 1040-ES. They are not optional for most self-employed people: underpay through the year and a penalty is added even if you pay the full balance by the April deadline. Safe-harbour rules — paying 100% or 110% of last year’s total tax — are the usual way to avoid it when this year’s income is unpredictable.',
    },
    {
      q: 'What is the QBI deduction and do I get it?',
      a: 'IRC §199A lets many pass-through businesses deduct up to 20% of qualified business income. This estimate applies a flat 20% of profit minus the half-SE deduction when you select it. Real eligibility is narrower: it phases out above income thresholds and is restricted for specified service trades such as health, law, accounting and consulting. Treat the result as the optimistic case and confirm eligibility before you count on it.',
    },
    {
      q: 'Which states have no income tax?',
      a: 'Alaska, Florida, Nevada, New Hampshire, South Dakota, Tennessee, Texas, Washington and Wyoming levy no broad tax on earned income — enter 0% for the state rate. Note that this only covers state income tax. City and county income taxes exist in several states, and none of them are modelled here.',
    },
    {
      q: 'How much does a meeting really cost?',
      a: 'Multiply headcount by duration by loaded hourly cost. An hour with eight people whose salaries average $7,000 a month is roughly $320 of labour at base pay, and closer to $400 once benefits and overhead are loaded in. Repeated weekly, that is a five-figure annual line item that never appears in any budget review.',
    },
    {
      q: 'Should I bill for meetings with clients?',
      a: 'If the meeting is work — discovery, review, direction, decisions — it is billable and belongs in your billable-hours count. If it is sales, it is an unbillable cost of doing business and belongs in the gap between hours worked and hours billed. Being clear about which is which is what keeps the rate calculation honest.',
    },
  ],

  sources: [
    { name: 'Self-Employment Tax (Social Security and Medicare Taxes)', url: 'https://www.irs.gov/businesses/small-businesses-self-employed/self-employment-tax-social-security-and-medicare-taxes', publisher: 'Internal Revenue Service' },
    { name: 'Schedule SE (Form 1040), Self-Employment Tax — instructions', url: 'https://www.irs.gov/forms-pubs/about-schedule-se-form-1040', publisher: 'Internal Revenue Service' },
    { name: 'Form 1040-ES, Estimated Tax for Individuals', url: 'https://www.irs.gov/forms-pubs/about-form-1040-es', publisher: 'Internal Revenue Service' },
    { name: 'Qualified Business Income Deduction (Section 199A)', url: 'https://www.irs.gov/newsroom/qualified-business-income-deduction', publisher: 'Internal Revenue Service' },
    { name: 'Contribution and Benefit Base — annual Social Security wage base', url: 'https://www.ssa.gov/oact/cola/cbb.html', publisher: 'Social Security Administration' },
    { name: 'Employer Costs for Employee Compensation — benefits as a share of total compensation', url: 'https://www.bls.gov/news.release/ecec.toc.htm', publisher: 'US Bureau of Labor Statistics' },
  ],

  replaces: [
    '/en/freelance-hourly-rate-calculator',
    '/en/side-hustle-tax-savings-calculator',
    '/en/meeting-cost-calculator',
  ],

  lastReviewed: '2026-07-28',
};
