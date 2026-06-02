export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function costoMantenimientoAutoAnualKm(i: Inputs): Outputs {
  const a=Number(i.anio)||2020; const km=Number(i.km)||15000; const p=Number(i.precio)||0;
  const edad=Math.max(0, new Date().getFullYear()-a);
  const pctBase=0.03+edad*0.005+Math.max(0,(km-15000)/15000)*0.01;
  const anual=p*Math.min(0.1,pctBase);
  const pctReal=p>0?(anual/p*100):0;
  const mensual=anual/12;
  const fmt=(n:number)=>`$${Math.round(n).toLocaleString('es-AR')}`;
  const tono=pctReal>=8?'warn':pctReal>=5?'neutral':'good';
  const text=p>0
    ? `Tu **${a}** (${edad} años, ${km.toLocaleString('es-AR')} km/año) gasta unos **${fmt(anual)}/año** en mantenimiento, cerca de **${fmt(mensual)}/mes**: un **${pctReal.toFixed(1)}%** del valor del auto.`
    : `Tu **${a}** (${edad} años, ${km.toLocaleString('es-AR')} km/año) gasta más en mantenimiento a más antigüedad y kilometraje. Cargá el valor del auto para ver el costo anual estimado.`;
  return {
    mantenimiento:`$${anual.toFixed(0)}`,
    pctValor:`${pctReal.toFixed(1)}%`,
    resumen:`Auto ${a} (${edad} años, ${km}km/año): ~$${anual.toFixed(0)}/año mantenimiento.`,
    _insight:{
      title:'Cuánto te saca el auto al año',
      text,
      tone:tono,
      icon:'🔧',
    },
  };
}
