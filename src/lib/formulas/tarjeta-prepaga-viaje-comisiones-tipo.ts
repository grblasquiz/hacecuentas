export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function tarjetaPrepagaViajeComisionesTipo(i: Inputs): Outputs {
  const t=String(i.tipo||'wise'); const m=Number(i.montoUsdCargar)||0;
  const comisiones={'ar_usd_prepaga':0.02,'ar_visa_internacional':0.03,'wise':0.005,'payoneer':0.02,'revolut':0.005};
  const com=m*comisiones[t];
  const rec=t==='wise'||t==='revolut'?'Mejor opción: baja comisión + cambio real':'Moderada. Comparar opciones.';
  return { comisionCarga:`USD ${com.toFixed(2)} (${(comisiones[t]*100).toFixed(2)}%)`, cambioUsd:t==='wise'||t==='revolut'?'Cambio interbancario real':'Tipo cambio con markup 2-3%', recomendacion:rec };
}
