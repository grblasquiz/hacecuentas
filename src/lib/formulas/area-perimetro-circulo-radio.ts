export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; }
export function areaPerimetroCirculoRadio(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const r=Number(i.r)||0;
  const a=Math.PI*r*r; const p=2*Math.PI*r;
  const resumen = __lang === 'en'
    ? `Circle with radius ${r}: area ${a.toFixed(1)}, perimeter ${p.toFixed(1)}.`
    : `Círculo de radio ${r}: área ${a.toFixed(1)}, perímetro ${p.toFixed(1)}.`;
  return { area:`${a.toFixed(2)} cm²`, perimetro:`${p.toFixed(2)} cm`, diametro:`${(2*r).toFixed(2)} cm`, resumen };
}
