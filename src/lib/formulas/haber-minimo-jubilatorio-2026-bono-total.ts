export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function haberMinimoJubilatorio2026BonoTotal(i: Inputs): Outputs {
  const h=Number(i.haberBase)||0; const tb=String(i.tieneBono||'no');
  const bono=tb==='si'?70000:0; const t=h+bono;
  return { total:`$${t.toLocaleString('es-AR')}`, bono:bono>0?`+$${bono.toLocaleString('es-AR')}`:'No aplica', interpretacion:tb==='si'?`Haber base $${h.toLocaleString('es-AR')} + bono $${bono.toLocaleString('es-AR')} = $${t.toLocaleString('es-AR')}.`:`Haber sin bono: $${t.toLocaleString('es-AR')}.` };
}
