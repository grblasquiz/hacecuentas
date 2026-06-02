export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; _chart?: any; }
export function usdtVsUsdcComisionExchange(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      recUSDC: 'USDC (mejor integración EEUU)',
      recUSDT: 'USDT (más liquidez global)',
      obs: 'Spread típico 0.01-0.1%. Reviewar siempre reservas publicadas.',
      exNames: { binance:'Binance', coinbase:'Coinbase', kraken:'Kraken', local_ar:'exchange local AR' } as Record<string,string>,
      titBarato: (n:string)=>`${n}: comisión baja`,
      titCaro: (n:string)=>`${n}: comisión alta`,
      txt: (ex:string, n:string, pct:string, fee:string, monto:string)=>`Operando **${monto}** en **${n}** pagás **${fee}** de comisión (**${pct}%**)${ex==='coinbase' ? '. Coinbase es de los más caros del lote: el mismo monto en Binance sale ~6× menos.' : ex==='local_ar' ? '. El exchange local AR es el tope de costo del lote: conviene comparar antes de cada operación grande.' : ex==='binance' ? '. Es de las más competitivas; el spread USDT/USDC suele pesar más que esta fee.' : '.'}`,
    },
    en: {
      recUSDC: 'USDC (best integration for US)',
      recUSDT: 'USDT (higher global liquidity)',
      obs: 'Typical spread 0.01–0.1%. Always review published reserves.',
      exNames: { binance:'Binance', coinbase:'Coinbase', kraken:'Kraken', local_ar:'local AR exchange' } as Record<string,string>,
      titBarato: (n:string)=>`${n}: low fee`,
      titCaro: (n:string)=>`${n}: high fee`,
      txt: (ex:string, n:string, pct:string, fee:string, monto:string)=>`Trading **${monto}** on **${n}** costs **${fee}** in fees (**${pct}%**)${ex==='coinbase' ? '. Coinbase is among the priciest here — the same amount on Binance costs ~6× less.' : ex==='local_ar' ? '. The local AR exchange is the costliest of the set; compare before every large trade.' : ex==='binance' ? '. One of the most competitive; the USDT/USDC spread usually matters more than this fee.' : '.'}`,
    },
  } as const)[__lang];
  const m=Number(i.monto)||0; const ex=String(i.exchange||'binance');
  const fees:Record<string,number>={'binance':0.001,'coinbase':0.006,'kraken':0.0026,'local_ar':0.01};
  const f=m*(fees[ex]||0.001);
  const rec=ex==='coinbase'||ex==='kraken'?T.recUSDC:T.recUSDT;
  const feeRate=(fees[ex]||0.001);
  const pctStr=(feeRate*100).toFixed(2);
  const feeStr=`USD ${f.toFixed(2)}`;
  const montoStr=`USD ${m.toLocaleString('en-US')}`;
  const exNombre=T.exNames[ex]||ex;
  const caro = feeRate>=0.006;
  const insight = {
    title: caro ? T.titCaro(exNombre) : T.titBarato(exNombre),
    text: T.txt(ex, exNombre, pctStr, feeStr, montoStr),
    tone: (feeRate>=0.006 ? 'warn' : feeRate<=0.001 ? 'good' : 'neutral') as 'good'|'warn'|'neutral',
    icon: caro ? '⚠️' : feeRate<=0.001 ? '🟢' : '💱',
  };
  return { recomendacion:rec, comisionEstimada:`USD ${f.toFixed(2)} (${(fees[ex]*100).toFixed(2)}%)`, observaciones:T.obs, _insight:insight };
}
