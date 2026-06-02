export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; _chart?: any; }
export function semanasGestacionHoyBebeTrimestre(i: Inputs): Outputs {
  const f=String(i.fum||''); if (!f) return { semanas:'—', dias:'—', trimestre:'—', resumen:'Ingresá FUM.' };
  const parts=f.split('-').map(Number);
  if (parts.length!==3 || parts.some(isNaN)) return { semanas:'—', dias:'—', trimestre:'—', resumen:'Fecha inválida.' };
  const [yy,mm,ddx]=parts;
  const d=new Date(yy,mm-1,ddx);
  if (isNaN(d.getTime())) return { semanas:'—', dias:'—', trimestre:'—', resumen:'Fecha inválida.' };
  const h=new Date();
  const dif=(h.getTime()-d.getTime())/86400000;
  const s=Math.floor(dif/7); const dd=Math.floor(dif%7);
  const tri=s<=13?'1°':s<=27?'2°':'3°';

  const diasTotal=Math.max(0,Math.floor(dif));
  const semParto=Math.max(0,40-s);
  const triLabel=tri==='1°'?'1.er trimestre':tri==='2°'?'2.° trimestre':'3.er trimestre';
  let insightText:string; let insightTone:'good'|'warn'|'neutral';
  if (s>=40) {
    insightText=`Estás en **${s} semanas y ${dd} días**: ya llegaste a término (**40 semanas**). El parto puede ocurrir en cualquier momento.`;
    insightTone='warn';
  } else {
    insightText=`Vas por **${s} semanas y ${dd} días** (${triLabel}). Faltan **~${semParto} semanas** para la fecha probable de parto a las 40 semanas.`;
    insightTone=tri==='3°'?'good':'neutral';
  }
  const _insight={ title:'En qué semana vas', text:insightText, tone:insightTone, icon:'🤰' };

  const markerDias=Math.max(0,Math.min(280,diasTotal));
  const _chart={
    type:'scale',
    marker:markerDias,
    markerLabel:`${s} sem`,
    min:0,
    segments:[
      { nombre:'1.er trim.', max:97, color:'#fbcfe8', colorDark:'#9d174d' },
      { nombre:'2.° trim.', max:195, color:'#f9a8d4', colorDark:'#be185d' },
      { nombre:'3.er trim.', max:280, color:'#f472b6', colorDark:'#db2777' },
    ],
    ariaLabel:`Progreso del embarazo: ${s} semanas de 40 (${triLabel})`,
  };

  return { semanas:`${s}`, dias:`${dd}d`, trimestre:tri, resumen:`${s} semanas ${dd} días (${tri} trimestre).`, _insight, _chart };
}
