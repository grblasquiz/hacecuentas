export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function areaPerimetroCirculoRadio(i: Inputs): Outputs {
  const r=Number(i.r)||0;
  const a=Math.PI*r*r; const p=2*Math.PI*r;
  return { area:`${a.toFixed(2)} cm²`, perimetro:`${p.toFixed(2)} cm`, diametro:`${(2*r).toFixed(2)} cm`, resumen:`Círculo de radio ${r}: área ${a.toFixed(1)}, perímetro ${p.toFixed(1)}.` };
}
