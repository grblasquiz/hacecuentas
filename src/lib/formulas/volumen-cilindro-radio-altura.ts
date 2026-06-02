export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function volumenCilindroRadioAltura(i: Inputs): Outputs {
  const r=Number(i.r)||0; const h=Number(i.h)||0;
  const v=Math.PI*r*r*h; const s=2*Math.PI*r*(r+h);
  const litros=v/1000;
  const _insight = {
    title: 'Capacidad del cilindro',
    text: `Un cilindro de radio **${r} cm** y altura **${h} cm** tiene un volumen de **${v.toFixed(0)} cm³**, es decir **${litros.toFixed(2)} L**. Su superficie total (tapas + lateral) es **${s.toFixed(0)} cm²**.`,
    tone: 'neutral',
    icon: '🛢️',
  };
  return { volumen:`${v.toFixed(2)} cm³ (${litros.toFixed(2)} L)`, superficie:`${s.toFixed(2)} cm²`, resumen:`Cilindro: ${v.toFixed(1)} cm³ = ${litros.toFixed(2)} L.`, _insight };
}
