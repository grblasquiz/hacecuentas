export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; }
export function gasFeeEthereumTransaccionSwap(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const g=Number(i.gasUnits)||0; const gw=Number(i.gweiPrice)||0; const p=Number(i.precioEth)||0;
  const eth=g*gw/1e9; const usd=eth*p;
  const interpretacion = __lang === 'en'
    ? `With ${gw} gwei: you pay USD ${usd.toFixed(2)} in fees. On L2 (Arbitrum/Optimism) it would be ~USD ${(usd/50).toFixed(2)}.`
    : `Con ${gw} gwei: pagás USD ${usd.toFixed(2)} en fees. En L2 (Arbitrum/Optimism) sería ~USD ${(usd/50).toFixed(2)}.`;
  return { feeEth:`${eth.toFixed(6)} ETH`, feeUsd:`USD ${usd.toFixed(2)}`, interpretacion };
}
