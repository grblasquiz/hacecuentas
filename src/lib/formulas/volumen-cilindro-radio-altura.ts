export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function volumenCilindroRadioAltura(i: Inputs): Outputs {
  const r=Number(i.r)||0; const h=Number(i.h)||0;
  const v=Math.PI*r*r*h; const s=2*Math.PI*r*(r+h);
  return { volumen:`${v.toFixed(2)} cm³ (${(v/1000).toFixed(2)} L)`, superficie:`${s.toFixed(2)} cm²`, resumen:`Cilindro: ${v.toFixed(1)} cm³ = ${(v/1000).toFixed(2)} L.` };
}
