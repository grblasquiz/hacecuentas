/**
 * HSA contribution limit 2026 — calcula tu tope de aporte a la Health Savings Account
 * (IRS Rev. Proc. 2025-19): base según cobertura (self-only $4.400 / family $8.750),
 * catch-up de $1.000 para 55+, prorrateado por meses de elegibilidad, menos lo que
 * aporta el empleador. Montos de src/lib/data/usa-2026.ts (HSA_2026).
 */
import { HSA_2026, fmtUSD, fmtUSD0 } from '../data/usa-2026.ts';

export interface Inputs {
  coverage_type: string;         // self | family
  eligible_months: number;       // meses cubierto por un HDHP en 2026 (1-12)
  age_55_plus: string;           // yes | no
  employer_contribution?: number; // aporte del empleador ya realizado
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

export function compute(i: Inputs): Outputs {
  const coverage = i.coverage_type === 'family' ? 'family' : 'self';
  let months = Math.round(Number(i.eligible_months) || 12);
  if (months < 0) months = 0;
  if (months > 12) months = 12;
  const catchUpElig = i.age_55_plus === 'yes';
  const employer = Math.max(0, Number(i.employer_contribution) || 0);

  const baseAnnual = coverage === 'family' ? HSA_2026.contribFamily : HSA_2026.contribSelfOnly;
  const catchUpAnnual = catchUpElig ? HSA_2026.catchUp55 : 0;

  const proratedBase = Math.round((baseAnnual * months / 12) * 100) / 100;
  const proratedCatchUp = Math.round((catchUpAnnual * months / 12) * 100) / 100;
  const totalLimit = Math.round((proratedBase + proratedCatchUp) * 100) / 100;

  const remaining = Math.max(0, Math.round((totalLimit - employer) * 100) / 100);

  const _insight = {
    title: 'Your 2026 HSA contribution limit',
    text: `${months < 12 ? `Eligible for **${months} of 12 months**, your ` : 'Your '}2026 HSA limit is **${fmtUSD(totalLimit)}** — ${fmtUSD0(baseAnnual)} base ${coverage === 'family' ? '(family)' : '(self-only)'}${catchUpElig ? ` plus the $1,000 age-55 catch-up` : ''}${months < 12 ? `, prorated to ${months}/12` : ''}.${employer > 0 ? ` After your employer's ${fmtUSD0(employer)}, you can still add **${fmtUSD(remaining)}**.` : ` You (and your employer) can contribute up to this amount.`} Tip: under the IRS **last-month rule**, if you have HDHP coverage on Dec 1, 2026 you may contribute the full annual limit — but you must stay HSA-eligible through all of 2027 or face tax and a penalty.`,
    tone: 'good',
    icon: '🩺',
  };

  const _chart = employer > 0 ? {
    type: 'doughnut',
    slices: [
      { label: 'Employer', value: Math.round(employer) },
      { label: 'You can add', value: Math.round(remaining) },
    ],
    prefix: '$',
    centerValue: fmtUSD0(totalLimit),
    centerLabel: 'Your limit',
    ariaLabel: `Of a ${fmtUSD0(totalLimit)} limit, ${fmtUSD0(employer)} is from your employer and you can add ${fmtUSD0(remaining)}.`,
  } : undefined;

  return {
    your_limit: fmtUSD(totalLimit),
    base_limit: fmtUSD0(baseAnnual),
    catch_up: fmtUSD0(proratedCatchUp),
    you_can_still_contribute: fmtUSD(remaining),
    prorated_months: `${months}/12`,
    breakdown: `${coverage === 'family' ? 'Family' : 'Self-only'} ${fmtUSD0(baseAnnual)}${catchUpElig ? ' + $1,000 catch-up' : ''}${months < 12 ? ` × ${months}/12` : ''} = ${fmtUSD(totalLimit)}.${employer > 0 ? ` − employer ${fmtUSD0(employer)} = ${fmtUSD(remaining)} left.` : ''}`,
    _insight,
    _chart,
  };
}
