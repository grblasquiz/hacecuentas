export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function pnlFuturosLongShortPerpetual(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const pe=Number(i.precioEntrada)||0; const pc=Number(i.precioCierre)||0; const tam=Number(i.tamanoPosicion)||0; const pos=String(i.posicion||'long'); const ap=Number(i.apalancamiento)||1;
  const cant=tam/pe; const diff=pos==='long'?(pc-pe):(pe-pc); const pnl=cant*diff;
  const margen=tam/ap; const roe=margen>0?(pnl/margen*100):0;
  const interpretacion = pnl>0
    ? (__lang==='en' ? `Gain ${pnl.toFixed(2)} USD (ROE ${roe.toFixed(0)}% on margin).` : `Ganancia ${pnl.toFixed(2)} USD (ROE ${roe.toFixed(0)}% sobre margen).`)
    : (__lang==='en' ? `Loss ${pnl.toFixed(2)} USD (ROE ${roe.toFixed(0)}%).` : `Pérdida ${pnl.toFixed(2)} USD (ROE ${roe.toFixed(0)}%).`);
  const posTxtEs = pos==='long' ? 'long' : 'short';
  const _insight = pnl>=0
    ? {
        title: __lang==='en' ? 'Position result' : 'Resultado de la posición',
        text: __lang==='en'
          ? `Your ${posTxtEs} closed in **profit**: **${pnl.toFixed(2)} USD**, a **${roe.toFixed(0)}% ROE** on the margin posted with **${ap}x** leverage. Remember that the same leverage that boosts your ROE also brings liquidation closer.`
          : `Tu ${posTxtEs} cerró en **ganancia**: **${pnl.toFixed(2)} USD**, un **ROE del ${roe.toFixed(0)}%** sobre el margen con **${ap}x** de apalancamiento. Recordá que el mismo apalancamiento que infla el ROE también acerca la liquidación.`,
        tone: 'good' as const,
        icon: '📈',
      }
    : {
        title: __lang==='en' ? 'Position result' : 'Resultado de la posición',
        text: __lang==='en'
          ? `Your ${posTxtEs} closed in **loss**: **${pnl.toFixed(2)} USD** (**${roe.toFixed(0)}% ROE**). With **${ap}x** leverage, losses are amplified by the same factor — size your stop accordingly.`
          : `Tu ${posTxtEs} cerró en **pérdida**: **${pnl.toFixed(2)} USD** (**ROE ${roe.toFixed(0)}%**). Con **${ap}x** de apalancamiento la pérdida se amplifica en la misma proporción — dimensioná el stop en consecuencia.`,
        tone: 'warn' as const,
        icon: '📉',
      };
  return { pnl:`USD ${pnl.toFixed(2)}`, roe:`${roe.toFixed(1)}%`, interpretacion, _insight };
}
