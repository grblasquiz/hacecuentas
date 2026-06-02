/** Calculadora de Rendimiento — %R = (real/teórico) × 100 */
export interface Inputs { masaReal: number; masaTeorica: number; }
export interface Outputs { rendimiento: number; perdida: number; clasificacion: string; formula: string; _insight?: any; _chart?: any; }

export function rendimientoReaccionQuimica(i: Inputs): Outputs {
  const real = Number(i.masaReal);
  const teorica = Number(i.masaTeorica);
  if (real < 0) throw new Error('La masa real no puede ser negativa');
  if (!teorica || teorica <= 0) throw new Error('La masa teórica debe ser mayor a 0');

  const rend = (real / teorica) * 100;
  const perdida = teorica - real;

  let clasif: string;
  if (rend >= 90) clasif = 'Excelente (≥ 90%)';
  else if (rend >= 70) clasif = 'Bueno (70-90%)';
  else if (rend >= 50) clasif = 'Moderado (50-70%)';
  else clasif = 'Bajo (< 50%)';

  const tone = rend >= 90 ? 'good' : rend >= 50 ? 'neutral' : 'warn';
  const _insight = {
    title: 'Rendimiento de la reacción',
    text: `Obtuviste **${rend.toFixed(2)}%** del producto teórico: clasificación **${clasif.replace(/\s*\(.*\)/, '')}**. Se perdieron **${perdida.toFixed(2)} g** respecto a la masa teórica de ${teorica} g.`,
    tone: tone as 'good' | 'neutral' | 'warn',
    icon: '⚗️',
  };

  const _chart = {
    type: 'scale' as const,
    marker: Number(rend.toFixed(2)),
    markerLabel: rend.toFixed(1) + '%',
    min: 0,
    segments: [
      { nombre: 'Bajo', max: 50, color: '#ef4444', colorDark: '#b91c1c' },
      { nombre: 'Moderado', max: 70, color: '#f59e0b', colorDark: '#b45309' },
      { nombre: 'Bueno', max: 90, color: '#84cc16', colorDark: '#4d7c0f' },
      { nombre: 'Excelente', max: Math.max(100, Math.ceil(rend)), color: '#22c55e', colorDark: '#15803d' },
    ],
    ariaLabel: `Rendimiento de ${rend.toFixed(2)}% sobre una escala de 0 a 100%, clasificado como ${clasif}`,
  };

  return {
    rendimiento: Number(rend.toFixed(2)),
    perdida: Number(perdida.toFixed(4)),
    clasificacion: clasif,
    formula: `%R = (${real} / ${teorica}) × 100 = ${rend.toFixed(2)}%`,
    _insight,
    _chart,
  };
}
