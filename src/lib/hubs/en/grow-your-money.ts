import type { HubData } from '../types';

/**
 * Decision hub EN — "How much will this money be worth, and how should I allocate it?"
 *
 * Absorbs 22 loose calculators covering three related questions: what a sum
 * grows to (compound interest, rule of 72, ROI, NPV, inflation, money-market
 * yield), how much cash you should hold before investing (emergency fund, net
 * worth), and how a portfolio should be split and sized (three-fund, 60/40,
 * Sharpe, position sizing, P/E, bond pricing and duration).
 *
 * MATH: the growth engine mirrors src/lib/formulas/compound-interest-calculator.ts
 * exactly — interest compounds on the existing balance first, then the period
 * contribution is added (ordinary annuity). Bond price and Macaulay/modified
 * duration are the standard textbook formulas. Nothing is hardcoded from memory:
 * every rate, yield and expected return is an editable field, because they change
 * daily and a baked-in number would be wrong on publication day.
 */

/** YMYL disclaimer — verbatim from src/lib/disclaimers.ts, COPY.en, domain 'investment'. */
const DISCLAIMER =
  'Educational tool, not investment advice or a recommendation. Returns and capital can fluctuate or be lost; verify costs and risks with an authorized provider or adviser.';

/** Compounding periods per year, matching the live formula's FREQ_MAP. */
export const FREQ = { annually: 1, quarterly: 4, monthly: 12, daily: 365 };

/** The Rule of 72 constant, and the more accurate 69.3 (ln 2 × 100) for continuous compounding. */
export const RULE = { of72: 72, exact: 69.3 };

/** Emergency-fund guidance in months of essential expenses, by job stability. */
export const EMERGENCY_MONTHS = { stable: 3, typical: 6, variable: 12 };

export const hub: HubData = {
slug: 'en/money/grow-your-money',
  title: 'Compound interest, ROI and portfolio allocation calculator',
  description:
    'See what a lump sum or a monthly contribution grows to, how long it takes to double, what a return is worth after inflation, how big an emergency fund you need, and how to split and size a portfolio — with Sharpe ratio, position sizing and bond duration.',
  silo: 'Money',
siloHref: '/en/money',
locale: 'en',

  eyebrow: 'Saving and investing',
  h1: 'How much will this money be worth, and how should I split it?',
  lede:
    'Compounding is the whole game, and the two things that decide it are time and the rate you actually keep after fees and inflation. Enter what you have and what you add, and you get the ending balance, how much of it is growth you never deposited, what it is worth in today’s money, and how the position should be sized against the rest of what you own.',
  stamps: ['Reviewed 27-07-2026', 'Ordinary-annuity compounding · standard bond math', '22 calculators inside'],

  resultLabel: 'What it grows to',

  cases: {
    title: 'My situation is different',
    intro:
      'Growing a lump sum, drip-feeding contributions, and deciding how to split a portfolio are three separate calculations. Pick yours.',
    items: [
      {
        id: 'lump',
        label: 'I have a lump sum',
        hint: 'One amount, left to grow.',
        yes: [
          'Ending balance at your rate and horizon, at the compounding frequency you choose',
          'How much of the final balance is growth you never deposited',
          'The doubling time from the Rule of 72, and the exact figure alongside it',
          'What the balance is worth in today’s money after inflation',
        ],
        warn: [
          DISCLAIMER,
          'Nominal returns flatter badly: at 3% inflation, a 7% return is about 3.9% in real terms, not 4%',
          'Fees compound against you exactly the way returns compound for you — a 1% annual fee costs roughly a fifth of a 30-year balance',
          'Past average returns are not a rate you are entitled to; sequence of returns matters enormously if you are drawing down',
        ],
        plazo: 'compounding is back-loaded — the last decade of a 30-year run typically produces more growth than the first two combined.',
        answer:
          'Interest compounds on the balance each period. Time matters more than rate: doubling the horizon beats adding a point of return.',
      },
      {
        id: 'monthly',
        label: 'I add money every month',
        hint: 'Regular contributions on top.',
        yes: [
          'Ending balance from the starting amount plus every contribution',
          'Total contributed against total growth',
          'What the same plan is worth in today’s money',
          'The share of the final balance that came from growth rather than deposits',
        ],
        warn: [
          DISCLAIMER,
          'This assumes contributions land at the end of each period; contributing at the start raises the result slightly',
          'A constant monthly amount loses purchasing power over decades — the plan needs indexing to inflation to keep its real value',
          'Missing contributions early costs far more than missing them late, because they had the longest to compound',
        ],
        plazo: 'increase the contribution with every pay rise: the increase compounds, the intention does not.',
        answer:
          'Regular contributions dominate early and compounding dominates late. The crossover is usually somewhere between year 12 and year 20.',
      },
      {
        id: 'cash',
        label: 'How much cash should I hold first?',
        hint: 'Emergency fund and net worth.',
        yes: [
          'Months of essential expenses covered by what you have now',
          'The target for your job stability: 3, 6 or 12 months',
          'The gap, and how long it takes to close at your savings rate',
          'Your net worth, so the fund is sized against the whole picture',
        ],
        warn: [
          DISCLAIMER,
          'Size the fund on essential expenses, not on income — rent, food, utilities, insurance, minimum debt payments',
          'It should sit somewhere boring and instantly accessible; a high-yield savings account or money-market fund, not the market',
          'Paying off high-interest debt usually beats over-funding the emergency account past about three months',
        ],
        plazo: 'build to one month first, then clear high-interest debt, then finish the fund — that order costs the least.',
        answer:
          'Three months of essential expenses if your income is stable, six for most people, twelve if it is variable or you are self-employed.',
      },
      {
        id: 'portfolio',
        label: 'How should I split and size it?',
        hint: 'Allocation, position sizing and risk.',
        yes: [
          'The dollar split of a three-fund or 60/40 style allocation across your total',
          'Position size from the percentage of capital you are willing to risk',
          'Sharpe ratio: return per unit of volatility, which is what makes two returns comparable',
          'What a P/E multiple implies, and how bond duration translates a rate move into a price move',
        ],
        warn: [
          DISCLAIMER,
          'Allocation percentages are a framework, not advice — the right split depends on horizon, income stability and what you can hold through a drawdown',
          'A Sharpe ratio computed on a short or cherry-picked window says nothing; it needs years of data and an honest start date',
          'Modified duration is a first-order approximation: it understates the price move on large rate changes because it ignores convexity',
        ],
        plazo: 'rebalance on a band (say 5 percentage points off target) rather than on a calendar — it trades less and works better.',
        answer:
          'Decide the split first, size positions by the capital you are willing to lose, and compare options on risk-adjusted return rather than raw return.',
      },
    ],
  },

  inputsTitle: 'Your numbers',
  inputsIntro:
    'Rates and yields are all inputs — none of them are stable enough to hardcode. Fill in what applies to the case you picked.',
  fields: [
    { id: 'principal', label: 'Starting amount', type: 'number', prefix: '$', min: 0, max: 100000000, step: 100, value: 10000 },
    { id: 'contribution', label: 'Monthly contribution', type: 'number', prefix: '$', min: 0, max: 1000000, step: 25, value: 500 },
    { id: 'rate', label: 'Expected annual return', type: 'number', suffix: '%', min: -20, max: 60, step: 0.1, value: 7 },
    { id: 'years', label: 'Time horizon', type: 'number', suffix: 'years', min: 1, max: 70, step: 1, value: 20 },
    {
      id: 'frequency',
      label: 'Compounding frequency',
      type: 'select',
      value: 'monthly',
      options: [
        { value: 'annually', label: 'Annually' },
        { value: 'quarterly', label: 'Quarterly' },
        { value: 'monthly', label: 'Monthly' },
        { value: 'daily', label: 'Daily' },
      ],
    },
    { id: 'inflation', label: 'Assumed inflation', type: 'number', suffix: '%', min: 0, max: 30, step: 0.1, value: 3 },
    { id: 'fee', label: 'Annual fee or expense ratio', type: 'number', suffix: '%', min: 0, max: 5, step: 0.01, value: 0.1 },
    { id: 'expenses', label: 'Essential monthly expenses', type: 'number', prefix: '$', min: 0, max: 200000, step: 50, value: 3200 },
    { id: 'savedNow', label: 'Cash you have saved right now', type: 'number', prefix: '$', min: 0, max: 10000000, step: 100, value: 8000 },
    { id: 'assets', label: 'Everything you own (net worth: assets)', type: 'number', prefix: '$', min: 0, max: 100000000, step: 1000, value: 120000 },
    { id: 'debts', label: 'Everything you owe (net worth: liabilities)', type: 'number', prefix: '$', min: 0, max: 100000000, step: 1000, value: 45000 },
    { id: 'stockPct', label: 'Target allocation to stocks', type: 'number', suffix: '%', min: 0, max: 100, step: 1, value: 60 },
    { id: 'bondPct', label: 'Target allocation to bonds', type: 'number', suffix: '%', min: 0, max: 100, step: 1, value: 30 },
    {
      id: 'riskPct',
      label: 'Capital you are willing to risk on one position',
      type: 'number',
      suffix: '%',
      min: 0.1,
      max: 20,
      step: 0.1,
      value: 1,
    },
    { id: 'stopPct', label: 'Distance to your stop', type: 'number', suffix: '%', min: 0.1, max: 90, step: 0.1, value: 8 },
    { id: 'volatility', label: 'Annual volatility of the strategy', type: 'number', suffix: '%', min: 0.1, max: 200, step: 0.5, value: 15 },
    { id: 'riskFree', label: 'Risk-free rate', type: 'number', suffix: '%', min: 0, max: 25, step: 0.05, value: 4.2 },
    { id: 'bondYield', label: 'Bond yield to maturity', type: 'number', suffix: '%', min: 0, max: 40, step: 0.05, value: 5 },
    { id: 'couponRate', label: 'Bond coupon rate', type: 'number', suffix: '%', min: 0, max: 40, step: 0.05, value: 4 },
    { id: 'bondYears', label: 'Years to maturity', type: 'number', suffix: 'years', min: 0.5, max: 50, step: 0.5, value: 10 },
  ],
  fineprint: DISCLAIMER,

  chart: {
    type: 'donut',
    title: 'Where the ending balance comes from',
    caption:
      'The split between the money you put in and the growth you never deposited. Over long horizons the growth slice overtakes the contributions slice — that crossover is the whole argument for starting early.',
  },
  breakdownTitle: 'The projection, line by line',
  breakdownIntro: 'All amounts are in US dollars unless the row says otherwise.',

  faq: [
    {
      q: 'How does compound interest actually work?',
      a: 'Each period, interest is applied to the balance you already have — including the interest you earned in previous periods — and then your contribution is added. That "interest on interest" is what makes the curve bend upward. This hub uses the same end-of-period convention as standard annuity math.',
    },
    {
      q: 'What is the Rule of 72?',
      a: 'Divide 72 by the annual percentage return to get the rough number of years for money to double. At 7% that is about 10.3 years. It is a mental shortcut, accurate to within a few percent for rates between roughly 4% and 12%; the mathematically exact constant for continuous compounding is 69.3.',
    },
    {
      q: 'Does compounding frequency matter much?',
      a: 'Less than people expect. At 7% over 20 years, moving from annual to monthly compounding on a $10,000 lump sum adds a few hundred dollars — real but small. The rate, the time horizon and the fees all matter far more than the cadence.',
    },
    {
      q: 'What is my return after inflation?',
      a: 'Not simply return minus inflation, though that is close enough at low numbers. The exact real return is (1 + nominal) ÷ (1 + inflation) − 1. At 7% nominal and 3% inflation that is 3.88%, not 4%. Over 30 years the difference in ending balance is substantial.',
    },
    {
      q: 'How much does a 1% fee really cost?',
      a: 'Roughly a fifth of your ending balance over 30 years. A 1% annual expense ratio does not take 1% of your final balance — it takes 1% of the whole balance every single year, so the compounding you lose compounds too. It is the single most controllable variable in the whole projection.',
    },
    {
      q: 'How big should my emergency fund be?',
      a: 'Three months of essential expenses if your income is stable and you have no dependants, six months for most people, and twelve if your income is variable or you are self-employed. Size it on essential expenses — rent, food, utilities, insurance and minimum debt payments — not on income.',
    },
    {
      q: 'Should I build the emergency fund or pay off debt first?',
      a: 'Usually a small buffer first, then the debt, then finish the fund. One month of expenses stops the next surprise from going straight onto the card; after that, high-interest debt at 20%+ beats a savings account at any realistic yield. Coming back to finish the fund afterwards costs the least overall.',
    },
    {
      q: 'What is a three-fund portfolio?',
      a: 'A total US stock market fund, a total international stock fund and a total bond fund, held in fixed proportions and rebalanced. It is popular because it is cheap, diversified across thousands of holdings, and simple enough to keep going through a bad year — which is the part most strategies fail.',
    },
    {
      q: 'How do I size a position?',
      a: 'Decide the percentage of capital you are prepared to lose on the trade, then divide that dollar amount by the distance to your stop. Risking 1% of a $100,000 account with an 8% stop gives a $12,500 position. The position size falls out of the risk, rather than the other way round.',
    },
    {
      q: 'What does the Sharpe ratio tell me?',
      a: 'Return above the risk-free rate, divided by volatility — how much return you got per unit of risk taken. It is what makes two strategies with different volatilities comparable. Above 1 is generally considered good, but it is extremely sensitive to the window you compute it over, so treat any short-sample Sharpe with suspicion.',
    },
    {
      q: 'What is modified duration?',
      a: 'The approximate percentage change in a bond’s price for a one-percentage-point change in yield. A duration of 8 means a 1% rise in rates costs roughly 8% of the price. It is a first-order estimate: for large rate moves it understates the gain and overstates the loss, because it ignores convexity.',
    },
    {
      q: 'What does a P/E ratio actually mean?',
      a: 'Price divided by earnings per share — how many dollars you pay for a dollar of annual earnings. Inverted, it is the earnings yield. A P/E of 20 is a 5% earnings yield. It is only meaningful compared against the same company\'s history and its sector; comparing a utility to a software company on P/E tells you nothing.',
    },
  ],

  sources: [
    {
      name: 'SEC Investor.gov — Compound Interest Calculator and investing basics',
      url: 'https://www.investor.gov/financial-tools-calculators/calculators/compound-interest-calculator',
      publisher: 'U.S. Securities and Exchange Commission',
    },
    {
      name: 'SEC — Mutual Fund Fees and Expenses',
      url: 'https://www.investor.gov/introduction-investing/investing-basics/glossary/mutual-fund-fees-and-expenses',
      publisher: 'U.S. Securities and Exchange Commission',
    },
    {
      name: 'CFPB — An essential guide to building an emergency fund',
      url: 'https://www.consumerfinance.gov/an-essential-guide-to-building-an-emergency-fund/',
      publisher: 'Consumer Financial Protection Bureau',
    },
    {
      name: 'TreasuryDirect — Understanding bond prices and yields',
      url: 'https://www.treasurydirect.gov/marketable-securities/understanding-pricing/',
      publisher: 'U.S. Department of the Treasury',
    },
    {
      name: 'Sharpe WF — The Sharpe Ratio (Journal of Portfolio Management)',
      url: 'https://web.stanford.edu/~wfsharpe/art/sr/sr.htm',
      publisher: 'Stanford University',
      date: '1994',
    },
    {
      name: 'Bureau of Labor Statistics — Consumer Price Index',
      url: 'https://www.bls.gov/cpi/',
      publisher: 'U.S. Bureau of Labor Statistics',
    },
  ],

  replaces: [
    '/en/compound-interest-calculator-long-term',
    '/en/rule-of-72-calculator',
    '/en/roi-calculator',
    '/en/net-present-value-calculator',
    '/en/inflation-calculator-us-cpi',
    '/en/emergency-fund-calculator-months-expenses',
    '/en/net-worth-tracker-calculator',
    '/en/money-market-fund-yield',
    '/en/bogleheads-3-fund-portfolio-calculator',
    '/en/portfolio-60-40-crypto-traditional-allocation',
    '/en/sharpe-ratio-backtest-calculator',
    '/en/position-size-stocks-percentage',
    '/en/pe-ratio-calculator',
    '/en/usd-broker-investment-calculator',
    '/en/bond-modified-duration',
    '/en/bond-present-value-zero-coupon',
    '/en/bond-al30-al35-al41-yield',
    '/en/al30-gd30-bond-yield',
    '/en/alyc-commissions-calculator',
    '/en/cedear-dividend-yield-2026',
    '/en/stock-options-vesting-tech-startup',
    '/en/bcra-interest-rate-savings-impact',
  ],

lastReviewed: '2026-07-28',
};
