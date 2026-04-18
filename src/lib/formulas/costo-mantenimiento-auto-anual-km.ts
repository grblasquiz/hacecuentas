export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function costoMantenimientoAutoAnualKm(i: Inputs): Outputs {
  const a=Number(i.anio)||2020; const km=Number(i.km)||15000; const p=Number(i.precio)||0;
  const edad=Math.max(0, new Date().getFullYear()-a);
  const pctBase=0.03+edad*0.005+Math.max(0,(km-15000)/15000)*0.01;
  const anual=p*Math.min(0.1,pctBase);
  return { mantenimiento:`$${anual.toFixed(0)}`, pctValor:`${(anual/p*100).toFixed(1)}%`, resumen:`Auto ${a} (${edad} años, ${km}km/año): ~$${anual.toFixed(0)}/año mantenimiento.` };
}
