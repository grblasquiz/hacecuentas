/** VAT Calculator — EN, audience global. Add VAT to a net price or remove VAT from a gross price. */
export interface Inputs {
  amount: number | string;
  vat_rate: number | string;
  mode?: 'add' | 'remove';
}
export interface Outputs {
  vat_amount: number;
  net: number;
  gross: number;
  effective_rate: string;
  _insight?: any;
  _chart?: any;
}

const num = (v: number | string | undefined, d = NaN): number => {
  if (v === '' || v === null || v === undefined) return d;
  const n = Number(v);
  return Number.isFinite(n) ? n : d;
};

export function vatCalculator(i: Inputs): Outputs {
  const amount = num(i.amount);
  const rate = num(i.vat_rate);
  const mode = i.mode === 'remove' ? 'remove' : 'add';

  if (!Number.isFinite(amount) || amount <= 0) throw new Error('Enter an amount greater than 0');
  if (!Number.isFinite(rate) || rate < 0 || rate > 100) throw new Error('Enter a VAT rate between 0 and 100%');

  const r = rate / 100;
  let net: number, vat: number, gross: number;
  if (mode === 'remove') {
    gross = amount;
    net = amount / (1 + r);
    vat = gross - net;
  } else {
    net = amount;
    vat = amount * r;
    gross = amount + vat;
  }

  const r2 = (n: number) => Math.round(n * 100) / 100;
  const netR = r2(net), vatR = r2(vat), grossR = r2(gross);
  const fmt = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const text = mode === 'remove'
    ? `A VAT-inclusive price of **${fmt(grossR)}** at **${rate}%** is **${fmt(netR)}** net plus **${fmt(vatR)}** VAT.`
    : `**${fmt(netR)}** net at **${rate}%** VAT adds **${fmt(vatR)}**, for a gross of **${fmt(grossR)}**.`;

  return {
    vat_amount: vatR,
    net: netR,
    gross: grossR,
    effective_rate: `${rate}%`,
    _insight: { title: mode === 'remove' ? 'VAT removed from gross' : 'VAT added to net', text, tone: 'neutral', icon: '🧾' },
    _chart: {
      type: 'doughnut',
      slices: [{ label: 'Net', value: netR }, { label: 'VAT', value: vatR }],
      centerValue: fmt(grossR),
      centerLabel: 'Gross',
      ariaLabel: `Net ${fmt(netR)} plus VAT ${fmt(vatR)} equals gross ${fmt(grossR)}.`,
    },
  };
}
