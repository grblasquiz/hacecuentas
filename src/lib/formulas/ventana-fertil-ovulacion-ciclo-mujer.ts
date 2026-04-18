export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function ventanaFertilOvulacionCicloMujer(i: Inputs): Outputs {
  const f=String(i.ultimaRegla||''); const c=Number(i.cicloDias)||28;
  if (!f) return { ovulacion:'—', ventana:'—', proxRegla:'—', resumen:'Ingresá fecha.' };
  const d=new Date(f+'T00:00:00'); if (isNaN(d.getTime())) return { ovulacion:'—', ventana:'—', proxRegla:'—', resumen:'Fecha inválida.' };
  const ovu=new Date(d.getTime()+(c-14)*86400000);
  const vIni=new Date(ovu.getTime()-5*86400000);
  const vFin=new Date(ovu.getTime()+1*86400000);
  const prox=new Date(d.getTime()+c*86400000);
  return { ovulacion:ovu.toISOString().slice(0,10), ventana:`${vIni.toISOString().slice(0,10)} a ${vFin.toISOString().slice(0,10)}`, proxRegla:prox.toISOString().slice(0,10), resumen:`Ovulación: ${ovu.toISOString().slice(0,10)}. Máx fertilidad: 6 días previos.` };
}
