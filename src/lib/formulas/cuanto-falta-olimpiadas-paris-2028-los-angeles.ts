export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function cuantoFaltaOlimpiadasParis2028LosAngeles(i: Inputs): Outputs {
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

  const semanas=Math.floor(Math.abs(diff)/7);
  const meses=Math.floor(Math.abs(diff)/30.44);
  let _insight;
  if (diff>0) {
    const detalle = meses>=2 ? `unos **${meses} meses**` : `**${semanas} semanas**`;
    _insight = { title:'Cuenta regresiva', text:`Faltan **${diff} días** (${detalle}) para esa fecha. Anotá la cuenta atrás y empezá a planear la ceremonia inaugural.`, tone:'neutral', icon:'🏅' };
  } else if (diff===0) {
    _insight = { title:'¡Es hoy!', text:'La fecha es **hoy mismo**: que arranquen los Juegos.', tone:'good', icon:'🔥' };
  } else {
    _insight = { title:'Fecha ya pasada', text:`Esa fecha quedó **${Math.abs(diff)} días atrás**. Probá con la próxima edición olímpica para ver la cuenta regresiva.`, tone:'warn', icon:'⏳' };
  }

  return { resultado:diff+' días', resumen:`Entre hoy y ${f}: ${diff} días.`, _insight };
}
