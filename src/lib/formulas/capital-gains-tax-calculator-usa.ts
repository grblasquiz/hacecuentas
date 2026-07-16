/**
 * Capital gains tax calculator — tax year 2026.
 * Short-term (≤1 año) tributa como ingreso ordinario (tasa marginal apilada);
 * long-term (>1 año) usa los tramos 0/15/20% apilados sobre el ingreso gravable,
 * más el Net Investment Income Tax (NIIT) 3,8% si corresponde.
 * Fuente única: src/lib/data/usa-2026.ts.
 */
import {
  calcFederalTax,
  CAPITAL_GAINS_2026,
  NIIT_2026,
  fmtUSD,
  fmtUSD0,
  type FilingStatus,
} from '../data/usa-2026.ts';

export interface Inputs {
  filing_status: string;   // 'single' | 'mfj' | 'mfs' | 'hoh'
  taxable_income: number;  // otro ingreso gravable ordinario (para apilar la ganancia)
  purchase_price: number;  // costo base
  sale_price: number;      // precio de venta
  other_costs?: number;    // mejoras + comisiones que suman al costo base
  holding: string;         // 'long' | 'short'
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

const STATUSES: FilingStatus[] = ['single', 'mfj', 'mfs', 'hoh'];

export function compute(i: Inputs): Outputs {
  const status = (STATUSES.includes(i.filing_status as FilingStatus) ? i.filing_status : 'single') as FilingStatus;
  const ordinary = Math.max(0, Number(i.taxable_income) || 0);
  const basis = Math.max(0, Number(i.purchase_price) || 0);
  const sale = Math.max(0, Number(i.sale_price) || 0);
  const otherCosts = Math.max(0, Number(i.other_costs) || 0);
  const isLong = String(i.holding || 'long') !== 'short';

  if (sale <= 0 && basis <= 0) throw new Error('Enter the purchase and sale prices');

  const gain = sale - basis - otherCosts;

  // ── Caso pérdida de capital ──
  if (gain <= 0) {
    const loss = Math.abs(gain);
    return {
      capital_gains_tax: fmtUSD(0),
      capital_gain: '−' + fmtUSD(loss),
      tax_rate_applied: 'Capital loss — no tax',
      niit: fmtUSD(0),
      after_tax_gain: '−' + fmtUSD(loss),
      effective_rate: '0%',
      breakdown: `Sale ${fmtUSD(sale)} − basis ${fmtUSD(basis + otherCosts)} = a capital loss of ${fmtUSD(loss)}. Capital losses offset capital gains; up to $3,000 of net loss can offset ordinary income per year, with the rest carried forward.`,
      _insight: {
        title: 'This is a capital loss',
        text: `You sold for ${fmtUSD0(sale)} against a ${fmtUSD0(basis + otherCosts)} cost basis — a **loss of ${fmtUSD0(loss)}**. There is no capital gains tax; you can use the loss to offset other gains, and up to **$3,000/year** against ordinary income (excess carries forward).`,
        tone: 'neutral',
        icon: '📉',
      },
    };
  }

  let tax = 0;
  let rateLabel: string;

  if (!isLong) {
    // Short-term: impuesto incremental sobre la ganancia como ingreso ordinario.
    tax = calcFederalTax(ordinary + gain, status) - calcFederalTax(ordinary, status);
    const eff = gain > 0 ? tax / gain : 0;
    rateLabel = `${(eff * 100).toFixed(0)}% ordinary (short-term)`;
  } else {
    // Long-term: tramos 0/15/20 apilados sobre el ingreso ordinario.
    const { zeroMax, fifteenMax } = CAPITAL_GAINS_2026[status];
    const top = ordinary + gain;
    const band0 = Math.max(0, Math.min(top, zeroMax) - ordinary);
    const band15 = Math.max(0, Math.min(top, fifteenMax) - Math.max(ordinary, zeroMax));
    const band20 = Math.max(0, top - Math.max(ordinary, fifteenMax));
    tax = band15 * 0.15 + band20 * 0.20;
    const parts: string[] = [];
    if (band0 > 0) parts.push('0%');
    if (band15 > 0) parts.push('15%');
    if (band20 > 0) parts.push('20%');
    rateLabel = `${parts.join(' / ')} long-term`;
  }

  // ── Net Investment Income Tax (NIIT) 3,8% ──
  const magi = ordinary + gain; // aproximación de MAGI
  const niitBase = Math.min(gain, Math.max(0, magi - NIIT_2026.threshold[status]));
  const niit = niitBase * NIIT_2026.rate;

  const totalTax = Math.round((tax + niit) * 100) / 100;
  const afterTax = Math.round((gain - totalTax) * 100) / 100;
  const effRate = gain > 0 ? totalTax / gain : 0;

  const _insight = {
    title: `${isLong ? 'Long-term' : 'Short-term'} capital gains tax`,
    text: `On a **${fmtUSD0(gain)}** ${isLong ? 'long-term' : 'short-term'} gain (stacked on ${fmtUSD0(ordinary)} of other taxable income), your federal capital gains tax is about **${fmtUSD(totalTax)}** — an effective **${(effRate * 100).toFixed(1)}%**${niit > 0 ? `, including ${fmtUSD(niit)} of the 3.8% NIIT` : ''}. You keep **${fmtUSD0(afterTax)}** of the gain.`,
    tone: 'neutral',
    icon: '📊',
  };

  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Capital gains tax', value: Math.round(totalTax) },
      { label: 'After-tax gain', value: Math.max(0, Math.round(afterTax)) },
    ],
    prefix: '$',
    centerValue: fmtUSD0(gain),
    centerLabel: 'Capital gain',
    ariaLabel: `Of a ${fmtUSD0(gain)} gain, ${fmtUSD0(totalTax)} goes to tax and ${fmtUSD0(afterTax)} is kept.`,
  };

  return {
    capital_gains_tax: fmtUSD(totalTax),
    capital_gain: fmtUSD(gain),
    tax_rate_applied: rateLabel,
    niit: fmtUSD(niit),
    after_tax_gain: fmtUSD(afterTax),
    effective_rate: (effRate * 100).toFixed(1) + '%',
    breakdown: `Gain ${fmtUSD(gain)} (${isLong ? 'long-term' : 'short-term'}) → ${rateLabel} = ${fmtUSD(tax)}${niit > 0 ? ` + NIIT ${fmtUSD(niit)}` : ''} = ${fmtUSD(totalTax)}. After-tax gain ${fmtUSD(afterTax)}.`,
    _insight,
    _chart,
  };
}
