export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function horasFacturablesEmpleadoVsFreelanceComparativa(i: Inputs): Outputs {
  const s=Number(i.sueldoBrutoMensual)||0; const th=Number(i.tarifaHoraFree)||0; const hf=Number(i.horasFacturablesMes)||0; const d=Number(i.dolarMep)||1;
  const empleadoAnual=(s*0.75)*13; // neto aportes + aguinaldo
  const brutoFree=th*hf*12;
  const freelanceAnualUsd=brutoFree*0.7; // comisiones + imp
  const freelanceAnualArs=freelanceAnualUsd*d;
  const dif=freelanceAnualArs-empleadoAnual;
  return { empleadoAnual:`$${Math.round(empleadoAnual).toLocaleString('es-AR')}`, freelanceAnual:`$${Math.round(freelanceAnualArs).toLocaleString('es-AR')}`, diferencia:`${dif>=0?'+':''}$${Math.round(dif).toLocaleString('es-AR')}` };
}
