export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function nftRoyaltyCreatorSecondaryMarket(i: Inputs): Outputs {
  const v=Number(i.ventaSecundariaUsd)||0; const r=Number(i.royaltyPorcentaje)||0;
  const rec=v*r/100; const neto=v-rec;
  return { royaltyRecibido:`USD ${rec.toFixed(2)}`, neto:`USD ${neto.toFixed(2)}`, interpretacion:`Con ${r}% royalty: creator recibe USD ${rec.toFixed(2)}, vendedor USD ${neto.toFixed(2)}.` };
}
