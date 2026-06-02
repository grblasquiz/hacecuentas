export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function maderaTerrazaMetrosCuadradosTablas(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const v1=Number(i.v1)||0; const v2=Number(i.v2)||1;
  const r=v1*v2;
  const resumen = __lang === 'en'
    ? `Calculation: ${v1} × ${v2} = ${r.toFixed(2)}.`
    : `Cálculo: ${v1} × ${v2} = ${r.toFixed(2)}.`;
  const _insight = {
    title: __lang === 'en' ? 'Your result' : 'Tu resultado',
    text: __lang === 'en'
      ? `**${v1}** × **${v2}** gives **${r.toFixed(2)}**. When buying decking boards, add about **10%** extra for cuts and waste, and don't forget the gap between boards so the wood can expand.`
      : `**${v1}** × **${v2}** da **${r.toFixed(2)}**. Al comprar las tablas para la terraza, sumá un **10%** extra por cortes y desperdicio, y no te olvides de la separación entre tablas para que la madera pueda dilatarse.`,
    tone: 'neutral',
    icon: '🪵',
  };
  return { resultado:r.toFixed(2), resumen, _insight };
}
