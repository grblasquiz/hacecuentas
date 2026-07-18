/**
 * Medicare IRMAA 2026 — recargos por ingresos altos (Income-Related Monthly
 * Adjustment Amount) sobre Part B y Part D, según el MAGI de 2024. Devuelve el
 * tier, la prima mensual total de Part B, el recargo de Part D y el costo anual.
 * Fuente única de montos: src/lib/data/usa-2026.ts (IRMAA_2026).
 */
import { IRMAA_2026, fmtUSD, fmtUSD0 } from '../data/usa-2026.ts';

export interface Inputs {
  magi: number;           // MAGI 2024 (AGI + intereses exentos)
  filing_status: string;  // single | mfj | mfs
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

const TIER_LABELS = ['Standard (no IRMAA)', 'Tier 1', 'Tier 2', 'Tier 3', 'Tier 4', 'Tier 5 (top)'];

function tierFor(magi: number, status: string): number {
  if (status === 'mfs') {
    if (magi <= IRMAA_2026.thresholds.mfsBase) return 0;
    if (magi <= IRMAA_2026.thresholds.mfsHigh) return 4;
    return 5;
  }
  const th = status === 'mfj' ? IRMAA_2026.thresholds.mfj : IRMAA_2026.thresholds.single;
  let tier = 0;
  for (const t of th) if (magi > t) tier++;
  return tier;
}

export function compute(i: Inputs): Outputs {
  const magi = Math.max(0, Number(i.magi) || 0);
  const status = ['single', 'mfj', 'mfs'].includes(i.filing_status) ? i.filing_status : 'single';

  if (magi <= 0) throw new Error('Enter your 2024 modified adjusted gross income (MAGI)');

  const tier = tierFor(magi, status);
  const t = IRMAA_2026.tiers[tier];
  const base = IRMAA_2026.partBBase;

  const partBSurcharge = Math.round((t.partB - base) * 100) / 100;
  const partDSurcharge = t.partD;
  const monthlyExtra = Math.round((partBSurcharge + partDSurcharge) * 100) / 100;
  const annualExtra = Math.round(monthlyExtra * 12 * 100) / 100;
  const annualPartB = Math.round(t.partB * 12 * 100) / 100;

  const hasIrmaa = tier > 0;

  const _insight = {
    title: hasIrmaa ? `You are in IRMAA ${TIER_LABELS[tier]}` : 'No IRMAA surcharge',
    text: hasIrmaa
      ? `With a 2024 MAGI of **${fmtUSD0(magi)}**, your 2026 Medicare Part B premium is **${fmtUSD(t.partB)}/month** (the ${fmtUSD(base)} base plus a **${fmtUSD(partBSurcharge)}** IRMAA surcharge), and Part D adds an extra **${fmtUSD(partDSurcharge)}/month**. That is **${fmtUSD0(annualExtra)} more per year** than a standard beneficiary pays — per person. IRMAA uses your income from two years earlier, so 2024 income sets your 2026 premium.`
      : `With a 2024 MAGI of **${fmtUSD0(magi)}**, you pay the standard 2026 Part B premium of **${fmtUSD(base)}/month** and no Part D IRMAA surcharge. You stay below the first threshold (${fmtUSD0(status === 'mfj' ? IRMAA_2026.thresholds.mfj[0] : IRMAA_2026.thresholds.single[0])}).`,
    tone: hasIrmaa ? 'warn' : 'good',
    icon: '🏥',
  };

  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Base Part B', value: Math.round(base) },
      { label: 'Part B IRMAA', value: Math.round(partBSurcharge) },
      { label: 'Part D IRMAA', value: Math.round(partDSurcharge) },
    ],
    prefix: '$',
    centerValue: fmtUSD(t.partB + partDSurcharge),
    centerLabel: '/mo total',
    ariaLabel: `Monthly cost: ${fmtUSD(base)} base Part B, ${fmtUSD(partBSurcharge)} Part B IRMAA, ${fmtUSD(partDSurcharge)} Part D IRMAA.`,
  };

  return {
    part_b_monthly: fmtUSD(t.partB),
    part_d_irmaa_monthly: fmtUSD(partDSurcharge),
    part_b_surcharge_monthly: fmtUSD(partBSurcharge),
    total_extra_monthly: fmtUSD(monthlyExtra),
    annual_extra: fmtUSD0(annualExtra),
    annual_part_b: fmtUSD0(annualPartB),
    tier: TIER_LABELS[tier],
    breakdown: `MAGI ${fmtUSD0(magi)} (${status}) → ${TIER_LABELS[tier]}. Part B ${fmtUSD(t.partB)}/mo (base ${fmtUSD(base)} + IRMAA ${fmtUSD(partBSurcharge)}), Part D IRMAA ${fmtUSD(partDSurcharge)}/mo. Extra ${fmtUSD0(annualExtra)}/yr vs standard.`,
    _insight,
    _chart,
  };
}
