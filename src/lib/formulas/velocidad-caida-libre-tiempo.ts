export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; }
export function velocidadCaidaLibreTiempo(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const t = Number(i.t); const g = Number(i.g) || 9.81;
  if (!t || t < 0) throw new Error(__lang === 'en' ? 'Enter a time value' : 'Ingresá tiempo');
  const v = g * t;
  const resumen = __lang === 'en'
    ? `At ${t}s: velocity ${v.toFixed(1)} m/s (${(v*3.6).toFixed(1)} km/h).`
    : `A ${t}s: velocidad ${v.toFixed(1)} m/s (${(v*3.6).toFixed(1)} km/h).`;
  return { velocidad: v.toFixed(2) + ' m/s', resumen };
}
