export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function diasHabilesMesActualFeriados(i: Inputs): Outputs {
  const f=String(i.fecha1||'');
  if (!f) {
    const hoy=new Date();
    return { resultado:hoy.toISOString().slice(0,10), resumen:'Ingresá una fecha.' };
  }
  const d=new Date(f+'T00:00:00');
  if (isNaN(d.getTime())) return { resultado:'—', resumen:'Fecha inválida.' };
  const hoy=new Date();
  const diff=Math.floor((d.getTime()-hoy.getTime())/86400000);
  return { resultado:diff+' días', resumen:`Entre hoy y ${f}: ${diff} días.` };
}
