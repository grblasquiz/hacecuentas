export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function cuantoFaltaDiaMadrePadreArgentina(i: Inputs): Outputs {
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
  const sem=Math.floor(Math.abs(diff)/7);
  const _insight = diff>0
    ? { title:`Faltan ${diff} días`, text:`Para el **${f}** quedan **${diff} días** (unas **${sem} semanas**). En Argentina el Día de la Madre cae el 3.º domingo de octubre y el del Padre el 3.º de junio: comprando con anticipación evitás la suba de precios de la semana previa.`, tone:'neutral', icon:'🎁' }
    : diff===0
      ? { title:'¡Es hoy!', text:`Hoy es **${f}**: el día de homenajear a mamá o papá. Que lo disfruten.`, tone:'good', icon:'🎁' }
      : { title:`Ya pasó hace ${-diff} días`, text:`El **${f}** fue hace **${-diff} días**. Si querés anticiparte a la próxima fecha, cargá el 3.º domingo del mes correspondiente.`, tone:'neutral', icon:'🎁' };
  return { resultado:diff+' días', resumen:`Entre hoy y ${f}: ${diff} días.`, _insight };
}
