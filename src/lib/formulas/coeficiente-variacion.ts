/** Calculadora Coeficiente de Variación — CV = σ/μ × 100 */
export interface Inputs { media: number; desviacion: number; }
export interface Outputs { cv: number; clasificacion: string; formula: string; }

export function coeficienteVariacion(i: Inputs): Outputs {
  const mu = Number(i.media);
  const sigma = Number(i.desviacion);
  if (mu === 0) throw new Error('La media no puede ser 0 (CV indefinido)');
  if (sigma < 0) throw new Error('La desviación estándar no puede ser negativa');

  const cv = (sigma / Math.abs(mu)) * 100;
  let clasif: string;
  if (cv < 15) clasif = 'Baja variabilidad (< 15%)';
  else if (cv < 30) clasif = 'Variabilidad moderada (15-30%)';
  else clasif = 'Alta variabilidad (> 30%)';

  return {
    cv: Number(cv.toFixed(4)),
    clasificacion: clasif,
    formula: `CV = (${sigma} / |${mu}|) × 100 = ${cv.toFixed(4)}%`,
  };
}
