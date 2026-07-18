/**
 * Missouri personal property tax de vehículos. El valor tasado = 33⅓% del valor de
 * mercado (RSMo 137.115) y el impuesto = valor tasado ÷ 100 × levy total ($/$100),
 * fijado por cada condado/distrito. Ratio y levy de ejemplo en
 * src/lib/data/usa-2026.ts (MO_PROPERTY_TAX_2026).
 */
import { MO_PROPERTY_TAX_2026, fmtUSD, fmtUSD0 } from '../data/usa-2026.ts';

export interface Inputs {
  market_value: number;   // valor de mercado del vehículo (N.A.D.A. al 1-ene)
  levy_per_100: number;   // levy total del condado/distrito ($/$100 de valor tasado)
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

export function compute(i: Inputs): Outputs {
  const market = Math.max(0, Number(i.market_value) || 0);
  const levy = Math.max(0, Number(i.levy_per_100) || MO_PROPERTY_TAX_2026.defaultLevyPer100);

  if (market <= 0) throw new Error('Enter the market value of your vehicle');

  // Valor tasado = 33⅓% del valor de mercado; MO lo redondea a la decena más cercana.
  const assessedRaw = market * MO_PROPERTY_TAX_2026.assessmentRatio;
  const assessed = Math.round(assessedRaw / 10) * 10;

  const tax = Math.round((assessed / 100) * levy * 100) / 100;
  const effRate = market > 0 ? (tax / market) * 100 : 0;

  const _insight = {
    title: 'Your Missouri vehicle property tax',
    text: `A vehicle worth **${fmtUSD0(market)}** is assessed at **33⅓%** = **${fmtUSD0(assessed)}**. At a total levy of **$${levy.toFixed(2)} per $100** of assessed value, the tax is about **${fmtUSD(tax)}** for the year — an effective **${effRate.toFixed(2)}%** of the car's value. Your county's total levy combines school, city, county, and other districts, so it varies by address; get the exact rate from your county collector.`,
    tone: 'neutral',
    icon: '🚗',
  };

  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Assessed (taxable ⅓)', value: Math.round(assessed) },
      { label: 'Not assessed', value: Math.max(0, Math.round(market - assessed)) },
    ],
    prefix: '$',
    centerValue: fmtUSD(tax),
    centerLabel: 'Annual tax',
    ariaLabel: `Of ${fmtUSD0(market)} market value, ${fmtUSD0(assessed)} is the taxable assessed value; the annual tax is ${fmtUSD(tax)}.`,
  };

  return {
    annual_tax: fmtUSD(tax),
    assessed_value: fmtUSD0(assessed),
    effective_rate: effRate.toFixed(2) + '%',
    levy_used: '$' + levy.toFixed(2) + ' / $100',
    breakdown: `${fmtUSD0(market)} × 33⅓% = ${fmtUSD0(assessed)} assessed. ${fmtUSD0(assessed)} ÷ 100 × $${levy.toFixed(2)} = ${fmtUSD(tax)} tax.`,
    _insight,
    _chart,
  };
}
