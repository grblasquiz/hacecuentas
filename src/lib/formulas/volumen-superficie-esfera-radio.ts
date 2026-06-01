export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function volumenSuperficieEsferaRadio(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const r=Number(i.r)||0;
  const v=(4/3)*Math.PI*r**3; const s=4*Math.PI*r*r;
  const resumen = __lang === 'en'
    ? `Sphere of radius ${r}: V=${v.toFixed(1)}, S=${s.toFixed(1)}.`
    : `Esfera de radio ${r}: V=${v.toFixed(1)}, S=${s.toFixed(1)}.`;
  return { volumen:`${v.toFixed(2)} cm³`, superficie:`${s.toFixed(2)} cm²`, resumen };
}
