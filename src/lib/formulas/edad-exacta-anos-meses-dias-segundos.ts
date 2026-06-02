export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function edadExactaAnosMesesDiasSegundos(i: Inputs): Outputs {
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
  const sem=Math.floor(abs/7);
  const _insight = {
    title: diff===0 ? '¡Es hoy!' : (diff>0 ? 'Hacia adelante' : 'Hacia atrás'),
    text: diff===0
      ? `La fecha **${f}** es **hoy mismo**: 0 días de diferencia.`
      : (diff>0
          ? `Faltan **${abs.toLocaleString('es-AR')} días** (unas **${sem.toLocaleString('es-AR')} semanas**) para el **${f}**.`
          : `Pasaron **${abs.toLocaleString('es-AR')} días** (unas **${sem.toLocaleString('es-AR')} semanas**) desde el **${f}**.`),
    tone: 'neutral',
    icon: '📆',
  };
  return { resultado:diff+' días', resumen:`Entre hoy y ${f}: ${diff} días.`, _insight };
}
