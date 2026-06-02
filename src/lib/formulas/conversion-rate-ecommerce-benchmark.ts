/** Conversion rate ecommerce */
export interface Inputs { visitasMes: number; transaccionesMes: number; aov: number; industria: string; }
export interface Outputs { conversionRate: number; benchmarkIndustria: number; diferenciaBenchmark: string; revenueActual: number; revenueSiMejora: number; _insight?: any; _chart?: any; }
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

  const fmtUsd = (n: number) => '$' + Math.round(n).toLocaleString('es-AR');
  const gap = Math.round(revMejora - revActual);
  const insight = diff >= 0
    ? {
        title: 'Convertís mejor que tu industria',
        text: `Tu CVR de **${cvr.toFixed(2)}%** supera el benchmark de ${ind} (**${bench}%**) por **${Math.abs(diff).toFixed(2)}pp**. Estás capturando ${fmtUsd(revActual)}/mes, por encima de lo que rendiría el promedio del rubro.`,
        tone: 'good',
        icon: '🛒',
      }
    : {
        title: 'Hay revenue sobre la mesa',
        text: `Tu CVR de **${cvr.toFixed(2)}%** está **${Math.abs(diff).toFixed(2)}pp** debajo del benchmark de ${ind} (**${bench}%**). Llegar al promedio del rubro sumaría unos **${fmtUsd(gap)}/mes** (${fmtUsd(revMejora)} vs ${fmtUsd(revActual)} actuales).`,
        tone: 'warn',
        icon: '🛒',
      };

  const seg1 = bench * 0.5;
  const seg2 = bench;
  const seg3 = bench * 1.5;
  const topMax = Math.max(seg3 + 0.01, cvr + 0.5);
  const chart = {
    type: 'scale',
    marker: Number(cvr.toFixed(2)),
    markerLabel: `Tu CVR ${cvr.toFixed(2)}%`,
    min: 0,
    segments: [
      { nombre: 'Muy por debajo', max: Number(seg1.toFixed(2)), color: '#ef4444', colorDark: '#b91c1c' },
      { nombre: 'Debajo del benchmark', max: Number(seg2.toFixed(2)), color: '#f59e0b', colorDark: '#b45309' },
      { nombre: 'En benchmark', max: Number(seg3.toFixed(2)), color: '#22c55e', colorDark: '#15803d' },
      { nombre: 'Top performer', max: Number(topMax.toFixed(2)), color: '#0ea5e9', colorDark: '#0369a1' },
    ],
    ariaLabel: `Tu tasa de conversión ${cvr.toFixed(2)}% frente al benchmark de ${bench}% para ${ind}`,
  };

  return {
    conversionRate: Number(cvr.toFixed(2)),
    benchmarkIndustria: bench,
    diferenciaBenchmark: diffText,
    revenueActual: Math.round(revActual),
    revenueSiMejora: Math.round(revMejora),
    _insight: insight,
    _chart: chart,
  };
}
