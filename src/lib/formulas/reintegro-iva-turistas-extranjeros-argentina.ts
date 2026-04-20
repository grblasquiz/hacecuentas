export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function reintegroIvaTuristasExtranjerosArgentina(i: Inputs): Outputs {
  const m=Number(i.compraUsd)||0;
  const iva=m*0.21/1.21;
  return { ivaReintegrable:`USD ${iva.toFixed(2)}`, procedimiento:'1) Factura A con pasaporte. 2) Sellado Aduana salida. 3) Reintegro vía TaxFree o transferencia.', observacion:'Solo productos artesanales AR + hoteles. Mínimo ARS 70 IVA por factura.' };
}
