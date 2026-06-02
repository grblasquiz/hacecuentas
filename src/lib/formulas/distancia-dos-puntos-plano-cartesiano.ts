export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function distanciaDosPuntosPlanoCartesiano(i: Inputs): Outputs {
  const x1=Number(i.x1)||0; const y1=Number(i.y1)||0; const x2=Number(i.x2)||0; const y2=Number(i.y2)||0;
  const dx=x2-x1; const dy=y2-y1;
  const d=Math.sqrt(dx**2+dy**2);
  const insight = {
    title: 'Distancia',
    text: `Entre **(${x1}, ${y1})** y **(${x2}, ${y2})** hay **${d.toFixed(2)}** unidades. Surge del teorema de Pitágoras con catetos Δx = **${dx}** y Δy = **${dy}**.`,
    tone: 'neutral',
    icon: '📐',
  };
  return { d:d.toFixed(3), resumen:`Distancia entre (${x1},${y1}) y (${x2},${y2}): ${d.toFixed(2)}.`, _insight: insight };
}
