export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function fideicomisoConstruccionAporteCuotas(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : i.__lang === 'pt' ? 'pt' : 'es';
  const v=Number(i.valorDepto)||0; const n=Number(i.cuotasTotales)||0; const a=(Number(i.avanceObra)||0)/100;
  const cuota=v/n;
  const debido=cuota*(n*a);
  const resumen = __lang === 'en'
    ? `$${v.toLocaleString('es-AR')} / ${n} installments: $${cuota.toFixed(0)}/mo. At ${(a*100).toFixed(0)}% completion you should have paid $${debido.toFixed(0)}.`
    : __lang === 'pt'
    ? `$${v.toLocaleString('es-AR')} / ${n} parcelas: $${cuota.toFixed(0)}/mês. Com ${(a*100).toFixed(0)}% de obra concluída, você deveria ter pago $${debido.toFixed(0)}.`
    : `$${v.toLocaleString('es-AR')} / ${n} cuotas: $${cuota.toFixed(0)}/mes. A ${(a*100).toFixed(0)}% obra debería haber pagado $${debido.toFixed(0)}.`;
  return { cuota:'$'+cuota.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.'), debido:'$'+debido.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.'), resumen };
}
