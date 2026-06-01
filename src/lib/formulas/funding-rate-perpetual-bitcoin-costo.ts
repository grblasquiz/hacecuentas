export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; }
export function fundingRatePerpetualBitcoinCosto(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const t=Number(i.tamanoUsd)||0; const r=Number(i.fundingRate)||0; const h=Number(i.horasOpen)||0;
  const intervalos=h/8; const funding=t*r/100*intervalos; const pct=t>0?(funding/t*100):0;
  const interpretacion = __lang === 'en'
    ? `In ${h}h you pay/receive USD ${funding.toFixed(2)} in funding.`
    : `En ${h}h pagás/cobrás USD ${funding.toFixed(2)} por funding.`;
  return { fundingTotal:`USD ${funding.toFixed(2)}`, porcentaje:`${pct.toFixed(3)}%`, interpretacion };
}
