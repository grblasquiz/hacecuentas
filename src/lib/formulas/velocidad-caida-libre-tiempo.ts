export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function velocidadCaidaLibreTiempo(i: Inputs): Outputs {
  const t = Number(i.t); const g = Number(i.g) || 9.81;
  if (!t || t < 0) throw new Error('Ingresá tiempo');
  const v = g * t;
  return { velocidad: v.toFixed(2) + ' m/s', resumen: `A ${t}s: velocidad ${v.toFixed(1)} m/s (${(v*3.6).toFixed(1)} km/h).` };
}
