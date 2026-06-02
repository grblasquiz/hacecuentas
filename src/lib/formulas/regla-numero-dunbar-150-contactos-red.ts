export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function reglaNumeroDunbar150ContactosRed(i: Inputs): Outputs {
  const v1=Number(i.v1)||0; const v2=Number(i.v2)||1;
  const r=v1/v2;
  const fmt=(n:number)=>new Intl.NumberFormat('es-AR',{maximumFractionDigits:2}).format(Number(n.toFixed(2)));
  const _insight = {
    title: 'Número de Dunbar',
    text: `Tu cálculo da **${fmt(r)}**. El número de Dunbar fija en **~150** el tope de relaciones estables que un cerebro humano puede sostener; por encima, los vínculos se vuelven superficiales.`,
    tone: 'neutral',
    icon: '🧠',
  };
  return { resultado:r.toFixed(2), resumen:`Cálculo: ${v1} / ${v2} = ${r.toFixed(2)}.`, _insight };
}
