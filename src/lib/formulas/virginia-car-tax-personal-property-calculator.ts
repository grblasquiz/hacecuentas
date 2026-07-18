/**
 * Virginia car tax — personal property tax de vehículos. El impuesto = valor tasado
 * (NADA/J.D. Power clean trade-in al 1-ene) ÷ 100 × tasa local ($/$100). El PPTRA
 * (Personal Property Tax Relief Act) subsidia un % del impuesto sobre los primeros
 * $20.000 de valor tasado de vehículos de uso personal.
 * Tope PPTRA y tasas de referencia en src/lib/data/usa-2026.ts (VA_CAR_TAX_2026).
 */
import { VA_CAR_TAX_2026, fmtUSD, fmtUSD0 } from '../data/usa-2026.ts';

export interface Inputs {
  assessed_value: number;    // valor tasado del vehículo
  rate_per_100: number;      // tasa local $/$100 de valor tasado
  pptra_relief_pct: number;  // % de alivio PPTRA sobre los primeros $20.000
  qualifies_relief: string;  // yes | no (vehículo de uso personal)
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

export function compute(i: Inputs): Outputs {
  const assessed = Math.max(0, Number(i.assessed_value) || 0);
  const rate = Math.max(0, Number(i.rate_per_100) || VA_CAR_TAX_2026.defaultRatePer100);
  const reliefPct = Math.max(0, Math.min(100, Number(i.pptra_relief_pct) || 0));
  const qualifies = i.qualifies_relief !== 'no';

  if (assessed <= 0) throw new Error('Enter the assessed value of your vehicle');

  const grossTax = Math.round((assessed / 100) * rate * 100) / 100;

  const reliefBase = Math.min(assessed, VA_CAR_TAX_2026.pptraReliefCap);
  const reliefTaxOnBase = (reliefBase / 100) * rate;
  const relief = qualifies ? Math.round(reliefTaxOnBase * (reliefPct / 100) * 100) / 100 : 0;

  const netTax = Math.max(0, Math.round((grossTax - relief) * 100) / 100);
  const effRate = assessed > 0 ? (netTax / assessed) * 100 : 0;

  const _insight = {
    title: 'Your Virginia car tax',
    text: `On an assessed value of **${fmtUSD0(assessed)}** at a rate of **$${rate.toFixed(2)} per $100**, the gross tax is **${fmtUSD(grossTax)}**.${qualifies && relief > 0 ? ` PPTRA relief of **${reliefPct}%** on the first $20,000 cuts **${fmtUSD(relief)}**, leaving **${fmtUSD(netTax)}** due.` : ` No PPTRA relief applies, so **${fmtUSD(netTax)}** is due.`} That is an effective **${effRate.toFixed(2)}%** of the vehicle's value. Rates and relief percentages are set each year by your city or county — check your locality for the exact figures.`,
    tone: 'neutral',
    icon: '🚙',
  };

  const _chart = relief > 0 ? {
    type: 'doughnut',
    slices: [
      { label: 'Tax you pay', value: Math.round(netTax) },
      { label: 'PPTRA relief', value: Math.round(relief) },
    ],
    prefix: '$',
    centerValue: fmtUSD0(netTax),
    centerLabel: 'You pay',
    ariaLabel: `Gross tax ${fmtUSD(grossTax)}: you pay ${fmtUSD(netTax)} after ${fmtUSD(relief)} PPTRA relief.`,
  } : undefined;

  return {
    net_tax: fmtUSD(netTax),
    gross_tax: fmtUSD(grossTax),
    relief_amount: fmtUSD(relief),
    effective_rate: effRate.toFixed(2) + '%',
    breakdown: `${fmtUSD0(assessed)} ÷ 100 × $${rate.toFixed(2)} = ${fmtUSD(grossTax)} gross.${relief > 0 ? ` PPTRA: ${fmtUSD0(reliefBase)} ÷ 100 × $${rate.toFixed(2)} × ${reliefPct}% = ${fmtUSD(relief)} relief.` : ''} Net tax ${fmtUSD(netTax)}.`,
    _insight,
    _chart,
  };
}
