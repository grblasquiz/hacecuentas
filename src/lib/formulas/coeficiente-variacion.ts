/** Calculadora Coeficiente de Variación — CV = σ/μ × 100 */
export interface Inputs { media: number; desviacion: number; }
export interface Outputs { cv: number; clasificacion: string; formula: string; _insight?: any; _chart?: any; }

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

  const cvR = Number(cv.toFixed(2));
  const tone = cv < 15 ? 'good' : cv < 30 ? 'neutral' : 'warn';
  const lectura = cv < 15
    ? 'los datos son **homogéneos**: la media los representa bien'
    : cv < 30
      ? 'hay **dispersión moderada**: la media sigue siendo útil pero con reservas'
      : 'los datos están **muy dispersos**: la media pierde poder de representación';
  const insight = {
    title: 'Qué dice tu CV',
    text: `Con un CV de **${cvR}%**, ${lectura}. La desviación equivale al **${cvR}%** del valor promedio.`,
    tone,
    icon: '📊',
  };

  const topSeg = Math.max(45, Math.ceil((cv + 5) / 5) * 5);
  const chart = {
    type: 'scale',
    marker: cvR,
    markerLabel: `${cvR}%`,
    min: 0,
    segments: [
      { nombre: 'Baja', max: 15, color: '#16a34a', colorDark: '#22c55e' },
      { nombre: 'Moderada', max: 30, color: '#f59e0b', colorDark: '#fbbf24' },
      { nombre: 'Alta', max: topSeg, color: '#dc2626', colorDark: '#ef4444' },
    ],
    ariaLabel: `Coeficiente de variación de ${cvR}% sobre una escala de variabilidad baja, moderada y alta`,
  };

  return {
    cv: Number(cv.toFixed(4)),
    clasificacion: clasif,
    formula: `CV = (${sigma} / |${mu}|) × 100 = ${cv.toFixed(4)}%`,
    _insight: insight,
    _chart: chart,
  };
}
