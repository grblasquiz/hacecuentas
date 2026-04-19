export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function certificadoLibreDeudaAutoCosto(i: Inputs): Outputs {
  const p=String(i.provincia||'caba');
  const c: Record<string,number> = { caba:15000, pba:18000, cba:14000 };
  return { costo:'$'+(c[p]||15000).toLocaleString('es-AR'), tiempo:'24-48h online', resumen:`Libre deuda ${p}: $${(c[p]||15000).toLocaleString('es-AR')}.` };
}
