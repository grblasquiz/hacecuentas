export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function volumenSuperficieEsferaRadio(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const r=Number(i.r)||0;
  const v=(4/3)*Math.PI*r**3; const s=4*Math.PI*r*r;
  const resumen = __lang === 'en'
    ? `Sphere of radius ${r}: V=${v.toFixed(1)}, S=${s.toFixed(1)}.`
    : `Esfera de radio ${r}: V=${v.toFixed(1)}, S=${s.toFixed(1)}.`;
  const out: Outputs = { volumen:`${v.toFixed(2)} cm³`, superficie:`${s.toFixed(2)} cm²`, resumen };
  if (r > 0) {
    out._insight = {
      title: __lang === 'en' ? 'Volume and surface' : 'Volumen y superficie',
      text: __lang === 'en'
        ? `A sphere of radius **${r} cm** holds a volume of **${v.toFixed(2)} cm³** and is wrapped by a surface of **${s.toFixed(2)} cm²**. Doubling the radius would multiply the volume by 8 and the surface by 4.`
        : `Una esfera de radio **${r} cm** encierra un volumen de **${v.toFixed(2)} cm³** y está envuelta por una superficie de **${s.toFixed(2)} cm²**. Si duplicaras el radio, el volumen se multiplicaría por 8 y la superficie por 4.`,
      tone: 'neutral',
      icon: '🔵',
    };
  }
  return out;
}
