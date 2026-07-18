/**
 * Social Security earnings test 2026 — cuánto beneficio se retiene si trabajás
 * cobrando antes de la Full Retirement Age (FRA). Límites 2026: $24.480 (todo el año
 * bajo FRA, $1 retenido por cada $2 de exceso) y $65.160 (año en que cumplís la FRA,
 * $1 por cada $3). A partir del mes de FRA no hay límite. Limites de
 * src/lib/data/usa-2026.ts (SOCIAL_SECURITY_2026).
 */
import { SOCIAL_SECURITY_2026, fmtUSD, fmtUSD0 } from '../data/usa-2026.ts';

export interface Inputs {
  situation: string;         // under_fra | year_of_fra | at_fra
  annual_earnings: number;   // ingresos laborales del año (wages + net self-employment)
  monthly_benefit?: number;  // beneficio mensual (para estimar meses retenidos)
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

export function compute(i: Inputs): Outputs {
  const situation = ['under_fra', 'year_of_fra', 'at_fra'].includes(i.situation) ? i.situation : 'under_fra';
  const earnings = Math.max(0, Number(i.annual_earnings) || 0);
  const monthly = Math.max(0, Number(i.monthly_benefit) || 0);

  const underLimit = SOCIAL_SECURITY_2026.earningsTestUnderFRA;   // 24480
  const fraYearLimit = SOCIAL_SECURITY_2026.earningsTestYearOfFRA; // 65160

  let limit = 0;
  let ratio = 0; // $1 withheld per $ratio over the limit
  if (situation === 'under_fra') { limit = underLimit; ratio = 2; }
  else if (situation === 'year_of_fra') { limit = fraYearLimit; ratio = 3; }
  // at_fra → no limit

  let withheld = 0;
  let excess = 0;
  if (ratio > 0) {
    excess = Math.max(0, earnings - limit);
    withheld = Math.round((excess / ratio) * 100) / 100;
  }

  const monthsWithheld = monthly > 0 ? Math.ceil(withheld / monthly) : 0;
  const overLimit = withheld > 0;

  let text: string;
  let tone: string;
  if (situation === 'at_fra') {
    text = `Once you reach **full retirement age**, there is **no earnings limit** — you keep every dollar of your Social Security benefit no matter how much you earn from work. Your **${fmtUSD0(earnings)}** in earnings has no effect on your benefit.`;
    tone = 'good';
  } else if (!overLimit) {
    text = `Your **${fmtUSD0(earnings)}** in earnings is at or below the 2026 limit of **${fmtUSD0(limit)}**, so **none** of your benefit is withheld. You can earn up to **${fmtUSD0(limit)}** this year without any reduction.`;
    tone = 'good';
  } else {
    text = `Earning **${fmtUSD0(earnings)}** is **${fmtUSD0(excess)}** over the 2026 limit of **${fmtUSD0(limit)}**. Social Security withholds **$1 for every $${ratio}** over the limit, so about **${fmtUSD0(withheld)}** in benefits is held back this year${monthsWithheld > 0 ? ` (roughly ${monthsWithheld} monthly check${monthsWithheld === 1 ? '' : 's'})` : ''}. Important: withheld benefits are **not lost** — the SSA recalculates and raises your monthly benefit once you reach full retirement age.`;
    tone = 'warn';
  }

  const _insight = {
    title: situation === 'at_fra' ? 'No limit at full retirement age' : (overLimit ? 'Some benefits will be withheld' : 'You are under the limit'),
    text,
    tone,
    icon: '💼',
  };

  const _chart = overLimit ? {
    type: 'doughnut',
    slices: [
      { label: 'Within limit', value: Math.round(Math.min(earnings, limit)) },
      { label: 'Excess earnings', value: Math.round(excess) },
    ],
    prefix: '$',
    centerValue: fmtUSD0(withheld),
    centerLabel: 'Withheld',
    ariaLabel: `Of ${fmtUSD0(earnings)} earnings, ${fmtUSD0(excess)} exceeds the ${fmtUSD0(limit)} limit, withholding ${fmtUSD0(withheld)} in benefits.`,
  } : undefined;

  return {
    benefits_withheld: fmtUSD0(withheld),
    limit_applied: situation === 'at_fra' ? 'No limit' : fmtUSD0(limit),
    excess_earnings: fmtUSD0(excess),
    months_withheld: situation === 'at_fra' ? '0' : String(monthsWithheld),
    withholding_ratio: situation === 'at_fra' ? 'N/A' : `$1 per $${ratio}`,
    breakdown: situation === 'at_fra'
      ? `At/after FRA: no earnings test. ${fmtUSD0(earnings)} earned, $0 withheld.`
      : `Earnings ${fmtUSD0(earnings)} − limit ${fmtUSD0(limit)} = ${fmtUSD0(excess)} excess. Withheld = ${fmtUSD0(excess)} ÷ ${ratio} = ${fmtUSD0(withheld)}.`,
    _insight,
    _chart,
  };
}
