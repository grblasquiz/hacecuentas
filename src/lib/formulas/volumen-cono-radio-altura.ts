export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function volumenConoRadioAltura(i: Inputs): Outputs {
  const r=Number(i.r)||0; const h=Number(i.h)||0;
  const g=Math.sqrt(r*r+h*h); const v=(1/3)*Math.PI*r*r*h; const s=Math.PI*r*(r+g);
  return { volumen:`${v.toFixed(2)} cm³`, generatriz:`${g.toFixed(2)} cm`, superficie:`${s.toFixed(2)} cm²`, resumen:`Cono r=${r}, h=${h}: V=${v.toFixed(1)}.` };
}
