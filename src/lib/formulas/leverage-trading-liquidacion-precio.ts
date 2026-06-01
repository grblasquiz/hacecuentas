export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; }
export function leverageTradingLiquidacionPrecio(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const p=Number(i.precioEntrada)||0; const a=Number(i.apalancamiento)||1; const t=String(i.tipoPosicion||'long');
  const mov=1/a*100;
  const pl=t==='long'?p*(1-1/a):p*(1+1/a);
  const movDir = __lang === 'en'
    ? (t==='long' ? 'drop' : 'rise')
    : (t==='long' ? 'caída' : 'suba');
  const priceDir = __lang === 'en'
    ? (t==='long' ? 'drops' : 'rises')
    : (t==='long' ? 'cae' : 'sube');
  const interpretacion = __lang === 'en'
    ? `With ${a}x ${t}: if price ${priceDir} ${mov.toFixed(1)}%, you get liquidated at ${Math.round(pl).toLocaleString('en-US')}.`
    : `Con ${a}x ${t}: si precio ${priceDir} ${mov.toFixed(1)}%, te liquidan a ${Math.round(pl).toLocaleString('en-US')}.`;
  return { precioLiquidacion:`USD ${Math.round(pl).toLocaleString('en-US')}`, porcentajeDisminucion:`${mov.toFixed(1)}% ${movDir}`, interpretacion };
}
