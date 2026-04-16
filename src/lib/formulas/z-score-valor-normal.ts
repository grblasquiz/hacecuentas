/** Calculadora Z-Score — z = (x - μ) / σ */
export interface Inputs { valor: number; media: number; desviacion: number; }
export interface Outputs { zScore: number; percentil: number; interpretacion: string; formula: string; }

// Approximation of the standard normal CDF using Abramowitz and Stegun 26.2.17
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

export function zScoreValorNormal(i: Inputs): Outputs {
  const x = Number(i.valor);
  const mu = Number(i.media);
  const sigma = Number(i.desviacion);
  if (sigma <= 0) throw new Error('La desviación estándar debe ser mayor a 0');

  const z = (x - mu) / sigma;
  const percentil = normalCDF(z) * 100;

  let interp: string;
  const az = Math.abs(z);
  if (az < 1) interp = 'Valor dentro del rango normal (dentro de 1σ, 68% central)';
  else if (az < 2) interp = 'Valor poco usual (entre 1σ y 2σ)';
  else if (az < 3) interp = 'Valor atípico (entre 2σ y 3σ, fuera del 95%)';
  else interp = 'Valor muy raro (más de 3σ, fuera del 99,7%)';

  return {
    zScore: Number(z.toFixed(4)),
    percentil: Number(percentil.toFixed(2)),
    interpretacion: interp,
    formula: `z = (${x} - ${mu}) / ${sigma} = ${z.toFixed(4)}`,
  };
}
