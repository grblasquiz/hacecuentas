export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; _chart?: any; }
export function portfolio6040CriptoTradicionalAlloc(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const m=Number(i.montoTotal)||0; const ac=Number(i.allocCripto)||0;
  const stocks=m*(100-ac)/100; const cripto=m*ac/100;
  const interpretacion = __lang === 'en'
    ? `${100-ac}% traditional + ${ac}% crypto. Rebalance at least annually.`
    : `${100-ac}% en tradicional + ${ac}% en cripto. Rebalanceá al menos anualmente.`;
  const tradPct = 100 - ac;
  const stocksFmt = Math.round(stocks).toLocaleString('en-US');
  const criptoFmt = Math.round(cripto).toLocaleString('en-US');
  // Tono: cripto es el activo volátil; >20% se considera agresivo
  const tone = ac >= 40 ? 'warn' : ac >= 20 ? 'neutral' : 'good';
  const _insight = {
    title: __lang === 'en' ? 'Your allocation' : 'Tu asignación',
    text: __lang === 'en'
      ? `You put **USD ${criptoFmt}** (${ac}%) in crypto and **USD ${stocksFmt}** (${tradPct}%) in traditional assets. ${ac >= 40 ? 'A crypto weight this high adds a lot of volatility: only the part you can afford to lose.' : ac >= 20 ? 'A moderate crypto sleeve — rebalance yearly so it doesn\'t drift.' : 'A conservative crypto sleeve that keeps overall volatility in check.'}`
      : `Pusiste **USD ${criptoFmt}** (${ac}%) en cripto y **USD ${stocksFmt}** (${tradPct}%) en tradicional. ${ac >= 40 ? 'Un peso cripto tan alto suma mucha volatilidad: que sea solo la plata que podés perder.' : ac >= 20 ? 'Una porción cripto moderada — rebalanceá una vez al año para que no se desbalancee.' : 'Una porción cripto conservadora que mantiene la volatilidad total bajo control.'}`,
    tone,
    icon: ac >= 40 ? '⚠️' : '📊',
  };
  const _chart = {
    type: 'doughnut',
    slices: [
      { label: __lang === 'en' ? 'Traditional' : 'Tradicional', value: Math.round(stocks) },
      { label: __lang === 'en' ? 'Crypto' : 'Cripto', value: Math.round(cripto) },
    ],
    prefix: 'USD ',
    centerValue: 'USD ' + Math.round(m).toLocaleString('en-US'),
    centerLabel: __lang === 'en' ? 'Total portfolio' : 'Cartera total',
    ariaLabel: __lang === 'en'
      ? `Portfolio split: USD ${stocksFmt} traditional and USD ${criptoFmt} crypto.`
      : `Distribución de la cartera: USD ${stocksFmt} en tradicional y USD ${criptoFmt} en cripto.`,
  };
  return { enStocks:`USD ${stocksFmt}`, enCripto:`USD ${criptoFmt}`, interpretacion, _insight, _chart };
}
