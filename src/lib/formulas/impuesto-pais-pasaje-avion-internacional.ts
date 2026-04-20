export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function impuestoPaisPasajeAvionInternacional(i: Inputs): Outputs {
  const p=Number(i.pasajeUsd)||0; const pais=Number(i.impuestoPais)||30; const per=Number(i.percepcion)||45;
  const impPais=p*pais/100; const impPer=p*per/100; const total=impPais+impPer; const fin=p+total;
  return { impuestoTotal:`USD ${total.toFixed(2)} (${(pais+per)}%)`, costoFinal:`USD ${fin.toFixed(2)}`, recuperoPosible:`USD ${impPer.toFixed(2)} (percepción recuperable en DDJJ)` };
}
