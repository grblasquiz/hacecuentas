/** ROI Calculator — EN, audience global. Return on investment, with optional annualized ROI. */
export interface Inputs {
  initial_investment: number | string;
  final_value: number | string;
  years?: number | string;
}
export interface Outputs {
  roi_percent: string;
  net_profit: number;
  annualized_roi: string;
  _insight?: any;
  _chart?: any;
}

const num = (v: number | string | undefined, d = NaN): number => {
  if (v === '' || v === null || v === undefined) return d;
  const n = Number(v);
  return Number.isFinite(n) ? n : d;
};

export function roiCalculator(i: Inputs): Outputs {
  const initial = num(i.initial_investment);
  const final = num(i.final_value);
  const years = num(i.years, 0) || 0;

  if (!Number.isFinite(initial) || initial <= 0) throw new Error('Enter an initial investment greater than 0');
  if (!Number.isFinite(final) || final < 0) throw new Error('Enter the final value (0 or more)');

  const net = final - initial;
  const roi = (net / initial) * 100;

  let annualized = '—';
  if (years > 0 && final > 0) {
    const ann = (Math.pow(final / initial, 1 / years) - 1) * 100;
    annualized = `${ann.toFixed(2)}%`;
  }

  const r2 = (n: number) => Math.round(n * 100) / 100;
  const netR = r2(net);
  const fmt = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const sign = net >= 0 ? '+' : '−';

  return {
    roi_percent: `${roi.toFixed(2)}%`,
    net_profit: netR,
    annualized_roi: annualized,
    _insight: {
      title: net >= 0 ? 'Net gain' : 'Net loss',
      text: `A $${fmt(initial)} investment ending at $${fmt(final)} is a **${roi.toFixed(2)}%** ROI (${sign}$${fmt(Math.abs(netR))})${years > 0 ? `, or **${annualized}** per year over ${years} year(s)` : ''}.`,
      tone: net > 0 ? 'good' : net < 0 ? 'bad' : 'neutral',
      icon: '📈',
    },
    _chart: {
      type: 'doughnut',
      slices: [{ label: 'Invested', value: r2(initial) }, { label: net >= 0 ? 'Profit' : 'Loss', value: Math.abs(netR) }],
      prefix: '$',
      centerValue: `${roi.toFixed(1)}%`,
      centerLabel: 'ROI',
      ariaLabel: `ROI of ${roi.toFixed(2)} percent, net ${sign}$${fmt(Math.abs(netR))}.`,
    },
  };
}
