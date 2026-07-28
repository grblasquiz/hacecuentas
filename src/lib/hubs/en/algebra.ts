import type { HubData } from '../types';

/**
 * Hub de decisión EN — "How do I solve this equation?"
 *
 * Absorbe las 7 calculadoras inglesas de álgebra y aritmética:
 * quadratic-equation-roots-discriminant, 2x2-linear-system-cramer-rule,
 * 2x2-matrix-determinant-inverse, logarithm-base-any-number,
 * polynomial-integral-calculator, arithmetic-progression-nth-term-sum y
 * gcd-lcm-two-integers.
 *
 * Fórmulas espejadas de src/lib/formulas/:
 * ecuacion-cuadratica-raices-discriminante.ts, sistema-ecuaciones-2x2-cramer.ts,
 * determinante-inversa-matriz-2x2.ts, logaritmo-base-cualquiera-numero.ts,
 * integral-indefinida-polinomio-coefs.ts, progresion-aritmetica-suma-termino.ts
 * y mcd-mcm-dos-numeros-enteros.ts.
 */

/** Disclaimer YMYL/técnico — src/lib/disclaimers.ts, dominio 'math', versión en inglés. */
const DISCLAIMER_MATH =
  'Mathematical result based on the inputs. Verify units, assumptions, and rounding before technical use.';

export const hub: HubData = {
  slug: 'en/math/algebra',
  title: 'Algebra Solver: quadratic formula, 2×2 systems, matrices, logs, sequences, GCD and integrals',
  description:
    'Solve the algebra you actually get asked for: quadratic roots and the discriminant, 2×2 linear systems by Cramer\'s rule, matrix determinant and inverse, logarithms in any base, arithmetic sequences, GCD and LCM, and polynomial integrals — each with the working shown.',
  silo: 'Math',
  siloHref: '/en/math',
  locale: 'en',

  eyebrow: 'Math · algebra and number theory',
  h1: 'How do I solve this equation?',
  lede:
    'Seven of the most-asked algebra problems in one place, each solved with the standard method and the intermediate quantity that decides the answer — the discriminant, the determinant, the greatest common divisor — written out rather than hidden.',
  stamps: [
    'The working, not just the answer',
    'Quadratics, systems, matrices, logs, sequences, GCD and integrals',
    '7 calculators inside',
  ],

  resultLabel: 'Your solution',

  cases: {
    title: 'Which equation are you looking at?',
    intro:
      'Each branch uses a different subset of the coefficient boxes below — the help text under each box tells you what it means once you have chosen. Quadratics are the most common starting point.',
    items: [
      {
        id: 'quadratic',
        label: 'A quadratic: ax² + bx + c = 0',
        hint: 'Roots and the discriminant · uses a, b, c',
        answer: 'The sign of the discriminant b² − 4ac decides everything: two real roots, one double root, or none.',
        yes: [
          'Coefficients a, b and c from ax² + bx + c = 0',
          'The quadratic formula x = (−b ± √(b² − 4ac)) ÷ 2a',
          'The discriminant b² − 4ac, plus the vertex, the axis of symmetry, and the sum and product of the roots',
          'When the discriminant is negative you get the complex conjugate pair rather than an error',
        ],
        warn: [
          DISCLAIMER_MATH,
          'If a is zero this is not a quadratic at all but a straight line, and it has a single root x = −c ÷ b',
          'Watch the signs in b² − 4ac: with a negative c the term −4ac becomes positive and the discriminant grows, which is why an upward parabola with a negative constant always crosses the axis twice',
          'Vieta\'s formulas give a fast sanity check: the roots must sum to −b ÷ a and multiply to c ÷ a',
        ],
        plazo: 'quick read: discriminant positive means two crossings, zero means a tangent, negative means no real crossing.',
      },
      {
        id: 'system',
        label: 'A 2×2 system of linear equations',
        hint: 'Cramer\'s rule · ax + by = e, cx + dy = f',
        answer: 'If the determinant ad − bc is not zero the two lines cross at exactly one point, and Cramer\'s rule finds it.',
        yes: [
          'Coefficients a, b for the first equation and c, d for the second',
          'Right-hand sides e and f',
          'x = (ed − bf) ÷ (ad − bc) and y = (af − ec) ÷ (ad − bc)',
          'The determinant, both numerator determinants, and a check that substitutes the answer back in',
        ],
        warn: [
          DISCLAIMER_MATH,
          'A determinant of zero means no unique solution: the two lines are either parallel (no solution) or the same line (infinitely many). Cramer\'s rule cannot tell those two apart on its own',
          'A determinant close to zero without being zero makes the system ill-conditioned — small changes in your coefficients swing the answer a long way',
          'Cramer\'s rule is elegant at 2×2 and hopeless at scale; anything bigger uses elimination',
        ],
        plazo: 'always substitute the answer back into both equations — it takes ten seconds and catches sign errors.',
      },
      {
        id: 'matrix',
        label: 'The determinant and inverse of a 2×2 matrix',
        hint: 'det = ad − bc · uses a, b, c, d',
        answer: 'A 2×2 matrix has an inverse exactly when its determinant is not zero.',
        yes: [
          'Matrix entries a, b on the top row and c, d on the bottom row',
          'The determinant ad − bc',
          'The inverse, which is 1 ÷ det times the swapped-and-negated matrix [[d, −b], [−c, a]]',
          'The trace, and the eigenvalues when they are real',
        ],
        warn: [
          DISCLAIMER_MATH,
          'A zero determinant means the matrix is singular: its rows are multiples of one another, it squashes the plane onto a line, and no inverse exists',
          'The determinant is also the area scale factor of the transformation — a negative determinant means the orientation flips',
          'Numerically, inverting a matrix with a tiny determinant amplifies every rounding error in the input',
        ],
        plazo: 'the adjugate shortcut only works at 2×2: swap the diagonal, negate the off-diagonal, divide by the determinant.',
      },
      {
        id: 'log',
        label: 'A logarithm in any base',
        hint: 'log_b(x) · uses e as the number and d as the base',
        answer: 'log_b(x) is the exponent you must raise b to in order to reach x — computed by the change-of-base formula.',
        yes: [
          'Box e is the number x you are taking the log of; box d is the base',
          'The change of base formula log_b(x) = ln(x) ÷ ln(b)',
          'The same value in base 10, base 2 and base e, so you can compare',
          'The whole part and the fractional part, which is how many complete times the base fits',
        ],
        warn: [
          DISCLAIMER_MATH,
          'The domain is strict: x must be strictly positive, and the base must be positive and not equal to 1. Logs of zero and of negative numbers do not exist in the reals',
          '"log" without a base means base 10 in engineering, base e in most mathematics, and base 2 in computer science. Always check which convention a source is using',
          'A logarithm compresses scale: a difference of 1 in the log is a whole multiplication by the base, which is why log scales hide enormous absolute gaps',
        ],
        plazo: 'log₂ of a number tells you roughly how many bits it needs; log₁₀ tells you how many digits.',
      },
      {
        id: 'sequence',
        label: 'An arithmetic sequence: nth term and sum',
        hint: 'aₙ and Sₙ · uses a as a₁, b as the difference, n as the term',
        answer: 'Each term adds a constant difference, so aₙ = a₁ + (n − 1)d and the sum is n(a₁ + aₙ) ÷ 2.',
        yes: [
          'Coefficient a is the first term a₁, coefficient b is the common difference d, and n is the term you want',
          'The nth term aₙ = a₁ + (n − 1)d',
          'The sum of the first n terms Sₙ = n(a₁ + aₙ) ÷ 2, which is n times the average of the first and last terms',
          'The average term, and the total added by the increments alone',
        ],
        warn: [
          DISCLAIMER_MATH,
          'This is an ARITHMETIC sequence, which adds a constant. A geometric sequence multiplies by a constant and grows very differently — compound interest is geometric, not arithmetic',
          'The formula uses n − 1, not n: the first term has had no difference applied to it yet. Off-by-one here is the most common error in the whole topic',
          'A negative common difference is perfectly valid and makes the sequence descend',
        ],
        plazo: 'sanity check: Sₙ divided by n should land exactly halfway between the first and last term.',
      },
      {
        id: 'gcd',
        label: 'The GCD and LCM of two whole numbers',
        hint: 'Euclidean algorithm · uses a and b',
        answer: 'The greatest common divisor comes from the Euclidean algorithm, and GCD × LCM always equals a × b.',
        yes: [
          'Coefficients a and b, taken as whole numbers and used as absolute values',
          'The greatest common divisor, computed by repeated remainders',
          'The least common multiple, from LCM = |a × b| ÷ GCD',
          'Whether the two numbers are coprime, and the reduced form of the fraction a ÷ b',
        ],
        warn: [
          DISCLAIMER_MATH,
          'The GCD of a number and zero is the number itself, but the LCM is undefined when either value is zero',
          'Non-integer inputs are floored before the algorithm runs — the GCD is only defined for whole numbers',
          'The identity GCD × LCM = a × b holds for two numbers only; it does not extend to three or more',
        ],
        plazo: 'reducing a fraction, syncing two schedules and finding a common denominator are all this branch.',
      },
      {
        id: 'integral',
        label: 'The indefinite integral of a polynomial',
        hint: 'Power rule · uses the coefficients box',
        answer: 'Raise every exponent by one and divide by the new exponent — then remember the constant of integration.',
        yes: [
          'Enter the coefficients in the "Polynomial coefficients" box, highest power first',
          '3, 0, −2, 5 means 3x³ + 0x² − 2x + 5',
          'Each term becomes cxⁿ⁺¹ ÷ (n + 1), and the answer carries a + C',
          'The breakdown lists the resulting coefficient of every power',
        ],
        warn: [
          DISCLAIMER_MATH,
          'The + C is not decoration: it stands for an infinite family of parallel curves, and dropping it makes any initial-value problem unsolvable',
          'The power rule fails at n = −1, because dividing by n + 1 would divide by zero. The integral of 1/x is ln|x|, and this branch does not cover it',
          'Enter every coefficient including zeros, in order, or the powers will shift',
        ],
        plazo: 'to check the answer, differentiate it: you should get your original coefficients back.',
      },
    ],
  },

  inputsTitle: 'Your coefficients',
  inputsIntro:
    'Every branch reads a different subset of these boxes. The example values solve a quadratic with two clean real roots; change only the ones your branch actually uses.',
  fields: [
    {
      id: 'a',
      label: 'Coefficient a',
      type: 'number',
      value: 1,
      step: 0.0001,
      help: 'Quadratic: the x² coefficient. System and matrix: the top-left entry. Sequence: the first term a₁. GCD: the first number.',
    },
    {
      id: 'b',
      label: 'Coefficient b',
      type: 'number',
      value: -5,
      step: 0.0001,
      help: 'Quadratic: the x coefficient. System and matrix: the top-right entry. Sequence: the common difference d. GCD: the second number.',
    },
    {
      id: 'c',
      label: 'Coefficient c',
      type: 'number',
      value: 6,
      step: 0.0001,
      help: 'Quadratic: the constant term. System and matrix: the bottom-left entry. Unused in the other branches.',
    },
    {
      id: 'd',
      label: 'Coefficient d (log base)',
      type: 'number',
      value: 2,
      step: 0.0001,
      help: 'System and matrix: the bottom-right entry. Logarithm: the base b.',
    },
    {
      id: 'e',
      label: 'Right-hand side e (log argument)',
      type: 'number',
      value: 8,
      step: 0.0001,
      help: 'System: the right-hand side of the first equation, ax + by = e. Logarithm: the number x you are taking the log of.',
    },
    {
      id: 'f',
      label: 'Right-hand side f',
      type: 'number',
      value: 3,
      step: 0.0001,
      help: 'System only: the right-hand side of the second equation, cx + dy = f.',
    },
    {
      id: 'n',
      label: 'Term number (n)',
      type: 'number',
      value: 20,
      min: 1,
      max: 100000,
      step: 1,
      help: 'Sequence branch only: which term you want, and how many terms to add up.',
    },
    {
      id: 'coefs',
      label: 'Polynomial coefficients',
      type: 'text',
      value: '3, 0, -2, 5',
      help: 'Integral branch only. Highest power first, separated by commas: "3, 0, -2, 5" means 3x³ − 2x + 5.',
    },
  ],
  fineprint: DISCLAIMER_MATH,

  chart: {
    type: 'donut',
    title: 'The number that decides your answer, split into its pieces',
    caption:
      'Each branch breaks the deciding quantity into the parts it is built from — b² against 4ac in the discriminant, ad against bc in the determinant, the whole against the fractional part of a logarithm, the shared factor against what is left. When one slice outweighs the other, that is the answer changing shape.',
  },
  breakdownTitle: 'The working, step by step',
  breakdownIntro:
    'Every intermediate value you would write down if you were doing this on paper, in the order you would write it.',

  faq: [
    {
      q: 'What is the quadratic formula and where does it come from?',
      a: 'For ax² + bx + c = 0 with a ≠ 0, the roots are x = (−b ± √(b² − 4ac)) ÷ 2a. It comes from completing the square on the general equation, which is why every quadratic yields to it, and why the ± produces exactly two roots counted with multiplicity. The expression under the root, b² − 4ac, is the discriminant, and its sign alone tells you whether those two roots are distinct reals, one repeated real, or a complex conjugate pair.',
    },
    {
      q: 'What does the discriminant tell me?',
      a: 'It tells you how the parabola meets the x-axis without you having to solve anything. Positive means it crosses at two distinct points and you get two real roots. Zero means it just touches the axis, giving one repeated root at the vertex. Negative means it never reaches the axis, so both roots are complex conjugates. In practice this is the first thing to compute, because it decides which of three answers you are even looking for.',
    },
    {
      q: 'What is Cramer\'s rule?',
      a: 'It solves a linear system by ratios of determinants. For ax + by = e and cx + dy = f, the main determinant is D = ad − bc, and the solution is x = (ed − bf) ÷ D and y = (af − ec) ÷ D. Each numerator is D with one column replaced by the right-hand side. It is exact, requires no elimination bookkeeping, and is genuinely convenient at 2×2 — but the number of determinants explodes with size, so nobody uses it beyond 3×3.',
    },
    {
      q: 'What happens when the determinant is zero?',
      a: 'The system has no unique solution and the matrix has no inverse. Geometrically, the two equations describe lines that are either parallel and never meet, or the same line met everywhere. Cramer\'s rule cannot separate those cases because both give a zero in the denominator; you have to look at whether the right-hand sides are in the same proportion as the coefficients. For a matrix, a zero determinant means it collapses the plane onto a line, which cannot be undone.',
    },
    {
      q: 'How do I find the inverse of a 2×2 matrix?',
      a: 'Swap the two diagonal entries, negate the two off-diagonal entries, and divide everything by the determinant. So the inverse of [[a, b], [c, d]] is (1 ÷ (ad − bc)) × [[d, −b], [−c, a]]. This shortcut is specific to 2×2 — it is the adjugate method, and at larger sizes the adjugate becomes far more work than Gaussian elimination. Always check your result by multiplying: the product must be the identity matrix.',
    },
    {
      q: 'How does the change of base formula work?',
      a: 'log_b(x) = ln(x) ÷ ln(b), and it works with any base on the right as long as you use the same one top and bottom, so log₁₀ works just as well as ln. It exists because calculators historically only had base 10 and base e keys. The formula also explains why all logarithm curves are the same shape scaled vertically: changing base is just multiplying by a constant.',
    },
    {
      q: 'Why can\'t I take the logarithm of a negative number or of zero?',
      a: 'Because there is no real exponent that produces a negative result from a positive base — raising a positive number to any real power always gives a positive number. Zero is out for the same reason from the other side: the exponent would have to run to negative infinity, so the log is unbounded rather than undefined-at-a-point. The base itself must be positive and different from 1, since 1 raised to anything is always 1 and could never reach a different x.',
    },
    {
      q: 'What is the difference between an arithmetic and a geometric sequence?',
      a: 'An arithmetic sequence adds a constant difference to each term, so it plots as a straight line: 3, 7, 11, 15. A geometric sequence multiplies by a constant ratio, so it curves: 3, 6, 12, 24. The distinction matters far outside the classroom, because compound interest, population growth and viral spread are all geometric, and treating them as arithmetic is what makes long-horizon estimates come out wildly low.',
    },
    {
      q: 'How do I find the sum of an arithmetic sequence quickly?',
      a: 'Multiply the number of terms by the average of the first and last terms: Sₙ = n(a₁ + aₙ) ÷ 2. The trick, attributed to a young Gauss, is that pairing the first term with the last, the second with the second-to-last and so on gives the same total every time. That is why the average of an arithmetic sequence is always exactly midway between its endpoints, which is a fast way to check any answer.',
    },
    {
      q: 'What is the relationship between GCD and LCM?',
      a: 'For any two positive integers, GCD(a, b) × LCM(a, b) = a × b. So once the Euclidean algorithm has given you the greatest common divisor, the least common multiple is a single division away. It also explains why two coprime numbers — GCD of 1 — have an LCM equal to their product, and why numbers that share a lot of factors have an LCM much smaller than their product. The identity holds for exactly two numbers, not three.',
    },
    {
      q: 'How does the Euclidean algorithm find the GCD?',
      a: 'Repeatedly replace the larger number with the remainder of dividing it by the smaller, until the remainder is zero; the last non-zero value is the GCD. For 48 and 18: 48 mod 18 = 12, 18 mod 12 = 6, 12 mod 6 = 0, so the GCD is 6. It is over two thousand years old and still one of the fastest algorithms in use, because the numbers shrink at least geometrically at every step.',
    },
    {
      q: 'Why does an indefinite integral need a + C?',
      a: 'Because differentiation destroys constants: x² + 1, x² + 7 and x² − 300 all have the same derivative 2x. Going backwards therefore cannot recover which constant was there, so the answer is a whole family of parallel curves, written with an arbitrary + C. You pin the constant down only when you have an extra condition, such as a known point the curve passes through. The one place the power rule breaks is the exponent −1, where ∫ 1/x dx = ln|x| + C.',
    },
  ],

  sources: [
    {
      name: 'NIST Digital Library of Mathematical Functions — Algebraic Equations',
      url: 'https://dlmf.nist.gov/1.11',
      publisher: 'NIST',
    },
    {
      name: 'Wolfram MathWorld — Quadratic Formula',
      url: 'https://mathworld.wolfram.com/QuadraticFormula.html',
      publisher: 'Wolfram Research',
    },
    {
      name: 'Wolfram MathWorld — Cramer\'s Rule',
      url: 'https://mathworld.wolfram.com/CramersRule.html',
      publisher: 'Wolfram Research',
    },
    {
      name: 'Wolfram MathWorld — Euclidean Algorithm',
      url: 'https://mathworld.wolfram.com/EuclideanAlgorithm.html',
      publisher: 'Wolfram Research',
    },
    {
      name: 'NIST Digital Library of Mathematical Functions — Elementary Functions: logarithms',
      url: 'https://dlmf.nist.gov/4.2',
      publisher: 'NIST',
    },
    {
      name: 'OpenStax Calculus Volume 1 — Antiderivatives and the power rule',
      url: 'https://openstax.org/books/calculus-volume-1/pages/4-10-antiderivatives',
      publisher: 'OpenStax, Rice University',
    },
  ],

  replaces: [
    '/en/quadratic-equation-roots-discriminant',
    '/en/2x2-linear-system-cramer-rule',
    '/en/2x2-matrix-determinant-inverse',
    '/en/logarithm-base-any-number',
    '/en/polynomial-integral-calculator',
    '/en/arithmetic-progression-nth-term-sum',
    '/en/gcd-lcm-two-integers',
  ],

  lastReviewed: '2026-07-28',
};
