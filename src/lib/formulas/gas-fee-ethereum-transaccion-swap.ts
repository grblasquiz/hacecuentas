export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function gasFeeEthereumTransaccionSwap(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const g=Number(i.gasUnits)||0; const gw=Number(i.gweiPrice)||0; const p=Number(i.precioEth)||0;
  const eth=g*gw/1e9; const usd=eth*p;
  const usdL2=usd/50;
  const interpretacion = __lang === 'en'
    ? `With ${gw} gwei: you pay USD ${usd.toFixed(2)} in fees. On L2 (Arbitrum/Optimism) it would be ~USD ${usdL2.toFixed(2)}.`
    : `Con ${gw} gwei: pagás USD ${usd.toFixed(2)} en fees. En L2 (Arbitrum/Optimism) sería ~USD ${usdL2.toFixed(2)}.`;
  const tone = usd>=20?'warn':(usd<=2?'good':'neutral');
  const _insight = __lang === 'en'
    ? { title:'Fee for this transaction', text:`This swap costs **USD ${usd.toFixed(2)}** (${eth.toFixed(6)} ETH) at ${gw} gwei. The same move on an L2 like Arbitrum runs ~**USD ${usdL2.toFixed(2)}** — about 50× cheaper.`, tone, icon:'⛽' }
    : { title:'Fee de esta transacción', text:`Este swap te cuesta **USD ${usd.toFixed(2)}** (${eth.toFixed(6)} ETH) a ${gw} gwei. La misma operación en una L2 como Arbitrum sale ~**USD ${usdL2.toFixed(2)}**, unas 50× más barata.`, tone, icon:'⛽' };
  return { feeEth:`${eth.toFixed(6)} ETH`, feeUsd:`USD ${usd.toFixed(2)}`, interpretacion, _insight };
}
