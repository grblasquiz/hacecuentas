export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function impuestoPaisPercepcionDolarTarjeta(i: Inputs): Outputs {
  const u=Number(i.consumoUsd)||0; const pais=Number(i.impuestoPais)||0; const per=Number(i.percepcionGanancias)||0; const cot=Number(i.cotizacionOficial)||0;
  const subtotal=u*cot; const total=subtotal*(1+pais/100+per/100);
  const def_=total/u; const brecha=cot>0?((def_/cot-1)*100):0;
  return { costoTotalPesos:`$${Math.round(total).toLocaleString('es-AR')}`, dolarEfectivo:`$${Math.round(def_).toLocaleString('es-AR')}`, brecha:`+${brecha.toFixed(0)}% sobre oficial` };
}
