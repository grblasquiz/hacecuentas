export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number | undefined; _insight?: any; }
export function heladeraInverterVsNoInverterConsumoAhorro(i: Inputs): Outputs {
  const i_=Number(i.kwhAnoInverter)||250; const t=Number(i.kwhAnoTradicional)||450; const tarifa=Number(i.tarifaKwh)||120;
  const ahorroKwh=t-i_; const ahorroArs=ahorroKwh*tarifa*1.21;
  const premiumEstimado=150000; const anios=ahorroArs>0?premiumEstimado/ahorroArs:0;
  let _insight;
  if (ahorroKwh <= 0) {
    _insight = { title: 'Sin ahorro de consumo', text: `Con esos números la inverter consume **igual o más** que la tradicional (${i_} vs ${t} kWh/año): el sobreprecio no se recupera por consumo. Su ventaja queda solo en ruido y vida útil del compresor.`, tone: 'warn', icon: '🔌' };
  } else if (anios <= 5) {
    _insight = { title: 'El sobreprecio se recupera rápido', text: `La inverter ahorra **${ahorroKwh} kWh/año** (~**$${Math.round(ahorroArs).toLocaleString('es-AR')}** con IVA): el sobreprecio estimado de ~$${premiumEstimado.toLocaleString('es-AR')} se paga en **~${anios.toFixed(1)} años**. Sumá menos ruido y un compresor más durable.`, tone: 'good', icon: '🔌' };
  } else {
    _insight = { title: 'Amortización lenta', text: `La inverter ahorra **${ahorroKwh} kWh/año** (~**$${Math.round(ahorroArs).toLocaleString('es-AR')}**), pero a esa tarifa el sobreprecio tarda **~${anios.toFixed(1)} años** en recuperarse. Si la tarifa sube o la usás muchos años, conviene igual por durabilidad y ruido.`, tone: 'neutral', icon: '🔌' };
  }
  return { ahorroAnual:`$${Math.round(ahorroArs).toLocaleString('es-AR')} (${ahorroKwh} kWh)`, amortizacion:`~${anios.toFixed(1)} años`, observacion:'Inverter: menos ruido + vida más larga del compresor.', _insight };
}
