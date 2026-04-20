export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function autonomosCategorias2026Aportes(i: Inputs): Outputs {
  const c=String(i.categoria||'III');
  const tab:Record<string,number>={'I':180000,'II':230000,'III':280000,'IV':340000,'V':400000,'I\'':220000,'II\'':280000,'III\'':340000,'IV\'':410000,'V\'':480000};
  const a=tab[c]||280000;
  return { aporteMensual:`$${a.toLocaleString('es-AR')}`, descripcion:`Categoría ${c}: aporte estimado ${a.toLocaleString('es-AR')}/mes.` };
}
