export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function internetFibraCableModemComparativaMbps(i: Inputs): Outputs {
  const m=Number(i.mbps)||100; const h=Number(i.hogarHabitantes)||1; const g=String(i.gamingStreaming||'no');
  const minimo=h*50+(g==='si'?100:0);
  const rec=m>=minimo?'Fibra óptica (mejor upload y latencia)':'Necesitás más Mbps: considerá 500-1000';
  return { recomendacion:rec, mbpsMinimos:`${minimo} Mbps`, observacion:'Fibra: misma velocidad descarga/subida. Cablemodem: subida ~10% descarga.' };
}
