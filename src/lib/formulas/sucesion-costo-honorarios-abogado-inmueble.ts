export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function sucesionCostoHonorariosAbogadoInmueble(i: Inputs): Outputs {
  const v=Number(i.valorAcervo)||0; const c=String(i.complejidad||'simple');
  const hono: Record<string,number> = { simple:0.08, med:0.12, compleja:0.15 };
  const h=v*(hono[c]||0.08);
  const imp=v*0.03;
  const total=h+imp;
  return { honorariosAbog:'$'+h.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.'), impuestos:'$'+imp.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.'), total:'$'+total.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.'), resumen:`Acervo $${v.toLocaleString('es-AR')} ${c}: total ~$${total.toFixed(0)} (${(total/v*100).toFixed(1)}%).` };
}
