export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function desalojoCausaPlazosHonorariosJuicio(i: Inputs): Outputs {
  const c=String(i.causa||'fp');
  const t: Record<string,string> = { fp:'6-18 meses', venc:'3-8 meses', incu:'8-24 meses' };
  return { tiempo:t[c]||t.fp, honorarios:'15-25% valor locativo', resumen:`Desalojo ${c}: ${t[c]||t.fp}, honorarios 15-25% del valor.` };
}
