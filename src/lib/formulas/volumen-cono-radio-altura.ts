export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function volumenConoRadioAltura(i: Inputs): Outputs {
  const r=Number(i.r)||0; const h=Number(i.h)||0;
  const g=Math.sqrt(r*r+h*h); const v=(1/3)*Math.PI*r*r*h; const s=Math.PI*r*(r+g);
  const litros=v/1000;
  const _insight = {
    title: 'Volumen del cono',
    text: `Un cono de radio **${r} cm** y altura **${h} cm** tiene un volumen de **${v.toFixed(0)} cm³** (**${litros.toFixed(2)} L**): exactamente **un tercio** del cilindro de igual base y altura. La generatriz mide **${g.toFixed(1)} cm**.`,
    tone: 'neutral',
    icon: '📐',
  };
  return { volumen:`${v.toFixed(2)} cm³`, generatriz:`${g.toFixed(2)} cm`, superficie:`${s.toFixed(2)} cm²`, resumen:`Cono r=${r}, h=${h}: V=${v.toFixed(1)}.`, _insight };
}
