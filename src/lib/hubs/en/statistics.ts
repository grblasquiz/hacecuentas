import type { HubData } from '../types';

/**
 * Hub de decisión EN — "What do these numbers say?"
 *
 * Absorbe las 7 calculadoras inglesas de estadística y conteo:
 * average-calculator, mean-median-mode-range-statistics,
 * standard-deviation-variance-calculator, simple-linear-regression-least-squares,
 * weighted-average-calculator, combinations-n-choose-k y
 * permutaciones-n-tomados-k-pnk.
 *
 * Las fórmulas son las mismas de src/lib/formulas/: promedio-mediana.ts,
 * media-mediana-moda-rango-estadistica.ts, desvio-estandar-varianza-conjunto.ts,
 * regresion-lineal-minimos-cuadrados.ts,
 * promedio-ponderado-materias-creditos-universidad.ts,
 * combinaciones-n-tomados-k-cnk.ts y permutaciones-n-tomados-k-pnk.ts.
 */

/** Disclaimer YMYL/técnico — src/lib/disclaimers.ts, dominio 'math', versión en inglés. */
const DISCLAIMER_MATH =
  'Mathematical result based on the inputs. Verify units, assumptions, and rounding before technical use.';

export const hub: HubData = {
  slug: 'en/math/statistics',
  title: 'Statistics Calculator: mean, median, mode, standard deviation, regression and combinations',
  description:
    'Paste a list of numbers and get the mean, median, mode, range, variance and standard deviation, plus weighted averages, least-squares regression with R², and how many combinations or permutations a set allows.',
  silo: 'Math',
  siloHref: '/en/math',
  locale: 'en',

  eyebrow: 'Math · statistics and counting',
  h1: 'What do these numbers actually say?',
  lede:
    'Paste your data once and read it properly: where the middle sits, how far the values scatter around it, whether two variables move together, and how many ways a set can be arranged. Every branch shows the intermediate steps, not just the final figure.',
  stamps: [
    'Population and sample formulas kept separate',
    'Descriptive stats, weighted averages, regression and counting',
    '7 calculators inside',
  ],

  resultLabel: 'Your statistic',

  cases: {
    title: 'What are you trying to find out?',
    intro:
      'Statistics is several different questions wearing one name. Start with describing a single set — the most common case — and switch branch if you have two variables, weights, or a counting problem.',
    items: [
      {
        id: 'describe',
        label: 'Describe one set of numbers',
        hint: 'Mean, median, mode, range, quartiles',
        answer: 'The mean is the balance point, the median is the middle value, and the gap between them tells you about the shape.',
        yes: [
          'Paste your values into "Data set", separated by commas or spaces',
          'You get count, sum, minimum, maximum, range, mean, median and mode',
          'Comparing the mean against the median tells you which way the data leans: mean above median means a right skew',
          'The chart puts the mean on the actual min-to-max scale of your data, split into thirds',
        ],
        warn: [
          DISCLAIMER_MATH,
          'One extreme value can drag the mean a long way while barely moving the median — that is exactly why income figures are usually reported as medians',
          'A data set can have no mode, one mode or several. Reporting a mode for continuous measurements is usually meaningless',
          'The range only uses two numbers out of the whole set, so it is extremely sensitive to a single outlier',
        ],
        plazo: 'if the mean and the median are far apart, quote the median and say why.',
      },
      {
        id: 'spread',
        label: 'How spread out is the data?',
        hint: 'Variance, standard deviation, coefficient of variation',
        answer: 'Variance is the average squared distance from the mean; the standard deviation is its square root, back in the original units.',
        yes: [
          'Paste your values into "Data set" and choose population or sample below',
          'Population divides by n; sample divides by n − 1, which is Bessel\'s correction',
          'The coefficient of variation (standard deviation ÷ mean) lets you compare spread across data in different units',
          'You also get the standard error of the mean and the one-sigma interval around the mean',
        ],
        warn: [
          DISCLAIMER_MATH,
          'Use the sample formula whenever your numbers are a sample drawn from a larger group you want to describe. Using the population formula on a sample understates the spread',
          'A sample standard deviation needs at least two values — with n = 1 the denominator is zero',
          'The standard deviation assumes the mean is a meaningful centre. On heavily skewed data, quote the interquartile range instead',
        ],
        plazo: 'a coefficient of variation under 15% is tight, over 30% is genuinely scattered.',
      },
      {
        id: 'weighted',
        label: 'A weighted average or a GPA',
        hint: 'Grades and credit hours · Σ(value × weight) ÷ Σ(weight)',
        answer: 'Multiply each value by its weight, add those up, and divide by the total weight — not by the number of items.',
        yes: [
          'Put your values in "Data set" and the matching weights in "Second data set"',
          'For a GPA, values are grade points and weights are credit hours',
          'The two lists must have the same length, and every weight must be positive',
          'You also get the plain unweighted average, so you can see how much the weighting moved the result',
        ],
        warn: [
          DISCLAIMER_MATH,
          'Averaging the grades without weighting is the classic GPA mistake: a B in a 5-credit course counts more than an A in a 1-credit one',
          'Weights do not have to add up to 1 or 100 — the formula divides by their total, whatever it is',
          'Institutions differ on how they treat withdrawals, pass/fail credits and repeated courses. This is the arithmetic, not your registrar\'s policy',
        ],
        plazo: 'check the two lists have the same number of entries before you trust the result.',
      },
      {
        id: 'regression',
        label: 'Do two variables move together?',
        hint: 'Least-squares line, slope, intercept, R²',
        answer: 'The least-squares line is the one that minimises the total squared vertical distance to your points.',
        yes: [
          'Put your X values in "Data set" and the matching Y values in "Second data set"',
          'You get the slope, the intercept, the correlation coefficient r and the coefficient of determination R²',
          'The slope says how much Y moves per unit of X; R² says what share of Y\'s variation the line explains',
          'You need at least two pairs, and the X values cannot all be identical',
        ],
        warn: [
          DISCLAIMER_MATH,
          'Correlation is not causation. A high R² only says the line fits, not that X drives Y — a hidden third variable explains a great many strong fits',
          'The line is only trustworthy inside the range of X you actually measured. Extrapolating past the edges of your data is where regressions go badly wrong',
          'A single outlier can dominate a least-squares fit, because the errors are squared before they are added up. Always look at the scatter, not just R²',
        ],
        plazo: 'R² above 0.7 is a strong fit; below 0.3, the line is telling you almost nothing.',
      },
      {
        id: 'counting',
        label: 'How many combinations or arrangements?',
        hint: 'C(n,k) and P(n,k) · order matters or it does not',
        answer: 'If order matters it is a permutation; if it does not, it is a combination — and there are always fewer combinations.',
        yes: [
          'Use the "Set size (n)" and "Choose (k)" boxes; the data boxes are ignored in this branch',
          'C(n,k) = n! ÷ (k! × (n−k)!) counts selections where order is irrelevant',
          'P(n,k) = n! ÷ (n−k)! counts arrangements where order matters',
          'The two are related: P(n,k) = C(n,k) × k!, because each selection can be ordered k! ways',
        ],
        warn: [
          DISCLAIMER_MATH,
          'k has to be between 0 and n — you cannot choose more items than the set contains',
          'These formulas assume every item is distinct and nothing is picked twice. Drawing with replacement is a different count entirely',
          'Factorials explode: 20! already exceeds 2.4 quintillion, so beyond roughly n = 170 the result overflows what a computer can hold as a normal number',
        ],
        plazo: 'a 6-of-49 lottery is C(49,6) = 13,983,816 tickets — one of each is the only sure win.',
      },
    ],
  },

  inputsTitle: 'Your data',
  inputsIntro:
    'Values can be separated by commas, spaces or semicolons — anything non-numeric is ignored. The second list is only used by the weighted-average and regression branches.',
  fields: [
    {
      id: 'data',
      label: 'Data set',
      type: 'text',
      value: '12, 15, 15, 18, 21, 24, 40',
      help: 'Your list of numbers. In the regression branch these are the X values; in the weighted branch, the values being averaged.',
    },
    {
      id: 'data2',
      label: 'Second data set (weights or Y values)',
      type: 'text',
      value: '3, 4, 3, 3, 4, 3, 2',
      help: 'Weights for the weighted average, or the matching Y values for regression. Must have the same number of entries as the first list.',
    },
    {
      id: 'basis',
      label: 'Population or sample?',
      type: 'select',
      value: 'sample',
      options: [
        { value: 'sample', label: 'Sample — divide by n − 1 (Bessel\'s correction)' },
        { value: 'population', label: 'Population — divide by n' },
      ],
      help: 'Choose "sample" when your numbers are a subset of a bigger group you want to describe. It is the safer default.',
    },
    {
      id: 'n',
      label: 'Set size (n)',
      type: 'number',
      value: 49,
      min: 0,
      max: 170,
      step: 1,
      help: 'Counting branch only: how many distinct items you are choosing from.',
    },
    {
      id: 'k',
      label: 'Choose (k)',
      type: 'number',
      value: 6,
      min: 0,
      max: 170,
      step: 1,
      help: 'Counting branch only: how many of them you pick. Must be between 0 and n.',
    },
  ],
  fineprint: DISCLAIMER_MATH,

  chart: {
    type: 'scale',
    title: 'Where your headline number falls',
    caption:
      'A positional scale, not a pie: the marker shows where your statistic sits on the range that gives it meaning — the mean inside your own minimum-to-maximum span, R² between a weak and a very strong fit, or the share of the set you are picking.',
    bands: [
      { label: 'Bottom of the range', from: 0, to: 33, tone: 'neutral' },
      { label: 'Middle of the range', from: 33, to: 67, tone: 'good' },
      { label: 'Top of the range', from: 67, to: 100, tone: 'neutral' },
    ],
  },
  breakdownTitle: 'Every step of the calculation',
  breakdownIntro:
    'The intermediate quantities most calculators hide — sums, squared deviations, degrees of freedom — so you can check the result by hand or reproduce it in a spreadsheet.',

  faq: [
    {
      q: 'What is the difference between mean, median and mode?',
      a: 'The mean is the sum divided by the count — the balance point of the data. The median is the middle value once everything is sorted, with the average of the two middle values when the count is even. The mode is whatever value appears most often. They coincide in a perfectly symmetric distribution and separate as soon as it skews, which is why the gap between the mean and the median is itself a useful diagnostic: mean above median means a few large values are pulling the average up.',
    },
    {
      q: 'When should I report the median instead of the mean?',
      a: 'Whenever the distribution is skewed or contains outliers you do not want to let dominate. Household income is the standard example: a handful of very high incomes drag the mean far above what a typical household earns, so official statistics report the median. The mean is the better choice for symmetric data and whenever you need a figure that adds up correctly across groups, since medians cannot be combined by weighting the way means can.',
    },
    {
      q: 'Why does the sample standard deviation divide by n − 1?',
      a: 'Because the sample mean is itself estimated from the same data, and it sits by construction slightly closer to the sample points than the true population mean does. Dividing by n would therefore systematically understate the spread. Dividing by n − 1, known as Bessel\'s correction, makes the variance an unbiased estimator of the population variance. The correction matters most on small samples: with n = 5 it inflates the variance by 25%, with n = 100 by about 1%.',
    },
    {
      q: 'What is the difference between variance and standard deviation?',
      a: 'Variance is the average of the squared distances from the mean, so it is expressed in squared units — squared dollars, squared centimeters — which nobody can interpret directly. The standard deviation is its square root, which brings it back into the original units and makes it comparable to the mean. Variance remains the quantity that behaves nicely in algebra: variances of independent variables add, standard deviations do not.',
    },
    {
      q: 'What is the coefficient of variation for?',
      a: 'It is the standard deviation divided by the mean, expressed as a percentage, and it lets you compare the spread of data sets that use different units or sit at very different scales. A standard deviation of 5 is enormous around a mean of 10 and negligible around a mean of 10,000. As rough guidance, under 15% counts as tightly clustered, 15–30% as moderate, and above 30% as genuinely scattered. It is only meaningful for ratio data with a positive mean.',
    },
    {
      q: 'How do I calculate a weighted average?',
      a: 'Multiply each value by its weight, add up those products, and divide by the sum of the weights. The mistake to avoid is dividing by the number of items instead of by the total weight. For a GPA the values are grade points and the weights are credit hours, so a 3.0 earned in a four-credit course counts twice as much as a 4.0 earned in a two-credit seminar. Weights do not need to sum to one; the formula normalises them for you.',
    },
    {
      q: 'What does R² actually mean?',
      a: 'R² is the share of the variation in Y that the fitted line accounts for. An R² of 0.82 means the line explains 82% of how much Y moves, leaving 18% to everything the model does not capture. It equals the square of the correlation coefficient r for a simple linear regression. What it does not tell you is whether the relationship is causal, whether a straight line was the right shape, or whether one outlier is doing all the work.',
    },
    {
      q: 'Does a high correlation prove that one thing causes the other?',
      a: 'No. A strong fit is consistent with X causing Y, with Y causing X, with a third variable driving both, and with pure coincidence in a small sample. Ice cream sales and drowning deaths correlate strongly, and the cause of both is summer. Establishing causation needs either an experiment where you control X, or a design that rules out the plausible confounders. The regression tells you about association only.',
    },
    {
      q: 'What is the difference between a combination and a permutation?',
      a: 'A permutation counts arrangements where order matters; a combination counts selections where it does not. Picking three people for a committee is a combination — the same three people are the same committee whatever order you name them in. Picking a president, a treasurer and a secretary from the same three is a permutation, because swapping roles gives a different outcome. The two are linked by P(n,k) = C(n,k) × k!, since each selection can be ordered k! ways.',
    },
    {
      q: 'How many combinations are there in a 6-of-49 lottery?',
      a: 'C(49,6) = 49! ÷ (6! × 43!) = 13,983,816. Order does not matter on a lottery ticket, so it is a combination rather than a permutation — the permutation count P(49,6) is 720 times larger, at just over 10 billion. Because there are fourteen million equally likely tickets, buying one of each would guarantee the jackpot, and would also cost far more than most jackpots pay out.',
    },
    {
      q: 'What is the standard error of the mean?',
      a: 'It is the standard deviation divided by the square root of the sample size, and it estimates how much your sample mean would bounce around if you repeated the sampling. It is the quantity behind confidence intervals: roughly 95% of sample means fall within about two standard errors of the true mean. Note the square root — quadrupling your sample size only halves the standard error, which is why precision gets expensive fast.',
    },
    {
      q: 'How many values do I need for these statistics to mean anything?',
      a: 'The arithmetic works from n = 1 for the mean and n = 2 for a sample standard deviation, but working is not the same as being informative. With fewer than about ten values a standard deviation is very unstable, and a regression on three points can show a near-perfect R² purely by chance. Treat small-sample results as a description of the numbers you have, not as an estimate of anything wider.',
    },
  ],

  sources: [
    {
      name: 'NIST/SEMATECH e-Handbook of Statistical Methods — summary statistics and measures of scale',
      url: 'https://www.itl.nist.gov/div898/handbook/eda/section3/eda35.htm',
      publisher: 'NIST / SEMATECH',
    },
    {
      name: 'NIST/SEMATECH e-Handbook — Linear Least Squares Regression',
      url: 'https://www.itl.nist.gov/div898/handbook/pmd/section1/pmd141.htm',
      publisher: 'NIST / SEMATECH',
    },
    {
      name: 'U.S. Census Bureau — Why the Census Bureau reports median rather than mean household income',
      url: 'https://www.census.gov/topics/income-poverty/income.html',
      publisher: 'U.S. Census Bureau',
    },
    {
      name: 'Wolfram MathWorld — Bessel\'s Correction',
      url: 'https://mathworld.wolfram.com/BesselsCorrection.html',
      publisher: 'Wolfram Research',
    },
    {
      name: 'Wolfram MathWorld — Binomial Coefficient and Permutation',
      url: 'https://mathworld.wolfram.com/BinomialCoefficient.html',
      publisher: 'Wolfram Research',
    },
    {
      name: 'OpenStax Introductory Statistics — Measures of the Center and Spread of the Data',
      url: 'https://openstax.org/books/introductory-statistics-2e/pages/2-5-measures-of-the-center-of-the-data',
      publisher: 'OpenStax, Rice University',
    },
  ],

  replaces: [
    '/en/average-calculator',
    '/en/mean-median-mode-range-statistics',
    '/en/standard-deviation-variance-calculator',
    '/en/simple-linear-regression-least-squares',
    '/en/weighted-average-calculator',
    '/en/combinations-n-choose-k',
    '/en/permutaciones-n-tomados-k-pnk',
  ],

  lastReviewed: '2026-07-28',
};
