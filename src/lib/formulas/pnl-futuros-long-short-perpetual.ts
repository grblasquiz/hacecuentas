export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function pnlFuturosLongShortPerpetual(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const pe=Number(i.precioEntrada)||0; const pc=Number(i.precioCierre)||0; const tam=Number(i.tamanoPosicion)||0; const pos=String(i.posicion||'long'); const ap=Number(i.apalancamiento)||1;
  const cant=tam/pe; const diff=pos==='long'?(pc-pe):(pe-pc); const pnl=cant*diff;
  const margen=tam/ap; const roe=margen>0?(pnl/margen*100):0;
  const interpretacion = pnl>0
    ? (__lang==='en' ? `Gain ${pnl.toFixed(2)} USD (ROE ${roe.toFixed(0)}% on margin).` : `Ganancia ${pnl.toFixed(2)} USD (ROE ${roe.toFixed(0)}% sobre margen).`)
    : (__lang==='en' ? `Loss ${pnl.toFixed(2)} USD (ROE ${roe.toFixed(0)}%).` : `Pérdida ${pnl.toFixed(2)} USD (ROE ${roe.toFixed(0)}%).`);
  return { pnl:`USD ${pnl.toFixed(2)}`, roe:`${roe.toFixed(1)}%`, interpretacion };
}
