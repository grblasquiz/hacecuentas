export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function ventanaFertilOvulacionCicloMujer(i: Inputs): Outputs {
  const f=String(i.ultimaRegla||''); const c=Number(i.cicloDias)||28;
  if (!f) return { ovulacion:'—', ventana:'—', proxRegla:'—', resumen:'Ingresá fecha.' };
  const parts=f.split('-').map(Number);
  if (parts.length!==3 || parts.some(isNaN)) return { ovulacion:'—', ventana:'—', proxRegla:'—', resumen:'Fecha inválida.' };
  const [yy,mm,dd]=parts;
  const d=new Date(yy,mm-1,dd);
  if (isNaN(d.getTime())) return { ovulacion:'—', ventana:'—', proxRegla:'—', resumen:'Fecha inválida.' };
  const ovu=new Date(d.getTime()+(c-14)*86400000);
  const vIni=new Date(ovu.getTime()-5*86400000);
  const vFin=new Date(ovu.getTime()+1*86400000);
  const prox=new Date(d.getTime()+c*86400000);
  const diaCiclo=c-14; // día del ciclo en que cae la ovulación
  const _insight = {
    title: 'Tu ventana fértil',
    text: `Con ciclo de **${c} días**, la ovulación cae cerca del **día ${diaCiclo}** (${ovu.toISOString().slice(0,10)}). La ventana de mayor probabilidad de embarazo va del **${vIni.toISOString().slice(0,10)} al ${vFin.toISOString().slice(0,10)}**, porque el espermatozoide sobrevive hasta 5 días. Es una estimación: el día real varía con la duración del ciclo.`,
    tone: 'neutral',
    icon: '🌸',
  };
  return { ovulacion:ovu.toISOString().slice(0,10), ventana:`${vIni.toISOString().slice(0,10)} a ${vFin.toISOString().slice(0,10)}`, proxRegla:prox.toISOString().slice(0,10), resumen:`Ovulación: ${ovu.toISOString().slice(0,10)}. Máx fertilidad: 6 días previos.`, _insight };
}
