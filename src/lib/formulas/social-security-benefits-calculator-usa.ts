/**
 * Social Security retirement benefit estimator (simplified).
 * Convierte los ingresos promedio de carrera (proxy de AIME) en la PIA usando
 * los bend points de elegibilidad 2026 (90/32/15) y ajusta por edad de reclamo
 * (reducción antes de la FRA, delayed credits hasta los 70).
 * Fuente única: src/lib/data/usa-2026.ts (SOCIAL_SECURITY_2026).
 */
import { SOCIAL_SECURITY_2026 as SS, fmtUSD, fmtUSD0 } from '../data/usa-2026.ts';

export interface Inputs {
  avg_annual_income: number;  // ingreso anual promedio de carrera (indexado, proxy AIME)
  birth_year: number;         // para determinar la Full Retirement Age
  claim_age: number;          // edad a la que reclama (62–70)
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

/** Full Retirement Age en años (decimal) según año de nacimiento (SSA). */
function fraYears(birthYear: number): number {
  if (birthYear <= 1954) return 66;
  if (birthYear >= 1960) return 67;
  // 1955–1959: sube 2 meses por año hasta 66y10m.
  const extraMonths = (birthYear - 1954) * 2;
  return 66 + extraMonths / 12;
}

/** PIA mensual a la FRA a partir del AIME, con los bend points 2026. */
function piaFromAime(aime: number): number {
  const [f1, f2, f3] = SS.piaFactors;
  const t1 = Math.min(aime, SS.bendPoint1) * f1;
  const t2 = Math.max(0, Math.min(aime, SS.bendPoint2) - SS.bendPoint1) * f2;
  const t3 = Math.max(0, aime - SS.bendPoint2) * f3;
  // SSA redondea la PIA al múltiplo de $0,10 inferior.
  return Math.floor((t1 + t2 + t3) * 10) / 10;
}

/** Factor de ajuste sobre la PIA por reclamar a claimAge dada una FRA. */
function claimFactor(claimAge: number, fra: number): number {
  const months = Math.round((claimAge - fra) * 12);
  if (months === 0) return 1;
  if (months < 0) {
    const early = -months;
    const first36 = Math.min(early, 36) * (5 / 900);      // 5/9% por mes
    const beyond = Math.max(0, early - 36) * (5 / 1200);  // 5/12% por mes
    return Math.max(0, 1 - first36 - beyond);
  }
  const delayMonths = Math.min(months, Math.round((SS.maxDelayAge - fra) * 12));
  return 1 + delayMonths * (SS.delayedCreditPerYear / 12); // 8%/año = 2/3% por mes
}

export function compute(i: Inputs): Outputs {
  const avgIncome = Math.max(0, Number(i.avg_annual_income) || 0);
  const birthYear = Math.floor(Number(i.birth_year) || 0);
  let claimAge = Math.floor(Number(i.claim_age) || SS.fullRetirementAge);
  claimAge = Math.min(SS.maxDelayAge, Math.max(SS.earlyClaimAge, claimAge));

  if (avgIncome <= 0) throw new Error('Enter your average annual earnings');
  if (birthYear < 1930 || birthYear > 2010) throw new Error('Enter a valid birth year');

  // AIME: los ingresos anuales cuentan sólo hasta el máximo imponible; /12 = mensual.
  const cappedIncome = Math.min(avgIncome, SS.maxTaxableEarnings);
  const aime = cappedIncome / 12;

  const pia = piaFromAime(aime);           // beneficio mensual a la FRA
  const fra = fraYears(birthYear);
  const factor = claimFactor(claimAge, fra);
  const monthly = Math.round(pia * factor * 100) / 100;
  const annual = Math.round(monthly * 12);

  const adjPct = (factor - 1) * 100;
  const adjLabel = Math.abs(adjPct) < 0.05
    ? 'at full retirement age (no adjustment)'
    : `${adjPct > 0 ? '+' : '−'}${Math.abs(adjPct).toFixed(1)}% for claiming at ${claimAge}`;

  const fraWhole = Math.floor(fra);
  const fraMonths = Math.round((fra - fraWhole) * 12);
  const fraLabel = fraMonths === 0 ? `${fraWhole}` : `${fraWhole} years ${fraMonths} months`;

  // Escenarios 62 / FRA / 70 para el gráfico y el contexto.
  const at62 = Math.round(pia * claimFactor(SS.earlyClaimAge, fra));
  const atFra = Math.round(pia);
  const at70 = Math.round(pia * claimFactor(SS.maxDelayAge, fra));

  const _insight = {
    title: 'Your estimated monthly Social Security benefit',
    text: `With average career earnings of **${fmtUSD0(avgIncome)}**, your benefit at full retirement age (**${fraLabel}**) is about **${fmtUSD0(pia)}/month**. Claiming at **${claimAge}** adjusts it to **${fmtUSD0(monthly)}/month** (${adjLabel}) — roughly **${fmtUSD0(annual)}/year**. Waiting from 62 to 70 raises the check from ${fmtUSD0(at62)} to ${fmtUSD0(at70)}.`,
    tone: 'neutral',
    icon: '🧓',
  };

  const _chart = {
    type: 'bar',
    labels: ['Age 62', `FRA (${fraWhole})`, 'Age 70'],
    values: [at62, atFra, at70],
    prefix: '$',
    ariaLabel: `Estimated monthly benefit: ${fmtUSD0(at62)} at 62, ${fmtUSD0(atFra)} at full retirement age, ${fmtUSD0(at70)} at 70.`,
  };

  return {
    monthly_benefit: fmtUSD0(monthly),
    pia_at_fra: fmtUSD0(pia),
    full_retirement_age: fraLabel,
    claim_adjustment: adjLabel,
    aime: fmtUSD0(aime),
    annual_benefit: fmtUSD0(annual),
    breakdown: `AIME ${fmtUSD0(aime)}/mo → PIA ${fmtUSD0(pia)}/mo at FRA. Claiming at ${claimAge}: ${fmtUSD0(pia)} × ${(factor).toFixed(3)} = ${fmtUSD0(monthly)}/mo (${fmtUSD0(annual)}/yr).`,
    _insight,
    _chart,
  };
}
