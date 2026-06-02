export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number | { title: string; text: string; tone: string; icon: string }; }
export function fechaExactaSumarRestarDiasHabiles(i: Inputs): Outputs {
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
  const semanas=(abs/7).toFixed(1);
  const _insight = diff === 0
    ? { title: 'Es hoy', text: `La fecha **${f}** es **hoy mismo**. No hay días de diferencia.`, tone: 'neutral', icon: '📅' }
    : diff > 0
      ? { title: `Faltan ${diff} días`, text: `Del día de hoy hasta el **${f}** hay **${diff} días** por delante (unas **${semanas} semanas**).`, tone: 'neutral', icon: '📅' }
      : { title: `Hace ${abs} días`, text: `La fecha **${f}** ya pasó: fue hace **${abs} días** (unas **${semanas} semanas**).`, tone: 'warn', icon: '📅' };
  return { resultado:diff+' días', resumen:`Entre hoy y ${f}: ${diff} días.`, _insight };
}
