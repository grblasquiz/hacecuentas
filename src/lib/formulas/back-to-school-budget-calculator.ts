/**
 * Back-to-School Budget Calculator (US) — EN, audience global.
 * Estimates a household back-to-school budget from number of kids, grade
 * level, and whether electronics are on the list, using NRF 2026 survey
 * averages (K-12: $863.86/household; college: $1,437.79/household).
 */
export interface Inputs {
  kids: number | string;
  grade_level: 'elementary' | 'middle' | 'high' | 'college';
  include_electronics?: 'yes' | 'no';
}
export interface Outputs {
  total_budget: number;
  clothing_budget: number;
  shoes_budget: number;
  supplies_budget: number;
  electronics_budget: number;
  other_budget: number;
  per_child: number;
  _insight?: any;
  _chart?: any;
}

const num = (v: number | string | undefined, d = NaN): number => {
  if (v === '' || v === null || v === undefined) return d;
  const n = Number(v);
  return Number.isFinite(n) ? n : d;
};

// NRF/Prosper Insights 2026 back-to-class survey — average planned spend per
// household. K-12 categories: electronics $293.11, clothing $250.29,
// shoes $174.01, school supplies $146.45 (total $863.86). College (per
// household, $1,437.79): electronics $341.95, dorm/apartment $194.00,
// clothing $182.39, food $153.91, personal care $133.34, rest = other.
const K12 = { electronics: 293.11, clothing: 250.29, shoes: 174.01, supplies: 146.45 };
const COLLEGE = { total: 1437.79, electronics: 341.95, dorm: 194.0, clothing: 182.39, food: 153.91, personalCare: 133.34 };

// Grade multipliers applied to the K-12 household average: younger kids need
// fewer/cheaper electronics and clothing sizes; high schoolers skew higher.
// Stated as an editorial assumption on the page.
const GRADE_MULT: Record<string, number> = { elementary: 0.85, middle: 1.0, high: 1.15 };

const round2 = (n: number) => Math.round(n * 100) / 100;
const fmt = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

export function compute(i: Inputs): Outputs {
  const kids = num(i.kids);
  if (!Number.isFinite(kids) || kids < 1 || kids > 10) throw new Error('Enter between 1 and 10 kids');
  const grade = i.grade_level;
  if (!['elementary', 'middle', 'high', 'college'].includes(grade)) throw new Error('Pick a grade level');
  const electronics = i.include_electronics !== 'no';

  let clothing = 0, shoes = 0, supplies = 0, electr = 0, other = 0;

  if (grade === 'college') {
    // College survey is per household; treat each student as one "household unit".
    electr = electronics ? COLLEGE.electronics * kids : 0;
    clothing = COLLEGE.clothing * kids;
    supplies = 0; // folded into "other" below via dorm/food/personal care
    shoes = 0;
    other = (COLLEGE.dorm + COLLEGE.food + COLLEGE.personalCare + (COLLEGE.total - COLLEGE.electronics - COLLEGE.dorm - COLLEGE.clothing - COLLEGE.food - COLLEGE.personalCare)) * kids;
  } else {
    const m = GRADE_MULT[grade];
    // NRF averages are per household (avg ~1.6 K-12 kids); convert to a
    // per-child base and scale: first child carries the full household base,
    // extra kids add ~65% (shared supplies, hand-me-downs, one printer).
    const scale = 1 + (kids - 1) * 0.65;
    clothing = K12.clothing * m * scale;
    shoes = K12.shoes * m * scale;
    supplies = K12.supplies * m * scale;
    electr = electronics ? K12.electronics * m * scale : 0;
  }

  const total = clothing + shoes + supplies + electr + other;

  return {
    total_budget: round2(total),
    clothing_budget: round2(clothing),
    shoes_budget: round2(shoes),
    supplies_budget: round2(supplies),
    electronics_budget: round2(electr),
    other_budget: round2(other),
    per_child: round2(total / kids),
    _insight: {
      title: 'Your back-to-school budget',
      text: `Plan for about **$${fmt(total)}** total (~$${fmt(total / kids)} per ${grade === 'college' ? 'student' : 'child'}). The NRF 2026 average is $863.86 per K-12 household and $1,437.79 per college household${electronics ? '' : ' — you trimmed the biggest line by skipping electronics'}. Time purchases with your state's sales tax holiday to shave another 4-7%.`,
      tone: 'neutral',
      icon: '🎒',
    },
    _chart: {
      type: 'doughnut',
      slices: [
        { label: 'Clothing', value: round2(clothing) },
        { label: 'Shoes', value: round2(shoes) },
        { label: 'School supplies', value: round2(supplies) },
        { label: 'Electronics', value: round2(electr) },
        { label: 'Dorm, food & other', value: round2(other) },
      ].filter((s) => s.value > 0),
      prefix: '$',
      centerValue: `$${fmt(total)}`,
      centerLabel: 'Total budget',
      ariaLabel: `Estimated back-to-school budget: $${fmt(total)} total.`,
    },
  };
}
