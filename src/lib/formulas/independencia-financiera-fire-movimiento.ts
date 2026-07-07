export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number | undefined; _insight?: any; }
export function independenciaFinancieraFireMovimiento(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const locale = __lang === 'en' ? 'en-US' : 'es-AR';
  const sep = __lang === 'en' ? ',' : '.';

  // Core FIRE inputs
  const gastoAnual = Math.abs(Number(i.gastoAnual) || 0);    // Annual spending target
  const portActual = Math.abs(Number(i.portActual) || 0);    // Current portfolio value
  const aportAnual = Math.abs(Number(i.aportAnual) || 0);    // Annual contributions
  const retornoNom = Math.abs(Number(i.retornoNom) || 7);    // Expected nominal return %

  // 1) FI Number = Annual Spending × 25 (inverse of 4% rule)
  const fiNumber = gastoAnual * 25;

  // 2) Years to FIRE using future-value formula with contributions
  // FV = PV*(1+r)^n + PMT*((1+r)^n - 1)/r = FI_number
  // Solve for n numerically (binary search)
  let aniosParaFire = 0;
  if (fiNumber <= 0 || gastoAnual <= 0) {
    aniosParaFire = 0;
  } else if (portActual >= fiNumber) {
    aniosParaFire = 0; // Already FI
  } else {
    const r = retornoNom / 100;
    if (r === 0) {
      // No growth: linear path
      const restante = fiNumber - portActual;
      aniosParaFire = aportAnual > 0 ? restante / aportAnual : Infinity;
    } else {
      // Binary search for n in [0, 200]
      let lo = 0, hi = 200;
      for (let iter = 0; iter < 60; iter++) {
        const mid = (lo + hi) / 2;
        const fv = portActual * Math.pow(1 + r, mid) + (aportAnual > 0 ? aportAnual * (Math.pow(1 + r, mid) - 1) / r : 0);
        if (fv < fiNumber) lo = mid; else hi = mid;
      }
      aniosParaFire = (lo + hi) / 2;
    }
  }

  // 3) Safe withdrawal at 4% of current portfolio (context info)
  const retiro4pct = portActual * 0.04;

  // 4) Savings rate needed if no current portfolio (from scratch)
  // monthly to reach FI in aniosParaFire years (for insight context)

  // Format helpers
  const fmt = (n: number) => {
    if (!isFinite(n)) return __lang === 'en' ? 'N/A (no contributions)' : 'N/A (sin aportes)';
    return '$' + Math.round(n).toLocaleString(locale);
  };
  const fmtYr = (n: number) => {
    if (!isFinite(n) || n > 150) return __lang === 'en' ? 'N/A' : 'N/A';
    const y = Math.ceil(n * 10) / 10;
    return __lang === 'en' ? `${y.toFixed(1)} years` : `${y.toFixed(1)} años`;
  };

  // Primary output: FI Number
  const resultado = fiNumber > 0 ? fmt(fiNumber) : (__lang === 'en' ? 'Enter annual spending' : 'Ingresá gasto anual');

  // Secondary: years to FIRE and current 4% withdrawal
  const resumen = (() => {
    if (gastoAnual <= 0) return __lang === 'en' ? 'Enter your annual spending to calculate your FI number.' : 'Ingresá tu gasto anual para calcular tu número FIRE.';
    if (portActual >= fiNumber) return __lang === 'en' ? `You are already financially independent! Your portfolio covers your spending at 4% withdrawal.` : `¡Ya sos financieramente independiente! Tu portafolio cubre tus gastos al 4% de retiro.`;
    const yr = isFinite(aniosParaFire) && aniosParaFire < 150 ? fmtYr(aniosParaFire) : (__lang === 'en' ? '(increase contributions)' : '(aumentá aportes)');
    if (__lang === 'en') {
      return `FI Number: ${fmt(fiNumber)} · Years to FIRE: ${yr} · Current 4% withdrawal: ${fmt(retiro4pct)}/yr`;
    } else {
      return `Número FIRE: ${fmt(fiNumber)} · Años para FIRE: ${yr} · Retiro 4% actual: ${fmt(retiro4pct)}/año`;
    }
  })();

  const aniosStr = isFinite(aniosParaFire) && aniosParaFire < 150 ? fmtYr(aniosParaFire) : (__lang === 'en' ? 'not reachable at current pace' : 'no alcanzable al ritmo actual');
  const insight = __lang === 'en'
    ? {
        title: 'Your FIRE number',
        text: `Your **FI number is ${fmt(fiNumber)}** (annual spending $${gastoAnual.toLocaleString('en-US')} × 25). At your current portfolio of ${fmt(portActual)} contributing ${fmt(aportAnual)}/yr at ${retornoNom}% return, you reach FIRE in **${aniosStr}**.`,
        tone: 'positive',
        icon: '🔥',
      }
    : {
        title: 'Tu número FIRE',
        text: `Tu **número FIRE es ${fmt(fiNumber)}** (gasto anual $${gastoAnual.toLocaleString('es-AR')} × 25). Con tu portafolio actual de ${fmt(portActual)} aportando ${fmt(aportAnual)}/año al ${retornoNom}% de retorno, alcanzás FIRE en **${aniosStr}**.`,
        tone: 'positive',
        icon: '🔥',
      };

  return { resultado, resumen, _insight: insight };
}
