/**
 * Currency Converter — EN, audience global. Rate-input model: the user supplies the current
 * exchange rate, so the result is always accurate and never goes stale (no hardcoded FX).
 */
export interface Inputs {
  amount: number | string;
  exchange_rate: number | string;
}
export interface Outputs {
  converted: number;
  inverse_rate: number;
  rate_used: number;
  _insight?: any;
}

const num = (v: number | string | undefined, d = NaN): number => {
  if (v === '' || v === null || v === undefined) return d;
  const n = Number(v);
  return Number.isFinite(n) ? n : d;
};

export function currencyConverter(i: Inputs): Outputs {
  const amount = num(i.amount);
  const rate = num(i.exchange_rate);

  if (!Number.isFinite(amount) || amount < 0) throw new Error('Enter an amount (0 or more)');
  if (!Number.isFinite(rate) || rate <= 0) throw new Error('Enter the current exchange rate (greater than 0)');

  const converted = amount * rate;
  const inverse = 1 / rate;
  const r2 = (n: number) => Math.round(n * 100) / 100;
  const fmt = (n: number, d = 2) => n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });

  return {
    converted: r2(converted),
    inverse_rate: Math.round(inverse * 1e6) / 1e6,
    rate_used: rate,
    _insight: {
      title: 'Converted amount',
      text: `At a rate of **${fmt(rate, 4)}**, **${fmt(amount)}** converts to **${fmt(r2(converted))}**. (Inverse rate: 1 ÷ ${fmt(rate, 4)} = ${fmt(inverse, 6)}.)`,
      tone: 'neutral',
      icon: '💱',
    },
  };
}
