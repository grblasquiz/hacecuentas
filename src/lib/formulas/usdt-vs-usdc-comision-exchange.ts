export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function usdtVsUsdcComisionExchange(i: Inputs): Outputs {
  const m=Number(i.monto)||0; const ex=String(i.exchange||'binance');
  const fees:Record<string,number>={'binance':0.001,'coinbase':0.006,'kraken':0.0026,'local_ar':0.01};
  const f=m*(fees[ex]||0.001);
  const rec=ex==='coinbase'||ex==='kraken'?'USDC (mejor integración EEUU)':'USDT (más liquidez global)';
  return { recomendacion:rec, comisionEstimada:`USD ${f.toFixed(2)} (${(fees[ex]*100).toFixed(2)}%)`, observaciones:`Spread típico 0.01-0.1%. Reviewar siempre reservas publicadas.` };
}
