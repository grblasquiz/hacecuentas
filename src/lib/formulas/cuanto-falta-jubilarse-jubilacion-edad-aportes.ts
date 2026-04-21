export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function cuantoFaltaJubilarseJubilacionEdadAportes(i: Inputs): Outputs {
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
  const diff=Math.floor((d.getTime()-hoy.getTime())/86400000);
  return { resultado:diff+' días', resumen:`Entre hoy y ${f}: ${diff} días.` };
}
