export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function aguaIngestaDiariaPesoActividad(i: Inputs): Outputs {
  const p=Number(i.peso)||0; const e=Number(i.ejercicioMin)||0; const c=String(i.clima||'fresco');
  const baseMl=p*35;
  const extraEj=e*20;
  const multClima=c==='caluroso'?1.25:1;
  const totalMl=(baseMl+extraEj)*multClima;
  const L=totalMl/1000;
  return { litrosDia:L.toFixed(2)+' L', vasos:Math.round(totalMl/250)+' vasos', resumen:`${p}kg + ${e}min ejercicio ${c}: ${L.toFixed(1)}L (${Math.round(totalMl/250)} vasos).` };
}
