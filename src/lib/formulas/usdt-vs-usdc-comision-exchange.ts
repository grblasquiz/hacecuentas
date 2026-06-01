export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; }
export function usdtVsUsdcComisionExchange(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      recUSDC: 'USDC (mejor integración EEUU)',
      recUSDT: 'USDT (más liquidez global)',
      obs: 'Spread típico 0.01-0.1%. Reviewar siempre reservas publicadas.',
    },
    en: {
      recUSDC: 'USDC (best integration for US)',
      recUSDT: 'USDT (higher global liquidity)',
      obs: 'Typical spread 0.01–0.1%. Always review published reserves.',
    },
  } as const)[__lang];
  const m=Number(i.monto)||0; const ex=String(i.exchange||'binance');
  const fees:Record<string,number>={'binance':0.001,'coinbase':0.006,'kraken':0.0026,'local_ar':0.01};
  const f=m*(fees[ex]||0.001);
  const rec=ex==='coinbase'||ex==='kraken'?T.recUSDC:T.recUSDT;
  return { recomendacion:rec, comisionEstimada:`USD ${f.toFixed(2)} (${(fees[ex]*100).toFixed(2)}%)`, observaciones:T.obs };
}
