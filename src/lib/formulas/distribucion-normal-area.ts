/** Calculadora Distribución Normal — P(a < X < b) */
export interface Inputs { media: number; desviacion: number; limiteA: number; limiteB: number; }
export interface Outputs { probabilidad: string; probMenorA: string; probMayorB: string; zScores: string; }

function normalCDF(z: number): number {
  if (z < -8) return 0;
  if (z > 8) return 1;
  const a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741, a4 = -1.453152027, a5 = 1.061405429;
  const p = 0.3275911;
  const sign = z < 0 ? -1 : 1;
  const x = Math.abs(z) / Math.sqrt(2);
  const t = 1 / (1 + p * x);
  const y = 1 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
  return 0.5 * (1 + sign * y);
}

export function distribucionNormalArea(i: Inputs): Outputs {
  const mu = Number(i.media);
  const sigma = Number(i.desviacion);
  const a = Number(i.limiteA);
  const b = Number(i.limiteB);
  if (sigma <= 0) throw new Error('σ debe ser mayor a 0');
  if (a >= b) throw new Error('El límite inferior debe ser menor que el superior');

  const zA = (a - mu) / sigma;
  const zB = (b - mu) / sigma;
  const pA = normalCDF(zA);
  const pB = normalCDF(zB);
  const pAB = pB - pA;

  return {
    probabilidad: `${(pAB * 100).toFixed(4)}% (${pAB.toFixed(6)})`,
    probMenorA: `P(X < ${a}) = ${(pA * 100).toFixed(4)}%`,
    probMayorB: `P(X > ${b}) = ${((1 - pB) * 100).toFixed(4)}%`,
    zScores: `z(a) = ${zA.toFixed(4)}, z(b) = ${zB.toFixed(4)}`,
  };
}
