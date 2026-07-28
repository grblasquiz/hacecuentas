import type { HubData } from '../types';

/**
 * Hub de decisión EN — "How do I work out this percentage?"
 *
 * Absorbe las 5 calculadoras inglesas de porcentaje / proporción:
 * percentage-of-number-calculator, percentage-increase-decrease-calculator,
 * percentage-calculator, ratio-simplifier-calculator y
 * rule-of-three-simple-direct-inverse.
 *
 * Las siete ramas replican las fórmulas vivas de src/lib/formulas/:
 *   porcentaje.ts · porcentaje-de-numero-calculadora.ts ·
 *   percentage-increase-decrease-calculator.ts · ratio-simplifier-calculator.ts ·
 *   regla-de-tres-simple-directa-inversa.ts
 * Nada de constantes inventadas: acá no hay constantes, sólo aritmética.
 */

/** Disclaimer YMYL/técnico — src/lib/disclaimers.ts, dominio 'math', versión en inglés. */
const DISCLAIMER_MATH =
  'Mathematical result based on the inputs. Verify units, assumptions, and rounding before technical use.';

export const hub: HubData = {
  slug: 'en/math/percentages',
  title: 'Percentage Calculator: % of a number, % change, ratios and rule of three',
  description:
    'Work out any percentage question in one place: what is X% of a number, what percent one number is of another, percent increase or decrease, the original price before a discount, ratio simplification and the rule of three.',
  silo: 'Math',
  siloHref: '/en/math',
  locale: 'en',

  eyebrow: 'Math · percentages and proportion',
  h1: 'How do I work out this percentage?',
  lede:
    'Seven different questions hide behind the word "percent", and they use different formulas. Pick the one you actually have — a share of a number, a change between two numbers, a reverse calculation, a ratio or a proportion — and the same four boxes answer it, with the arithmetic written out.',
  stamps: [
    'Exact arithmetic, no rounded shortcuts',
    'Seven percentage and proportion questions',
    '5 calculators inside',
  ],

  resultLabel: 'Your answer',

  cases: {
    title: 'Which percentage question is yours?',
    intro:
      'The trap with percentages is that the same word covers formulas that give completely different answers. Start with the most common one and switch if it is not your case.',
    items: [
      {
        id: 'of',
        label: 'What is X% of a number?',
        hint: 'A share of a total · part = total × pct ÷ 100',
        answer: 'A percent is just hundredths: multiply the number by the percent and divide by 100.',
        yes: [
          'Number A is the whole you are taking a share of',
          'Percentage (%) is the share you want',
          'The answer is A × % ÷ 100 — the same as multiplying by the percent written as a decimal',
          'The breakdown also gives you 1% of A, so you can scale to any other percent in your head',
        ],
        warn: [
          DISCLAIMER_MATH,
          'Percentages above 100% are perfectly valid: 150% of 80 is 120, not an error',
          'Tips, sales tax and commissions are this case — but each of them is applied to a different base, so check what the percent is being taken of before you trust the number',
        ],
        plazo: 'quick check: 10% of anything is the number with the decimal point moved one place left.',
      },
      {
        id: 'whatpct',
        label: 'What percent is A of B?',
        hint: 'A share expressed as a percent · A ÷ B × 100',
        answer: 'Divide the part by the whole and multiply by 100. B must not be zero.',
        yes: [
          'Number A is the part, Number B is the whole',
          'The answer is A ÷ B × 100',
          'If A is bigger than B the answer goes above 100% — that is correct, not a bug',
          'The breakdown shows how much of B is left over once A is taken out',
        ],
        warn: [
          DISCLAIMER_MATH,
          'B cannot be zero: dividing by zero leaves the percentage undefined, not infinite',
          'This is not the same as percent change. "A is 62.5% of B" and "A is 37.5% less than B" describe the same pair of numbers with two different formulas',
        ],
        plazo: 'test scores, market share and completion rates all live in this branch.',
      },
      {
        id: 'change',
        label: 'By what percent did it change?',
        hint: 'Increase or decrease · (new − old) ÷ old × 100',
        answer: 'Percent change is always measured against the old value, never the new one.',
        yes: [
          'Number A is the original (old) value, Number B is the new value',
          'The answer is (B − A) ÷ A × 100 — positive means an increase, negative a decrease',
          'The absolute difference B − A comes out in the breakdown too',
          'The chart splits the new value into the part you started with and the part that changed',
        ],
        warn: [
          DISCLAIMER_MATH,
          'The denominator is the ORIGINAL value. Going 50 → 100 is +100%, but 100 → 50 is −50%: the same absolute move is a different percentage',
          'Percent change is undefined when the original value is zero — there is nothing to compare against',
          'Do not confuse a change in percentage points with a percent change: going from 4% to 6% is +2 percentage points and +50%',
        ],
        plazo: 'year-over-year growth, price moves and grade improvements all use this formula.',
      },
      {
        id: 'apply',
        label: 'Add or subtract a percent from a number',
        hint: 'Markups, discounts and stacked offers · A × (1 + pct ÷ 100)',
        answer: 'Multiply by (1 + percent ÷ 100). Use a negative percent for a discount.',
        yes: [
          'Number A is the starting value',
          'Percentage (%) is what you are adding — enter a negative number to subtract',
          'Second percentage (%) stacks a second change on top, applied to the already-changed value',
          'The breakdown reports the combined effective percentage, which is not the sum of the two',
        ],
        warn: [
          DISCLAIMER_MATH,
          'Stacked percentages do not add up: −20% then −10% is −28% overall, not −30%, because the second cut is taken from a smaller base',
          'A markup and a margin are different: a 25% markup on cost is a 20% margin on price',
          'Adding X% and then removing X% does not bring you back: +10% then −10% leaves you 1% down',
        ],
        plazo: 'set the second percentage to 0 when you only have one change to apply.',
      },
      {
        id: 'reverse',
        label: 'What was it before the percent was applied?',
        hint: 'Working backwards · original = final ÷ (1 + pct ÷ 100)',
        answer: 'Divide by (1 + percent ÷ 100). Subtracting the percent from the final price is wrong.',
        yes: [
          'Number A is the value you can see now, after the change',
          'Percentage (%) is the change that was applied — negative for a discount already taken',
          'The answer is A ÷ (1 + % ÷ 100)',
          'The breakdown shows the amount that was added or removed along the way',
        ],
        warn: [
          DISCLAIMER_MATH,
          'The classic mistake: taking 20% off a discounted price to "undo" a 20% discount. The base changed, so the arithmetic has to be reversed by division, not subtraction',
          'A percentage of −100% or lower has no valid inverse: the original value would be zero or negative',
          'This is the branch for pulling a pre-tax amount out of a tax-inclusive total',
        ],
        plazo: 'to strip a 25% markup out of a final price, enter the percent as 25 — not as −25.',
      },
      {
        id: 'ratio',
        label: 'Simplify a ratio and turn it into percentages',
        hint: 'A : B : C in lowest terms · greatest common divisor',
        answer: 'Divide every part by their greatest common divisor to get the lowest terms.',
        yes: [
          'Numbers A, B and C are the parts of your ratio — leave C at 0 for a two-part ratio',
          'Decimals are scaled to whole numbers first, then reduced by the greatest common divisor',
          'The breakdown gives each part as a percentage of the whole and the A ÷ B decimal value',
          'The chart is the ratio drawn as shares of one hundred percent',
        ],
        warn: [
          DISCLAIMER_MATH,
          'A ratio of 1 : 3 means one part in FOUR (25%), not one part in three — the classic mixing error',
          'A ratio and a fraction are not the same object: 1 : 3 as a fraction of the whole is 1/4',
          'Parts must all be positive; a ratio with a zero or negative part has no meaningful simplification',
        ],
        plazo: 'screen aspect ratios, paint mixes, recipe scaling and map scales all reduce this way.',
      },
      {
        id: 'ruleof3',
        label: 'Rule of three: if A gives B, what does C give?',
        hint: 'Direct proportion · x = B × C ÷ A',
        answer: 'In a direct proportion the ratio stays constant, so x = B × C ÷ A.',
        yes: [
          'Number A and Number B are the pair you already know',
          'Number C is the new first quantity; the answer x is its partner',
          'Direct proportion keeps A ÷ B constant — more of one means more of the other',
          'The breakdown also gives the unit rate, which is the fastest way to sanity-check the answer',
        ],
        warn: [
          DISCLAIMER_MATH,
          'Check that the relationship really is proportional before you use it. Two painters take half the time of one, but ten painters do not take a tenth: crowding is not linear',
          'For an INVERSE proportion (more workers, less time) the formula flips to x = A × B ÷ C — the breakdown shows that value too so you can compare',
          'A cannot be zero in a direct proportion',
        ],
        plazo: 'recipe scaling, currency conversion and map distances are all direct proportions.',
      },
    ],
  },

  inputsTitle: 'Your numbers',
  inputsIntro:
    'The same five boxes feed every branch — the help text under each one tells you what it means in the case you picked. Leave the example values in place to see how a branch behaves before you type your own.',
  fields: [
    {
      id: 'a',
      label: 'First number (A)',
      type: 'number',
      value: 250,
      step: 0.01,
      help: 'The total, the part, the original value, the first part of the ratio — depending on the branch you picked.',
    },
    {
      id: 'b',
      label: 'Second number (B)',
      type: 'number',
      value: 400,
      step: 0.01,
      help: 'The whole you compare against, the new value, or the second part of the ratio.',
    },
    {
      id: 'c',
      label: 'Third number (C)',
      type: 'number',
      value: 100,
      step: 0.01,
      help: 'Only used by the ratio branch (third part — set it to 0 for a two-part ratio) and the rule of three (the new quantity).',
    },
    {
      id: 'pct',
      label: 'Percentage (%)',
      type: 'number',
      value: 15,
      step: 0.01,
      suffix: '%',
      help: 'The percent you want to take, add, remove or reverse. Negative values mean a decrease.',
    },
    {
      id: 'pct2',
      label: 'Second percentage (%)',
      type: 'number',
      value: 0,
      step: 0.01,
      suffix: '%',
      help: 'Stacks a second change on top of the first, applied to the already-changed value. Leave at 0 if you only have one.',
    },
  ],
  fineprint: DISCLAIMER_MATH,

  chart: {
    type: 'donut',
    title: 'The whole, split the way your question splits it',
    caption:
      'Every branch cuts one whole into parts: the share you asked for against the rest of the total, the starting value against the amount that changed, or the ratio drawn as slices of one hundred percent.',
  },
  breakdownTitle: 'The arithmetic, line by line',
  breakdownIntro:
    'Each row is one step you could do by hand, in the order you would do it — including the intermediate numbers most calculators hide.',

  faq: [
    {
      q: 'What is the basic percentage formula?',
      a: 'Percent means "per hundred", so a percentage is always a fraction with 100 on the bottom. To take X% of a number N you compute N × X ÷ 100. To find what percent A is of B you compute A ÷ B × 100. Those two are inverses of each other, and almost every percentage question is one of them wearing a disguise. If you can name which number is the whole and which is the part, you already know which formula to use.',
    },
    {
      q: 'Why is percent change measured against the old value?',
      a: 'Because the point of a percent change is to say how big the move was relative to where you started. The formula is (new − old) ÷ old × 100. That is why the two directions are asymmetric: 50 up to 100 is a 100% increase, but 100 back down to 50 is only a 50% decrease, even though the absolute move is 50 both times. If you divide by the new value instead you get a number that no one else will recognise.',
    },
    {
      q: 'Why do two discounts of 20% and 10% not add up to 30%?',
      a: 'Because the second discount is taken from a price that has already shrunk. A $100 item at −20% becomes $80, and 10% off $80 is $8, so you pay $72 — a 28% total discount, not 30%. The general rule is to multiply the factors: 0.80 × 0.90 = 0.72. The same logic applies in reverse to stacked increases, which compound above the sum: +10% then +10% is +21%, not +20%.',
    },
    {
      q: 'How do I find the original price before a discount?',
      a: 'Divide, do not subtract. If a jacket is $63 after 30% off, the original was 63 ÷ (1 − 0.30) = 63 ÷ 0.70 = $90. Taking 30% off $63 would give $44.10, which is wrong by a wide margin, because the 30% was a share of the original price and not of the sale price. The same division pulls a pre-tax amount out of a tax-inclusive total: divide the total by 1 plus the tax rate.',
    },
    {
      q: 'What is the difference between percent and percentage points?',
      a: 'A percentage point is an absolute difference between two percentages; a percent change is a relative one. If an interest rate goes from 4% to 6%, that is a rise of 2 percentage points and a rise of 50 percent. Newspapers and central banks use percentage points precisely to avoid the ambiguity, and mixing the two is one of the most common ways a correct calculation ends up telling a wrong story.',
    },
    {
      q: 'Can a percentage be more than 100%?',
      a: 'Yes, whenever the part is bigger than the reference. If revenue goes from $2M to $5M that is a 150% increase, and 300 is 150% of 200. The only case where percentages are capped at 100 is when they describe a share of a fixed whole that cannot be exceeded — the parts of a single pie, for example. Percentages can also be negative, which simply means the quantity moved down.',
    },
    {
      q: 'What is a markup and how is it different from a margin?',
      a: 'A markup is measured against cost, a margin against the selling price. If an item costs $80 and sells for $100, that is a 25% markup ($20 ÷ $80) and a 20% margin ($20 ÷ $100). Both describe the same $20, so quoting the markup when someone expects the margin overstates your profitability. The conversion is margin = markup ÷ (1 + markup), and markup = margin ÷ (1 − margin).',
    },
    {
      q: 'How do I simplify a ratio?',
      a: 'Divide every part by the greatest common divisor of all the parts. For 250 : 400 the GCD is 50, so the ratio reduces to 5 : 8. If your parts have decimals, multiply them all by the same power of ten first to get whole numbers, then reduce. A ratio is in lowest terms when the only whole number that divides all its parts is 1 — which is exactly the definition the calculator applies.',
    },
    {
      q: 'Does a 1 : 3 ratio mean one third?',
      a: 'No — that is probably the single most expensive misreading in mixing, dosing and dilution. A ratio of 1 : 3 means one part of the first thing for every three of the second, so the whole is four parts and the first thing is one quarter, or 25%. One third would be written 1 : 2. Whenever a label gives a ratio, add the parts together before you convert it to a fraction or a percentage.',
    },
    {
      q: 'When can I use the rule of three?',
      a: 'Only when the two quantities really are proportional, meaning their ratio stays constant across the whole range you care about. Doubling the flour doubles the number of cookies, so recipes work. Doubling the workers does not halve every project, because coordination and shared equipment break the proportionality. In a direct proportion x = B × C ÷ A; in an inverse proportion, where the product rather than the ratio is constant, x = A × B ÷ C.',
    },
    {
      q: 'How do I calculate a percentage in my head?',
      a: 'Anchor on 10%, which is the number with the decimal point moved one place to the left, then build from there. 20% is double that, 5% is half of it, and 1% is the decimal point moved two places. So 15% of 240 is 24 + 12 = 36. The other handy trick is that X% of Y always equals Y% of X, so 4% of 75 is the same as 75% of 4, which is 3.',
    },
    {
      q: 'What does the percentage of a percentage mean?',
      a: 'It means multiplying the two decimal forms. 50% of 20% is 0.50 × 0.20 = 0.10, that is 10%. This shows up in commission splits, conversion funnels and compound tax rules, and it is why a funnel with four 50% steps converts at 6.25% rather than 200%. In this hub, the "add or subtract a percent" branch with a second percentage does exactly this compounding for you.',
    },
  ],

  sources: [
    {
      name: 'NIST/SEMATECH e-Handbook of Statistical Methods — measures and proportions',
      url: 'https://www.itl.nist.gov/div898/handbook/',
      publisher: 'NIST',
    },
    {
      name: 'NIST Special Publication 811 — Guide for the Use of the International System of Units (§7.10, percent and ratio quantities)',
      url: 'https://www.nist.gov/pml/special-publication-811',
      publisher: 'NIST',
    },
    {
      name: 'Wolfram MathWorld — Percent',
      url: 'https://mathworld.wolfram.com/Percent.html',
      publisher: 'Wolfram Research',
    },
    {
      name: 'Wolfram MathWorld — Greatest Common Divisor',
      url: 'https://mathworld.wolfram.com/GreatestCommonDivisor.html',
      publisher: 'Wolfram Research',
    },
    {
      name: 'OpenStax Prealgebra — Solve Proportions and Their Applications',
      url: 'https://openstax.org/books/prealgebra-2e/pages/6-5-solve-proportions-and-their-applications',
      publisher: 'OpenStax, Rice University',
    },
    {
      name: 'U.S. Bureau of Labor Statistics — Percent changes and percentage points in BLS data',
      url: 'https://www.bls.gov/cpi/factsheets/percent-changes.htm',
      publisher: 'U.S. Bureau of Labor Statistics',
    },
  ],

  replaces: [
    '/en/percentage-of-number-calculator',
    '/en/percentage-increase-decrease-calculator',
    '/en/percentage-calculator',
    '/en/ratio-simplifier-calculator',
    '/en/rule-of-three-simple-direct-inverse',
  ],

  lastReviewed: '2026-07-28',
};
