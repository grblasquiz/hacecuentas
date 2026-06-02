/** Calculadora Z-Score — z = (x - μ) / σ */
export interface Inputs { valor: number; media: number; desviacion: number; }
export interface Outputs { zScore: number; percentil: number; interpretacion: string; formula: string; _chart?: any; _insight?: any; }

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

  const ext = Math.max(4, Math.ceil(az) + 1);
  const chart = {
    type: 'scale' as const,
    marker: Number(z.toFixed(2)),
    markerLabel: 'Tu z-score: ' + z.toFixed(2),
    min: -ext,
    unit: 'σ',
    segments: [
      { nombre: 'Muy raro', max: -3, color: '#fecaca', colorDark: '#b91c1c' },
      { nombre: 'Atípico', max: -2, color: '#fed7aa', colorDark: '#9a3412' },
      { nombre: 'Poco usual', max: -1, color: '#fde68a', colorDark: '#b45309' },
      { nombre: 'Normal', max: 1, color: '#bbf7d0', colorDark: '#166534' },
      { nombre: 'Poco usual', max: 2, color: '#fde68a', colorDark: '#b45309' },
      { nombre: 'Atípico', max: 3, color: '#fed7aa', colorDark: '#9a3412' },
      { nombre: 'Muy raro', max: ext, color: '#fecaca', colorDark: '#b91c1c' },
    ],
    ariaLabel: 'Escala z-score en desviaciones estándar: normal en el centro, atípico en los extremos',
  };

  const lado = z >= 0 ? 'por encima' : 'por debajo';
  const _insight = {
    title: 'Qué tan lejos de la media está tu valor',
    text: `Tu valor está a **${Math.abs(z).toFixed(2)}σ** ${lado} de la media y supera al **${percentil.toFixed(1)}%** de los casos. ${interp}.`,
    tone: az < 1 ? 'good' : az < 2 ? 'neutral' : 'warn',
    icon: '📊',
  };

  return {
    zScore: Number(z.toFixed(4)),
    percentil: Number(percentil.toFixed(2)),
    interpretacion: interp,
    formula: `z = (${x} - ${mu}) / ${sigma} = ${z.toFixed(4)}`,
    _chart: chart,
    _insight,
  };
}
