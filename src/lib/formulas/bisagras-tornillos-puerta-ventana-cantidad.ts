export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function bisagrasTornillosPuertaVentanaCantidad(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const v1=Number(i.v1)||0; const v2=Number(i.v2)||1;
  const r=v1*v2;
  const rTxt=r.toFixed(2);
  const resumen = __lang === 'en'
    ? `Calculation: ${v1} × ${v2} = ${rTxt}.`
    : `Cálculo: ${v1} × ${v2} = ${rTxt}.`;
  const _insight = __lang === 'en'
    ? { title: 'Total fasteners needed', text: `For **${v1}** units at **${v2}** screws each you need **${rTxt}** in total. Buy a 10-15% extra for losses and stripped heads.`, tone: 'neutral', icon: '🔩' }
    : { title: 'Total de herrajes necesarios', text: `Para **${v1}** unidades a **${v2}** tornillos cada una necesitás **${rTxt}** en total. Comprá un 10-15% de más por pérdidas y cabezas pasadas.`, tone: 'neutral', icon: '🔩' };
  return { resultado:rTxt, resumen, _insight };
}
