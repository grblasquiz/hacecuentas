export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function diasEntreFechasLaboralesHabilesCorridos(i: Inputs): Outputs {
  const f=String(i.fecha1||'');
  if (!f) {
    const hoy=new Date();
    return { resultado:hoy.toISOString().slice(0,10), resumen:'Ingresá una fecha.' };
  }
  const parts=f.split('-').map(Number);
  if (parts.length!==3 || parts.some(isNaN)) return { resultado:'—', resumen:'Fecha inválida.' };
  const [yy,mm,dd]=parts;
  const d=new Date(yy,mm-1,dd);
  if (isNaN(d.getTime())) return { resultado:'—', resumen:'Fecha inválida.' };
  const hoy=new Date();
  hoy.setHours(0,0,0,0);
  const diff=Math.round((d.getTime()-hoy.getTime())/86400000);
  const abs=Math.abs(diff);
  const semanas=Math.floor(abs/7);
  const ctxSemanas=semanas>0?` (unas **${semanas} semana${semanas===1?'':'s'}**)`:'';
  const _insight = diff===0
    ? {
        title: 'Es hoy',
        text: `La fecha que ingresaste (**${f}**) es **hoy mismo**: 0 días de diferencia.`,
        tone: 'neutral',
        icon: '📅',
      }
    : diff>0
    ? {
        title: `Faltan ${abs} días`,
        text: `Del día de hoy a **${f}** hay **${abs} días** corridos por delante${ctxSemanas}.`,
        tone: 'neutral',
        icon: '⏳',
      }
    : {
        title: `Pasaron ${abs} días`,
        text: `La fecha **${f}** ya quedó atrás: hace **${abs} días** corridos${ctxSemanas}.`,
        tone: 'neutral',
        icon: '🗓️',
      };
  return { resultado:diff+' días', resumen:`Entre hoy y ${f}: ${diff} días.`, _insight };
}
