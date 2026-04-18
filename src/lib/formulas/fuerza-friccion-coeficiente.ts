export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function fuerzaFriccionCoeficiente(i: Inputs): Outputs {
  const mu = Number(i.mu); const n = Number(i.n);
  if (!mu || !n) throw new Error('Completá μ y N');
  const f = mu * n;
  return { friccion: f.toFixed(2) + ' N', resumen: `Fricción ${f.toFixed(1)} N con μ=${mu} y N=${n}.` };
}
