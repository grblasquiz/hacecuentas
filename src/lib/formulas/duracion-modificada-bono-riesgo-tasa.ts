export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function duracionModificadaBonoRiesgoTasa(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const tir=Number(i.tir)||0; const a=Number(i.anosVencimiento)||0;
  const durAprox=a*0.85; // aproximación para bono cupón regular
  const dm=durAprox/(1+tir/100);
  const interpretacion = __lang === 'en'
    ? `If the YTM rises 1 point, the bond price falls ~${dm.toFixed(2)}%. Higher MD means higher volatility.`
    : `Si la TIR sube 1 punto, el precio del bono cae ~${dm.toFixed(2)}%. A mayor DM, mayor volatilidad.`;
  return { durationMod:`${dm.toFixed(2)}`, cambioPrecio1Pct:`${dm.toFixed(2)}%`, interpretacion };
}
