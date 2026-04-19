export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function libretaSanitariaCostoHueriaFood(i: Inputs): Outputs {
  const m=String(i.municipio||'caba');
  const c: Record<string,number> = { caba:15000, 'la-plata':12000, cba:13000, rosario:11000 };
  return { costo:'$'+(c[m]||15000).toLocaleString('es-AR'), validez:'1 año', resumen:`Libreta sanitaria ${m}: $${(c[m]||15000).toLocaleString('es-AR')}/año.` };
}
