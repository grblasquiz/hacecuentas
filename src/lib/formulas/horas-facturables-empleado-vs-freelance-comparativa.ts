export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function horasFacturablesEmpleadoVsFreelanceComparativa(i: Inputs): Outputs {
  const s=Number(i.sueldoBrutoMensual)||0; const th=Number(i.tarifaHoraFree)||0; const hf=Number(i.horasFacturablesMes)||0; const d=Number(i.dolarMep)||1;
  const empleadoAnual=(s*0.75)*13; // neto aportes + aguinaldo
  const brutoFree=th*hf*12;
  const freelanceAnualUsd=brutoFree*0.7; // comisiones + imp
  const freelanceAnualArs=freelanceAnualUsd*d;
  const dif=freelanceAnualArs-empleadoAnual;
  const fmt=(n:number)=>`$${Math.round(n).toLocaleString('es-AR')}`;
  const ganaFree=dif>=0;
  const pct=empleadoAnual>0?Math.round(Math.abs(dif)/empleadoAnual*100):0;
  const _insight={
    title: ganaFree ? 'El freelance rinde más' : 'El empleo rinde más',
    text: ganaFree
      ? `Facturando como freelance ganarías **${fmt(Math.abs(dif))}** más al año (**${pct}%** sobre el empleo), pero sin aguinaldo, obra social ni indemnización.`
      : `Como empleado ganarías **${fmt(Math.abs(dif))}** más al año (**${pct}%** sobre el freelance) y con cobertura, aguinaldo y estabilidad incluidos.`,
    tone: 'neutral',
    icon: ganaFree ? '🧑‍💻' : '🏢',
  };
  return { empleadoAnual:fmt(empleadoAnual), freelanceAnual:fmt(freelanceAnualArs), diferencia:`${dif>=0?'+':''}${fmt(dif)}`, _insight };
}
