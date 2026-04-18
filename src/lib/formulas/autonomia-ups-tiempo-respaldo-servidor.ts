export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function autonomiaUpsTiempoRespaldoServidor(i: Inputs): Outputs {
  const va=Number(i.va)||0; const w=Number(i.w)||0;
  if (w===0) return { minutos:'—', utilizacion:'—', resumen:'Carga no puede ser 0.' };
  const wMax=va*0.6;
  const ut=w/wMax*100;
  const min=(va*0.4)/w;
  return { minutos:`${min.toFixed(1)} min`, utilizacion:`${ut.toFixed(0)}%`, resumen:`UPS ${va}VA con ${w}W: ~${min.toFixed(0)} min (${ut.toFixed(0)}% uso).` };
}
