export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function dniPasaporteCostoTramiteArgentina(i: Inputs): Outputs {
  const t=String(i.tipo||'dni-renov');
  const tar: Record<string,[number,string]> = {
    'dni-0-5':[0,'15 días'], 'dni-renov':[12000,'15 días'], 'dni-duplic':[18000,'15 días'],
    'pas-com':[95000,'15 días'], 'pas-ex':[150000,'5-10 días']
  };
  const [c,t1]=tar[t]||tar['dni-renov'];
  return { costo:'$'+c.toLocaleString('es-AR'), tiempo:t1, resumen:`${t}: $${c.toLocaleString('es-AR')}, entrega ${t1}.` };
}
