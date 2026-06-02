export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function cedearDividendYield2026(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const p=Number(i.precioCedear)||0; const r=Number(i.ratioConversion)||1;
  const d=Number(i.dividendoAnualUsd)||0; const c=Number(i.cotizacionDolar)||1;
  const divPorCedear=d/r*c; const dy=p>0?(divPorCedear/p*100):0; const ing100=divPorCedear*100;
  const locale = __lang === 'en' ? 'en-US' : 'es-AR';
  const ing100Fmt = Math.round(ing100).toLocaleString(locale);
  const divCedFmt = divPorCedear.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const interpretacion = __lang === 'en'
    ? `Yields ~${dy.toFixed(1)}% annually in dividends. With 100 CEDEARs: $${ing100Fmt}/year.`
    : `Rinde ~${dy.toFixed(1)}% anual en dividendos. Con 100 CEDEARs: $${Math.round(ing100).toLocaleString('es-AR')}/año.`;
  const alto = dy >= 4;
  const _insight = {
    title: __lang === 'en' ? 'Dividend yield' : 'Rendimiento por dividendo',
    text: __lang === 'en'
      ? `Each CEDEAR pays about **$${divCedFmt}** a year, a **${dy.toFixed(2)}%** dividend yield. ` +
        (alto
          ? `That is a high yield — strong cash flow, but check the payout is sustainable, not a falling price.`
          : `100 CEDEARs would hand you roughly **$${ing100Fmt}** per year before taxes.`)
      : `Cada CEDEAR paga unos **$${divCedFmt}** al año, un dividend yield del **${dy.toFixed(2)}%**. ` +
        (alto
          ? `Es un yield alto — buen flujo de caja, pero fijate que el pago sea sostenible y no producto de una caída del precio.`
          : `100 CEDEARs te darían cerca de **$${ing100Fmt}** al año antes de impuestos.`),
    tone: alto ? 'good' : 'neutral',
    icon: '💵',
  };
  return { dividendYield:`${dy.toFixed(2)}%`, ingresoEn100:`$${ing100Fmt}`, interpretacion, _insight };
}
