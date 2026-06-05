/**
 * Sales Tax Calculator (US) — EN, audience global.
 * Add tax to a pre-tax amount, or extract the tax baked into a tax-inclusive total.
 */
export interface Inputs {
  amount: number | string;
  tax_rate: number | string;
  mode?: 'add' | 'extract';
}
export interface Outputs {
  tax_amount: number;
  total: number;
  net: number;
  effective_rate: string;
  _insight?: any;
  _chart?: any;
}

const num = (v: number | string | undefined, d = NaN): number => {
  if (v === '' || v === null || v === undefined) return d;
  const n = Number(v);
  return Number.isFinite(n) ? n : d;
};

export function salesTaxCalculator(i: Inputs): Outputs {
  const amount = num(i.amount);
  const rate = num(i.tax_rate);
  const mode = i.mode === 'extract' ? 'extract' : 'add';

  if (!Number.isFinite(amount) || amount <= 0) throw new Error('Enter an amount greater than 0');
  if (!Number.isFinite(rate) || rate < 0 || rate > 100) throw new Error('Enter a tax rate between 0 and 100%');

  const r = rate / 100;
  let net: number, tax: number, total: number;
  if (mode === 'extract') {
    // amount is the tax-inclusive total; back out the pre-tax price.
    total = amount;
    net = amount / (1 + r);
    tax = total - net;
  } else {
    net = amount;
    tax = amount * r;
    total = amount + tax;
  }

  const round2 = (n: number) => Math.round(n * 100) / 100;
  const netR = round2(net), taxR = round2(tax), totalR = round2(total);
  const fmt = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const text = mode === 'extract'
    ? `A tax-inclusive total of **$${fmt(totalR)}** at **${rate}%** breaks down to **$${fmt(netR)}** pre-tax plus **$${fmt(taxR)}** sales tax.`
    : `**$${fmt(netR)}** at **${rate}%** sales tax adds **$${fmt(taxR)}**, for a total of **$${fmt(totalR)}**.`;

  return {
    tax_amount: taxR,
    total: totalR,
    net: netR,
    effective_rate: `${rate}%`,
    _insight: {
      title: mode === 'extract' ? 'Tax backed out of total' : 'Total with sales tax',
      text,
      tone: 'neutral',
      icon: '🧾',
    },
    _chart: {
      type: 'doughnut',
      slices: [
        { label: 'Pre-tax', value: netR },
        { label: 'Sales tax', value: taxR },
      ],
      prefix: '$',
      centerValue: `$${fmt(totalR)}`,
      centerLabel: 'Total',
      ariaLabel: `Pre-tax $${fmt(netR)} plus sales tax $${fmt(taxR)} equals $${fmt(totalR)} total.`,
    },
  };
}
