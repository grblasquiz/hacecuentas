export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number | any; }
export function cuantosFeriadosRestanAnoArgentina(i: Inputs): Outputs {
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
  const dias=Math.abs(diff);
  const semanas=Math.floor(dias/7);
  const enFuturo=diff>0;
  const insight = enFuturo
    ? {
        title: 'Lo que falta',
        text: `Faltan **${dias.toLocaleString('es-AR')} días** (unas **${semanas} semanas**) para la fecha ingresada. Marcala en el calendario para no perderte el próximo fin de semana largo.`,
        tone: 'good',
        icon: '📆'
      }
    : {
        title: 'Fecha ya pasada',
        text: `La fecha ingresada quedó **${dias.toLocaleString('es-AR')} días atrás**. Ingresá una fecha futura para ver cuántos días faltan.`,
        tone: 'neutral',
        icon: '📅'
      };
  return { resultado:diff+' días', resumen:`Entre hoy y ${f}: ${diff} días.`, _insight: insight };
}
