/** Calculadora Correlación de Pearson */
export interface Inputs { datosX: string; datosY: string; }
export interface Outputs { r: number; r2: number; interpretacion: string; n: number; }

export function correlacionPearson(i: Inputs): Outputs {
  const X = String(i.datosX).split(/[,;\s]+/).map(s => s.trim()).filter(s => s !== '').map(Number).filter(n => !isNaN(n));
  const Y = String(i.datosY).split(/[,;\s]+/).map(s => s.trim()).filter(s => s !== '').map(Number).filter(n => !isNaN(n));
  if (X.length !== Y.length) throw new Error('X e Y deben tener la misma cantidad de datos');
  if (X.length < 3) throw new Error('Se necesitan al menos 3 pares de datos');

  const n = X.length;
  const meanX = X.reduce((a, b) => a + b, 0) / n;
  const meanY = Y.reduce((a, b) => a + b, 0) / n;

  let sumXY = 0, sumX2 = 0, sumY2 = 0;
  for (let idx = 0; idx < n; idx++) {
    const dx = X[idx] - meanX;
    const dy = Y[idx] - meanY;
    sumXY += dx * dy;
    sumX2 += dx * dx;
    sumY2 += dy * dy;
  }

  if (sumX2 === 0 || sumY2 === 0) throw new Error('Una de las variables no tiene variabilidad');

  const r = sumXY / Math.sqrt(sumX2 * sumY2);
  const r2 = r * r;
  const ar = Math.abs(r);

  let interp: string;
  const dir = r >= 0 ? 'positiva' : 'negativa';
  if (ar < 0.1) interp = 'Sin correlación lineal';
  else if (ar < 0.3) interp = `Correlación ${dir} débil`;
  else if (ar < 0.5) interp = `Correlación ${dir} moderada-débil`;
  else if (ar < 0.7) interp = `Correlación ${dir} moderada`;
  else if (ar < 0.9) interp = `Correlación ${dir} fuerte`;
  else interp = `Correlación ${dir} muy fuerte`;

  return {
    r: Number(r.toFixed(6)),
    r2: Number(r2.toFixed(6)),
    interpretacion: `${interp}. R² = ${(r2 * 100).toFixed(2)}% (X explica ${(r2 * 100).toFixed(1)}% de la variabilidad de Y).`,
    n,
  };
}
