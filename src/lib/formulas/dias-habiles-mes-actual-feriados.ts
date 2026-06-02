export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number | object; }
export function diasHabilesMesActualFeriados(i: Inputs): Outputs {
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
  const insight = diff===0
    ? { title:'Es hoy', text:'La fecha que ingresaste es **hoy mismo**: faltan 0 días.', tone:'neutral', icon:'📆' }
    : diff>0
      ? { title:'Cuenta regresiva', text:`Faltan **${abs} días** para el ${f} (≈ ${(abs/7).toFixed(1)} semanas). Tenés ese margen para organizarte.`, tone:'good', icon:'⏳' }
      : { title:'Fecha ya pasada', text:`El ${f} fue hace **${abs} días** (≈ ${(abs/7).toFixed(1)} semanas). Es una fecha pasada respecto de hoy.`, tone:'neutral', icon:'🕰️' };
  return { resultado:diff+' días', resumen:`Entre hoy y ${f}: ${diff} días.`, _insight: insight };
}
