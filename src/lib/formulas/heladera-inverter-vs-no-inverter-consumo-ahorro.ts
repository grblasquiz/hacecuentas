export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function heladeraInverterVsNoInverterConsumoAhorro(i: Inputs): Outputs {
  const i_=Number(i.kwhAnoInverter)||250; const t=Number(i.kwhAnoTradicional)||450; const tarifa=Number(i.tarifaKwh)||120;
  const ahorroKwh=t-i_; const ahorroArs=ahorroKwh*tarifa*1.21;
  const premiumEstimado=150000; const anios=ahorroArs>0?premiumEstimado/ahorroArs:0;
  return { ahorroAnual:`$${Math.round(ahorroArs).toLocaleString('es-AR')} (${ahorroKwh} kWh)`, amortizacion:`~${anios.toFixed(1)} años`, observacion:'Inverter: menos ruido + vida más larga del compresor.' };
}
