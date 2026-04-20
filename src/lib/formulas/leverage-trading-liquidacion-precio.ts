export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function leverageTradingLiquidacionPrecio(i: Inputs): Outputs {
  const p=Number(i.precioEntrada)||0; const a=Number(i.apalancamiento)||1; const t=String(i.tipoPosicion||'long');
  const mov=1/a*100;
  const pl=t==='long'?p*(1-1/a):p*(1+1/a);
  return { precioLiquidacion:`USD ${Math.round(pl).toLocaleString('en-US')}`, porcentajeDisminucion:`${mov.toFixed(1)}% ${t==='long'?'caída':'suba'}`, interpretacion:`Con ${a}x ${t}: si precio ${t==='long'?'cae':'sube'} ${mov.toFixed(1)}%, te liquidan a ${Math.round(pl).toLocaleString('en-US')}.` };
}
