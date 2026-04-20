export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function sueldoDolarizadoVsPesosArgentinaComparativa(i: Inputs): Outputs {
  const u=Number(i.sueldoUsdMensual)||0; const a=Number(i.sueldoArsMensual)||0; const c=Number(i.cotMep)||1;
  const usdEnArs=u*c; const dif=usdEnArs-a;
  const rec=usdEnArs>a?`USD conviene: $${Math.round(dif).toLocaleString('es-AR')} más`:`Pesos conviene: $${Math.abs(Math.round(dif)).toLocaleString('es-AR')} más`;
  return { usdEnPesos:`$${Math.round(usdEnArs).toLocaleString('es-AR')}`, diferencia:`${dif>=0?'+':''}$${Math.round(dif).toLocaleString('es-AR')} (${((dif/a)*100).toFixed(0)}%)`, recomendacion:rec };
}
