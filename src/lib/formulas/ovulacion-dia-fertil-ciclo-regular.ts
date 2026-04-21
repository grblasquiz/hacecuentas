export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function ovulacionDiaFertilCicloRegular(i: Inputs): Outputs {
  const ur=String(i.ultimaRegla||''); const c=Number(i.duracionCiclo)||28;
  if (!ur) return { ovulacion:'—', ventanaFertil:'—', resumen:'Ingresá fecha.' };
  const parts=ur.split('-').map(Number);
  if (parts.length!==3 || parts.some(isNaN)) return { ovulacion:'—', ventanaFertil:'—', resumen:'Fecha inválida.' };
  const [yy,mm,dd]=parts;
  const d=new Date(yy,mm-1,dd);
  if (isNaN(d.getTime())) return { ovulacion:'—', ventanaFertil:'—', resumen:'Fecha inválida.' };
  const ov=new Date(d.getTime()+(c-14)*86400000);
  const i1=new Date(ov.getTime()-5*86400000);
  const f1=new Date(ov.getTime()+1*86400000);
  return { ovulacion:ov.toISOString().slice(0,10), ventanaFertil:i1.toISOString().slice(0,10)+' al '+f1.toISOString().slice(0,10), resumen:`Ovulación: ${ov.toISOString().slice(0,10)}. Fértil: ${i1.toISOString().slice(0,10)} a ${f1.toISOString().slice(0,10)}.` };
}
