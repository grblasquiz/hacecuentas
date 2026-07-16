/**
 * Property tax calculator by US state.
 * Estima el impuesto anual a la propiedad = valor de la vivienda × tasa efectiva
 * promedio del estado (owner-occupied), con opción de tasa personalizada por
 * condado/municipio. Tasas efectivas promedio: Tax Foundation / U.S. Census ACS.
 *
 * Las tasas efectivas por estado se mueven despacio (datos ACS anuales). Ancladas
 * a valores verificados (NJ 2,38%; IL 2,32%; NH 2,15%; CT 1,98%; HI 0,28%;
 * AL 0,43%; LA 0,51%; DE 0,55%). Son PROMEDIOS: el condado/municipio real varía.
 */

// Tasa efectiva promedio de impuesto a la propiedad (owner-occupied), en %.
// Fuente: Tax Foundation "How High Are Property Taxes in Your State" / Census ACS.
const STATE_RATES: Record<string, number> = {
  AL: 0.43, AK: 1.07, AZ: 0.63, AR: 0.64, CA: 0.75, CO: 0.55, CT: 1.98, DE: 0.55,
  FL: 0.91, GA: 0.92, HI: 0.28, ID: 0.67, IL: 2.32, IN: 0.84, IA: 1.52, KS: 1.34,
  KY: 0.85, LA: 0.51, ME: 1.24, MD: 1.05, MA: 1.14, MI: 1.38, MN: 1.11, MS: 0.79,
  MO: 0.98, MT: 0.74, NE: 1.63, NV: 0.55, NH: 2.15, NJ: 2.38, NM: 0.73, NY: 1.64,
  NC: 0.80, ND: 0.98, OH: 1.53, OK: 0.90, OR: 0.93, PA: 1.49, RI: 1.40, SC: 0.57,
  SD: 1.17, TN: 0.67, TX: 1.68, UT: 0.57, VT: 1.83, VA: 0.82, WA: 0.87, WV: 0.57,
  WI: 1.61, WY: 0.61, DC: 0.57,
};

const STATE_NAMES: Record<string, string> = {
  AL: 'Alabama', AK: 'Alaska', AZ: 'Arizona', AR: 'Arkansas', CA: 'California',
  CO: 'Colorado', CT: 'Connecticut', DE: 'Delaware', FL: 'Florida', GA: 'Georgia',
  HI: 'Hawaii', ID: 'Idaho', IL: 'Illinois', IN: 'Indiana', IA: 'Iowa', KS: 'Kansas',
  KY: 'Kentucky', LA: 'Louisiana', ME: 'Maine', MD: 'Maryland', MA: 'Massachusetts',
  MI: 'Michigan', MN: 'Minnesota', MS: 'Mississippi', MO: 'Missouri', MT: 'Montana',
  NE: 'Nebraska', NV: 'Nevada', NH: 'New Hampshire', NJ: 'New Jersey', NM: 'New Mexico',
  NY: 'New York', NC: 'North Carolina', ND: 'North Dakota', OH: 'Ohio', OK: 'Oklahoma',
  OR: 'Oregon', PA: 'Pennsylvania', RI: 'Rhode Island', SC: 'South Carolina',
  SD: 'South Dakota', TN: 'Tennessee', TX: 'Texas', UT: 'Utah', VT: 'Vermont',
  VA: 'Virginia', WA: 'Washington', WV: 'West Virginia', WI: 'Wisconsin', WY: 'Wyoming',
  DC: 'District of Columbia',
};

const NATIONAL_AVG = 0.90; // tasa efectiva promedio nacional aprox. (%)

export interface Inputs {
  home_value: number;
  state: string;         // código de 2 letras, 'DC' o 'custom'
  custom_rate?: number;  // tasa % si state = 'custom'
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

function fmtUSD0(n: number): string {
  return '$' + Math.round(n).toLocaleString('en-US', { maximumFractionDigits: 0 });
}
function fmtUSD(n: number): string {
  return '$' + (Math.round(n * 100) / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function compute(i: Inputs): Outputs {
  const value = Math.max(0, Number(i.home_value) || 0);
  const stateCode = String(i.state || 'TX').toUpperCase();
  if (value <= 0) throw new Error('Enter your home value');

  let rate: number;
  let stateLabel: string;
  if (stateCode === 'CUSTOM') {
    rate = Math.max(0, Number(i.custom_rate) || 0);
    stateLabel = 'your custom rate';
    if (rate <= 0) throw new Error('Enter a custom property tax rate');
  } else {
    rate = STATE_RATES[stateCode];
    if (rate === undefined) { rate = STATE_RATES.TX; stateLabel = STATE_NAMES.TX; }
    else stateLabel = STATE_NAMES[stateCode] || stateCode;
  }

  const annual = value * (rate / 100);
  const monthly = annual / 12;
  const per1000 = rate * 10; // dólares por cada $1.000 de valor
  const nationalAnnual = value * (NATIONAL_AVG / 100);
  const vsNational = annual - nationalAnnual;

  const compareText = Math.abs(vsNational) < 1
    ? 'about the same as the national average'
    : vsNational > 0
      ? `${fmtUSD0(Math.abs(vsNational))} more than the ~${NATIONAL_AVG}% national average`
      : `${fmtUSD0(Math.abs(vsNational))} less than the ~${NATIONAL_AVG}% national average`;

  const _insight = {
    title: `About ${fmtUSD0(annual)} per year in property tax`,
    text: `A ${fmtUSD0(value)} home in **${stateLabel}** (average effective rate **${rate}%**) owes roughly **${fmtUSD0(annual)}/year** — about **${fmtUSD0(monthly)}/month** in your escrow, or ${fmtUSD0(per1000)} per $1,000 of value. That is ${compareText}.`,
    tone: rate >= 1.5 ? 'warn' : rate <= 0.6 ? 'good' : 'neutral',
    icon: '🏡',
  };

  const _chart = {
    type: 'bar',
    labels: [stateLabel.length > 14 ? stateCode : stateLabel, 'National avg'],
    values: [Math.round(annual), Math.round(nationalAnnual)],
    prefix: '$',
    ariaLabel: `Estimated property tax ${fmtUSD0(annual)} in ${stateLabel} versus ${fmtUSD0(nationalAnnual)} at the national average.`,
  };

  return {
    annual_property_tax: fmtUSD0(annual),
    monthly_escrow: fmtUSD(monthly),
    effective_rate_used: rate + '%',
    per_1000_value: fmtUSD(per1000),
    vs_national: compareText,
    breakdown: `${fmtUSD0(value)} × ${rate}% = ${fmtUSD0(annual)}/year (${fmtUSD(monthly)}/month). ${stateLabel} average effective rate ${rate}% vs ~${NATIONAL_AVG}% nationally.`,
    _insight,
    _chart,
  };
}
