export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function epinefrinaDosisPesoAnafilaxia(i: Inputs): Outputs {
  const p=Number(i.pesoKg)||0;
  const d=Math.min(p*0.01,0.5);
  const disp=p<10?'No disponible EpiPen — pediatra':p<30?'EpiPen Jr (0.15 mg)':'EpiPen (0.3 mg)';
  return { dosisMg:`${d.toFixed(2)} mg IM`, dispositivo:disp, advertencia:'Siempre llamar 107/911 post-administración. Reacción bifásica posible.' };
}
