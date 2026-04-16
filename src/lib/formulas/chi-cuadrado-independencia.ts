/** Calculadora Chi-Cuadrado 2×2 — χ² = Σ(O-E)²/E */
export interface Inputs { a: number; b: number; c: number; d: number; }
export interface Outputs { chi2: number; pValor: string; conclusion: string; esperados: string; }

// Chi-squared CDF approximation for 1 df using normal approximation
function chi2pValue1df(chi2: number): number {
  // For 1 df, P(χ² > x) = 2*(1 - Φ(√x))
  const z = Math.sqrt(chi2);
  // Normal CDF approximation
  const a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741, a4 = -1.453152027, a5 = 1.061405429;
  const p = 0.3275911;
  const x = z / Math.sqrt(2);
  const t = 1 / (1 + p * x);
  const y = 1 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
  const phi = 0.5 * (1 + y);
  return 2 * (1 - phi);
}

export function chiCuadradoIndependencia(i: Inputs): Outputs {
  const a = Number(i.a), b = Number(i.b), c = Number(i.c), d = Number(i.d);
  if (a < 0 || b < 0 || c < 0 || d < 0) throw new Error('Las frecuencias no pueden ser negativas');
  const n = a + b + c + d;
  if (n === 0) throw new Error('El total no puede ser 0');

  const r1 = a + b, r2 = c + d, c1 = a + c, c2 = b + d;
  const ea = r1 * c1 / n, eb = r1 * c2 / n, ec = r2 * c1 / n, ed = r2 * c2 / n;

  const chi2 = Math.pow(a - ea, 2) / ea + Math.pow(b - eb, 2) / eb + Math.pow(c - ec, 2) / ec + Math.pow(d - ed, 2) / ed;
  const pVal = chi2pValue1df(chi2);

  let conclusion: string;
  if (pVal < 0.001) conclusion = 'Variables MUY asociadas (p < 0,001). Rechazás independencia con altísima confianza.';
  else if (pVal < 0.01) conclusion = 'Variables asociadas (p < 0,01). Rechazás independencia al 99%.';
  else if (pVal < 0.05) conclusion = 'Variables asociadas (p < 0,05). Rechazás independencia al 95%.';
  else conclusion = 'No hay evidencia suficiente de asociación (p ≥ 0,05). No rechazás independencia.';

  const minExpected = Math.min(ea, eb, ec, ed);
  if (minExpected < 5) conclusion += ' ⚠️ Alguna esperada < 5: considerá el test exacto de Fisher.';

  return {
    chi2: Number(chi2.toFixed(4)),
    pValor: pVal < 0.001 ? '< 0,001' : pVal.toFixed(4),
    conclusion,
    esperados: `E(a)=${ea.toFixed(1)}, E(b)=${eb.toFixed(1)}, E(c)=${ec.toFixed(1)}, E(d)=${ed.toFixed(1)}`,
  };
}
