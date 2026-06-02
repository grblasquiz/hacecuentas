export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function smartGoalsObjetivosMetodologiaMeta(i: Inputs): Outputs {
  const v1=Number(i.v1)||0; const v2=Number(i.v2)||1;
  const r=v1/v2;
  const pct = r * 100;
  const _insight = {
    title: 'Avance hacia tu meta',
    text: `Con un valor actual de **${v1}** sobre un objetivo de **${v2}**, llevás un **${pct.toFixed(0)}%** del camino recorrido. ${r >= 1 ? 'Ya **alcanzaste o superaste** la meta.' : `Te falta cubrir el **${(100 - pct).toFixed(0)}%** restante.`}`,
    tone: r >= 1 ? 'good' : (r >= 0.5 ? 'neutral' : 'warn'),
    icon: '🎯',
  };
  return { resultado:r.toFixed(2), resumen:`Cálculo: ${v1} / ${v2} = ${r.toFixed(2)}.`, _insight };
}
