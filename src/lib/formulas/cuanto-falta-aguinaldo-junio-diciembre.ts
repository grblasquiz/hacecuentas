export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function cuantoFaltaAguinaldoJunioDiciembre(i: Inputs): Outputs {
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
    ? { title:`Faltan ${diff} días`, text:`Para el **${f}** quedan **${diff} días** (unas **${sem} semanas**). El medio aguinaldo se liquida con la última quincena: tenelo en cuenta para no comprometerlo antes de cobrarlo.`, tone:'neutral', icon:'💰' }
    : diff===0
      ? { title:'¡Es hoy!', text:`Hoy es **${f}**, fecha tope del aguinaldo. Revisá que el SAC haya impactado en tu recibo.`, tone:'good', icon:'💰' }
      : { title:`Ya pasó hace ${-diff} días`, text:`El **${f}** fue hace **${-diff} días** (unas **${sem} semanas**). Si ese aguinaldo no se acreditó, reclamalo.`, tone:'warn', icon:'💰' };
  return { resultado:diff+' días', resumen:`Entre hoy y ${f}: ${diff} días.`, _insight };
}
