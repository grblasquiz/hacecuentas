export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; _chart?: any; }
export function saldoCriptoValorMonedaLocalMulti(i: Inputs): Outputs {
  const btc=Number(i.btcCant)||0; const eth=Number(i.ethCant)||0; const usdt=Number(i.usdtCant)||0;
  const pbtc=Number(i.precioBtcUsd)||0; const peth=Number(i.precioEthUsd)||0; const cm=Number(i.cotMep)||0;
  const valBtc=btc*pbtc; const valEth=eth*peth; const valUsdt=usdt*1;
  const usd=valBtc+valEth+valUsdt; const ars=usd*cm;
  const des=`BTC ${btc}→USD ${valBtc.toFixed(0)} | ETH ${eth}→USD ${valEth.toFixed(0)} | USDT ${usdt}→USD ${usdt}`;

  const usdFmt = (n: number) => 'USD ' + Math.round(n).toLocaleString('en-US');
  // Activo dominante de la cartera
  const partes: { label: string; value: number }[] = [
    { label: 'BTC', value: valBtc },
    { label: 'ETH', value: valEth },
    { label: 'USDT', value: valUsdt },
  ].filter(p => p.value > 0);
  let dominante = partes[0];
  for (const p of partes) if (p.value > (dominante?.value ?? 0)) dominante = p;
  const pctDom = usd > 0 && dominante ? (dominante.value / usd * 100) : 0;

  const _insight = {
    title: 'Valor de tu cartera cripto',
    text: usd > 0
      ? `Tu cartera vale **${usdFmt(usd)}** (**$${Math.round(ars).toLocaleString('es-AR')}** al dólar MEP). El activo de mayor peso es **${dominante.label}** con el **${pctDom.toFixed(0)}%** del total.`
      : `Ingresá las cantidades y precios de tus criptos para ver el valor total en dólares y en pesos.`,
    tone: 'neutral',
    icon: '🪙',
  };

  const _chart = partes.length >= 2 ? {
    type: 'doughnut',
    slices: partes,
    prefix: 'USD ',
    centerValue: usdFmt(usd),
    centerLabel: 'Total cartera',
    ariaLabel: `Composición de la cartera por activo, total ${usdFmt(usd)}: ` + partes.map(p => `${p.label} ${usdFmt(p.value)}`).join(', ') + '.',
  } : undefined;

  return {
    totalUsd:`USD ${Math.round(usd).toLocaleString('en-US')}`,
    totalArs:`$${Math.round(ars).toLocaleString('es-AR')}`,
    desglose:des,
    _insight,
    ...(_chart ? { _chart } : {}),
  };
}
