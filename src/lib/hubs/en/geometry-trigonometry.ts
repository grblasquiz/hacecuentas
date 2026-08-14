import type { HubData } from '../types';

/**
 * Hub de decisión EN — "What's the area, the angle or the distance?"
 *
 * Absorbe las 5 calculadoras inglesas de geometría y trigonometría:
 * triangle-area-herons-formula, sphere-volume-surface-area,
 * distance-two-points-cartesian-plane, sine-cosine-tangent-angle-calculator y
 * radians-to-degrees-angle.
 *
 * Fórmulas espejadas de src/lib/formulas/: area-triangulo-heron-tres-lados.ts,
 * volumen-superficie-esfera-radio.ts, distancia-dos-puntos-plano-cartesiano.ts,
 * seno-coseno-tangente-angulo-triangulo.ts y conversion-radianes-grados-angulo.ts.
 *
 * El factor rad→grados es 180/π = 57,29577951308232, el mismo exacto que usaba
 * la fórmula vieja.
 */

/** Disclaimer YMYL/técnico — src/lib/disclaimers.ts, dominio 'math', versión en inglés. */
const DISCLAIMER_MATH =
  'Mathematical result based on the inputs. Verify units, assumptions, and rounding before technical use.';

export const hub: HubData = {
  slug: 'en/math/geometry-trigonometry',
  title: 'Geometry & Trigonometry: area, volume and distance',
  description:
    'Work out the area of a triangle from its three sides with Heron\'s formula, the volume and surface area of a sphere, the distance between two points, the sine, cosine and tangent of an angle, and the conversion between radians and degrees.',
  silo: 'Math',
  siloHref: '/en/math',
  locale: 'en',

  eyebrow: 'Math · geometry and trigonometry',
  h1: 'What is the area, the angle or the distance?',
  lede:
    'Five shapes-and-angles questions that keep coming up — a triangle from three side lengths, a sphere from its radius, the gap between two coordinates, the trig ratios of an angle, and radians against degrees — each with the geometry behind the number spelled out.',
  stamps: [
    'Heron\'s formula, Pythagoras and the unit circle',
    'Both directions of the radian-degree conversion',
    '5 calculators inside',
  ],

  resultLabel: 'Your measurement',

  cases: {
    title: 'What are you measuring?',
    intro:
      'Each branch reads a different set of the boxes below. Start with the triangle, which is the one people look for most, and switch if your question is about a sphere, a distance or an angle.',
    items: [
      {
        id: 'triangle',
        label: 'The area of a triangle from its three sides',
        hint: 'Heron\'s formula · uses a, b, c',
        answer: 'Heron\'s formula gets the area from the three sides alone, with no height and no angle needed.',
        yes: [
          'Side lengths a, b and c, in any consistent unit',
          'The semiperimeter s = (a + b + c) ÷ 2 and the area √(s(s−a)(s−b)(s−c))',
          'The perimeter, the height on each side, and the radius of the inscribed and circumscribed circles',
          'Whether the triangle is acute, right or obtuse, from comparing the longest side against the other two',
        ],
        warn: [
          DISCLAIMER_MATH,
          'The triangle inequality has to hold: each side must be shorter than the sum of the other two. If it does not, there is no such triangle and the formula returns the square root of a negative number',
          'The area comes out in squared units of whatever you typed. Mixing feet and inches across the three sides silently produces nonsense',
          'Heron\'s formula loses precision on very thin triangles where one side is nearly the sum of the other two — the numerically stable variant sorts the sides first',
        ],
        plazo: 'quick check: any triangle with sides 3, 4 and 5 is right-angled and has an area of exactly 6.',
      },
      {
        id: 'sphere',
        label: 'The volume and surface area of a sphere',
        hint: 'V = 4/3 πr³ and S = 4πr² · uses a as the radius',
        answer: 'Volume grows with the cube of the radius, surface area only with its square — that gap explains a lot of physics.',
        yes: [
          'Coefficient a is the radius; the rest of the boxes are ignored',
          'Volume V = 4/3 × π × r³ and surface area S = 4 × π × r²',
          'The diameter, the great-circle circumference, and the surface-area-to-volume ratio',
          'The chart compares the sphere against the smallest cube that would contain it',
        ],
        warn: [
          DISCLAIMER_MATH,
          'Radius, not diameter. Feeding a diameter into the radius box overstates the volume eightfold',
          'Doubling the radius multiplies the surface by 4 and the volume by 8. This is why large animals overheat and small ones lose heat, and why a big storage tank costs less material per liter than a small one',
          'A sphere holds exactly π/6, about 52.4%, of the volume of its bounding cube — the tightest a single ball can pack into a box',
        ],
        plazo: 'the surface-to-volume ratio is 3 ÷ r, so it falls as the sphere grows.',
      },
      {
        id: 'distance',
        label: 'The distance between two points',
        hint: 'Pythagoras on the plane · (a, b) to (c, d)',
        answer: 'The distance formula is the Pythagorean theorem with Δx and Δy as the two legs.',
        yes: [
          'The first point is (a, b) and the second is (c, d)',
          'Distance = √(Δx² + Δy²), where Δx = c − a and Δy = d − b',
          'You also get the midpoint, the slope of the line, and the angle it makes with the horizontal',
          'The chart splits the squared distance into its Δx² and Δy² halves — the Pythagorean identity, drawn',
        ],
        warn: [
          DISCLAIMER_MATH,
          'This is straight-line (Euclidean) distance. City-block or Manhattan distance, |Δx| + |Δy|, is a different and usually larger number',
          'Latitude and longitude are not Cartesian coordinates: the distance between two degrees of longitude shrinks towards the poles, so this formula does not give a distance on the globe',
          'A vertical line has an undefined slope, because Δx is zero — the distance is still perfectly well defined',
        ],
        plazo: 'the midpoint is just the average of the two x values and the average of the two y values.',
      },
      {
        id: 'trig',
        label: 'The sine, cosine and tangent of an angle',
        hint: 'Trig ratios · uses the angle box and its unit',
        answer: 'Sine and cosine are the coordinates of a point on the unit circle; the tangent is their ratio.',
        yes: [
          'Enter the angle and pick degrees or radians in the unit selector',
          'You get sine, cosine, tangent, and the reciprocals cosecant, secant and cotangent',
          'The Pythagorean identity sin²θ + cos²θ = 1 is what the chart draws',
          'The angle is also reported in the other unit, and reduced into its first-turn equivalent',
        ],
        warn: [
          DISCLAIMER_MATH,
          'Check the unit before you trust the number. sin(30) is 0.5 in degrees and −0.988 in radians — most calculator errors in trigonometry are this one',
          'The tangent is undefined at 90° and 270°, where the cosine is zero. The calculator reports it as undefined rather than as a very large number',
          'In a right triangle these ratios only apply to the two non-right angles, and always relative to the hypotenuse',
        ],
        plazo: 'anchors worth memorising: sin 30° = 0.5, sin 45° = cos 45° = 0.7071, and tan 45° = 1.',
      },
      {
        id: 'angle',
        label: 'Radians to degrees, or degrees to radians',
        hint: '180° = π rad · uses the angle box and its unit',
        answer: 'One radian is 180 ÷ π degrees, about 57.2958°, and a full turn is 2π radians.',
        yes: [
          'Enter the angle and pick which unit it is currently in',
          'Radians to degrees multiplies by 180 ÷ π = 57.29577951; degrees to radians divides by the same factor',
          'The angle also comes out as a multiple of π, and as a fraction of a full turn',
          'Gradians are included too, for the surveying and older-calculator cases',
        ],
        warn: [
          DISCLAIMER_MATH,
          'Radians are the natural unit for calculus and for any physics with rotation: the derivative of sin x is cos x only when x is in radians',
          'Spreadsheets and most programming languages take radians, not degrees. Passing degrees to a sine function is one of the most persistent bugs in engineering code',
          'A radian is not a physical unit but a pure ratio — arc length divided by radius — which is why it disappears from dimensional analysis',
        ],
        plazo: 'the anchors: π rad = 180°, π/2 = 90°, π/4 = 45°, and 2π = one full turn.',
      },
    ],
  },

  inputsTitle: 'Your figures',
  inputsIntro:
    'Lengths and coordinates share the first four boxes; the angle has its own box and its own unit selector. Every branch tells you in its help text which ones it actually reads.',
  fields: [
    {
      id: 'a',
      label: 'a — first side, radius, or point 1 x',
      type: 'number',
      value: 3,
      step: 0.0001,
      help: 'Triangle: the first side. Sphere: the radius. Distance: the x coordinate of the first point.',
    },
    {
      id: 'b',
      label: 'b — second side, or point 1 y',
      type: 'number',
      value: 4,
      step: 0.0001,
      help: 'Triangle: the second side. Distance: the y coordinate of the first point. Not used for the sphere.',
    },
    {
      id: 'c',
      label: 'c — third side, or point 2 x',
      type: 'number',
      value: 5,
      step: 0.0001,
      help: 'Triangle: the third side. Distance: the x coordinate of the second point.',
    },
    {
      id: 'd',
      label: 'd — point 2 y',
      type: 'number',
      value: 12,
      step: 0.0001,
      help: 'Distance branch only: the y coordinate of the second point.',
    },
    {
      id: 'ang',
      label: 'Angle',
      type: 'number',
      value: 45,
      step: 0.0001,
      help: 'Used by the trigonometry and the radian-degree branches. Pick its unit below.',
    },
    {
      id: 'unit',
      label: 'Angle unit',
      type: 'select',
      value: 'deg',
      options: [
        { value: 'deg', label: 'Degrees (°)' },
        { value: 'rad', label: 'Radians (rad)' },
      ],
      help: 'Which unit the angle above is written in. Getting this wrong is the single most common trigonometry error.',
    },
  ],
  fineprint: DISCLAIMER_MATH,

  chart: {
    type: 'donut',
    title: 'One whole, split into the parts that make it',
    caption:
      'Every branch cuts a real total into its pieces: the perimeter into three sides, the squared distance into Δx² and Δy², the unit circle into sin²θ and cos²θ, a full turn into your angle and what is left of it.',
  },
  breakdownTitle: 'The geometry, line by line',
  breakdownIntro:
    'The intermediate quantities that make the answer checkable — the semiperimeter, the deltas, the identities — not just the final figure.',

  faq: [
    {
      q: 'What is Heron\'s formula?',
      a: 'It gives the area of any triangle from its three side lengths alone: compute the semiperimeter s = (a + b + c) ÷ 2, then take √(s(s−a)(s−b)(s−c)). Its value is that it needs no height and no angle, so it works on a plot of land you can only measure along the edges. It is attributed to Heron of Alexandria in the first century, though Archimedes may well have known it earlier.',
    },
    {
      q: 'What is the triangle inequality and why does it matter here?',
      a: 'Each side of a triangle has to be shorter than the sum of the other two — otherwise the two shorter sides cannot reach across the longest one and no triangle closes. Sides of 2, 3 and 9 are impossible. In Heron\'s formula, violating the inequality makes one of the (s − side) factors negative, so the product under the square root goes negative and the area is not a real number. That is the algebra reporting the geometry honestly.',
    },
    {
      q: 'How do I tell whether a triangle is right, acute or obtuse from its sides?',
      a: 'Compare the square of the longest side against the sum of the squares of the other two. If they are equal, the triangle is right-angled — that is the converse of the Pythagorean theorem, and it is why 3, 4, 5 works. If the longest side squared is smaller, every angle is acute; if larger, one angle is obtuse. The test costs three multiplications and needs no trigonometry at all.',
    },
    {
      q: 'What is the formula for the volume of a sphere?',
      a: 'V = 4/3 × π × r³, and the surface area is S = 4 × π × r². Both take the radius, not the diameter, which is where most errors come from: putting a diameter in the radius slot inflates the volume by a factor of eight. A useful relationship is that the surface area is exactly the derivative of the volume with respect to the radius, which is the geometric statement that growing a sphere adds a thin shell.',
    },
    {
      q: 'Why does the surface-area-to-volume ratio matter?',
      a: 'Because it is 3 ÷ r, so it falls as the sphere grows. Small things have enormous surface relative to their bulk and exchange heat, water and gas with their surroundings very fast; large things cannot. It is why mice must eat constantly and elephants must shed heat through their ears, why crushed ice melts faster than a block, and why big storage tanks need less steel per liter than small ones.',
    },
    {
      q: 'How do I calculate the distance between two points?',
      a: 'Distance = √((x₂ − x₁)² + (y₂ − y₁)²). It is the Pythagorean theorem with the horizontal and vertical gaps as the two legs and the distance as the hypotenuse. From (3, 4) to (5, 12) the gaps are 2 and 8, so the distance is √(4 + 64) = √68 ≈ 8.246. The same construction extends to three dimensions by adding a Δz² term under the root.',
    },
    {
      q: 'Can I use the distance formula on latitude and longitude?',
      a: 'Not directly, and doing so is a classic source of wrong mileages. Degrees of latitude are roughly constant at about 111 km, but degrees of longitude shrink from 111 km at the equator to nothing at the poles, so treating a lat/long pair as flat coordinates overstates east-west distances badly outside the tropics. The haversine formula, which works on the sphere, is the right tool for that job.',
    },
    {
      q: 'What is the difference between degrees and radians?',
      a: 'Degrees are an arbitrary division of a circle into 360 parts, inherited from Babylonian arithmetic and convenient because 360 has so many divisors. A radian is defined by the circle itself: it is the angle whose arc length equals the radius, so a full turn is exactly 2π radians. That definition is what makes calculus work cleanly — the derivative of sin x equals cos x only when x is measured in radians.',
    },
    {
      q: 'How do I convert radians to degrees?',
      a: 'Multiply by 180 ÷ π, which is 57.29577951308232. Going the other way, multiply degrees by π ÷ 180. The anchors worth remembering are π rad = 180°, π/2 = 90°, π/3 = 60°, π/4 = 45° and π/6 = 30°. Since a radian is a ratio of two lengths it carries no physical dimension, which is why it can be introduced or dropped in a formula without breaking dimensional analysis.',
    },
    {
      q: 'What do sine, cosine and tangent actually represent?',
      a: 'On a unit circle, the cosine of an angle is the x coordinate of the point at that angle and the sine is the y coordinate — which is why sin²θ + cos²θ = 1 is just the Pythagorean theorem on a radius of length one. In a right triangle, sine is opposite over hypotenuse, cosine is adjacent over hypotenuse, and tangent is opposite over adjacent, which also makes tangent equal to sine divided by cosine.',
    },
    {
      q: 'Why is the tangent undefined at 90 degrees?',
      a: 'Because the tangent is sine divided by cosine, and at 90° the cosine is exactly zero. Dividing by zero has no value, so the tangent is undefined there rather than infinite: approaching 90° from below the tangent grows without bound, and from above it comes back from negative infinity. Geometrically, the tangent measures a slope, and at 90° the line is vertical and has no slope.',
    },
    {
      q: 'What are the trig values I should just memorise?',
      a: 'Five angles cover most of what you will ever need. sin 0° = 0, sin 30° = 0.5, sin 45° = √2/2 ≈ 0.7071, sin 60° = √3/2 ≈ 0.8660 and sin 90° = 1. Cosine is the same list read backwards, since cos θ = sin(90° − θ). Tangent follows from dividing them, giving tan 30° ≈ 0.5774, tan 45° = 1 and tan 60° ≈ 1.7321.',
    },
  ],

  sources: [
    {
      name: 'NIST Digital Library of Mathematical Functions — Elementary Functions: trigonometric functions',
      url: 'https://dlmf.nist.gov/4.14',
      publisher: 'NIST',
    },
    {
      name: 'Wolfram MathWorld — Heron\'s Formula',
      url: 'https://mathworld.wolfram.com/HeronsFormula.html',
      publisher: 'Wolfram Research',
    },
    {
      name: 'Wolfram MathWorld — Sphere',
      url: 'https://mathworld.wolfram.com/Sphere.html',
      publisher: 'Wolfram Research',
    },
    {
      name: 'Wolfram MathWorld — Distance',
      url: 'https://mathworld.wolfram.com/Distance.html',
      publisher: 'Wolfram Research',
    },
    {
      name: 'BIPM — The International System of Units: the radian as a dimensionless derived unit',
      url: 'https://www.bipm.org/en/publications/si-brochure',
      publisher: 'Bureau International des Poids et Mesures',
    },
    {
      name: 'OpenStax Algebra and Trigonometry — Unit Circle: Sine and Cosine Functions',
      url: 'https://openstax.org/books/algebra-and-trigonometry-2e/pages/7-3-unit-circle',
      publisher: 'OpenStax, Rice University',
    },
  ],

  replaces: [
    '/en/triangle-area-herons-formula',
    '/en/sphere-volume-surface-area',
    '/en/distance-two-points-cartesian-plane',
    '/en/sine-cosine-tangent-angle-calculator',
    '/en/radians-to-degrees-angle',
  ],

  lastReviewed: '2026-07-28',
};
