export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function electricidadTarifaSocialSubsidioN1N2(i: Inputs): Outputs {
  const k=Number(i.kwhMes)||0; const s=String(i.segmentoTarifa||'N1_altos'); const tn1=Number(i.tarifaN1)||180;
  const mult={'N1_altos':1,'N2_bajos':0.38,'N3_medios':0.65}[s];
  const costo=k*tn1*mult*1.21;
  const sin=k*tn1*1.21; const ahorro=sin-costo;
  return { costoMensual:`$${Math.round(costo).toLocaleString('es-AR')}`, segmento:s.replace('_',' '), ahorroVsN1:mult<1?`$${Math.round(ahorro).toLocaleString('es-AR')} (${((1-mult)*100).toFixed(0)}%)`:'0 (sin subsidio)' };
}
