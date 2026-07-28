import type { HubData } from '../types';
import { OBBBA_2026, STANDARD_DEDUCTION_2026, FEDERAL_BRACKETS_2026 } from '../../data/usa-2026';

/**
 * Decision hub EN/US — "What's the fastest, cheapest way to clear my debt?"
 *
 * The payoff math is pure amortization and needs no statutory constants. The one
 * expiring piece is the OBBBA car-loan interest deduction (tax years 2025-2028),
 * which comes from src/lib/data/usa-2026.ts — never from memory.
 *
 * Source formulas mirrored here:
 *   src/lib/formulas/credit-card-payoff-time-calculator.ts
 *   src/lib/formulas/debt-avalanche-payoff-calculator.ts
 *   src/lib/formulas/simple-interest-vs-compound-comparison.ts
 *   src/lib/formulas/car-loan-interest-deduction-calculator.ts
 *   src/lib/formulas/tarjeta-credito-minimo.ts  (slug credit-card-minimum-payment)
 */

/** YMYL disclaimer — copied verbatim from src/lib/disclaimers.ts, domain 'finance', language 'en'. */
export const DISCLAIMER_FINANCE =
  'Informational estimate. Actual rates, fees, and terms depend on the provider and contract; compare official documents before deciding.';

/** OBBBA car-loan interest deduction, tax years 2025-2028. Source: usa-2026.ts (IRS newsroom). */
export const CAR_LOAN = OBBBA_2026.carLoan;

/** Standard deduction by filing status, used only to place you on the bracket table. */
export const STD_DEDUCTION = STANDARD_DEDUCTION_2026;

/** Federal brackets, mirrored so compute() can find your marginal rate without an import. */
export const BRACKETS = FEDERAL_BRACKETS_2026;

/**
 * Typical credit-card minimum payment formula: the greater of a percentage of the
 * balance and a small dollar floor. Issuers set both in the cardholder agreement —
 * that is why both ship as editable fields, not constants.
 */
export const DEFAULT_MIN_PERCENT = 2;
export const DEFAULT_MIN_FLOOR = 35;

export const hub: HubData = {
slug: 'en/money/get-out-of-debt',
  title: 'Fastest way to pay off debt: minimum payment, avalanche or snowball',
  description:
    'See exactly what paying only the minimum costs you, how many months a fixed payment takes, and how much the avalanche method saves over the snowball on your real balances and APRs.',
  silo: 'Money',
siloHref: '/en/money',
  locale: 'en',

  eyebrow: 'United States · credit cards and consumer loans',
  h1: 'What is the fastest, cheapest way to clear my debt?',
  lede:
    'The minimum payment is designed to keep you paying for decades. Put your balances and APRs in once and compare four routes out: minimum only, a fixed payment, avalanche versus snowball across several debts, and what an auto loan is really costing you after the interest deduction.',
  stamps: [
    'Month-by-month amortization, not a rule of thumb',
    `Car loan interest deduction from IRS OBBBA rules (cap $${CAR_LOAN.cap.toLocaleString('en-US')})`,
    '6 calculators inside',
  ],

  resultLabel: 'What this route costs you in interest',

  cases: {
    title: 'Where are you starting from?',
    intro:
      'The right method depends on whether you have one balance or several, and whether your problem is the rate or the discipline. Start with the most common trap.',
    items: [
      {
        id: 'minimum',
        label: 'I am only paying the minimum',
        hint: 'The most expensive route',
        answer:
          'Minimum payments shrink as the balance shrinks, so the payoff stretches for years and interest can exceed what you originally charged.',
        yes: [
          'Your balance and the purchase APR on the statement',
          'The issuer’s minimum formula: a percentage of the balance, or a small dollar floor, whichever is greater',
          'How the required payment falls every month, dragging the payoff out',
          'Total interest and total paid over the whole run',
        ],
        warn: [
          DISCLAIMER_FINANCE,
          'The minimum-payment warning box printed on every U.S. statement is required by the CARD Act precisely because this route is so costly — read yours and compare it with the result here.',
          'A promotional 0% APR that expires can trigger deferred interest on some store cards: the entire accrued interest is charged retroactively if any balance remains.',
          'Paying late can trigger a penalty APR, which resets this whole calculation upward.',
        ],
        plazo:
          'interest is charged from the statement date unless you pay the full statement balance by the due date — the grace period only survives if the balance goes to zero.',
      },
      {
        id: 'fixed',
        label: 'I can commit to a fixed monthly payment',
        hint: 'Payoff date and total interest',
        answer:
          'Freezing the payment instead of letting it shrink is the single change that converts a decade of minimums into a couple of years.',
        yes: [
          'The fixed amount you will pay every month regardless of what the statement asks',
          'The number of months until the balance hits zero',
          'The total interest that fixed payment costs you',
          'Whether the payment is even above the first month’s interest — below that the balance grows',
        ],
        warn: [
          DISCLAIMER_FINANCE,
          'A payment at or below the first month’s interest never pays the card off. The breakdown shows that interest so you can check.',
          'New charges on the same card restart the arithmetic. This assumes you stop using it.',
          'Balance-transfer offers usually carry a 3%–5% transfer fee: add it to the balance before comparing.',
        ],
        plazo:
          'set the fixed amount as an automatic payment, not a manual one — the whole method depends on it not shrinking.',
      },
      {
        id: 'avalanche',
        label: 'I have several debts and want an order',
        hint: 'Avalanche vs snowball',
        answer:
          'Avalanche (highest APR first) always costs less in interest; snowball (smallest balance first) pays you back in motivation instead.',
        yes: [
          'Every balance with its own APR and minimum payment',
          'The extra amount above the minimums you can throw at one target debt',
          'Total interest and total months under both orderings, side by side',
          'The exact dollar and month difference between the two methods',
        ],
        warn: [
          DISCLAIMER_FINANCE,
          'Both methods assume you keep paying every minimum on every debt. Missing one triggers fees and possible penalty APRs that dwarf the difference between the methods.',
          'If the gap between avalanche and snowball is small, pick the one you will actually finish. A method you abandon costs infinitely more than a suboptimal one you complete.',
          'As each debt clears, its minimum should roll into the next target. That rollover is what makes either method accelerate.',
        ],
        plazo:
          'recheck the order after any promotional rate expires — an expiring 0% can instantly become your highest APR.',
      },
      {
        id: 'car',
        label: 'My debt is a car loan',
        hint: 'Interest cost and the deduction',
        answer:
          'Auto loan interest is front-loaded, and for a qualifying new U.S.-assembled car part of it is deductible even if you do not itemize.',
        yes: [
          'Your loan balance, APR and remaining term — and the interest still ahead of you',
          `The OBBBA deduction of up to $${CAR_LOAN.cap.toLocaleString('en-US')} of car loan interest per year`,
          'The MAGI phase-out that shrinks that deduction, and your estimated tax saving',
        ],
        warn: [
          DISCLAIMER_FINANCE,
          'The deduction only applies to a NEW vehicle for personal use with final assembly in the United States, on a loan secured by the vehicle and originated after December 31, 2024. Used cars, leases and refinances of pre-2025 loans do not qualify.',
          'It is a temporary provision for tax years 2025 through 2028. Confirm it still applies to the year you are filing.',
          'Leasing is not the same decision: a lease payment covers depreciation plus rent charge and leaves you with no asset. Compare total cost of ownership over the years you actually keep a car, not the monthly payment.',
        ],
        plazo:
          'you report the vehicle identification number on the return, so keep the loan documents and the VIN with your tax file.',
      },
    ],
  },

  inputsTitle: 'Your balances',
  inputsIntro:
    'All amounts in U.S. dollars, all rates as annual percentage rates. Only the fields your case uses affect the result.',
  fields: [
    {
      id: 'balance',
      label: 'Main balance (card or loan)',
      type: 'number',
      prefix: '$',
      value: 6500,
      min: 0,
      step: 100,
      help: 'The statement balance you are trying to clear.',
    },
    {
      id: 'apr',
      label: 'APR on that balance',
      type: 'number',
      value: 22.5,
      min: 0,
      max: 60,
      step: 0.01,
      suffix: '%',
      help: 'The purchase APR on the statement, or the note rate on the loan.',
    },
    {
      id: 'monthly_payment',
      label: 'Fixed monthly payment you can commit to',
      type: 'number',
      prefix: '$',
      value: 250,
      min: 0,
      step: 10,
      help: 'Used by the fixed-payment case, and as the minimum on the main debt in the avalanche case.',
    },
    {
      id: 'min_percent',
      label: 'Issuer minimum, as a percent of balance',
      type: 'number',
      value: DEFAULT_MIN_PERCENT,
      min: 0.5,
      max: 10,
      step: 0.1,
      suffix: '%',
      help: 'Most U.S. issuers use 1%–3% of the balance plus that month’s interest and fees. Check your cardholder agreement.',
    },
    {
      id: 'min_floor',
      label: 'Issuer minimum, dollar floor',
      type: 'number',
      prefix: '$',
      value: DEFAULT_MIN_FLOOR,
      min: 0,
      step: 5,
      help: 'The minimum never falls below this. Commonly $25 to $40.',
    },
    {
      id: 'debt2_balance',
      label: 'Second debt — balance',
      type: 'number',
      prefix: '$',
      value: 12000,
      min: 0,
      step: 100,
      help: 'Leave at 0 if you only have one debt.',
    },
    {
      id: 'debt2_apr',
      label: 'Second debt — APR',
      type: 'number',
      value: 9.5,
      min: 0,
      max: 60,
      step: 0.01,
      suffix: '%',
    },
    {
      id: 'debt2_min',
      label: 'Second debt — minimum payment',
      type: 'number',
      prefix: '$',
      value: 220,
      min: 0,
      step: 10,
    },
    {
      id: 'extra_payment',
      label: 'Extra above the minimums, each month',
      type: 'number',
      prefix: '$',
      value: 150,
      min: 0,
      step: 25,
      help: 'The whole extra goes to one target debt: highest APR under avalanche, smallest balance under snowball.',
    },
    {
      id: 'loan_years',
      label: 'Years left on the car loan',
      type: 'number',
      value: 4,
      min: 1,
      max: 10,
      step: 1,
    },
    {
      id: 'filing_status',
      label: 'Filing status',
      type: 'select',
      value: 'single',
      options: [
        { value: 'single', label: 'Single' },
        { value: 'mfj', label: 'Married filing jointly' },
        { value: 'hoh', label: 'Head of household' },
      ],
      help: 'Sets the phase-out threshold and the bracket used for the car loan interest deduction.',
    },
    {
      id: 'magi',
      label: 'Modified adjusted gross income',
      type: 'number',
      prefix: '$',
      value: 85000,
      min: 0,
      step: 1000,
      help: `The car loan interest deduction shrinks by $${CAR_LOAN.reductionPer1000} for every $1,000 of MAGI above the threshold.`,
    },
  ],
  fineprint: DISCLAIMER_FINANCE,

  chart: {
    type: 'donut',
    title: 'Principal versus interest',
    caption:
      'Shows how much of everything you will hand over is the money you actually borrowed and how much is interest — and, where two methods are compared, how much of that interest one method avoids.',
  },
  breakdownTitle: 'The payoff, line by line',
  breakdownIntro:
    'Every figure the result depends on: the required payment, the first month’s interest, the number of months, and the total interest under each route.',

  faq: [
    {
      q: 'How is a credit card minimum payment calculated?',
      a: 'Most U.S. issuers use the greater of a percentage of the statement balance — typically 1% to 3%, plus that month’s interest and any fees — and a fixed dollar floor, commonly $25 to $40. The exact formula is in your cardholder agreement, which is why both the percentage and the floor are editable fields here rather than fixed assumptions. The key property is that the percentage minimum falls as the balance falls, which is what stretches the payoff out.',
    },
    {
      q: 'What does paying only the minimum actually cost?',
      a: 'On a $6,500 balance at 22.5% APR with a 2% minimum, the payoff runs for well over a decade and the interest can approach or exceed the original balance. Because the required payment shrinks alongside the balance, each month a larger share of what you pay goes to interest. Every U.S. statement carries a required minimum-payment warning box for this reason: compare its 36-month figure with the minimum-only figure here.',
    },
    {
      q: 'What is the avalanche method?',
      a: 'You pay every minimum on every debt, then send all spare money to the debt with the highest APR. When it clears, its minimum rolls into the next-highest APR debt, and so on. Mathematically this always produces the lowest total interest and the shortest total payoff, because you are always attacking the most expensive dollar first.',
    },
    {
      q: 'What is the snowball method, and is it ever better?',
      a: 'Snowball targets the smallest balance first regardless of rate, so you clear whole accounts quickly and get visible wins. It always costs at least as much interest as avalanche — usually a few hundred to a couple of thousand dollars more — but behavioural research and plenty of real-world experience say people finish it more often. If the gap in your case is small, the method you will actually stick to is the better one.',
    },
    {
      q: 'How much does avalanche save over snowball?',
      a: 'It depends entirely on the spread between your APRs and the spread between your balances. If your highest-APR debt is also your smallest, the two methods produce the identical order and save exactly the same. The gap widens when a large balance carries a much higher rate than a small one. The breakdown here runs both simulations month by month and shows the dollar and month difference for your actual numbers.',
    },
    {
      q: 'Why does my payment barely move the balance?',
      a: 'Because the interest is charged first. At 22.5% APR, a $6,500 balance accrues roughly $122 in interest in month one. A $150 payment therefore reduces the balance by only about $28. If your payment is at or below the first month’s interest, the balance never falls at all — it grows. The breakdown shows that first-month interest figure explicitly so you can check where your payment sits.',
    },
    {
      q: 'What is the difference between simple and compound interest here?',
      a: 'Simple interest is charged only on the original principal; compound interest is charged on principal plus accumulated interest. Credit cards compound daily on the average daily balance, which is why the effective annual cost is slightly higher than the stated APR. Most amortizing loans — mortgages, auto loans, personal loans — charge interest on the outstanding balance each period, so paying principal down early is what reduces the total cost.',
    },
    {
      q: 'Should I take a balance transfer or a debt consolidation loan?',
      a: 'A 0% balance transfer can be excellent if you can clear the balance inside the promotional window, but factor the 3%–5% transfer fee into the comparison and know the go-to rate. A consolidation loan replaces revolving debt with a fixed term at a fixed rate — helpful for discipline, but it only saves money if the new APR beats the weighted average of what you have. In both cases the risk is the same: the freed-up cards get used again.',
    },
    {
      q: 'Is car loan interest tax deductible?',
      a: `Under the One Big Beautiful Bill Act, up to $${CAR_LOAN.cap.toLocaleString('en-US')} of interest per year on a qualifying auto loan is deductible for tax years 2025 through 2028, and you do not need to itemize to claim it. The vehicle must be new, for personal use, with final assembly in the United States; the loan must be secured by the vehicle and originated after December 31, 2024. The deduction phases out by $${CAR_LOAN.reductionPer1000} for every $1,000 of MAGI above $${CAR_LOAN.phaseoutStart.single.toLocaleString('en-US')} for single filers and $${CAR_LOAN.phaseoutStart.mfj.toLocaleString('en-US')} for joint filers, disappearing entirely $50,000 above each. Confirm the rules for the year you are filing before relying on it.`,
    },
    {
      q: 'Should I lease or buy a car?',
      a: 'A lease payment covers only the depreciation over the lease term plus a rent charge, so it is almost always lower than a loan payment on the same car — and at the end you own nothing. Buying costs more per month but the payments stop, and the residual value is yours. The honest comparison is total cost over the number of years you actually keep a vehicle: if that is well past the loan term, buying usually wins; if you replace the car every three years anyway, leasing can be competitive. Note that the interest deduction above applies to purchase loans, not leases.',
    },
    {
      q: 'Should I pay off debt or build savings first?',
      a: 'The common ordering is: a small starter emergency fund of a few hundred to a thousand dollars, then any employer retirement match, then high-rate debt, then a fuller emergency fund. The logic is that without any cash buffer, the next unexpected expense goes straight back onto the card you just paid down, and you end up running in place at 22% APR.',
    },
    {
      q: 'Does paying off a card help or hurt my credit score?',
      a: 'Paying down revolving balances lowers your credit utilisation ratio, which is one of the largest factors in most scoring models, so the effect is normally positive and fairly quick. Closing the account afterwards is the part that can hurt: it removes the available credit from the utilisation calculation and, eventually, shortens your average account age. Paying to zero and leaving the account open is usually the better outcome.',
    },
  ],

  sources: [
    {
      name: 'CFPB — How is my credit card minimum payment calculated?',
      url: 'https://www.consumerfinance.gov/ask-cfpb/how-is-the-minimum-payment-on-my-credit-card-calculated-en-000/',
      publisher: 'Consumer Financial Protection Bureau',
    },
    {
      name: 'Credit CARD Act of 2009 — minimum payment warning on statements',
      url: 'https://www.consumerfinance.gov/rules-policy/regulations/1026/7/',
      publisher: 'CFPB · Regulation Z §1026.7',
    },
    {
      name: 'IRS — One Big Beautiful Bill Act: tax deductions for working Americans and seniors',
      url: 'https://www.irs.gov/newsroom/one-big-beautiful-bill-act-tax-deductions-for-working-americans-and-seniors',
      publisher: 'Internal Revenue Service',
    },
    {
      name: 'IRS Revenue Procedure 2025-32 — 2026 inflation adjustments (brackets and standard deduction)',
      url: 'https://www.irs.gov/newsroom/irs-releases-tax-inflation-adjustments-for-tax-year-2026-including-amendments-from-the-one-big-beautiful-bill',
      publisher: 'Internal Revenue Service',
    },
    {
      name: 'Federal Reserve G.19 — Consumer Credit, credit card interest rates',
      url: 'https://www.federalreserve.gov/releases/g19/current/',
      publisher: 'Board of Governors of the Federal Reserve System',
    },
    {
      name: 'CFPB — Auto loans: understanding the total cost',
      url: 'https://www.consumerfinance.gov/consumer-tools/auto-loans/',
      publisher: 'Consumer Financial Protection Bureau',
    },
  ],

  replaces: [
    '/en/credit-card-minimum-payment',
    '/en/credit-card-payoff-time-calculator',
    '/en/debt-avalanche-payoff-calculator',
    '/en/simple-interest-vs-compound-comparison',
    '/en/car-loan-interest-deduction-calculator',
    '/en/leasing-vs-auto-loan-comparison',
  ],

lastReviewed: '2026-07-28',
};
