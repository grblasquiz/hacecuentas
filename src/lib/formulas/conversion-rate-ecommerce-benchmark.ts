/** Conversion rate ecommerce */
export interface Inputs { visitasMes: number; transaccionesMes: number; aov: number; industria: string; }
export interface Outputs { conversionRate: number; benchmarkIndustria: number; diferenciaBenchmark: string; revenueActual: number; revenueSiMejora: number; }
export function conversionRateEcommerceBenchmark(i: Inputs): Outputs {
  const vis = Number(i.visitasMes);
  const trans = Number(i.transaccionesMes);
  const aov = Number(i.aov);
  const ind = String(i.industria || 'moda');
  if (vis <= 0) throw new Error('Visitas inválidas');
  const cvr = (trans / vis) * 100;
  const benchmarks: Record<string, number> = { moda: 2.0, belleza: 3.5, electro: 1.4, hogar: 2.5, cpg: 4.0, deportes: 1.8 };
  const bench = benchmarks[ind] || 2.5;
  const diff = cvr - bench;
  const diffText = diff > 0 ? `+${diff.toFixed(2)}pp mejor` : `${diff.toFixed(2)}pp debajo`;
  const revActual = trans * aov;
  const revMejora = vis * (bench / 100) * aov;
  return {
    conversionRate: Number(cvr.toFixed(2)),
    benchmarkIndustria: bench,
    diferenciaBenchmark: diffText,
    revenueActual: Math.round(revActual),
    revenueSiMejora: Math.round(revMejora)
  };
}
