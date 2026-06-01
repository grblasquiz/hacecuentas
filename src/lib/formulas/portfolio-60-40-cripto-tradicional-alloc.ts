export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; }
export function portfolio6040CriptoTradicionalAlloc(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const m=Number(i.montoTotal)||0; const ac=Number(i.allocCripto)||0;
  const stocks=m*(100-ac)/100; const cripto=m*ac/100;
  const interpretacion = __lang === 'en'
    ? `${100-ac}% traditional + ${ac}% crypto. Rebalance at least annually.`
    : `${100-ac}% en tradicional + ${ac}% en cripto. Rebalanceá al menos anualmente.`;
  return { enStocks:`USD ${Math.round(stocks).toLocaleString('en-US')}`, enCripto:`USD ${Math.round(cripto).toLocaleString('en-US')}`, interpretacion };
}
