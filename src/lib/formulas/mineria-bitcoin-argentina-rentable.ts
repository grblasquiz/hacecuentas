export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function mineriaBitcoinArgentinaRentable(i: Inputs): Outputs {
  const h=Number(i.hashrateTh)||0; const c=Number(i.consumoKw)||0; const t=Number(i.tarifaKwh)||0; const p=Number(i.precioBtc)||0; const cm=Number(i.cotMep)||1;
  const networkHash=600e6; // TH/s aprox
  const btcBlock=3.125; const bloquesDia=144;
  const btcDia=(h/networkHash)*btcBlock*bloquesDia;
  const ingUsd=btcDia*p; const gastoPesos=c*24*t; const gastoUsd=gastoPesos/cm; const neto=ingUsd-gastoUsd;
  return { btcDiario:`${btcDia.toFixed(8)} BTC`, ingresoDiario:`USD ${ingUsd.toFixed(2)}`, gastoDiario:`$${Math.round(gastoPesos).toLocaleString('es-AR')}`, rentabilidad:`USD ${neto.toFixed(2)} neto/día` };
}
