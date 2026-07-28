import type { HubData } from '../types';
import {
  FEDERAL_BRACKETS_2026,
  STANDARD_DEDUCTION_2026,
  FICA_2026,
  CHILD_TAX_CREDIT_2026,
  OBBBA_2026,
  DATA_AS_OF,
} from '../../data/usa-2026';

/**
 * Decision hub EN/US — "How much of my paycheck do I actually keep?"
 *
 * EVERY statutory constant comes from src/lib/data/usa-2026.ts, which cites its
 * sources (IRS Rev. Proc. 2025-32, IRS Notice 2025-67, SSA 2025-10-24 release,
 * IRS OBBBA newsroom guidance) with the date each was verified. Nothing here is
 * written from memory.
 *
 * ⚠️ These figures EXPIRE. Brackets, the standard deduction, the Social Security
 * wage base and the OBBBA caps are re-issued every year. The tax-year label is
 * shown on the page and the whole table is re-verified when usa-2026.ts is bumped.
 * The two things a user can override themselves are filing status and income; if
 * you are filing a different tax year, do not trust these numbers.
 *
 * Source formulas mirrored here:
 *   src/lib/formulas/w4-paycheck-withholding-calculator.ts
 *   src/lib/formulas/tax-refund-calculator-usa.ts
 *   src/lib/formulas/self-employment-tax-calculator-1099.ts
 *   src/lib/formulas/no-tax-on-overtime-deduction-calculator.ts
 *   src/lib/formulas/tip-income-tax-deduction-calculator.ts
 *   src/lib/formulas/biweekly-pay-periods-2026-calculator.ts
 */

/** YMYL disclaimer — copied verbatim from src/lib/disclaimers.ts, domain 'tax', language 'en'. */
export const DISCLAIMER_TAX =
  'Informational estimate based on the stated parameters. Rules and brackets may change; verify the relevant tax authority and consult a qualified tax professional for a final filing.';

/** Tax year the tables in usa-2026.ts describe. */
export const TAX_YEAR = 2026;
export const TABLES_AS_OF = DATA_AS_OF;

export const BRACKETS = FEDERAL_BRACKETS_2026;
export const STD_DEDUCTION = STANDARD_DEDUCTION_2026;
export const FICA = FICA_2026;
export const CTC = CHILD_TAX_CREDIT_2026;
export const OBBBA = OBBBA_2026;

/**
 * Federal unemployment tax (FUTA): 6.0% statutory rate on the first $7,000 of each
 * employee's wages, reduced to an effective 0.6% by the 5.4% credit for state
 * unemployment tax in a non-credit-reduction state (IRC §3301, §3306(b)(1)).
 * The wage base is written into the statute, not indexed, so it does not drift —
 * but the credit reduction applies in some states, so the rate is editable.
 */
export const FUTA = { rate: 0.006, wageBase: 7000 };

export const hub: HubData = {
slug: 'en/money/paycheck-and-taxes',
  title: 'How much of my paycheck do I keep? W-4, refund, bonus, overtime and 1099',
  description:
    'Federal withholding per paycheck, your refund or balance due, what a bonus or overtime really nets, the self-employment tax on 1099 income, and what an employee actually costs an employer — all on the current IRS and SSA figures.',
  silo: 'Money',
siloHref: '/en/money',
  locale: 'en',

  eyebrow: `United States · tax year ${TAX_YEAR}`,
  h1: 'How much of my paycheck do I actually keep?',
  lede:
    'Gross pay is a headline; take-home is the number you live on. Enter your salary once and see the federal tax withheld each payday, whether you are heading for a refund or a bill, what a bonus or overtime nets after the new deductions, what 1099 income owes on top, and what the whole package costs your employer.',
  stamps: [
    `Federal brackets and standard deduction — tax year ${TAX_YEAR}`,
    `Social Security wage base $${FICA_2026.ssWageBase.toLocaleString('en-US')} · Medicare uncapped`,
    '13 calculators inside',
  ],

  resultLabel: 'What you keep',

  cases: {
    title: 'What are you trying to work out?',
    intro:
      'Withholding, filing, extra pay and self-employment are four different calculations on the same income. Pick the one you are staring at right now.',
    items: [
      {
        id: 'paycheck',
        label: 'What lands in my bank account each payday',
        hint: 'W-4 withholding and take-home',
        answer:
          'Your take-home is gross pay minus federal withholding, Social Security, Medicare and any state tax — the W-4 only controls the federal piece.',
        yes: [
          'Federal income tax withheld per paycheck, using the percentage method with the standard deduction built in',
          `Social Security at ${(FICA_2026.ssRate * 100).toFixed(2)}% up to the $${FICA_2026.ssWageBase.toLocaleString('en-US')} wage base, and Medicare at ${(FICA_2026.medicareRate * 100).toFixed(2)}% with no cap`,
          `Dependent credits from W-4 Step 3: $2,000 per qualifying child and $500 per other dependent`,
          'Any extra withholding you asked for in Step 4(c)',
          'Your number of pay periods — including the 27-paycheck years that hit biweekly employees',
        ],
        warn: [
          DISCLAIMER_TAX,
          'This covers federal tax only. State and local income tax, and in some states disability or paid-leave contributions, come out on top and vary enormously.',
          'Pre-tax deductions — 401(k), HSA, health premiums — reduce taxable wages and are not modelled here. Your real withholding will be lower than shown if you have them.',
          'The W-4 has had no "allowances" since 2020. If your withholding looks wrong, the fix is a new W-4, not a phone call to payroll.',
        ],
        plazo:
          'you can file a new W-4 with your employer at any time; it normally takes effect within one or two pay cycles.',
      },
      {
        id: 'refund',
        label: 'Will I get a refund or owe at filing',
        hint: 'Year-end reconciliation',
        answer:
          'Your refund is simply what you overpaid: tax owed for the year minus everything already withheld, plus refundable credits.',
        yes: [
          'Taxable income after adjustments and the standard deduction',
          'Tax from the bracket table, then the Child Tax Credit and other dependent credits',
          `The credit phase-out of $${CHILD_TAX_CREDIT_2026.phaseoutPer1000} per $1,000 of income above the threshold`,
          `The refundable portion of the child credit, up to $${CHILD_TAX_CREDIT_2026.refundableCap.toLocaleString('en-US')} per child`,
          'Federal tax already withheld from every paycheck this year',
        ],
        warn: [
          DISCLAIMER_TAX,
          'A big refund is not a win — it is an interest-free loan you made to the government. Adjust the W-4 instead of celebrating it.',
          'This models the standard deduction and the family credits. Itemized deductions, education and energy credits, the earned income credit and self-employment income all change the answer.',
          'If you owe a large balance you may also owe an underpayment penalty. The safe-harbour rules generally require paying in either most of this year’s tax or all of last year’s.',
        ],
        plazo:
          'the federal filing deadline is normally April 15; an extension to file is not an extension to pay.',
      },
      {
        id: 'extras',
        label: 'What a bonus, overtime or tips really net',
        hint: 'Supplemental pay and the new deductions',
        answer:
          'Bonuses are usually withheld at a flat supplemental rate, while overtime premium and tips now carry deductions that come back at filing — not in the paycheck.',
        yes: [
          'The flat 22% federal supplemental withholding rate typically applied to a separate bonus payment',
          'Social Security and Medicare on the bonus, which apply regardless',
          `The overtime deduction on the FLSA-required premium only, capped at $${OBBBA_2026.overtime.capSingle.toLocaleString('en-US')} ($${OBBBA_2026.overtime.capMFJ.toLocaleString('en-US')} filing jointly)`,
          `The qualified tips deduction, capped at $${OBBBA_2026.tips.cap.toLocaleString('en-US')}`,
          'The MAGI phase-out that erodes both deductions, and the estimated tax each one saves',
        ],
        warn: [
          DISCLAIMER_TAX,
          'Only the FLSA-required PREMIUM — the extra half of time-and-a-half — qualifies for the overtime deduction. The base hourly pay for those hours does not.',
          '"No tax on tips" and "no tax on overtime" are deductions on the return, not exemptions from withholding. Social Security, Medicare and any state tax still apply to every dollar.',
          'These are temporary provisions covering tax years 2025 through 2028. Confirm they still apply to the year you are filing.',
          'The flat 22% supplemental rate is a withholding convention, not your final tax. If your marginal rate is lower you get the difference back at filing; if it is higher you owe more.',
        ],
        plazo:
          'tips must be reported to your employer by the 10th of the following month to be captured correctly on your W-2.',
      },
      {
        id: 'selfemployed',
        label: 'I am paid on a 1099 or freelance',
        hint: 'Self-employment tax and quarterlies',
        answer:
          'On 1099 income you pay both halves of Social Security and Medicare yourself, on top of income tax — plan to set aside roughly a quarter to a third of profit.',
        yes: [
          `Net earnings from self-employment: profit × ${(FICA_2026.seNetEarningsFactor * 100).toFixed(2)}%`,
          `Social Security at ${(FICA_2026.ssRateSelfEmployed * 100).toFixed(1)}% up to the wage base, less any W-2 wages already counted against it`,
          `Medicare at ${(FICA_2026.medicareRateSelfEmployed * 100).toFixed(1)}% with no cap, plus the ${(FICA_2026.addlMedicareRate * 100).toFixed(1)}% Additional Medicare Tax above the threshold`,
          'The above-the-line deduction for half the self-employment tax',
          'Estimated income tax on the profit, and the quarterly payment that follows',
        ],
        warn: [
          DISCLAIMER_TAX,
          'Nobody withholds for you. If you do not make quarterly estimated payments you can owe an underpayment penalty even when you pay in full at filing.',
          'Business expenses reduce net profit before any of this applies, and the qualified business income deduction may reduce income tax further. Both are outside this estimate.',
          'If you also have a W-2 job, the wages there already used part of your Social Security wage base — the calculation accounts for that so you are not double-charged.',
          'When you set a freelance rate, remember it has to cover self-employment tax, unpaid time, health coverage and retirement that an employer would otherwise carry.',
        ],
        plazo:
          'estimated payments are generally due April 15, June 15, September 15 and January 15 of the following year (Form 1040-ES).',
      },
      {
        id: 'employer',
        label: 'What an employee costs me as an employer',
        hint: 'Fully loaded payroll cost',
        answer:
          'Gross salary is roughly 70% to 85% of what an employee costs: employer payroll taxes, unemployment insurance and benefits sit on top.',
        yes: [
          `Employer Social Security at ${(FICA_2026.ssRate * 100).toFixed(2)}% up to the wage base and Medicare at ${(FICA_2026.medicareRate * 100).toFixed(2)}% with no cap — matching what the employee pays`,
          `Federal unemployment tax at an effective ${(FUTA.rate * 100).toFixed(1)}% on the first $${FUTA.wageBase.toLocaleString('en-US')} of wages`,
          'State unemployment insurance at your experience rate, which you enter',
          'Benefits and other loaded costs as a percentage of salary',
          'The total annual and monthly cost, and the multiplier over base salary',
        ],
        warn: [
          DISCLAIMER_TAX,
          'The employer does NOT match the Additional Medicare Tax — that 0.9% is withheld from the employee only.',
          'State unemployment rates and wage bases vary enormously by state and by your own claims history. The default here is a placeholder; use your actual rate notice.',
          'Workers’ compensation, equipment, software seats, recruiting and paid leave are real costs not captured by a simple percentage.',
        ],
        plazo:
          'federal payroll deposits follow a monthly or semi-weekly schedule set by your prior-year liability; Form 941 is filed quarterly.',
      },
    ],
  },

  inputsTitle: 'Your numbers',
  inputsIntro:
    'All amounts in U.S. dollars and annual unless the label says otherwise. Only the fields your case uses affect the result.',
  fields: [
    {
      id: 'annual_salary',
      label: 'Annual gross salary or wages',
      type: 'number',
      prefix: '$',
      value: 78000,
      min: 0,
      step: 1000,
      help: 'Before any deductions. For the employer case, the base salary you are paying.',
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
      help: 'Sets the bracket table, the standard deduction and every phase-out threshold.',
    },
    {
      id: 'pay_frequency',
      label: 'How often you are paid',
      type: 'select',
      value: 'biweekly',
      options: [
        { value: 'weekly', label: 'Weekly (52 paychecks)' },
        { value: 'biweekly', label: 'Biweekly (26 paychecks)' },
        { value: 'biweekly27', label: 'Biweekly in a 27-paycheck year' },
        { value: 'semimonthly', label: 'Semi-monthly (24 paychecks)' },
        { value: 'monthly', label: 'Monthly (12 paychecks)' },
      ],
      help: 'A calendar quirk gives biweekly employees 27 paydays in some years — pick that option to see the effect.',
    },
    {
      id: 'qualifying_children',
      label: 'Qualifying children under 17',
      type: 'number',
      value: 1,
      min: 0,
      max: 10,
      step: 1,
      help: `$2,000 each on the W-4; $${CHILD_TAX_CREDIT_2026.perChild.toLocaleString('en-US')} each as the Child Tax Credit at filing.`,
    },
    {
      id: 'other_dependents',
      label: 'Other dependents',
      type: 'number',
      value: 0,
      min: 0,
      max: 10,
      step: 1,
      help: `$${CHILD_TAX_CREDIT_2026.otherDependent} each, non-refundable.`,
    },
    {
      id: 'extra_withholding',
      label: 'Extra withholding per paycheck (W-4 Step 4c)',
      type: 'number',
      prefix: '$',
      value: 0,
      min: 0,
      step: 10,
    },
    {
      id: 'federal_withheld',
      label: 'Federal tax withheld so far this year (W-2 Box 2)',
      type: 'number',
      prefix: '$',
      value: 7200,
      min: 0,
      step: 100,
      help: 'Used by the refund case to reconcile against the tax you actually owe.',
    },
    {
      id: 'bonus',
      label: 'Annual bonus',
      type: 'number',
      prefix: '$',
      value: 5000,
      min: 0,
      step: 500,
    },
    {
      id: 'overtime_premium',
      label: 'Qualified overtime premium for the year',
      type: 'number',
      prefix: '$',
      value: 3000,
      min: 0,
      step: 250,
      help: 'The FLSA-required extra half of time-and-a-half only, not your total overtime pay.',
    },
    {
      id: 'tip_income',
      label: 'Qualified tip income for the year',
      type: 'number',
      prefix: '$',
      value: 0,
      min: 0,
      step: 500,
    },
    {
      id: 'net_profit_1099',
      label: 'Net self-employment profit (Schedule C)',
      type: 'number',
      prefix: '$',
      value: 20000,
      min: 0,
      step: 1000,
      help: 'Revenue minus business expenses, before any tax.',
    },
    {
      id: 'suta_rate',
      label: 'State unemployment insurance rate (employer)',
      type: 'number',
      value: 2.7,
      min: 0,
      max: 15,
      step: 0.1,
      suffix: '%',
      help: 'Your experience rate. Varies by state and claims history — use your rate notice.',
    },
    {
      id: 'suta_wage_base',
      label: 'State unemployment wage base',
      type: 'number',
      prefix: '$',
      value: 9000,
      min: 0,
      step: 500,
      help: 'Set by each state; ranges from about $7,000 to well over $50,000.',
    },
    {
      id: 'benefits_pct',
      label: 'Benefits and other loaded costs',
      type: 'number',
      value: 12,
      min: 0,
      max: 60,
      step: 0.5,
      suffix: '%',
      help: 'Health premiums, retirement match, workers’ comp, equipment — as a share of salary.',
    },
  ],
  fineprint: DISCLAIMER_TAX,

  chart: {
    type: 'donut',
    title: 'Where the gross goes',
    caption:
      'Splits the gross figure in your case into what you keep and what leaves: federal income tax, Social Security and Medicare, and — in the employer case — the taxes and benefits stacked on top of salary.',
  },
  breakdownTitle: 'Every line the number rests on',
  breakdownIntro:
    'Taxable income, the bracket applied, each payroll tax separately, and the credits or deductions — so you can reconcile it against a real pay stub or a Form 1040.',

  faq: [
    {
      q: 'Why is my take-home so much less than my salary?',
      a: `Four things come out before you see it. Federal income tax, withheld under the percentage method using your W-4; Social Security at ${(FICA_2026.ssRate * 100).toFixed(2)}% up to the $${FICA_2026.ssWageBase.toLocaleString('en-US')} wage base; Medicare at ${(FICA_2026.medicareRate * 100).toFixed(2)}% with no cap at all; and, in most states, state and sometimes local income tax. On top of that come pre-tax deductions like health premiums and 401(k) contributions, which lower your tax but also lower the deposit. A federal-only take-home rate in the high seventies to low eighties as a percentage of gross is normal.`,
    },
    {
      q: 'How does the W-4 actually change my withholding?',
      a: 'There are no allowances any more — the form was redesigned in 2020. Step 3 claims dependent credits, which directly reduce the annual tax your employer withholds. Step 4(a) adds other income so more is withheld, 4(b) adds deductions above the standard deduction so less is withheld, and 4(c) adds a flat dollar amount to every paycheck. Step 2 is for a second job or a working spouse, and skipping it is the single most common cause of under-withholding in two-income households.',
    },
    {
      q: 'What is the difference between my marginal rate and my effective rate?',
      a: `The marginal rate is the bracket your last dollar falls into — ${(FEDERAL_BRACKETS_2026.single[2][1] * 100).toFixed(0)}%, ${(FEDERAL_BRACKETS_2026.single[3][1] * 100).toFixed(0)}%, ${(FEDERAL_BRACKETS_2026.single[4][1] * 100).toFixed(0)}% and so on. The effective rate is total tax divided by total income, and it is always much lower because the brackets are progressive: only the slice of income inside each band is taxed at that band's rate. Someone in the 24% bracket often has an effective federal rate near 13%. Getting a raise never costs you money by "pushing you into a higher bracket" — only the extra dollars are taxed higher.`,
    },
    {
      q: 'Is the standard deduction worth taking?',
      a: `For roughly nine out of ten filers, yes. For tax year ${TAX_YEAR} it is $${STANDARD_DEDUCTION_2026.single.toLocaleString('en-US')} for single filers, $${STANDARD_DEDUCTION_2026.mfj.toLocaleString('en-US')} filing jointly and $${STANDARD_DEDUCTION_2026.hoh.toLocaleString('en-US')} for head of household. Itemizing only pays if your mortgage interest, state and local taxes within the cap, and charitable giving together exceed that figure. These amounts are indexed and change every year — always check the current-year number before filing.`,
    },
    {
      q: 'Why did I get 27 paychecks this year instead of 26?',
      a: 'It is a calendar artefact, not an error. Biweekly pay produces 26 paydays in most years, but 52 weeks is 364 days, so the extra day or two accumulates and eventually a year contains 27 paydays. Employers handle it two ways: keep the per-check amount the same, so you receive one extra check of gross pay that year, or divide the same annual salary across 27 checks, so each one is slightly smaller. Both are legal; which one applies is a payroll policy question. Watch annual caps such as 401(k) deferrals if you get the extra check.',
    },
    {
      q: 'Why is my bonus taxed at 22%?',
      a: 'It is not taxed at 22% — it is withheld at 22%. The IRS permits employers to apply a flat supplemental withholding rate to bonuses and other supplemental wages paid separately from regular pay, and 22% is that rate for amounts under $1 million. Your bonus is ordinary income like everything else; the difference between the 22% withheld and your actual marginal rate is settled at filing, as a refund if your rate is lower or a balance due if it is higher.',
    },
    {
      q: 'Does "no tax on overtime" mean my overtime is tax free?',
      a: `No, on three counts. First, it is a deduction claimed on the return, not an exemption from withholding: the money still comes out of your paycheck and returns at filing. Second, it only covers the FLSA-required PREMIUM — the extra half of time-and-a-half — not the base pay for those hours. Third, it is capped at $${OBBBA_2026.overtime.capSingle.toLocaleString('en-US')} ($${OBBBA_2026.overtime.capMFJ.toLocaleString('en-US')} filing jointly) and phases out by $${OBBBA_2026.overtime.reductionPer1000} for every $1,000 of MAGI above $${OBBBA_2026.overtime.phaseoutStart.single.toLocaleString('en-US')} single or $${OBBBA_2026.overtime.phaseoutStart.mfj.toLocaleString('en-US')} joint. Social Security, Medicare and any state income tax apply to every dollar regardless.`,
    },
    {
      q: 'How does the tip deduction work?',
      a: `Qualified tips are deductible up to $${OBBBA_2026.tips.cap.toLocaleString('en-US')} per return, with the same MAGI phase-out as the overtime deduction: $${OBBBA_2026.tips.reductionPer1000} of deduction lost per $1,000 of income above the threshold. The tips must be voluntary, received in an occupation that customarily receives tips, and reported — cash tips you never reported to your employer do not qualify. As with overtime, payroll taxes still apply, and the provision is temporary, covering tax years 2025 through 2028.`,
    },
    {
      q: 'How much should I set aside for taxes on 1099 income?',
      a: `Start at 25% to 30% of net profit and adjust once you know your bracket. The self-employment tax alone is ${(FICA_2026.ssRateSelfEmployed * 100).toFixed(1)}% Social Security plus ${(FICA_2026.medicareRateSelfEmployed * 100).toFixed(1)}% Medicare on ${(FICA_2026.seNetEarningsFactor * 100).toFixed(2)}% of profit — about 14.1% of profit before income tax has been touched. Federal income tax then stacks on top at your marginal rate, and state tax on top of that. The consolation is that half the self-employment tax is deductible above the line.`,
    },
    {
      q: 'What are quarterly estimated taxes and do I have to pay them?',
      a: 'If you expect to owe a meaningful amount at filing and are not having enough withheld elsewhere, you generally must pay estimated tax during the year using Form 1040-ES, normally in four instalments due in April, June, September and the following January. Missing them can trigger an underpayment penalty even if you pay the full balance on time at filing. If you also hold a W-2 job, an alternative to writing quarterly checks is simply increasing withholding there through Step 4(c) of your W-4 — withholding is treated as paid evenly through the year, which can cure an earlier shortfall.',
    },
    {
      q: 'Why does my employer pay more than my salary?',
      a: `Because payroll taxes are shared and benefits are extra. The employer matches Social Security at ${(FICA_2026.ssRate * 100).toFixed(2)}% and Medicare at ${(FICA_2026.medicareRate * 100).toFixed(2)}%, pays federal unemployment tax at an effective ${(FUTA.rate * 100).toFixed(1)}% on the first $${FUTA.wageBase.toLocaleString('en-US')} of wages, and pays state unemployment insurance at a rate set by the state and the employer's own claims history. Add health premiums, any retirement match and workers' compensation and a typical fully loaded cost lands somewhere between 1.15 and 1.35 times base salary.`,
    },
    {
      q: 'How should a freelancer set an hourly rate?',
      a: 'Work backwards from the salary you want, then add what an employer would otherwise absorb. Roughly: take the target annual income, add self-employment tax, health coverage and retirement saving, and divide by billable hours — which for most independents is 1,000 to 1,400 a year, not 2,080, because selling, admin, sick days and holidays are unpaid. That arithmetic is why a $50 an hour freelance rate does not remotely match a $100,000 salary.',
    },
    {
      q: 'What is the Additional Medicare Tax?',
      a: `An extra ${(FICA_2026.addlMedicareRate * 100).toFixed(1)}% on wages and self-employment earnings above $${FICA_2026.addlMedicareThreshold.single.toLocaleString('en-US')} for single and head-of-household filers, $${FICA_2026.addlMedicareThreshold.mfj.toLocaleString('en-US')} filing jointly and $${FICA_2026.addlMedicareThreshold.mfs.toLocaleString('en-US')} filing separately. It applies to the employee or self-employed person only — employers do not match it. Employers must begin withholding it once wages pass $200,000 for the year, which means a jointly filing couple can be over- or under-withheld and reconcile at filing.`,
    },
  ],

  sources: [
    {
      name: `IRS — tax inflation adjustments for tax year ${TAX_YEAR} (Rev. Proc. 2025-32, including OBBBA amendments)`,
      url: 'https://www.irs.gov/newsroom/irs-releases-tax-inflation-adjustments-for-tax-year-2026-including-amendments-from-the-one-big-beautiful-bill',
      publisher: 'Internal Revenue Service',
    },
    {
      name: 'IRS Publication 15-T — Federal Income Tax Withholding Methods',
      url: 'https://www.irs.gov/publications/p15t',
      publisher: 'Internal Revenue Service',
    },
    {
      name: 'IRS Form W-4 and the Tax Withholding Estimator',
      url: 'https://www.irs.gov/individuals/tax-withholding-estimator',
      publisher: 'Internal Revenue Service',
    },
    {
      name: `Social Security Administration — ${TAX_YEAR} contribution and benefit base and COLA fact sheet`,
      url: 'https://www.ssa.gov/oact/cola/cbb.html',
      publisher: 'Social Security Administration',
    },
    {
      name: 'IRS — One Big Beautiful Bill Act: deductions for overtime, tips, car loan interest and seniors',
      url: 'https://www.irs.gov/newsroom/one-big-beautiful-bill-act-tax-deductions-for-working-americans-and-seniors',
      publisher: 'Internal Revenue Service',
    },
    {
      name: 'IRS — Questions and answers about the new deduction for qualified overtime compensation',
      url: 'https://www.irs.gov/newsroom/questions-and-answers-about-the-new-deduction-for-qualified-overtime-compensation',
      publisher: 'Internal Revenue Service',
    },
    {
      name: 'IRS Schedule SE — Self-Employment Tax, and Form 1040-ES estimated tax',
      url: 'https://www.irs.gov/forms-pubs/about-schedule-se-form-1040',
      publisher: 'Internal Revenue Service',
    },
    {
      name: 'IRS Publication 15 (Circular E) — Employer’s Tax Guide, including FUTA',
      url: 'https://www.irs.gov/publications/p15',
      publisher: 'Internal Revenue Service',
    },
    {
      name: 'U.S. Department of Labor — Fair Labor Standards Act overtime pay requirements',
      url: 'https://www.dol.gov/agencies/whd/overtime',
      publisher: 'U.S. Department of Labor',
    },
  ],

  replaces: [
    '/en/w4-paycheck-withholding-calculator',
    '/en/tax-refund-calculator-usa',
    '/en/biweekly-pay-periods-2026-calculator',
    '/en/no-tax-on-overtime-deduction-calculator',
    '/en/tip-income-tax-deduction-calculator',
    '/en/annual-bonus-net',
    '/en/self-employment-tax-calculator-1099',
    '/en/total-employment-cost-with-taxes',
    '/en/freelance-rate-usd-per-hour-by-experience',
    '/en/salary-calculator-argentina',
    '/en/aguinaldo-calculator-argentina',
    '/en/severance-calculator-argentina',
    '/en/vacation-days-seniority-lct',
  ],

lastReviewed: '2026-07-28',
};
