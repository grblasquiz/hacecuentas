export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function fideicomisoConstruccionAporteCuotas(i: Inputs): Outputs {
  const v=Number(i.valorDepto)||0; const n=Number(i.cuotasTotales)||0; const a=(Number(i.avanceObra)||0)/100;
  const cuota=v/n;
  const debido=cuota*(n*a);
  return { cuota:'$'+cuota.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.'), debido:'$'+debido.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.'), resumen:`$${v.toLocaleString('es-AR')} / ${n} cuotas: $${cuota.toFixed(0)}/mes. A ${(a*100).toFixed(0)}% obra debería haber pagado $${debido.toFixed(0)}.` };
}
