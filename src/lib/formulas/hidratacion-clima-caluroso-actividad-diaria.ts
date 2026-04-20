export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function hidratacionClimaCalurosoActividadDiaria(i: Inputs): Outputs {
  const p=Number(i.pesoKg)||0; const t=Number(i.temperaturaC)||20; const a=Number(i.actividadMin)||0;
  let ml=p*35;
  if(t>25) ml*=1+(t-25)/5*0.15;
  ml+=a*17;
  const L=ml/1000; const v=Math.round(ml/250);
  return { litrosDia:`${L.toFixed(1)} L`, vasos:`${v} vasos`, recordatorio:`Divide en 8 tomas. Mañana 500 mL, cada hora ${Math.round(ml/16)} mL.` };
}
