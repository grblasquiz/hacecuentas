/**
 * 27 biweekly pay periods in 2026 — anomalía del calendario: los empleados pagados
 * cada dos semanas pueden recibir 27 cheques en 2026 (en vez de 26) si su primer pago
 * cae temprano en enero. Compara el sueldo por cheque bajo 26 vs 27 períodos según
 * cómo lo maneje el empleador. Fórmula pura (sin tablas oficiales).
 */
import { fmtUSD, fmtUSD0 } from '../data/usa-2026.ts';

export interface Inputs {
  annual_salary: number;     // sueldo bruto anual
  employer_method: string;   // spread | extra
  pay_periods: number;       // 26 o 27 (según el calendario del empleador)
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

export function compute(i: Inputs): Outputs {
  const annual = Math.max(0, Number(i.annual_salary) || 0);
  const method = i.employer_method === 'extra' ? 'extra' : 'spread';
  let periods = Math.round(Number(i.pay_periods) || 27);
  if (periods !== 26 && periods !== 27) periods = 27;

  if (annual <= 0) throw new Error('Enter your annual gross salary');

  const normalCheck = Math.round((annual / 26) * 100) / 100;   // cheque "normal" en un año de 26
  const spreadCheck = Math.round((annual / 27) * 100) / 100;   // sueldo dividido en 27

  let paycheck: number;
  let annualGross: number;
  let deltaLabel: string;
  let deltaValue: number;

  if (periods === 26) {
    paycheck = normalCheck;
    annualGross = Math.round(normalCheck * 26 * 100) / 100;
    deltaLabel = 'Extra 27th check';
    deltaValue = 0;
  } else if (method === 'extra') {
    // El empleador mantiene el monto por cheque → el 27º es pago extra.
    paycheck = normalCheck;
    annualGross = Math.round(normalCheck * 27 * 100) / 100;
    deltaLabel = 'Extra pay this year';
    deltaValue = Math.round((annualGross - annual) * 100) / 100; // ≈ un cheque normal
  } else {
    // El empleador reparte el mismo sueldo anual en 27 → cada cheque es más chico.
    paycheck = spreadCheck;
    annualGross = Math.round(spreadCheck * 27 * 100) / 100;
    deltaLabel = 'Smaller per check';
    deltaValue = Math.round((normalCheck - spreadCheck) * 100) / 100;
  }

  let text: string;
  let tone: string;
  if (periods === 26) {
    text = `With **26 pay periods** in 2026, your biweekly gross is **${fmtUSD(normalCheck)}**. Your first payday falls late enough that 2026 is a normal 26-check year for you.`;
    tone = 'neutral';
  } else if (method === 'extra') {
    text = `Because 2026 has a **27th biweekly paycheck** and your employer keeps each check the same (**${fmtUSD(normalCheck)}**), you receive about **${fmtUSD0(deltaValue)} of extra gross pay** this year — one full bonus check. Note more pay can mean slightly more tax withheld, and watch annual caps like 401(k) contributions.`;
    tone = 'good';
  } else {
    text = `Because 2026 has **27 biweekly paydays** and your employer spreads the same **${fmtUSD0(annual)}** salary across all 27, each check drops from ${fmtUSD(normalCheck)} to **${fmtUSD(spreadCheck)}** — about **${fmtUSD(deltaValue)} less per check**. Your annual total is unchanged; you just get it in 27 smaller pieces.`;
    tone = 'warn';
  }

  const _insight = { title: periods === 26 ? 'A normal 26-check year' : 'You have a 27-paycheck year', text, tone, icon: '📅' };

  const _chart = (periods === 27 && method === 'extra') ? {
    type: 'doughnut',
    slices: [
      { label: 'Regular 26 checks', value: Math.round(normalCheck * 26) },
      { label: 'Extra 27th check', value: Math.max(0, Math.round(deltaValue)) },
    ],
    prefix: '$',
    centerValue: fmtUSD0(annualGross),
    centerLabel: '2026 gross',
    ariaLabel: `2026 gross ${fmtUSD0(annualGross)}: 26 regular checks plus one extra check of about ${fmtUSD0(deltaValue)}.`,
  } : undefined;

  return {
    paycheck_2026: fmtUSD(paycheck),
    normal_biweekly: fmtUSD(normalCheck),
    annual_gross_2026: fmtUSD0(annualGross),
    pay_periods_2026: String(periods),
    delta_label: deltaLabel,
    delta_value: fmtUSD(deltaValue),
    breakdown: periods === 26
      ? `26 checks × ${fmtUSD(normalCheck)} = ${fmtUSD0(annualGross)}.`
      : method === 'extra'
        ? `27 checks × ${fmtUSD(normalCheck)} = ${fmtUSD0(annualGross)} (≈ ${fmtUSD0(deltaValue)} more than a 26-check ${fmtUSD0(annual)} salary).`
        : `${fmtUSD0(annual)} ÷ 27 = ${fmtUSD(spreadCheck)} per check (${fmtUSD(deltaValue)} less than the ${fmtUSD(normalCheck)} 26-check amount).`,
    _insight,
    _chart,
  };
}
