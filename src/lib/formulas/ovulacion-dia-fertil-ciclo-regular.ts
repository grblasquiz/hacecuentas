export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number | undefined | { [k: string]: any }; _insight?: any; }
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
  const ovStr=ov.toISOString().slice(0,10);
  const i1Str=i1.toISOString().slice(0,10);
  const f1Str=f1.toISOString().slice(0,10);
  return {
    ovulacion:ovStr,
    ventanaFertil:i1Str+' al '+f1Str,
    resumen:`Ovulación: ${ovStr}. Fértil: ${i1Str} a ${f1Str}.`,
    _insight: {
      title: 'Tu ventana fértil',
      text: `En un ciclo regular de **${c} días**, ovulás alrededor del **${ovStr}**. Tus días más fértiles van del **${i1Str}** al **${f1Str}** (5 días antes más el día de la ovulación).`,
      tone: 'neutral',
      icon: '\u{1FA78}',
    },
  };
}
