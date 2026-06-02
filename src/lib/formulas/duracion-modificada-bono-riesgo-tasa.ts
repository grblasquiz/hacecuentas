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
  const tone = dm >= 7 ? 'warn' : dm >= 3 ? 'neutral' : 'good';
  const _insight = {
    title: __lang === 'en' ? 'Rate sensitivity' : 'Sensibilidad a la tasa',
    text: __lang === 'en'
      ? `With a modified duration of **${dm.toFixed(2)}**, a 1-point rise in the YTM moves the price about **${dm.toFixed(2)}%** the other way — and a 1-point drop lifts it the same. ${dm >= 7 ? 'That is high volatility: this bond reacts sharply to rate changes.' : dm >= 3 ? 'Moderate sensitivity, typical of medium-term bonds.' : 'Low sensitivity: the price is fairly stable against rate swings.'}`
      : `Con una duración modificada de **${dm.toFixed(2)}**, una suba de 1 punto en la TIR mueve el precio cerca de **${dm.toFixed(2)}%** para el otro lado — y una baja de 1 punto lo levanta lo mismo. ${dm >= 7 ? 'Es alta volatilidad: este bono reacciona fuerte a los cambios de tasa.' : dm >= 3 ? 'Sensibilidad moderada, típica de bonos de mediano plazo.' : 'Baja sensibilidad: el precio es bastante estable ante movimientos de tasa.'}`,
    tone,
    icon: '📉',
  };
  return { durationMod:`${dm.toFixed(2)}`, cambioPrecio1Pct:`${dm.toFixed(2)}%`, interpretacion, _insight };
}
