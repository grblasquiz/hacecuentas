export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function impuestoCriptoArgentinaDeclaracionAnual(i: Inputs): Outputs {
  const g=Number(i.gananciaRealizadaUsd)||0; const s=Number(i.saldoCripto31dic)||0; const c=Number(i.cotizacionMep)||1;
  const gan=g*0.15; const saldoPesos=s*c; const bp=saldoPesos>350000000?saldoPesos*0.0075:0; const total=gan*c+bp;
  return { gananciasImpuesto:`USD ${gan.toFixed(2)}`, bienesPersonales:bp>0?`$${Math.round(bp).toLocaleString('es-AR')}`:'No aplica (debajo MNI)', total:`$${Math.round(total).toLocaleString('es-AR')}` };
}
