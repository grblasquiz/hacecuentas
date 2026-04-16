/** Calculadora Regresión Lineal Simple — y = mx + b */
export interface Inputs { datosX: string; datosY: string; }
export interface Outputs { ecuacion: string; pendiente: number; ordenada: number; r2: number; }

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

  return {
    ecuacion: `y = ${m.toFixed(4)}x ${signB} ${Math.abs(b).toFixed(4)}`,
    pendiente: Number(m.toFixed(6)),
    ordenada: Number(b.toFixed(6)),
    r2: Number(r2.toFixed(6)),
  };
}
