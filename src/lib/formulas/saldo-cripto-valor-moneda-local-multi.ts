export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function saldoCriptoValorMonedaLocalMulti(i: Inputs): Outputs {
  const btc=Number(i.btcCant)||0; const eth=Number(i.ethCant)||0; const usdt=Number(i.usdtCant)||0;
  const pbtc=Number(i.precioBtcUsd)||0; const peth=Number(i.precioEthUsd)||0; const cm=Number(i.cotMep)||0;
  const usd=btc*pbtc+eth*peth+usdt*1; const ars=usd*cm;
  const des=`BTC ${btc}→USD ${(btc*pbtc).toFixed(0)} | ETH ${eth}→USD ${(eth*peth).toFixed(0)} | USDT ${usdt}→USD ${usdt}`;
  return { totalUsd:`USD ${Math.round(usd).toLocaleString('en-US')}`, totalArs:`$${Math.round(ars).toLocaleString('es-AR')}`, desglose:des };
}
