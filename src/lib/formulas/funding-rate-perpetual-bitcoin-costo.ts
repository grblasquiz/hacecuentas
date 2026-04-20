export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function fundingRatePerpetualBitcoinCosto(i: Inputs): Outputs {
  const t=Number(i.tamanoUsd)||0; const r=Number(i.fundingRate)||0; const h=Number(i.horasOpen)||0;
  const intervalos=h/8; const funding=t*r/100*intervalos; const pct=t>0?(funding/t*100):0;
  return { fundingTotal:`USD ${funding.toFixed(2)}`, porcentaje:`${pct.toFixed(3)}%`, interpretacion:`En ${h}h pagás/cobrás USD ${funding.toFixed(2)} por funding.` };
}
