export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; _chart?: any; }

/**
 * Estate settlement cost estimator using the California statutory fee scale
 * (Probate Code §10810 / §10800) — the most widely referenced probate fee structure in the US.
 * Complexity multiplier adds extraordinary fees on top of the base statutory fee.
 */
export function sucesionCostoHonorariosAbogadoInmueble(i: Inputs): Outputs {
  const v = Number(i.valorAcervo) || 0;
  const c = String(i.complejidad || 'simple');

  // California statutory sliding scale (Probate Code §10810) — attorney fee
  function caStatutoryFee(estate: number): number {
    if (estate <= 0) return 0;
    let fee = 0;
    // 4% on first $100,000
    fee += Math.min(estate, 100_000) * 0.04;
    // 3% on next $100,000 ($100k–$200k)
    if (estate > 100_000) fee += Math.min(estate - 100_000, 100_000) * 0.03;
    // 2% on next $800,000 ($200k–$1M)
    if (estate > 200_000) fee += Math.min(estate - 200_000, 800_000) * 0.02;
    // 1% on next $9,000,000 ($1M–$10M)
    if (estate > 1_000_000) fee += Math.min(estate - 1_000_000, 9_000_000) * 0.01;
    // 0.5% on next $15,000,000 ($10M–$25M)
    if (estate > 10_000_000) fee += Math.min(estate - 10_000_000, 15_000_000) * 0.005;
    // Above $25M: approximately 0.5% (court-determined "reasonable amount")
    if (estate > 25_000_000) fee += (estate - 25_000_000) * 0.005;
    return fee;
  }

  // Base attorney fee (statutory)
  const baseFee = caStatutoryFee(v);

  // Executor fee = same as attorney fee (CA Probate Code §10800)
  const executorFee = baseFee;

  // Extraordinary fees multiplier for complexity
  const extraMult: Record<string, number> = { simple: 0, med: 0.5, compleja: 1.2 };
  const extraFee = baseFee * (extraMult[c] ?? 0);

  // Total attorney-side fees (attorney + executor + extraordinary)
  const h = baseFee + executorFee + extraFee;

  // Federal estate tax: 40% on estate value above $13,610,000 exemption (2024)
  const FEDERAL_EXEMPTION = 13_610_000;
  const taxableEstate = Math.max(0, v - FEDERAL_EXEMPTION);
  const imp = taxableEstate * 0.40;

  // Court filing + appraisal (flat estimate)
  const courtFees = v > 0 ? Math.min(500 + v * 0.001, 5_000) : 0;

  const total = h + imp + courtFees;
  const pctTotal = v > 0 ? (total / v) * 100 : 0;

  const fmt = (n: number) =>
    '$' + n.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  const insight = {
    title: 'What goes to costs vs. heirs',
    text: `On a **${fmt(v)}** estate, total settlement costs are approximately **${fmt(total)}** (**${pctTotal.toFixed(1)}%**): **${fmt(h)}** in attorney/executor fees${imp > 0 ? ` + **${fmt(imp)}** in federal estate tax` : ' (no federal estate tax)'} + ~**${fmt(courtFees)}** in court/appraisal fees. Net to heirs: **${fmt(Math.max(0, v - total))}**.`,
    tone: pctTotal >= 15 ? 'warn' : 'neutral',
    icon: '⚖️',
  };

  const chartSlices = [
    { label: 'Attorney Fees', value: Math.round(baseFee) },
    { label: 'Executor Fees', value: Math.round(executorFee) },
  ];
  if (extraFee > 0) chartSlices.push({ label: 'Extraordinary Fees', value: Math.round(extraFee) });
  if (imp > 0) chartSlices.push({ label: 'Federal Estate Tax', value: Math.round(imp) });
  if (courtFees > 0) chartSlices.push({ label: 'Court & Appraisal', value: Math.round(courtFees) });

  const chart = {
    type: 'doughnut',
    slices: chartSlices,
    prefix: '$',
    centerValue: fmt(total),
    centerLabel: 'Total Cost',
    ariaLabel: 'Breakdown of estate settlement costs: attorney fees, executor fees, taxes, court costs',
  };

  const resumen = `Estate ${fmt(v)} (${c}): atty+exec fees ${fmt(h)}, tax ${fmt(imp)}, total ~${fmt(total)} (${pctTotal.toFixed(1)}% of estate).`;

  return {
    honorariosAbog: fmt(h),
    impuestos: fmt(imp > 0 ? imp : 0),
    total: fmt(total),
    resumen,
    _insight: insight,
    _chart: chart,
  };
}
