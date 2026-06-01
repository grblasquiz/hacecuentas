export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; }
export function cedearDividendYield2026(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const p=Number(i.precioCedear)||0; const r=Number(i.ratioConversion)||1;
  const d=Number(i.dividendoAnualUsd)||0; const c=Number(i.cotizacionDolar)||1;
  const divPorCedear=d/r*c; const dy=p>0?(divPorCedear/p*100):0; const ing100=divPorCedear*100;
  const locale = __lang === 'en' ? 'en-US' : 'es-AR';
  const ing100Fmt = Math.round(ing100).toLocaleString(locale);
  const interpretacion = __lang === 'en'
    ? `Yields ~${dy.toFixed(1)}% annually in dividends. With 100 CEDEARs: $${ing100Fmt}/year.`
    : `Rinde ~${dy.toFixed(1)}% anual en dividendos. Con 100 CEDEARs: $${Math.round(ing100).toLocaleString('es-AR')}/año.`;
  return { dividendYield:`${dy.toFixed(2)}%`, ingresoEn100:`$${ing100Fmt}`, interpretacion };
}
