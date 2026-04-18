export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function zapataAisladaColumnas(i: Inputs): Outputs {
  const P = Number(i.cargaKN) || 0; const s = Number(i.sigmaAdm) || 150;
  const A = P / s; const lado = Math.sqrt(A);
  return { areaNecesaria: A.toFixed(2) + ' m²', ladoCuadrada: lado.toFixed(2) + ' m', resumen: `Zapata ${lado.toFixed(1)}×${lado.toFixed(1)} m (A = ${A.toFixed(2)} m²).` };
}
