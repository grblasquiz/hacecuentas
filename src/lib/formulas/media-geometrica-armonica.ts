/** Media geométrica y armónica (promedios especiales) */
export interface Inputs {
  v1: number;
  v2: number;
  v3?: number;
  v4?: number;
  v5?: number;
  v6?: number;
}

export interface Outputs {
  result: number;
  mediaAritmetica: number;
  mediaArmonica: number;
  detalle: string;
}

export function mediaGeometricaArmonica(i: Inputs): Outputs {
  const vals: number[] = [];

  const raw = [i.v1, i.v2, i.v3, i.v4, i.v5, i.v6];
  for (const v of raw) {
    if (v !== undefined && v !== null && String(v) !== '') {
      const num = Number(v);
      if (isNaN(num)) continue;
      if (num <= 0) throw new Error('Todos los valores deben ser positivos (> 0)');
      vals.push(num);
    }
  }

  if (vals.length < 2) throw new Error('Ingresá al menos 2 valores');

  const n = vals.length;

  // Aritmética
  const suma = vals.reduce((a, b) => a + b, 0);
  const ma = suma / n;

  // Geométrica
  const logSum = vals.reduce((a, b) => a + Math.log(b), 0);
  const mg = Math.exp(logSum / n);

  // Armónica
  const invSum = vals.reduce((a, b) => a + 1 / b, 0);
  const mh = n / invSum;

  return {
    result: Number(mg.toFixed(4)),
    mediaAritmetica: Number(ma.toFixed(4)),
    mediaArmonica: Number(mh.toFixed(4)),
    detalle: `**Valores**: ${vals.join(', ')} (n = ${n})\n\n**Media aritmética**: (${vals.join(' + ')}) / ${n} = **${ma.toFixed(4)}**\n**Media geométrica**: (${vals.join(' × ')})^(1/${n}) = **${mg.toFixed(4)}**\n**Media armónica**: ${n} / (${vals.map((v) => `1/${v}`).join(' + ')}) = **${mh.toFixed(4)}**\n\nDesigualdad: ${mh.toFixed(4)} ≤ ${mg.toFixed(4)} ≤ ${ma.toFixed(4)}`,
  };
}
