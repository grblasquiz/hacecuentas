export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: any; }
export function tarjetaPrepagaViajeComisionesTipo(i: Inputs): Outputs {
  const t=String(i.tipo||'wise'); const m=Number(i.montoUsdCargar)||0;
  const comisiones={'ar_usd_prepaga':0.02,'ar_visa_internacional':0.03,'wise':0.005,'payoneer':0.02,'revolut':0.005};
  const com=m*comisiones[t];
  const rec=t==='wise'||t==='revolut'?'Mejor opción: baja comisión + cambio real':'Moderada. Comparar opciones.';
  const pct = comisiones[t] * 100;
  const esBarata = t==='wise'||t==='revolut';
  const insightTone: 'good' | 'warn' | 'neutral' = esBarata ? 'good' : (comisiones[t] >= 0.03 ? 'warn' : 'neutral');
  const insightText = esBarata
    ? `Cargando **USD ${m.toLocaleString('es-AR')}** pagás solo **USD ${com.toFixed(2)}** de comisión (${pct.toFixed(1)}%) y usás el **cambio interbancario real**: la opción más barata para el viaje.`
    : `Cargando **USD ${m.toLocaleString('es-AR')}** la comisión es **USD ${com.toFixed(2)}** (${pct.toFixed(1)}%) y encima sumás un **markup de 2-3%** en el tipo de cambio. Comparalo contra Wise o Revolut antes de cargar.`;
  return {
    comisionCarga:`USD ${com.toFixed(2)} (${(comisiones[t]*100).toFixed(2)}%)`,
    cambioUsd:t==='wise'||t==='revolut'?'Cambio interbancario real':'Tipo cambio con markup 2-3%',
    recomendacion:rec,
    _insight: { title: 'Qué significa este resultado', text: insightText, tone: insightTone, icon: '✈️' },
  };
}
