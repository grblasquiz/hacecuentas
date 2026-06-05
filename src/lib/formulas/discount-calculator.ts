/** Discount Calculator — EN, audience global. Single or stacked (chained) discounts. */
export interface Inputs {
  original_price: number | string;
  discount_1: number | string;
  discount_2?: number | string;
}
export interface Outputs {
  final_price: number;
  savings: number;
  total_discount: string;
  _insight?: any;
  _chart?: any;
}

const num = (v: number | string | undefined, d = NaN): number => {
  if (v === '' || v === null || v === undefined) return d;
  const n = Number(v);
  return Number.isFinite(n) ? n : d;
};

export function discountCalculator(i: Inputs): Outputs {
  const price = num(i.original_price);
  const d1 = num(i.discount_1, 0);
  const d2 = num(i.discount_2, 0) || 0;

  if (!Number.isFinite(price) || price <= 0) throw new Error('Enter an original price greater than 0');
  if (d1 < 0 || d1 > 100) throw new Error('Discount must be between 0 and 100%');
  if (d2 < 0 || d2 > 100) throw new Error('Second discount must be between 0 and 100%');

  const factor = (1 - d1 / 100) * (1 - d2 / 100);
  const finalPrice = price * factor;
  const savings = price - finalPrice;
  const totalPct = (savings / price) * 100;

  const r2 = (n: number) => Math.round(n * 100) / 100;
  const finalR = r2(finalPrice), savingsR = r2(savings);
  const fmt = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const text = d2 > 0
    ? `Stacking **${d1}%** then **${d2}%** gives a real discount of **${totalPct.toFixed(1)}%** — not ${d1 + d2}%, because the second is applied to the already-reduced price.`
    : `**${d1}%** off **$${fmt(price)}** means you pay **$${fmt(finalR)}** and save **$${fmt(savingsR)}**.`;

  return {
    final_price: finalR,
    savings: savingsR,
    total_discount: `${totalPct.toFixed(1)}%`,
    _insight: { title: 'Your real discount', text, tone: totalPct >= 30 ? 'good' : 'neutral', icon: '🏷️' },
    _chart: {
      type: 'doughnut',
      slices: [{ label: 'You pay', value: finalR }, { label: 'You save', value: savingsR }],
      prefix: '$',
      centerValue: `$${fmt(finalR)}`,
      centerLabel: 'Final price',
      ariaLabel: `From $${fmt(price)}, you pay $${fmt(finalR)} and save $${fmt(savingsR)}.`,
    },
  };
}
