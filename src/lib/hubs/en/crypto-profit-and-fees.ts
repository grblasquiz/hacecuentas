import type { HubData } from '../types';

/**
 * Decision hub EN — "What am I really making on crypto after fees?"
 *
 * Absorbs 12 loose calculators: profit and loss on a trade, DCA returns,
 * weighted average cost basis, stablecoin conversion spread, cross-chain bridge
 * cost, perpetual funding rate, impermanent loss in a liquidity pool, portfolio
 * valuation, the halving projection, hot vs cold wallet risk, the BTC/equity
 * correlation and the currency converter.
 *
 * MATH: mirrors src/lib/formulas/bitcoin-profit-loss-calculator.ts exactly —
 * cost basis includes the buy fee (IRS Pub. 544: acquisition costs capitalise),
 * proceeds are net of the sell fee, and the annualised return is a CAGR over
 * the holding period. Impermanent loss uses the standard constant-product
 * formula 2√r/(1+r) − 1.
 *
 * NO PRICE IS HARDCODED. Every price, rate and fee is an editable field: crypto
 * prices move by the minute and a baked-in number would be wrong on publication
 * day.
 */

/** YMYL disclaimer — verbatim from src/lib/disclaimers.ts, COPY.en, domain 'investment'. */
const DISCLAIMER =
  'Educational tool, not investment advice or a recommendation. Returns and capital can fluctuate or be lost; verify costs and risks with an authorized provider or adviser.';

/** IRS holding-period line between short-term and long-term capital gains, in days. */
export const LONG_TERM_DAYS = 365;

/** Perpetual futures funding is settled three times a day on the major venues. */
export const FUNDING_SETTLEMENTS_PER_DAY = 3;

/** Bitcoin halvings: the schedule is fixed by the protocol at every 210,000 blocks. */
export const HALVING = { blocksPerHalving: 210000, targetBlockMinutes: 10, lastHalvingYear: 2024, nextHalvingYear: 2028 };

export const hub: HubData = {
slug: 'en/money/crypto-profit-and-fees',
  title: 'Crypto profit and fee calculator — P&L, cost basis, funding and impermanent loss',
  description:
    'Work out what a crypto position actually earned after buy and sell fees: cost basis, net proceeds, total and annualised return, break-even price, the short-term or long-term tax line, plus the cost of stablecoin swaps, bridges, perpetual funding and impermanent loss in a pool.',
  silo: 'Money',
siloHref: '/en/money',
locale: 'en',

  eyebrow: 'Crypto returns and costs',
  h1: 'What am I really making on crypto after fees?',
  lede:
    'Headline gains ignore the three things that eat them: the fee on the way in, the fee on the way out, and the tax treatment of how long you held. This works out your true cost basis, your net proceeds, the price you break even at, and what the same position costs you in funding, bridging or impermanent loss if you are not simply holding it.',
  stamps: ['Reviewed 27-07-2026', 'Cost basis per IRS Pub. 544', '12 calculators inside'],

  resultLabel: 'Profit after all fees',

  cases: {
    title: 'My situation is different',
    intro:
      'Holding, averaging in, providing liquidity and holding a perpetual are four different cost structures. Pick yours.',
    items: [
      {
        id: 'trade',
        label: 'I bought and sold',
        hint: 'A single position, opened and closed.',
        yes: [
          'Cost basis including the buy fee, which is what the IRS lets you capitalise',
          'Net proceeds after the sell fee',
          'Total return and annualised return over your holding period',
          'The break-even sell price, and whether the gain is short-term or long-term',
        ],
        warn: [
          DISCLAIMER,
          'Fees on both sides are the difference between a winning and a losing trade at small margins — a 1% round trip needs a 2% move just to break even',
          'Holding for 365 days or less is a short-term gain, taxed as ordinary income; past that it gets long-term rates',
          'Every disposal is a taxable event in the US, including swapping one coin for another and paying for something in crypto',
        ],
        plazo: 'the long-term line is one year and a day from the acquisition date, not from the calendar year.',
        answer:
          'Your real profit is proceeds minus the sell fee, minus a cost basis that already includes the buy fee. Break-even is above your buy price, always.',
      },
      {
        id: 'dca',
        label: 'I buy a bit every month',
        hint: 'Dollar-cost averaging.',
        yes: [
          'Weighted average cost basis across every purchase, which is what your break-even really is',
          'Total invested against current value',
          'Return on the whole position, not on the last buy',
          'How much the recurring fee has cost you across all the purchases',
        ],
        warn: [
          DISCLAIMER,
          'A flat fee per purchase is brutal on small recurring buys: $2 on a $50 buy is 4% before the price moves at all',
          'US tax law lets you choose a cost-basis method (FIFO, specific identification) — the choice changes your bill and has to be consistent',
          'Averaging down into a falling asset is not risk management; it is a larger position in the same bet',
        ],
        plazo: 'record the date, amount and fee of every purchase as you go — reconstructing it later is the single biggest crypto tax headache.',
        answer:
          'Your break-even is the weighted average of every purchase including fees, not the price you last paid.',
      },
      {
        id: 'pool',
        label: 'I provide liquidity',
        hint: 'An AMM pool, yield farming.',
        yes: [
          'Impermanent loss for the price move you enter, using the constant-product formula',
          'The fee income you would need just to offset it',
          'Value if you had simply held the two assets instead',
          'The point where the pool position beats holding',
        ],
        warn: [
          DISCLAIMER,
          'Impermanent loss becomes permanent the moment you withdraw — the name is misleading and has cost people a lot of money',
          'A 4× price divergence costs about 20% against just holding, before any fee income',
          'Advertised APRs on new pools are usually front-loaded token emissions that decay fast; the fee income is the durable part',
        ],
        plazo: 'compare against simply holding at least monthly — pool positions that made sense at entry often stop making sense.',
        answer:
          'Impermanent loss is 2√r/(1+r) − 1 for a price ratio r. Fee income has to beat that number for the pool to be worth it.',
      },
      {
        id: 'perp',
        label: 'I hold a perpetual',
        hint: 'Funding rate on a leveraged position.',
        yes: [
          'What funding costs or pays you over the period you hold',
          'The cost as an annualised rate, which is the only way to compare it with anything else',
          'The effect of leverage on that cost relative to your own capital',
          'The break-even price move that funding alone forces on you',
        ],
        warn: [
          DISCLAIMER,
          'Funding settles three times a day on most venues: a 0.01% rate is roughly 11% a year, not 0.01%',
          'Persistent positive funding means you are paying to be long, every eight hours, regardless of price direction',
          'Leverage multiplies funding against your own capital, not just the notional — this is where positions quietly bleed out',
        ],
        plazo: 'funding resets every eight hours; check it before every roll, not once at entry.',
        answer:
          'Funding rate × notional × settlements is the running cost. Annualise it before deciding whether the position is worth holding.',
      },
      {
        id: 'convert',
        label: 'I am moving or converting',
        hint: 'Stablecoin swap, bridge, or into local currency.',
        yes: [
          'The all-in cost of a conversion including the spread, not just the advertised fee',
          'What a cross-chain bridge costs on top of the gas',
          'The effective rate you actually receive',
          'How much of the move you lose to friction',
        ],
        warn: [
          DISCLAIMER,
          'The spread is usually bigger than the fee: a "0.1% fee" quote with a 0.4% spread costs you 0.5%',
          'Bridges have been the single largest source of losses in crypto by value — the cheapest route is not always the one to take',
          'Converting one stablecoin to another is still a disposal for US tax purposes even though the dollar value barely changes',
        ],
        plazo: 'compare the quoted output amount across two routes before signing anything — that number includes everything.',
        answer:
          'Judge a conversion on the amount you actually receive, not on the advertised fee. Spread plus fee plus gas is the real cost.',
      },
    ],
  },

  inputsTitle: 'Your position',
  inputsIntro:
    'Every price and rate is an input because none of them are stable enough to hardcode. Fill in what applies to the case you picked.',
  fields: [
    { id: 'amount', label: 'Amount of the asset', type: 'number', suffix: 'units', min: 0, max: 1000000, step: 0.0001, value: 0.5 },
    { id: 'buyPrice', label: 'Buy price per unit', type: 'number', prefix: '$', min: 0, max: 10000000, step: 1, value: 60000 },
    { id: 'sellPrice', label: 'Current or sell price per unit', type: 'number', prefix: '$', min: 0, max: 10000000, step: 1, value: 90000 },
    { id: 'buyFee', label: 'Buy fee', type: 'number', suffix: '%', min: 0, max: 10, step: 0.01, value: 0.5 },
    { id: 'sellFee', label: 'Sell fee', type: 'number', suffix: '%', min: 0, max: 10, step: 0.01, value: 0.5 },
    { id: 'days', label: 'Holding period', type: 'number', suffix: 'days', min: 0, max: 10000, step: 1, value: 400 },
    {
      id: 'monthly',
      label: 'Monthly purchase (dollar-cost averaging)',
      type: 'number',
      prefix: '$',
      min: 0,
      max: 100000,
      step: 25,
      value: 200,
    },
    { id: 'months', label: 'Months of purchases', type: 'number', suffix: 'months', min: 0, max: 240, step: 1, value: 24 },
    {
      id: 'avgBuyPrice',
      label: 'Average price paid across those purchases',
      type: 'number',
      prefix: '$',
      min: 0,
      max: 10000000,
      step: 1,
      value: 55000,
    },
    { id: 'flatFee', label: 'Flat fee per recurring purchase', type: 'number', prefix: '$', min: 0, max: 100, step: 0.5, value: 1.5 },
    {
      id: 'priceRatio',
      label: 'Price change of one pool asset against the other',
      type: 'number',
      suffix: '× (2 means it doubled)',
      min: 0.05,
      max: 20,
      step: 0.05,
      value: 2,
    },
    { id: 'poolValue', label: 'Value you put into the pool', type: 'number', prefix: '$', min: 0, max: 10000000, step: 100, value: 10000 },
    { id: 'poolApr', label: 'Fee income from the pool', type: 'number', suffix: '% APR', min: 0, max: 500, step: 0.5, value: 20 },
    {
      id: 'fundingRate',
      label: 'Funding rate per settlement',
      type: 'number',
      suffix: '%',
      min: -1,
      max: 1,
      step: 0.001,
      value: 0.01,
      help: 'Most venues settle three times a day, so a 0.01% rate compounds to roughly 11% a year.',
    },
    { id: 'notional', label: 'Position notional', type: 'number', prefix: '$', min: 0, max: 10000000, step: 100, value: 20000 },
    { id: 'leverage', label: 'Leverage', type: 'number', suffix: '×', min: 1, max: 125, step: 1, value: 5 },
    { id: 'convertAmount', label: 'Amount to convert', type: 'number', prefix: '$', min: 0, max: 10000000, step: 100, value: 5000 },
    { id: 'convertFee', label: 'Quoted conversion fee', type: 'number', suffix: '%', min: 0, max: 10, step: 0.01, value: 0.1 },
    { id: 'spread', label: 'Spread against the mid price', type: 'number', suffix: '%', min: 0, max: 10, step: 0.01, value: 0.35 },
    { id: 'gas', label: 'Network gas or bridge fee', type: 'number', prefix: '$', min: 0, max: 5000, step: 1, value: 12 },
  ],
  fineprint: DISCLAIMER,

  chart: {
    type: 'donut',
    title: 'Where the money went',
    caption:
      'The split between what you put in, what the fees took, and what is left as profit. Fees are shown at full size on purpose — on small moves they are the largest slice.',
  },
  breakdownTitle: 'The position, line by line',
  breakdownIntro: 'All amounts are in US dollars unless the row says otherwise.',

  faq: [
    {
      q: 'How do I calculate profit on a crypto trade?',
      a: 'Cost basis is the amount bought times the buy price, times one plus the buy fee — acquisition fees capitalise into the basis under IRS Publication 544. Net proceeds are the sale value times one minus the sell fee. Profit is net proceeds minus cost basis. The headline price move always overstates it.',
    },
    {
      q: 'What price do I need to break even?',
      a: 'Higher than what you paid, always. Break-even is the cost basis divided by the amount held and by one minus the sell fee. With 0.5% fees on both sides, an asset bought at $60,000 needs about $60,600 just to get you back to flat.',
    },
    {
      q: 'Is my crypto gain short-term or long-term?',
      a: 'The line is 365 days. Held for one year or less, the gain is short-term and taxed at your ordinary income rate. Held longer, it gets long-term capital gains rates, which are substantially lower for most filers. The clock runs from the acquisition date, not from the start of the tax year.',
    },
    {
      q: 'Is swapping one coin for another taxable?',
      a: 'Yes, in the US. Every disposal is a taxable event — swapping BTC for ETH, converting one stablecoin to another, or paying for something in crypto all realise a gain or loss even though no dollars moved. This surprises people every filing season.',
    },
    {
      q: 'What is impermanent loss and how big is it?',
      a: 'It is the gap between holding two assets and putting them in a constant-product pool when their relative price moves. The formula is 2√r/(1+r) − 1 for a price ratio r. A 1.25× divergence costs about 0.6%, 2× costs about 5.7%, and 4× costs about 20%. It becomes permanent the moment you withdraw.',
    },
    {
      q: 'How much fee income do I need to make a pool worth it?',
      a: 'Enough to beat the impermanent loss for the price move that actually happens, which you do not know in advance. As a sanity check: if the assets diverge 2× over a year, fee income needs to clear about 5.7% just to draw level with having held them. Advertised APRs on new pools are usually decaying token emissions, not durable fee income.',
    },
    {
      q: 'How does the perpetual funding rate work?',
      a: 'Longs pay shorts when funding is positive and the reverse when it is negative, settled three times a day on most venues. The headline number is per settlement, not per year: 0.01% per settlement is about 0.03% a day and roughly 11% a year. Always annualise before comparing it with anything.',
    },
    {
      q: 'Does leverage change what funding costs me?',
      a: 'It changes what it costs relative to your money. Funding is charged on notional, so a 5× position pays five times the funding per dollar of your own capital. A rate that looks trivial on notional can be a double-digit annual drag on your margin.',
    },
    {
      q: 'What does a stablecoin swap or a bridge actually cost?',
      a: 'The advertised fee is usually the smaller half. Spread against the mid price commonly adds 0.2 to 0.5%, and a bridge adds gas on both chains. Judge any route on the output amount you are quoted, not on the fee — that figure already contains everything.',
    },
    {
      q: 'When is the next Bitcoin halving?',
      a: 'The schedule is fixed by the protocol: block rewards halve every 210,000 blocks, which at a ten-minute target block time works out at roughly four years. The last one was in 2024 and the next falls in 2028. The exact date drifts with actual block times, so any specific day is an estimate.',
    },
    {
      q: 'Is a hardware wallet worth it?',
      a: 'It moves your risk from exchange failure and account compromise to your own handling of a seed phrase. Historically, exchange and bridge failures have destroyed far more value than individual self-custody mistakes — but self-custody has no recovery path at all. The usual answer is cold storage for what you would not want to lose and an exchange balance only for what you are actively trading.',
    },
    {
      q: 'Does Bitcoin move with the stock market?',
      a: 'Sometimes closely, sometimes not at all. The correlation with the Nasdaq and S&P 500 has swung between roughly zero and strongly positive over different periods, rising sharply during liquidity-driven selloffs. Treating it as a reliable diversifier has repeatedly failed at exactly the moments diversification was needed.',
    },
  ],

  sources: [
    {
      name: 'IRS — Digital Assets (tax treatment and reporting)',
      url: 'https://www.irs.gov/filing/digital-assets',
      publisher: 'Internal Revenue Service',
    },
    {
      name: 'IRS Publication 544 — Sales and Other Dispositions of Assets',
      url: 'https://www.irs.gov/publications/p544',
      publisher: 'Internal Revenue Service',
    },
    {
      name: 'IRS — Topic no. 409, Capital gains and losses',
      url: 'https://www.irs.gov/taxtopics/tc409',
      publisher: 'Internal Revenue Service',
    },
    {
      name: 'Uniswap docs — Understanding impermanent loss',
      url: 'https://docs.uniswap.org/concepts/protocol/oracles',
      publisher: 'Uniswap',
    },
    {
      name: 'Bitcoin protocol — controlled supply and the halving schedule',
      url: 'https://en.bitcoin.it/wiki/Controlled_supply',
      publisher: 'Bitcoin Wiki',
    },
    {
      name: 'CFTC — Customer Advisory: Use Caution When Buying Digital Coins or Tokens',
      url: 'https://www.cftc.gov/LearnAndProtect/AdvisoriesAndArticles/customer_advisory_tokens.html',
      publisher: 'Commodity Futures Trading Commission',
    },
  ],

  replaces: [
    '/en/bitcoin-profit-loss-calculator',
    '/en/dca-bitcoin-historical-returns',
    '/en/weighted-average-cost-crypto',
    '/en/usdt-vs-usdc-commission-exchange',
    '/en/bridge-fee-cripto-crosschain-costo',
    '/en/funding-rate-perpetual-bitcoin-cost',
    '/en/yield-farming-impermanent-loss-pool',
    '/en/crypto-balance-to-local-currency',
    '/en/bitcoin-halving-2028-proyeccion',
    '/en/cold-wallet-vs-hot-wallet-riesgo',
    '/en/btc-nasdaq-sp500-correlation',
    '/en/currency-converter',
  ],

lastReviewed: '2026-07-28',
};
