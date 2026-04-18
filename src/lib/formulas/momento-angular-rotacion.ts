export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function momentoAngularRotacion(i: Inputs): Outputs {
  const I = Number(i.inercia); const w = Number(i.omega);
  if (!I || !w) throw new Error('Completá');
  const L = I * w;
  return { momento: L.toFixed(3) + ' kg·m²/s', resumen: `L = ${L.toFixed(2)} kg·m²/s con I=${I} y ω=${w} rad/s.` };
}
