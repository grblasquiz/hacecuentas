import type { HubData } from '../types';

/**
 * Decision hub EN/US — "Should I refinance, pay extra, or borrow against my home?"
 *
 * Every number in this hub is pure loan math (French/level amortization), so there
 * are no expiring statutory constants: the rate, the term and the closing costs are
 * all user inputs. The only tax-adjacent statement in the copy is the mortgage
 * interest deduction, which is described qualitatively and left to the tax hub.
 *
 * Source formulas mirrored here:
 *   src/lib/formulas/mortgage-payoff-extra-payment-calculator.ts
 *   src/lib/formulas/mortgage-refinance-break-even-calculator.ts
 *   src/lib/formulas/heloc-home-equity-line-payment-calculator.ts
 *   src/lib/formulas/prestamo-cuota.ts  (slug loan-payment-calculator)
 */

/** YMYL disclaimer — copied verbatim from src/lib/disclaimers.ts, domain 'finance', language 'en'. */
export const DISCLAIMER_FINANCE =
  'Informational estimate. Actual rates, fees, and terms depend on the provider and contract; compare official documents before deciding.';

/**
 * Default combined loan-to-value a lender will go to on a HELOC. Not a legal limit:
 * it is a lender underwriting convention (most cap between 80% and 90%), which is
 * why it ships as an editable field rather than a hardcoded constant.
 */
export const DEFAULT_CLTV = 85;

export const hub: HubData = {
slug: 'en/money/home-loan',
  title: 'Refinance, pay extra, or take a HELOC? Run all three on your mortgage',
  description:
    'One calculator for the three big home-loan decisions: how much a refinance really saves after closing costs, how much time and interest an extra monthly payment buys, and what a HELOC would cost you per month.',
  silo: 'Money',
siloHref: '/en/money',
  locale: 'en',

  eyebrow: 'United States · mortgages and home equity',
  h1: 'Should I refinance, pay extra, or borrow against my home?',
  lede:
    'Three moves, one balance, very different outcomes. Enter your loan once and compare the break-even month on a refinance, the years an extra payment shaves off, the monthly cost of tapping your equity, and the cash you need to close on a new home.',
  stamps: [
    'Level-payment amortization — no expiring tax tables',
    'Break-even, interest saved and cash-to-close in one place',
    '7 calculators inside',
  ],

  resultLabel: 'What this move is worth',

  cases: {
    title: 'Which move are you weighing?',
    intro:
      'The math behind each one is different: a refinance is a break-even question, an extra payment is a compounding question, and a HELOC is a payment-shock question. Start with the most common.',
    items: [
      {
        id: 'refinance',
        label: 'I want to refinance to a lower rate',
        hint: 'Break-even on closing costs',
        answer:
          'A refinance pays off only if you stay in the home past the break-even month: closing costs divided by your monthly savings.',
        yes: [
          'Your current balance, rate and months left — the payment you are replacing',
          'The new rate and the new term you are being quoted',
          'Every closing cost rolled in: origination, appraisal, title, recording, points',
          'The break-even month, and the lifetime interest difference between the two loans',
        ],
        warn: [
          DISCLAIMER_FINANCE,
          'Resetting a 22-year balance into a fresh 30-year loan can lower the payment and still raise your lifetime interest. Watch the total interest row, not just the payment.',
          'A quoted rate is not an APR. Ask for the Loan Estimate: the APR folds in points and fees and is the only number worth comparing across lenders.',
          'If you roll closing costs into the balance you are financing them at the mortgage rate for decades — the break-even is later than it looks.',
        ],
        plazo:
          'a Loan Estimate is binding for 10 business days, and a rate lock usually runs 30 to 60 days — that is your real decision window.',
      },
      {
        id: 'extra',
        label: 'I want to pay extra toward the principal',
        hint: 'Time and interest saved',
        answer:
          'Every extra dollar applied to principal skips all the future interest that dollar would have carried — which is why small extras cut years.',
        yes: [
          'The extra amount you can add every month on top of principal and interest',
          'The month your loan actually ends, versus the scheduled payoff',
          'Total interest on the normal schedule versus with the extra payment',
        ],
        warn: [
          DISCLAIMER_FINANCE,
          'Tell the servicer in writing to apply the extra to principal. Left unmarked, many apply it to the next payment instead, and you save nothing.',
          'Compare the guaranteed return: paying down a 6.8% mortgage is a risk-free 6.8%, but only after you have an emergency fund and any employer 401(k) match.',
          'Paying extra does not lower next month’s required payment. It shortens the loan; it does not buy you flexibility if money gets tight.',
        ],
        plazo:
          'the earlier in the loan you start, the bigger the effect — the first years are almost all interest.',
      },
      {
        id: 'heloc',
        label: 'I want to borrow against my equity (HELOC)',
        hint: 'Draw period vs repayment shock',
        answer:
          'A HELOC is cheap while you only pay interest, then the payment jumps when principal is added at the end of the draw period.',
        yes: [
          'Your available line: the lender’s combined loan-to-value on the home value, minus the first mortgage',
          'The interest-only payment during the draw period',
          'The fully amortizing payment once repayment starts — and the size of the jump',
        ],
        warn: [
          DISCLAIMER_FINANCE,
          'Your home is the collateral. A HELOC turns unsecured spending into a debt that can end in foreclosure.',
          'Almost every HELOC carries a variable rate tied to the prime rate: the payment you see today is not the payment you are committing to.',
          'Interest-only payments during the draw period leave the balance untouched. The repayment-period payment shown here is the one to budget for.',
        ],
        plazo:
          'a typical structure is a 10-year draw period followed by a 20-year repayment period — check yours before you draw.',
      },
      {
        id: 'purchase',
        label: 'I am buying and want to know the cash I need',
        hint: 'Down payment + closing costs',
        answer:
          'Cash to close is your down payment plus closing costs — budget for roughly 2% to 5% of the price on top of the down payment.',
        yes: [
          'Down payment as a percentage of the purchase price',
          'Closing costs as a percentage of the price: lender fees, title, appraisal, recording, prepaids and escrow',
          'The resulting loan amount and the principal-and-interest payment it creates',
          'Your loan-to-value, which decides whether mortgage insurance applies',
        ],
        warn: [
          DISCLAIMER_FINANCE,
          'The payment shown is principal and interest only. Property tax, homeowners insurance, mortgage insurance and any HOA dues are on top — often 25% to 40% more.',
          'Below 20% down on a conventional loan you normally pay private mortgage insurance until you reach 20% equity.',
          'Rent-to-own contracts are a different animal: only the rent credit written in the contract counts toward the purchase, and forfeiting it is the common outcome. Read the option fee and the credit clause before signing.',
        ],
        plazo:
          'lenders want your down payment sourced and seasoned — large deposits in the 60 days before closing get questioned.',
      },
    ],
  },

  inputsTitle: 'Your loan',
  inputsIntro:
    'All amounts in U.S. dollars, all rates as annual percentages. Only the fields your case uses affect the result — leave the sample numbers in place and come back with yours.',
  fields: [
    {
      id: 'home_value',
      label: 'Home value (or purchase price)',
      type: 'number',
      prefix: '$',
      value: 450000,
      min: 0,
      step: 1000,
      help: 'Current market value for a refinance or HELOC; the agreed price if you are buying.',
    },
    {
      id: 'balance',
      label: 'Current mortgage balance',
      type: 'number',
      prefix: '$',
      value: 320000,
      min: 0,
      step: 1000,
      help: 'Principal still owed today, not the original loan amount.',
    },
    {
      id: 'current_rate',
      label: 'Current interest rate',
      type: 'number',
      value: 6.8,
      min: 0,
      max: 25,
      step: 0.01,
      suffix: '%',
      help: 'The note rate on the loan you have now.',
    },
    {
      id: 'remaining_years',
      label: 'Years left on the current loan',
      type: 'number',
      value: 27,
      min: 1,
      max: 40,
      step: 1,
      help: 'Also used as the draw-plus-repayment horizon reference for a HELOC.',
    },
    {
      id: 'new_rate',
      label: 'New rate you are being quoted',
      type: 'number',
      value: 5.9,
      min: 0,
      max: 25,
      step: 0.01,
      suffix: '%',
      help: 'Refinance quote, or the rate on a new purchase loan. Also used as the HELOC rate.',
    },
    {
      id: 'new_term_years',
      label: 'New loan term',
      type: 'number',
      value: 30,
      min: 5,
      max: 40,
      step: 1,
      suffix: 'years',
      help: 'The term of the refinance or of the purchase loan.',
    },
    {
      id: 'closing_costs',
      label: 'Closing costs on the refinance',
      type: 'number',
      prefix: '$',
      value: 6500,
      min: 0,
      step: 100,
      help: 'Everything you pay to get the new loan. Enter 0 for a true no-cost refinance.',
    },
    {
      id: 'extra_payment',
      label: 'Extra toward principal each month',
      type: 'number',
      prefix: '$',
      value: 200,
      min: 0,
      step: 25,
      help: 'On top of your regular principal-and-interest payment.',
    },
    {
      id: 'down_payment_pct',
      label: 'Down payment (purchase)',
      type: 'number',
      value: 10,
      min: 0,
      max: 100,
      step: 0.5,
      suffix: '%',
      help: 'Percentage of the purchase price you are putting down.',
    },
    {
      id: 'closing_pct',
      label: 'Closing costs on a purchase',
      type: 'number',
      value: 3,
      min: 0,
      max: 10,
      step: 0.1,
      suffix: '%',
      help: 'Typically 2% to 5% of the price, including prepaids and escrow funding.',
    },
    {
      id: 'cltv',
      label: 'Lender’s combined loan-to-value limit',
      type: 'number',
      value: DEFAULT_CLTV,
      min: 50,
      max: 100,
      step: 1,
      suffix: '%',
      help: 'How far the HELOC lender will go on first mortgage plus line. Most cap between 80% and 90%.',
    },
  ],
  fineprint: DISCLAIMER_FINANCE,

  chart: {
    type: 'donut',
    title: 'Where the money goes',
    caption:
      'Splits the amount at stake in your case: on a refinance, interest under each loan; on extra payments, the interest you still pay versus the interest you skip; on a HELOC, the balance against the interest it carries; on a purchase, down payment, closing costs and the loan itself.',
  },
  breakdownTitle: 'The full arithmetic, line by line',
  breakdownIntro:
    'Every intermediate figure the result depends on, so you can check it against a Loan Estimate or an amortization schedule.',

  faq: [
    {
      q: 'How is the break-even point on a refinance calculated?',
      a: 'Divide your total closing costs by the monthly payment savings, and round up. If the refinance costs $6,500 and cuts $180 off the payment, you break even at month 37 — just over three years. Stay in the home past that and the refinance pays; sell or refinance again before it and you lost the closing costs. The one nuance the simple ratio hides: if the new loan is longer than what was left on the old one, your lifetime interest can still rise even though every monthly payment is lower.',
    },
    {
      q: 'Is a lower monthly payment always a better deal?',
      a: 'No, and this is the most expensive misunderstanding in mortgage lending. Stretching a balance with 22 years left back out over 30 years lowers the payment purely by adding 96 more payments. The breakdown here shows total interest under both loans side by side. If total interest goes up, you are buying monthly cash flow with lifetime cost — a legitimate trade when money is tight, but you should know you are making it.',
    },
    {
      q: 'What rate drop makes a refinance worth doing?',
      a: 'There is no universal threshold — the old "one full point" rule of thumb ignores loan size. What matters is the break-even month against how long you plan to stay. On a large balance, half a point can break even in under two years; on a small balance, even two full points may never pay off the closing costs. Run your own numbers rather than trusting a rule.',
    },
    {
      q: 'How much does an extra payment actually save?',
      a: 'More than people expect, because an extra dollar of principal cancels every future interest charge that dollar would have generated. On a $320,000 balance at 6.8% with 27 years left, an extra $200 a month typically shortens the loan by roughly five years and saves tens of thousands in interest. The effect is front-loaded: the same $200 started ten years from now saves far less.',
    },
    {
      q: 'Should I pay extra on the mortgage or invest instead?',
      a: 'Paying down a mortgage is a guaranteed, risk-free return equal to your rate — a 6.8% loan is a 6.8% return you cannot lose. Investing may beat it over long horizons but is not guaranteed. The usual ordering is: employer 401(k) match first (it is an instant 50%–100% return), then high-rate consumer debt, then the mortgage versus taxable investing question. Keep an emergency fund either way, because principal you send to the servicer is not money you can get back without borrowing it again.',
    },
    {
      q: 'What is the difference between a HELOC and a home equity loan?',
      a: 'A home equity loan is a lump sum at a fixed rate with a fixed payment from day one. A HELOC is a revolving line: you draw what you need during a draw period (often 10 years) paying interest only, then it converts to a repayment period (often 20 years) where principal is added and the payment jumps. HELOCs are usually variable-rate, tied to the prime rate, so the payment can move even before the draw period ends.',
    },
    {
      q: 'How much can I borrow with a HELOC?',
      a: 'Lenders work from a combined loan-to-value limit: the maximum they will let your first mortgage plus the line reach, as a share of the home value. At an 85% limit on a $450,000 home with a $320,000 mortgage, the ceiling is $450,000 × 85% − $320,000 = $62,500. That is a lending convention, not a rule of law, which is why it is an editable field here — your lender may cap at 80% or stretch to 90%.',
    },
    {
      q: 'Why does my HELOC payment jump so much later?',
      a: 'Because during the draw period you are only paying the interest, so the balance never moves. When repayment begins, the same balance has to be fully amortized over the remaining years, so principal is suddenly added to every payment. On a $60,000 line the interest-only payment might be around $300 while the repayment payment is closer to $430 — and if the variable rate has risen in the meantime, more still. The breakdown shows both figures and the size of the jump.',
    },
    {
      q: 'How much cash do I need to buy a home?',
      a: 'Down payment plus closing costs. Closing costs commonly run 2% to 5% of the price and cover lender fees, appraisal, title insurance and search, recording, and prepaid items such as the first year of homeowners insurance and the property tax escrow cushion. On a $450,000 purchase with 10% down and 3% costs, that is $45,000 plus $13,500 — about $58,500 before you have bought a single piece of furniture.',
    },
    {
      q: 'Do I have to put 20% down?',
      a: 'No. Conventional loans go down to 3% for qualified buyers, FHA to 3.5%, and VA and USDA loans to zero for those eligible. What 20% buys you is the avoidance of private mortgage insurance on a conventional loan. PMI is not permanent: you can generally request cancellation once you reach 20% equity, and it terminates automatically at 22% under the Homeowners Protection Act.',
    },
    {
      q: 'Is mortgage interest still deductible?',
      a: 'Interest on acquisition debt secured by your main or second home is deductible if you itemize, within the limits set by the tax code, and interest on a home equity loan or HELOC is deductible only when the proceeds are used to buy, build, or substantially improve the home securing the loan. Because the standard deduction is large, most households do not itemize and therefore get no deduction at all. Check the current IRS guidance for the year you are filing before you count on it.',
    },
    {
      q: 'How does rent-to-own compare with buying outright?',
      a: 'In a rent-to-own or lease-option contract, only the rent credit explicitly written into the agreement counts toward the eventual purchase — typically a slice of an above-market rent — and it is usually forfeited if you do not or cannot exercise the option. You also normally pay a non-refundable option fee up front. Compare the total of option fee plus credited rent against a straightforward down payment before assuming it is the cheaper path in.',
    },
  ],

  sources: [
    {
      name: 'Consumer Financial Protection Bureau — Loan Estimate and Closing Disclosure',
      url: 'https://www.consumerfinance.gov/owning-a-home/loan-estimate/',
      publisher: 'CFPB',
    },
    {
      name: 'CFPB — What you should know before taking out a home equity line of credit (HELOC)',
      url: 'https://www.consumerfinance.gov/consumer-tools/mortgages/answers/what-is-a-heloc/',
      publisher: 'CFPB',
    },
    {
      name: 'CFPB — Understanding closing costs',
      url: 'https://www.consumerfinance.gov/owning-a-home/process/close/',
      publisher: 'CFPB',
    },
    {
      name: 'Homeowners Protection Act — private mortgage insurance cancellation',
      url: 'https://www.consumerfinance.gov/ask-cfpb/when-can-i-remove-private-mortgage-insurance-pmi-from-my-loan-en-202/',
      publisher: 'CFPB',
    },
    {
      name: 'IRS Publication 936 — Home Mortgage Interest Deduction',
      url: 'https://www.irs.gov/publications/p936',
      publisher: 'Internal Revenue Service',
    },
    {
      name: 'Federal Reserve — Consumer Handbook on Adjustable-Rate Mortgages and home equity lines',
      url: 'https://www.federalreserve.gov/pubs/arms/arms_english.htm',
      publisher: 'Federal Reserve Board',
    },
  ],

  replaces: [
    '/en/mortgage-payoff-extra-payment-calculator',
    '/en/mortgage-refinance-break-even-calculator',
    '/en/heloc-home-equity-line-payment-calculator',
    '/en/loan-payment-calculator',
    '/en/first-home-purchase-costs',
    '/en/rent-to-own-property-calculator',
    '/en/fideicomiso-construccion-aporte-cuotas',
  ],

lastReviewed: '2026-07-28',
};
