/** Calculadora Regresión Lineal Simple — y = mx + b */
export interface Inputs { datosX: string; datosY: string; }
export interface Outputs { ecuacion: string; pendiente: number; ordenada: number; r2: number; _insight?: any; _chart?: any; }

export function regresionLinealSimple(i: Inputs): Outputs {
  const X = String(i.datosX).split(/[,;\s]+/).map(s => s.trim()).filter(s => s !== '').map(Number).filter(n => !isNaN(n));
  const Y = String(i.datosY).split(/[,;\s]+/).map(s => s.trim()).filter(s => s !== '').map(Number).filter(n => !isNaN(n));
  if (X.length !== Y.length) throw new Error('X e Y deben tener la misma cantidad de datos');
  if (X.length < 3) throw new Error('Se necesitan al menos 3 pares de datos');

  const n = X.length;
  const sumX = X.reduce((a, b) => a + b, 0);
  const sumY = Y.reduce((a, b) => a + b, 0);
  const sumXY = X.reduce((a, xi, idx) => a + xi * Y[idx], 0);
  const sumX2 = X.reduce((a, xi) => a + xi * xi, 0);
  const sumY2 = Y.reduce((a, yi) => a + yi * yi, 0);

  const denom = n * sumX2 - sumX * sumX;
  if (denom === 0) throw new Error('Los datos X no tienen variabilidad');

  const m = (n * sumXY - sumX * sumY) / denom;
  const b = (sumY - m * sumX) / n;

  // R²
  const meanY = sumY / n;
  const ssTot = Y.reduce((a, yi) => a + (yi - meanY) ** 2, 0);
  const ssRes = X.reduce((a, xi, idx) => a + (Y[idx] - (m * xi + b)) ** 2, 0);
  const r2 = ssTot === 0 ? 1 : 1 - ssRes / ssTot;

  const signB = b >= 0 ? '+' : '-';

  const pct = (r2 * 100).toFixed(1);
  const calidad = r2 >= 0.9 ? 'muy fuerte' : r2 >= 0.7 ? 'fuerte' : r2 >= 0.5 ? 'moderado' : r2 >= 0.3 ? 'débil' : 'muy débil';
  const tone = r2 >= 0.7 ? 'good' : r2 >= 0.5 ? 'neutral' : 'warn';
  const dir = m > 0 ? 'positiva (Y sube cuando X sube)' : m < 0 ? 'negativa (Y baja cuando X sube)' : 'plana';
  const _insight = {
    title: `Ajuste ${calidad}`,
    text: `La recta **y = ${m.toFixed(3)}x ${signB} ${Math.abs(b).toFixed(3)}** explica el **${pct}%** de la variación de Y (R² = ${r2.toFixed(3)}) sobre ${n} pares de datos. La relación es ${dir}.`,
    tone,
    icon: '📉',
  };
  const _chart = {
    type: 'scale',
    marker: Math.max(0, Math.min(1, Number(r2.toFixed(4)))),
    markerLabel: `R² ${r2.toFixed(2)}`,
    min: 0,
    segments: [
      { nombre: 'Débil', max: 0.5, color: '#f87171', colorDark: '#b91c1c' },
      { nombre: 'Moderado', max: 0.7, color: '#fbbf24', colorDark: '#b45309' },
      { nombre: 'Fuerte', max: 0.9, color: '#4ade80', colorDark: '#15803d' },
      { nombre: 'Muy fuerte', max: 1, color: '#22c55e', colorDark: '#166534' },
    ],
    ariaLabel: `Bondad de ajuste R² de ${r2.toFixed(2)} en una escala de 0 a 1`,
  };

  return {
    ecuacion: `y = ${m.toFixed(4)}x ${signB} ${Math.abs(b).toFixed(4)}`,
    pendiente: Number(m.toFixed(6)),
    ordenada: Number(b.toFixed(6)),
    r2: Number(r2.toFixed(6)),
    _insight,
    _chart,
  };
}
