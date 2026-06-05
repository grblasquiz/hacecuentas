/** Overtime Pay Calculator — EN, audience global. US FLSA default: 1.5× after 40 hrs/week. */
export interface Inputs {
  hourly_rate: number | string;
  regular_hours: number | string;
  overtime_hours: number | string;
  overtime_multiplier?: number | string;
}
export interface Outputs {
  total_pay: number;
  regular_pay: number;
  overtime_pay: number;
  overtime_rate: number;
  _insight?: any;
  _chart?: any;
}

const num = (v: number | string | undefined, d = NaN): number => {
  if (v === '' || v === null || v === undefined) return d;
  const n = Number(v);
  return Number.isFinite(n) ? n : d;
};

export function overtimePayCalculator(i: Inputs): Outputs {
  const rate = num(i.hourly_rate);
  const reg = num(i.regular_hours, 0);
  const ot = num(i.overtime_hours, 0);
  const mult = num(i.overtime_multiplier, 1.5) || 1.5;

  if (!Number.isFinite(rate) || rate <= 0) throw new Error('Enter an hourly rate greater than 0');
  if (reg < 0 || ot < 0) throw new Error('Hours cannot be negative');
  if (mult < 1) throw new Error('Overtime multiplier is usually 1.5 (time-and-a-half) or 2 (double time)');

  const otRate = rate * mult;
  const regularPay = rate * reg;
  const overtimePay = otRate * ot;
  const total = regularPay + overtimePay;

  const r2 = (n: number) => Math.round(n * 100) / 100;
  const fmt = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const regR = r2(regularPay), otR = r2(overtimePay), totR = r2(total);

  return {
    total_pay: totR,
    regular_pay: regR,
    overtime_pay: otR,
    overtime_rate: r2(otRate),
    _insight: {
      title: 'Your gross pay',
      text: `${ot} overtime hours at **${mult}×** ($${fmt(r2(otRate))}/hr) add **$${fmt(otR)}** on top of **$${fmt(regR)}** regular pay, for **$${fmt(totR)}** gross.`,
      tone: 'neutral',
      icon: '⏱️',
    },
    _chart: {
      type: 'doughnut',
      slices: [{ label: 'Regular', value: regR }, { label: 'Overtime', value: otR }],
      prefix: '$',
      centerValue: `$${fmt(totR)}`,
      centerLabel: 'Total pay',
      ariaLabel: `Regular pay $${fmt(regR)} plus overtime $${fmt(otR)} equals $${fmt(totR)}.`,
    },
  };
}
