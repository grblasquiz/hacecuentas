export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function distanciaCaidaLibreAltura(i: Inputs): Outputs {
  const t = Number(i.t); const g = Number(i.g) || 9.81;
  if (!t || t < 0) throw new Error('Ingresá tiempo');
  const h = 0.5 * g * t * t;
  return { altura: h.toFixed(2) + ' m', resumen: `En ${t}s cae ${h.toFixed(1)} m.` };
}
